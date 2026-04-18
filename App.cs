@page "/"
@using System.Text.Json
@using System.Collections.Generic

<!DOCTYPE html>
<html>
<head>
    <title>FreshCart - Grocery Management System</title>
    <style>
        /* Matching React CSS theme */
        :root {
            --green: #1a7c4f;
            --green-light: #2ea668;
            --green-pale: #e8f7f0;
            --amber: #f59e0b;
            --amber-light: #fef3c7;
            --red: #ef4444;
            --red-light: #fee2e2;
            --bg: #f0f4f0;
            --card: #ffffff;
            --text: #1a2a1a;
            --text-muted: #6b7c6b;
            --border: #d4e4d4;
            --shadow: 0 4px 24px rgba(26,124,79,0.10);
            --shadow-lg: 0 12px 48px rgba(26,124,79,0.18);
            --radius: 20px;
            --radius-sm: 12px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: var(--bg); color: var(--text); }
        h1, h2, h3 { font-weight: 700; }
        .app-layout { min-height: 100vh; display: flex; flex-direction: column; }
        .header {
            background: var(--card); border-bottom: 1px solid var(--border);
            padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;
            box-shadow: var(--shadow);
        }
        .header-logo { font-size: 1.5rem; font-weight: 800; color: var(--green); }
        .nav-btn { padding: 0.5rem 1rem; border-radius: 10px; border: none; background: transparent; cursor: pointer; color: var(--text-muted); }
        .nav-btn.active { background: var(--green-pale); color: var(--green); }
        .main { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
        .login-wrap {
            min-height: 100vh; background: linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%);
            display: flex; align-items: center; justify-content: center; padding: 2rem;
        }
        .login-card {
            background: var(--card); border-radius: var(--radius); padding: 3rem; max-width: 400px; width: 100%;
            box-shadow: var(--shadow-lg);
        }
        .btn-primary {
            width: 100%; padding: 1rem; border-radius: 12px; background: var(--green); color: white;
            border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .input-field { width: 100%; padding: 1rem; border: 2px solid var(--border); border-radius: 12px; font-size: 1rem; }
        .input-field:focus { outline: none; border-color: var(--green); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: var(--card); padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow); }
        .stat-value { font-size: 2rem; font-weight: 800; color: var(--green); }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .product-card {
            background: var(--card); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow);
            cursor: pointer; transition: all 0.3s;
        }
        .product-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
        .cart-sidebar {
            position: fixed; right: 0; top: 0; bottom: 0; width: 400px; background: var(--card);
            box-shadow: -8px 0 40px rgba(0,0,0,0.1); z-index: 1000;
        }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .section-title { font-size: 1.5rem; font-weight: 800; }
        @media (max-width: 768px) { .main { padding: 1rem; } .products-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="app-layout">
        @if (IsLoggedIn == false)
        {
            <div class="login-wrap">
                <div class="login-card">
                    <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">🛒</div>
                    <h1 style="font-size: 2rem; text-align: center; color: var(--green); margin-bottom: 0.5rem;">FreshCart</h1>
                    <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Grocery Management System</p>
                    
                    <div class="input-group">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
                        <input @bind="loginEmail" class="input-field" placeholder="admin@grocery.com" />
                    </div>
                    <div class="input-group">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
                        <input type="password" @bind="loginPassword" class="input-field" placeholder="admin123" />
                    </div>
                    <button class="btn-primary" @onclick="Login">Sign In →</button>
                    <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                        Demo: admin@grocery.com / admin123 (admin) | user@grocery.com / user123 (user)
                    </p>
                </div>
            </div>
        }
        else
        {
            <!-- Header -->
            <div class="header">
                <div class="header-logo"><span style="font-size: 2rem;">🛒</span> FreshCart</div>
                @if (CurrentUser.Role == "admin")
                {
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="@(CurrentView == "dashboard" ? "nav-btn active" : "nav-btn")" @onclick="() => SetView("dashboard")">📊 Dashboard</button>
                        <button class="@(CurrentView == "products" ? "nav-btn active" : "nav-btn")" @onclick="() => SetView("products")">📦 Products</button>
                    </div>
                }
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="role-badge @(CurrentUser.Role == "admin" ? "role-admin" : "role-user")">@(CurrentUser.Role.ToUpper())</span>
                    <div style="width: 2rem; height: 2rem; border-radius: 50%; background: var(--green); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">@CurrentUser.Name[0]</div>
                    <button class="nav-btn" @onclick="Logout">Logout</button>
                </div>
            </div>

            <div class="main">
                @if (CurrentUser.Role == "admin" && CurrentView == "dashboard")
                {
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📦</div>
                            <div class="stat-value">@Products.Count</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Products</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚠️</div>
                            <div class="stat-value" style="color: var(--amber);">@(Products.Count(p => p.Stock < 20))</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Low Stock</div>
                        </div>
                        <div class="stat-card">
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💰</div>
                            <div class="stat-value">₹@(Products.Sum(p => p.Price * p.Stock):N0)</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Inventory Value</div>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        <h2 class="section-title">📋 Products Management</h2>
                        <button class="btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.9rem;" @onclick="() => ShowProductModal(true)">+ Add Product</button>
                    </div>
                    
                    <div style="background: var(--card); border-radius: var(--radius); overflow: auto; max-height: 60vh; border: 1px solid var(--border);">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--green-pale);">
                                    <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--green);">Product</th>
                                    <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--green);">Price</th>
                                    <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--green);">Stock</th>
                                    <th style="padding: 1rem; text-align: left; font-weight: 700; color: var(--green);">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach (var p in Products.Take(10))
                                {
                                    <tr style="border-bottom: 1px solid var(--border);">
                                        <td style="padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                                            <span style="font-size: 2rem;">@p.Image</span>
                                            <div>
                                                <div style="font-weight: 700;">@p.Name</div>
                                                <div style="font-size: 0.9rem; color: var(--text-muted);">@p.Category</div>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem; font-weight: 700; color: var(--green);">₹@p.Price / @p.Unit</td>
                                        <td style="padding: 1rem;">
                                            <span class="@(p.Stock < 20 ? "stock-low" : "stock-ok")" style="padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600;">
                                                @(p.Stock < 20 ? "⚠️ Low" : "✅ In Stock") (@p.Stock)
                                            </span>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; margin-right: 0.5rem;" @onclick="() => EditProduct(p)">✏️</button>
                                            <button style="padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid var(--red); color: var(--red); background: var(--red-light); font-size: 0.8rem; cursor: pointer;" @onclick="() => DeleteProduct(p.Id)">🗑️</button>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                }
                else if (CurrentUser.Role == "admin" && CurrentView == "products")
                {
                    <h2 class="section-title">📦 All Products (@Products.Count)</h2>
                    <div class="products-grid">
                        @foreach (var p in Products)
                        {
                            <div class="product-card">
                                <div style="font-size: 4rem; text-align: center; margin-bottom: 1rem; background: var(--green-pale); border-radius: 12px; padding: 1rem;">@p.Image</div>
                                <h3 style="margin-bottom: 0.5rem;">@p.Name</h3>
                                <div style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">@p.Description</div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span style="font-size: 1.5rem; font-weight: 800; color: var(--green);">₹@p.Price</span>
                                    <span style="font-size: 0.9rem; color: var(--text-muted);">/ @p.Unit</span>
                                </div>
                                <span class="@(p.Stock < 20 ? "stock-low" : "stock-ok")" style="padding: 0.5rem 1rem; border-radius: 1rem; font-weight: 600;">
                                    @(p.Stock < 20 ? "Low Stock" : "In Stock")
                                </span>
                            </div>
                        }
                    </div>
                }
                else
                {
                    <!-- User Shop -->
                    <div style="background: linear-gradient(135deg, var(--green), var(--green-light)); border-radius: var(--radius); padding: 2rem; margin-bottom: 2rem; color: white; text-align: center;">
                        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Welcome, @CurrentUser.Name! 🛒</h2>
                        <p>Fresh groceries delivered to your door</p>
                    </div>
                    
                    <div class="section-header">
                        <h2 class="section-title">🥦 Fresh Produce</h2>
                        <input @bind="searchTerm" placeholder="🔍 Search products..." style="padding: 0.75rem 1rem; border: 2px solid var(--border); border-radius: 12px; font-size: 1rem;" />
                    </div>
                    
                    <div class="products-grid">
                        @foreach (var p in FilteredProducts)
                        {
                            <div class="product-card" @onclick="() => AddToCart(p)">
                                <div style="font-size: 4rem; text-align: center; margin-bottom: 1rem; background: var(--green-pale); border-radius: 12px; padding: 1rem;">@p.Image</div>
                                <h3 style="margin-bottom: 0.5rem;">@p.Name</h3>
                                <div style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">@p.Category</div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span style="font-size: 1.5rem; font-weight: 800; color: var(--green);">₹@p.Price</span>
                                    <span style="font-size: 0.9rem; color: var(--text-muted);">/ @p.Unit</span>
                                </div>
                                <button class="btn-primary" style="width: 100%;">🛒 Add to Cart</button>
                            </div>
                        }
                    </div>
                }
            </div>
        }
    </div>
</body>
</html>

@code {
    private bool IsLoggedIn { get; set; } = false;
    private User CurrentUser { get; set; } = new();
    private string CurrentView { get; set; } = "dashboard";
    private string loginEmail = "";
    private string loginPassword = "";
    private string searchTerm = "";
    private List<Product> Products { get; set; } = new();
    private List<CartItem> Cart { get; set; } = new();

    protected override void OnInitialized()
    {
        LoadProducts();
    }

    private void LoadProducts()
    {
        Products = new List<Product> {
            new() { Id = 1, Name = "Organic Apples", Category = "Fruits", Price = 120, Stock = 50, Unit = "kg", Image = "🍎", Description = "Fresh organic apples" },
            new() { Id = 2, Name = "Bananas", Category = "Fruits", Price = 50, Stock = 100, Unit = "dozen", Image = "🍌", Description = "Ripe yellow bananas" },
            new() { Id = 3, Name = "Tomatoes", Category = "Vegetables", Price = 40, Stock = 80, Unit = "kg", Image = "🍅", Description = "Ripe red tomatoes" },
            new() { Id = 4, Name = "Whole Milk", Category = "Dairy", Price = 60, Stock = 30, Unit = "L", Image = "🥛", Description = "Farm fresh milk" },
            new() { Id = 5, Name = "Almonds", Category = "Nuts", Price = 650, Stock = 25, Unit = "kg", Image = "🌰", Description = "Premium almonds" },
            // Add more from React mock data...
        };
    }

    private List<Product> FilteredProducts => Products.Where(p =>
        string.IsNullOrEmpty(searchTerm) || p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
    ).ToList();

    private void Login()
    {
        if (loginEmail.Contains("admin") &amp;&amp; loginPassword.Length >= 3)
        {
            CurrentUser = new User { Name = "Admin", Email = loginEmail, Role = "admin" };
        }
        else
        {
            CurrentUser = new User { Name = "Customer", Email = loginEmail, Role = "user" };
        }
        IsLoggedIn = true;
        StateHasChanged();
    }

    private void Logout()
    {
        IsLoggedIn = false;
        CurrentUser = new();
        loginEmail = "";
        loginPassword = "";
    }

    private void SetView(string view) => CurrentView = view;

    private void AddToCart(Product product)
    {
        var existing = Cart.FirstOrDefault(c => c.ProductId == product.Id);
        if (existing != null)
        {
            existing.Quantity++;
        }
        else
        {
            Cart.Add(new CartItem { ProductId = product.Id, Quantity = 1 });
        }
        StateHasChanged();
    }

    // Placeholder methods
    private void ShowProductModal(bool isNew) { /* Modal logic */ }
    private void EditProduct(Product product) { /* Edit logic */ }
    private void DeleteProduct(int id) { /* Delete logic */ }

    public class User
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
    }

    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Unit { get; set; } = "";
        public string Image { get; set; } = "";
        public string Description { get; set; } = "";
    }

    public class CartItem
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
