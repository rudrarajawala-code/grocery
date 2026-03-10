# ============================================================
#  GROCERY MANAGEMENT SYSTEM — Django + MongoDB Backend
#  Technology: Django REST Framework + djongo (MongoDB)
# ============================================================

# ─── INSTALLATION ───────────────────────────────────────────
# pip install django djangorestframework djongo pymongo
# pip install django-cors-headers djangorestframework-simplejwt

# ─── grocery_backend/settings.py ────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'grocery',           # our app
]

DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'grocery_db',
        'CONN_MAX_AGE': 60,
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
        }
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middlewares
]

CORS_ALLOW_ALL_ORIGINS = True   # For development only


# ─── grocery/models.py ──────────────────────────────────────
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [('admin', 'Admin'), ('user', 'User')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Product(models.Model):
    name        = models.CharField(max_length=200)
    category    = models.CharField(max_length=100)
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    stock       = models.IntegerField(default=0)
    unit        = models.CharField(max_length=50, default='kg')
    image       = models.CharField(max_length=10, default='🥦')   # emoji
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    user       = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    price    = models.DecimalField(max_digits=10, decimal_places=2)  # price at time of order

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class Cart(models.Model):
    user    = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cart')
    updated = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)


# ─── grocery/serializers.py ─────────────────────────────────
from rest_framework import serializers

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'status', 'total', 'items', 'created_at']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']


# ─── grocery/views.py ───────────────────────────────────────
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]            # Only admins can add/edit/delete

    def get_queryset(self):
        qs = Product.objects.all()
        category = self.request.query_params.get('category')
        search   = self.request.query_params.get('search')
        if category: qs = qs.filter(category=category)
        if search:   qs = qs.filter(name__icontains=search)
        return qs


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def create(self, request):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'error': 'No items in cart'}, status=400)

        total = sum(item['price'] * item['quantity'] for item in items_data)
        order = Order.objects.create(user=request.user, total=total)

        for item in items_data:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order, product=product,
                quantity=item['quantity'], price=item['price']
            )
            # Reduce stock
            product.stock = max(0, product.stock - item['quantity'])
            product.save()

        return Response(OrderSerializer(order).data, status=201)


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = CartItem.objects.filter(cart=cart).select_related('product')
        return Response(CartItemSerializer(items, many=True).data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity   = request.data.get('quantity', 1)
        product    = Product.objects.get(id=product_id)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        return Response({'message': 'Added to cart'})

    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
        CartItem.objects.filter(id=pk, cart__user=request.user).delete()
        return Response({'message': 'Removed from cart'})


# ─── grocery/urls.py ────────────────────────────────────────
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders',   OrderViewSet, basename='orders')
router.register(r'cart',     CartViewSet,  basename='cart')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/',         TokenObtainPairView.as_view(),  name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),
]

# ─── API ENDPOINTS SUMMARY ──────────────────────────────────
"""
AUTH:
  POST  /api/token/              → Login (returns JWT)
  POST  /api/token/refresh/      → Refresh JWT

PRODUCTS (Admin: all methods | User: GET only):
  GET   /api/products/           → List all products
  POST  /api/products/           → Add product         [Admin]
  GET   /api/products/{id}/      → Get product detail
  PUT   /api/products/{id}/      → Update product      [Admin]
  DELETE/api/products/{id}/      → Delete product      [Admin]
  GET   /api/products/?category= → Filter by category
  GET   /api/products/?search=   → Search by name

CART:
  GET   /api/cart/               → View cart
  POST  /api/cart/add/           → Add item to cart
  DELETE/api/cart/{id}/remove/   → Remove item

ORDERS:
  GET   /api/orders/             → List orders (user sees own, admin sees all)
  POST  /api/orders/             → Place order
  GET   /api/orders/{id}/        → Order detail
"""
