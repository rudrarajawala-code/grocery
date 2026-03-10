import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: "Organic Apples", category: "Fruits", price: 120, stock: 50, unit: "kg", image: "🍎", description: "Fresh organic apples from Himachal Pradesh" },
  { id: 2, name: "Basmati Rice", category: "Grains", price: 85, stock: 200, unit: "kg", image: "🌾", description: "Premium aged basmati rice" },
  { id: 3, name: "Whole Milk", category: "Dairy", price: 60, stock: 30, unit: "L", image: "🥛", description: "Farm fresh whole milk" },
  { id: 4, name: "Tomatoes", category: "Vegetables", price: 40, stock: 80, unit: "kg", image: "🍅", description: "Ripe red tomatoes" },
  { id: 5, name: "Almonds", category: "Nuts", price: 650, stock: 25, unit: "kg", image: "🌰", description: "California almonds premium grade" },
  { id: 6, name: "Spinach", category: "Vegetables", price: 30, stock: 60, unit: "bunch", image: "🥬", description: "Fresh farm spinach" },
  { id: 7, name: "Bananas", category: "Fruits", price: 50, stock: 100, unit: "dozen", image: "🍌", description: "Ripe yellow bananas" },
  { id: 8, name: "Cheddar Cheese", category: "Dairy", price: 320, stock: 15, unit: "250g", image: "🧀", description: "Aged cheddar cheese block" },
];

const USERS_DB = [
  { id: 1, email: "admin@grocery.com", password: "admin123", role: "admin", name: "Admin User" },
  { id: 2, email: "user@grocery.com", password: "user123", role: "user", name: "Raj Kumar" },
];

// Helper: extract a display name from any email like "john.doe@gmail.com" → "John Doe"
const nameFromEmail = (email) => {
  const local = email.split("@")[0];
  return local.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const CATEGORIES = ["All", "Fruits", "Vegetables", "Dairy", "Grains", "Nuts"];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }

  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.8); }
    70%  { transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(26,124,79,0.4); }
    70% { box-shadow: 0 0 0 12px rgba(26,124,79,0); }
    100% { box-shadow: 0 0 0 0 rgba(26,124,79,0); }
  }

  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in { animation: fadeIn 0.4s ease both; }
  .pop-in  { animation: popIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

  /* Login Screen */
  .login-wrap {
    min-height: 100vh;
    background: linear-gradient(135deg, #0d3d26 0%, #1a7c4f 50%, #2ea668 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  .login-bg-orb {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }
  .login-card {
    background: white;
    border-radius: 32px;
    padding: 48px 40px;
    width: 100%; max-width: 440px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.3);
    position: relative; z-index: 1;
  }
  .login-logo { font-size: 48px; text-align: center; margin-bottom: 8px; animation: bounce 2s ease infinite; }
  .login-title { font-size: 28px; font-weight: 800; text-align: center; color: var(--green); margin-bottom: 4px; }
  .login-sub { text-align: center; color: var(--text-muted); font-size: 14px; margin-bottom: 32px; }
  .demo-chips { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; justify-content: center; }
  .demo-chip {
    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1.5px solid var(--border);
    transition: all 0.2s; background: var(--green-pale); color: var(--green);
  }
  .demo-chip:hover { background: var(--green); color: white; border-color: var(--green); transform: translateY(-2px); }
  .input-group { margin-bottom: 18px; }
  .input-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
  .input-field {
    width: 100%; padding: 14px 16px; border-radius: 14px;
    border: 2px solid var(--border); font-size: 15px;
    transition: all 0.2s; outline: none; font-family: 'DM Sans', sans-serif;
    background: var(--bg);
  }
  .input-field:focus { border-color: var(--green); background: white; box-shadow: 0 0 0 4px rgba(26,124,79,0.1); }
  .btn-primary {
    width: 100%; padding: 16px; border-radius: 14px;
    background: linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%);
    color: white; border: none; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .btn-primary:active { transform: translateY(0); }
  .error-msg { background: var(--red-light); color: var(--red); padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 16px; }

  /* Layout */
  .app-layout { min-height: 100vh; display: flex; flex-direction: column; }
  .header {
    background: white; border-bottom: 1px solid var(--border);
    padding: 0 24px; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 16px rgba(26,124,79,0.08);
  }
  .header-logo { display: flex; align-items: center; gap: 10px; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--green); }
  .header-logo span { font-size: 28px; }
  .header-nav { display: flex; gap: 6px; }
  .nav-btn {
    padding: 8px 16px; border-radius: 10px; border: none;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    color: var(--text-muted); background: transparent;
  }
  .nav-btn.active { background: var(--green-pale); color: var(--green); font-weight: 600; }
  .nav-btn:hover:not(.active) { background: var(--bg); }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, var(--green), var(--green-light));
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 15px; cursor: pointer;
  }
  .cart-btn {
    position: relative; padding: 8px 16px; border-radius: 10px;
    background: var(--green-pale); border: none; cursor: pointer;
    font-size: 20px; transition: all 0.2s;
  }
  .cart-btn:hover { background: var(--green); transform: scale(1.05); }
  .cart-badge {
    position: absolute; top: -4px; right: -4px;
    background: var(--red); color: white; border-radius: 50%;
    width: 20px; height: 20px; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    animation: pulse-ring 1.5s ease infinite;
  }
  .logout-btn {
    padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border);
    font-size: 13px; font-weight: 500; cursor: pointer; background: white;
    color: var(--text-muted); transition: all 0.2s;
  }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  /* Main */
  .main { flex: 1; padding: 28px 24px; max-width: 1200px; width: 100%; margin: 0 auto; }

  /* Stats Cards */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: white; border-radius: var(--radius); padding: 24px 20px;
    box-shadow: var(--shadow); transition: all 0.3s;
    border: 1px solid var(--border);
  }
  .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .stat-icon { font-size: 32px; margin-bottom: 12px; }
  .stat-value { font-size: 28px; font-weight: 800; font-family: 'Syne', sans-serif; }
  .stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

  /* Section Header */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .section-title { font-size: 22px; font-weight: 800; }
  .section-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Search & Filter */
  .search-bar {
    padding: 10px 16px; border-radius: 12px; border: 2px solid var(--border);
    font-size: 14px; width: 220px; outline: none; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif; background: white;
  }
  .search-bar:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(26,124,79,0.1); }
  .filter-chip {
    padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--border);
    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    background: white; color: var(--text-muted);
  }
  .filter-chip.active { background: var(--green); color: white; border-color: var(--green); }
  .filter-chip:hover:not(.active) { border-color: var(--green); color: var(--green); }

  /* Product Grid */
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

  /* Product Card */
  .product-card {
    background: white; border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow); transition: all 0.3s; cursor: pointer;
    border: 1px solid var(--border);
    animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .product-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
  .product-img {
    background: linear-gradient(135deg, var(--green-pale), #d0f0e0);
    height: 140px; display: flex; align-items: center; justify-content: center;
    font-size: 60px; transition: all 0.3s; position: relative; overflow: hidden;
  }
  .product-card:hover .product-img { background: linear-gradient(135deg, #c0ebd4, #a8e6c0); }
  .product-img-emoji { transition: transform 0.3s; }
  .product-card:hover .product-img-emoji { transform: scale(1.2) rotate(-5deg); }
  .product-body { padding: 16px; }
  .product-category { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--green); margin-bottom: 4px; }
  .product-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; font-family: 'Syne', sans-serif; }
  .product-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
  .product-footer { display: flex; align-items: center; justify-content: space-between; }
  .product-price { font-size: 18px; font-weight: 800; color: var(--green); font-family: 'Syne', sans-serif; }
  .product-unit { font-size: 12px; color: var(--text-muted); font-weight: 400; }
  .stock-badge {
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px;
  }
  .stock-ok { background: var(--green-pale); color: var(--green); }
  .stock-low { background: var(--amber-light); color: #b45309; }
  .add-cart-btn {
    margin-top: 12px; width: 100%; padding: 10px; border-radius: 12px;
    background: linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%);
    color: white; border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .add-cart-btn:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(26,124,79,0.3); }
  .add-cart-btn:active { transform: scale(0.98); }

  /* Admin Table */
  .admin-table-wrap { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border); }
  .admin-table { width: 100%; border-collapse: collapse; }
  .admin-table th { background: var(--green-pale); padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--green); font-family: 'Syne', sans-serif; }
  .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--bg); font-size: 14px; vertical-align: middle; }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tr:hover td { background: var(--green-pale); }
  .table-emoji { font-size: 28px; }

  /* Action Buttons */
  .btn-edit {
    padding: 7px 14px; border-radius: 8px; border: 1.5px solid var(--amber);
    color: #b45309; background: var(--amber-light); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin-right: 8px;
  }
  .btn-edit:hover { background: var(--amber); color: white; }
  .btn-delete {
    padding: 7px 14px; border-radius: 8px; border: 1.5px solid var(--red);
    color: var(--red); background: var(--red-light); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-delete:hover { background: var(--red); color: white; }
  .btn-add {
    padding: 10px 20px; border-radius: 12px;
    background: linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%);
    color: white; border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
  }
  .btn-add:hover { transform: translateY(-2px); box-shadow: var(--shadow); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 24px;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(4px);
  }
  .modal-card {
    background: white; border-radius: 28px; padding: 36px;
    width: 100%; max-width: 480px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.25);
    animation: popIn 0.35s cubic-bezier(0.22,1,0.36,1);
    max-height: 90vh; overflow-y: auto;
  }
  .modal-title { font-size: 22px; font-weight: 800; margin-bottom: 24px; color: var(--green); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { margin-bottom: 16px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--border);
    font-size: 14px; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .form-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(26,124,79,0.1); }
  .modal-actions { display: flex; gap: 12px; margin-top: 8px; }
  .btn-cancel {
    flex: 1; padding: 12px; border-radius: 12px; border: 2px solid var(--border);
    font-size: 14px; font-weight: 600; cursor: pointer; background: white;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .btn-cancel:hover { border-color: var(--red); color: var(--red); }
  .btn-save {
    flex: 1; padding: 12px; border-radius: 12px;
    background: linear-gradient(135deg, var(--green), var(--green-light));
    color: white; border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
  }
  .btn-save:hover { transform: translateY(-1px); box-shadow: var(--shadow); }

  /* Cart Sidebar */
  .cart-sidebar {
    position: fixed; right: 0; top: 0; bottom: 0; width: 380px;
    background: white; box-shadow: -8px 0 40px rgba(0,0,0,0.12);
    z-index: 200; display: flex; flex-direction: column;
    animation: slideRight 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .cart-header {
    padding: 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .cart-title { font-size: 20px; font-weight: 800; font-family: 'Syne', sans-serif; }
  .cart-close { font-size: 24px; cursor: pointer; color: var(--text-muted); background: none; border: none; line-height: 1; }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px; }
  .cart-item {
    display: flex; gap: 12px; padding: 14px; border-radius: 16px;
    background: var(--bg); margin-bottom: 12px; align-items: center;
    animation: slideRight 0.3s ease;
  }
  .cart-item-emoji { font-size: 36px; flex-shrink: 0; }
  .cart-item-info { flex: 1; }
  .cart-item-name { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
  .cart-item-price { font-size: 13px; color: var(--green); font-weight: 600; }
  .qty-controls { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
  .qty-btn {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--green-pale); border: none; font-size: 16px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--green); font-weight: 700; transition: all 0.2s;
  }
  .qty-btn:hover { background: var(--green); color: white; }
  .qty-val { font-weight: 700; font-size: 15px; min-width: 20px; text-align: center; }
  .cart-footer {
    padding: 20px; border-top: 1px solid var(--border);
    background: white;
  }
  .cart-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; margin-bottom: 16px; font-family: 'Syne', sans-serif; }
  .btn-order {
    width: 100%; padding: 16px; border-radius: 16px;
    background: linear-gradient(135deg, var(--green), var(--green-light));
    color: white; border: none; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif;
  }
  .btn-order:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .empty-cart { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .empty-cart-icon { font-size: 64px; margin-bottom: 16px; animation: bounce 2s ease infinite; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--green); color: white;
    padding: 14px 20px; border-radius: 16px;
    font-size: 14px; font-weight: 500;
    box-shadow: var(--shadow-lg); z-index: 9999;
    animation: popIn 0.35s cubic-bezier(0.22,1,0.36,1);
    display: flex; align-items: center; gap: 10px;
    max-width: 320px;
  }

  /* Order Success */
  .order-success { text-align: center; padding: 40px 20px; }
  .success-icon { font-size: 72px; animation: bounce 0.8s ease; }
  .success-title { font-size: 24px; font-weight: 800; color: var(--green); margin: 16px 0 8px; }
  .success-sub { color: var(--text-muted); font-size: 15px; }
  .order-id { background: var(--green-pale); color: var(--green); padding: 10px 20px; border-radius: 12px; display: inline-block; font-weight: 700; margin-top: 16px; font-family: 'Syne', sans-serif; }

  /* Welcome Banner */
  .welcome-banner {
    background: linear-gradient(135deg, #0d3d26 0%, #1a7c4f 60%, #2ea668 100%);
    border-radius: var(--radius); padding: 32px; margin-bottom: 28px;
    color: white; position: relative; overflow: hidden;
  }
  .welcome-banner::before {
    content: '🛒'; position: absolute; right: 24px; top: 50%;
    transform: translateY(-50%); font-size: 80px; opacity: 0.15;
  }
  .welcome-title { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .welcome-sub { opacity: 0.8; font-size: 15px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--green-light); }

  .role-badge {
    padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .role-admin { background: linear-gradient(135deg, var(--green), var(--green-light)); color: white; }
  .role-user { background: var(--amber-light); color: #b45309; }

  .orders-list { display: flex; flex-direction: column; gap: 16px; }
  .order-card {
    background: white; border-radius: var(--radius); padding: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow);
    animation: fadeUp 0.4s ease;
  }
  .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .order-id-text { font-weight: 800; font-family: 'Syne', sans-serif; color: var(--green); }
  .order-status {
    padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
    background: var(--green-pale); color: var(--green);
  }
  .order-items-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .order-item-chip { background: var(--bg); padding: 4px 10px; border-radius: 8px; font-size: 13px; }
  .order-total { font-size: 16px; font-weight: 800; color: var(--green); font-family: 'Syne', sans-serif; }

  @media (max-width: 768px) {
    .header { padding: 0 16px; }
    .main { padding: 16px; }
    .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    .cart-sidebar { width: 100%; }
    .login-card { padding: 32px 24px; }
    .form-grid { grid-template-columns: 1fr; }
    .header-nav { display: none; }
  }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, []);
  return <div className="toast">✅ {message}</div>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const fill = (u) => { setEmail(u.email); setPass(u.password); };

  const submit = () => {
    if (!email || !pass) return setError("Please enter both email and password.");
    if (!email.includes("@")) return setError("Please enter a valid email address.");
    if (pass.length < 3) return setError("Password must be at least 3 characters.");

    // Check known demo accounts first
    const known = USERS_DB.find(u => u.email === email && u.password === pass);
    if (known) return onLogin(known);

    // Any random email/password works — if "admin" in email → admin role, else user
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const localPart = email.split("@")[0];
    const name = localPart.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    onLogin({ id: Date.now(), email, role, name });
  };

  return (
    <div className="login-wrap">
      <div className="login-bg-orb" style={{ width:400, height:400, top:-100, left:-100 }} />
      <div className="login-bg-orb" style={{ width:300, height:300, bottom:-80, right:-80 }} />
      <div className="login-card fade-up">
        <div className="login-logo">🛒</div>
        <h1 className="login-title">FreshCart</h1>
        <p className="login-sub">Grocery Management System</p>

        <p style={{ textAlign:"center", fontSize:12, color:"#999", marginBottom:8 }}>Login with any email & password, or use demo accounts:</p>
        <div className="demo-chips">
          {USERS_DB.map(u => (
            <div key={u.id} className="demo-chip" onClick={() => fill(u)}>
              {u.role === "admin" ? "👑" : "👤"} {u.role}
            </div>
          ))}
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input className="input-field" type="email" placeholder="you@example.com"
            value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••"
            value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn-primary" onClick={submit}>Sign In →</button>
      </div>
    </div>
  );
}

// ─── ADMIN PRODUCT MODAL ──────────────────────────────────────────────────────
function ProductModal({ product, onSave, onClose }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(product || { name:"", category:"Fruits", price:"", stock:"", unit:"kg", image:"🥦", description:"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const emojis = ["🍎","🍌","🍅","🥬","🥛","🧀","🌾","🌰","🥕","🧅","🍊","🍇","🥑","🫑","🥦"];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="modal-title">{isEdit ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Pick Emoji Icon</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {emojis.map(e => (
                <span key={e} onClick={() => set("image", e)}
                  style={{ fontSize:28, cursor:"pointer", padding:6, borderRadius:8,
                    background: form.image === e ? "var(--green-pale)" : "transparent",
                    border: form.image === e ? "2px solid var(--green)" : "2px solid transparent",
                    transition:"all 0.2s" }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="form-group full">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Organic Apples" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => set("category", e.target.value)}>
              {["Fruits","Vegetables","Dairy","Grains","Nuts","Beverages","Snacks"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select className="form-input" value={form.unit} onChange={e => set("unit", e.target.value)}>
              {["kg","g","L","ml","piece","dozen","bunch","250g","500g"].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input className="form-input" type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Quantity *</label>
            <input className="form-input" type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
          </div>
          <div className="form-group full">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief product description..." />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => onSave(form)}>
            {isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────────────────────
function OrderModal({ cart, total, onConfirm, onClose }) {
  const orderId = "ORD-" + Math.random().toString(36).slice(2,8).toUpperCase();
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="order-success">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p className="success-sub">Your fresh groceries are on their way.</p>
          <div className="order-id">Order ID: {orderId}</div>
          <div style={{ marginTop:20, padding:16, background:"var(--bg)", borderRadius:16, textAlign:"left" }}>
            {cart.map(item => (
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid var(--border)", fontSize:14 }}>
                <span>{item.image} {item.name} × {item.qty}</span>
                <span style={{ fontWeight:700 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontWeight:800, fontSize:16, fontFamily:"'Syne', sans-serif", color:"var(--green)" }}>
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop:20 }} onClick={onConfirm}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ products, setProducts, showToast }) {
  const [modal, setModal] = useState(null); // null | "add" | product obj
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("products"); // "products" | "stats"

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const saveProduct = (form) => {
    if (!form.name || !form.price || !form.stock) return;
    if (form.id) {
      setProducts(ps => ps.map(p => p.id === form.id ? { ...form, price: +form.price, stock: +form.stock } : p));
      showToast("Product updated successfully");
    } else {
      setProducts(ps => [...ps, { ...form, id: Date.now(), price: +form.price, stock: +form.stock }]);
      showToast("Product added successfully");
    }
    setModal(null);
  };

  const deleteProduct = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts(ps => ps.filter(p => p.id !== id));
      showToast("Product deleted");
    }
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 20).length;

  return (
    <div className="main">
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        {[
          { icon:"📦", val: products.length, label:"Total Products", color:"#1a7c4f" },
          { icon:"🏷️", val: [...new Set(products.map(p=>p.category))].length, label:"Categories", color:"#7c3aed" },
          { icon:"⚠️", val: lowStock, label:"Low Stock", color:"#b45309" },
          { icon:"💰", val: `₹${(totalValue/1000).toFixed(0)}K`, label:"Inventory Value", color:"#0891b2" },
        ].map((s, i) => (
          <div className="stat-card fade-up" key={s.label} style={{ animationDelay: `${i*0.08}s` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="section-title">📋 Product Management</h2>
        <div className="section-actions">
          <input className="search-bar" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-add" onClick={() => setModal({})}>+ Add Product</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ animation: `fadeUp 0.3s ease ${i*0.04}s both` }}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span className="table-emoji">{p.image}</span>
                    <div>
                      <div style={{ fontWeight:700 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{p.description}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ background:"var(--green-pale)", color:"var(--green)", padding:"3px 10px", borderRadius:8, fontSize:12, fontWeight:600 }}>{p.category}</span></td>
                <td style={{ fontWeight:700, color:"var(--green)", fontFamily:"'Syne',sans-serif" }}>₹{p.price}/{p.unit}</td>
                <td style={{ fontWeight:600 }}>{p.stock} units</td>
                <td>
                  <span className={`stock-badge ${p.stock < 20 ? "stock-low" : "stock-ok"}`}>
                    {p.stock < 20 ? "⚠️ Low" : "✅ In Stock"}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => setModal(p)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => deleteProduct(p.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:48, color:"var(--text-muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div>No products found</div>
          </div>
        )}
      </div>

      {modal !== null && <ProductModal product={modal?.id ? modal : null} onSave={saveProduct} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── USER SHOP ────────────────────────────────────────────────────────────────
function UserShop({ products, user, showToast }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [orderModal, setOrderModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("shop"); // "shop" | "orders"

  const filtered = products.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    showToast(`${product.image} ${product.name} added to cart`);
  };

  const updateQty = (id, delta) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = () => {
    const order = { id: Date.now(), items: [...cart], total, date: new Date().toLocaleDateString(), status: "Confirmed" };
    setOrders(prev => [order, ...prev]);
    setOrderModal(true);
  };

  const confirmOrder = () => {
    setCart([]);
    setOrderModal(false);
    setCartOpen(false);
    showToast("Order placed! 🎉");
  };

  return (
    <div className="app-layout" style={{ flex:1, display:"flex", flexDirection:"column" }}>
      {/* Sub Nav */}
      <div style={{ background:"white", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ display:"flex", gap:6, maxWidth:1200, margin:"0 auto" }}>
          {["shop","orders"].map(t => (
            <button key={t} className={`nav-btn ${view===t?"active":""}`} onClick={() => setView(t)}>
              {t === "shop" ? "🛍️ Shop" : `📦 My Orders (${orders.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="main">
        {view === "shop" && <>
          <div className="welcome-banner fade-in">
            <div className="welcome-title">Fresh & Organic 🌿</div>
            <div className="welcome-sub">Welcome back, {user.name}! Discover today's best picks.</div>
          </div>

          <div className="section-header">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-chip ${category===c?"active":""}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <input className="search-bar" placeholder="🔍 Search groceries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="products-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="product-card" style={{ animationDelay:`${i*0.06}s` }}>
                <div className="product-img">
                  <span className="product-img-emoji">{p.image}</span>
                </div>
                <div className="product-body">
                  <div className="product-category">{p.category}</div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.description}</div>
                  <div className="product-footer">
                    <div>
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-unit">/{p.unit}</span>
                    </div>
                    <span className={`stock-badge ${p.stock < 20 ? "stock-low":"stock-ok"}`}>
                      {p.stock < 20 ? "Low" : "In Stock"}
                    </span>
                  </div>
                  <button className="add-cart-btn" onClick={() => addToCart(p)}>
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:80, color:"var(--text-muted)" }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🥦</div>
              <div style={{ fontSize:18, fontWeight:700 }}>No products found</div>
            </div>
          )}
        </>}

        {view === "orders" && (
          <div>
            <h2 className="section-title" style={{ marginBottom:20 }}>📦 My Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign:"center", padding:80, color:"var(--text-muted)" }}>
                <div style={{ fontSize:64, marginBottom:12 }}>📭</div>
                <div style={{ fontSize:18, fontWeight:700 }}>No orders yet</div>
                <div style={{ fontSize:14, marginTop:8 }}>Place your first order from the shop!</div>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(o => (
                  <div key={o.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id-text">Order #{o.id.toString().slice(-6)}</span>
                      <span className="order-status">✅ {o.status}</span>
                    </div>
                    <div className="order-items-preview">
                      {o.items.map(i => <span key={i.id} className="order-item-chip">{i.image} {i.name} ×{i.qty}</span>)}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:13, color:"var(--text-muted)" }}>📅 {o.date}</span>
                      <span className="order-total">₹{o.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <span className="cart-title">🛒 My Cart ({cartCount})</span>
            <button className="cart-close" onClick={() => setCartOpen(false)}>×</button>
          </div>
          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <div style={{ fontWeight:700, fontSize:16 }}>Cart is empty</div>
                <div style={{ fontSize:14, marginTop:8 }}>Add some fresh groceries!</div>
              </div>
            ) : cart.map(item => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.image}</span>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price * item.qty}</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <button className="btn-order" onClick={placeOrder}>🎉 Place Order</button>
            </div>
          )}
        </div>
      )}

      {orderModal && <OrderModal cart={cart} total={total} onConfirm={confirmOrder} onClose={() => setOrderModal(false)} />}

      {/* Cart FAB */}
      {!cartOpen && cartCount > 0 && (
        <button className="cart-btn" onClick={() => setCartOpen(true)}
          style={{ position:"fixed", bottom:24, right:24, width:64, height:64, borderRadius:"50%", fontSize:28, background:"var(--green)", color:"white", zIndex:150, boxShadow:"var(--shadow-lg)", animation:"pulse-ring 2s ease infinite" }}>
          🛒
          <span className="cart-badge">{cartCount}</span>
        </button>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [toast, setToast] = useState(null);
  const [adminTab, setAdminTab] = useState("products");
  const [cartOpen, setCartOpen] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <style>{styles}</style>
      {!user ? (
        <LoginScreen onLogin={setUser} />
      ) : (
        <div className="app-layout">
          <header className="header">
            <div className="header-logo">
              <span>🛒</span> FreshCart
            </div>
            {user.role === "admin" && (
              <div className="header-nav">
                <button className={`nav-btn ${adminTab==="products"?"active":""}`} onClick={() => setAdminTab("products")}>📋 Products</button>
              </div>
            )}
            <div className="header-right">
              <span className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                {user.role === "admin" ? "👑 Admin" : "👤 User"}
              </span>
              <div className="avatar" title={user.name}>{user.name[0]}</div>
              <button className="logout-btn" onClick={() => setUser(null)}>Sign Out</button>
            </div>
          </header>

          {user.role === "admin" ? (
            <AdminDashboard products={products} setProducts={setProducts} showToast={showToast} />
          ) : (
            <UserShop products={products} user={user} showToast={showToast} />
          )}
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
