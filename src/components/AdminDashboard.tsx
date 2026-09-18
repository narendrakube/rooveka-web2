import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Tag, 
  ArrowLeft, 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Search, 
  DollarSign,
  MapPin,
  CreditCard,
  Plus,
  Layers,
  ImageIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImageGraphic } from './ProductImageGraphic';
import { AddProductModal } from './AddProductModal';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminViewOpen, 
    setIsAdminViewOpen, 
    orders, 
    updateOrderStatus, 
    products, 
    updateProductPrice, 
    pricingConfig, 
    updateFreeShippingThreshold,
    refreshProducts,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'pricing' | 'products'>('analytics');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});
  const [editingThreshold, setEditingThreshold] = useState<number>(pricingConfig.freeShippingThreshold);
  const [showAddProduct, setShowAddProduct] = useState(false);

  if (!isAdminViewOpen) return null;

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.status !== 'Cancelled' ? order.totalAmount : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const dispatchedOrdersCount = orders.filter((o) => o.status === 'Dispatched').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Filtered Orders List
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = orderStatusFilter === 'All' || ord.status === orderStatusFilter;
    const matchesSearch = 
      ord.orderId.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.phone.includes(orderSearchQuery) ||
      ord.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePriceInputChange = (productId: string, sizeLabel: string, value: string) => {
    const key = `${productId}-${sizeLabel}`;
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setEditingPrices({ ...editingPrices, [key]: num });
    }
  };

  const handleSavePrice = (productId: string, sizeLabel: string, currentPrice: number) => {
    const key = `${productId}-${sizeLabel}`;
    const newPrice = editingPrices[key] !== undefined ? editingPrices[key] : currentPrice;
    updateProductPrice(productId, sizeLabel, newPrice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-rooveka-cream overflow-y-auto font-sans text-rooveka-dark animate-fade-in">
      
      {/* Admin Top Navigation Header */}
      <header className="bg-rooveka-dark text-rooveka-cream border-b border-rooveka-gold/30 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rooveka-gold text-rooveka-dark flex items-center justify-center font-serif font-bold text-lg">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-serif font-bold text-rooveka-cream uppercase tracking-wider">
                  ROOVEKA ADMIN
                </h1>
                <span className="bg-rooveka-gold/20 text-rooveka-gold text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-rooveka-gold/40 uppercase">
                  MANAGEMENT
                </span>
              </div>
              <p className="text-[11px] text-rooveka-cream/70 font-mono">
                Sales Analytics, Orders & Live Pricing Controls
              </p>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAdminViewOpen(false)}
              className="px-4 py-2 bg-rooveka-cream/10 hover:bg-rooveka-gold hover:text-rooveka-dark text-rooveka-cream text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 border border-rooveka-cream/20"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO STORE</span>
            </button>
          </div>

        </div>

        {/* Tab Selection Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 border-t border-rooveka-cream/10 pt-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-rooveka-gold text-rooveka-gold bg-rooveka-gold/10'
                : 'border-transparent text-rooveka-cream/70 hover:text-rooveka-cream'
            }`}
          >
            <BarChart3 size={16} />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-rooveka-gold text-rooveka-gold bg-rooveka-gold/10'
                : 'border-transparent text-rooveka-cream/70 hover:text-rooveka-cream'
            }`}
          >
            <Package size={16} />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'pricing'
                ? 'border-rooveka-gold text-rooveka-gold bg-rooveka-gold/10'
                : 'border-transparent text-rooveka-cream/70 hover:text-rooveka-cream'
            }`}
          >
            <Tag size={16} />
            <span>Price & Catalog Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-rooveka-gold text-rooveka-gold bg-rooveka-gold/10'
                : 'border-transparent text-rooveka-cream/70 hover:text-rooveka-cream'
            }`}
          >
            <Layers size={16} />
            <span>Products Catalog ({products.length})</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* =================================================================== */}
        {/* TAB 1: OVERVIEW & SALES ANALYTICS */}
        {/* =================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Revenue Card */}
              <div className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-muted">
                    TOTAL SALES REVENUE
                  </span>
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-rooveka-dark">
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono mt-1 block">
                    All completed orders
                  </span>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-muted">
                    TOTAL ORDERS
                  </span>
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-rooveka-dark">
                    {totalOrdersCount}
                  </div>
                  <span className="text-[11px] text-rooveka-muted font-mono mt-1 block">
                    {pendingOrdersCount} Pending | {dispatchedOrdersCount} Dispatched
                  </span>
                </div>
              </div>

              {/* AOV Card */}
              <div className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-muted">
                    AVERAGE ORDER VALUE
                  </span>
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-rooveka-dark">
                    ₹{averageOrderValue}
                  </div>
                  <span className="text-[11px] text-rooveka-muted font-mono mt-1 block">
                    Per transaction average
                  </span>
                </div>
              </div>

              {/* Delivered Count Card */}
              <div className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-muted">
                    DELIVERED ORDERS
                  </span>
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-rooveka-dark">
                    {deliveredOrdersCount}
                  </div>
                  <span className="text-[11px] text-purple-700 font-mono mt-1 block">
                    Successful fulfillments
                  </span>
                </div>
              </div>

            </div>

            {/* Product Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Product Catalog Performance */}
              <div className="lg:col-span-7 bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border space-y-4">
                <div className="flex items-center justify-between border-b border-rooveka-border/60 pb-3">
                  <h3 className="text-base font-serif font-bold text-rooveka-dark uppercase tracking-wider">
                    Product Performance Summary
                  </h3>
                  <span className="text-xs font-mono text-rooveka-gold uppercase font-bold">3 PRODUCTS</span>
                </div>

                <div className="space-y-4">
                  {products.map((prod) => (
                    <div key={prod.id} className="p-4 bg-rooveka-cream rounded-xl border border-rooveka-border/60 flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-rooveka-brown/10 border">
                          <ProductImageGraphic tag={prod.imageTag} aspect="aspect-square" className="w-full h-full" />
                        </div>
                        <div>
                          <h4 className="text-xs font-serif font-bold text-rooveka-dark">{prod.name}</h4>
                          <span className="text-[10px] text-rooveka-muted font-mono">{prod.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-serif font-bold text-rooveka-dark">
                          Starting at ₹{prod.sizes[0].price}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono uppercase font-semibold">
                          Active in Store
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Quick Recent Orders */}
              <div className="lg:col-span-5 bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border space-y-4">
                <div className="flex items-center justify-between border-b border-rooveka-border/60 pb-3">
                  <h3 className="text-base font-serif font-bold text-rooveka-dark uppercase tracking-wider">
                    Recent Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-rooveka-gold font-semibold uppercase hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((ord) => (
                    <div key={ord.orderId} className="p-3 bg-rooveka-cream rounded-xl border border-rooveka-border/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-rooveka-dark">{ord.orderId}</div>
                        <div className="text-rooveka-muted font-light">{ord.customerName} ({ord.city})</div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif font-bold text-rooveka-dark">₹{ord.totalAmount}</div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ORDERS MANAGEMENT TABLE */}
        {/* =================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Filter and Search Bar */}
            <div className="bg-rooveka-cream-soft p-4 rounded-2xl border border-rooveka-border flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {['All', 'Pending', 'Dispatched', 'Delivered', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      orderStatusFilter === status
                        ? 'bg-rooveka-dark text-rooveka-cream shadow-sm'
                        : 'bg-rooveka-cream text-rooveka-muted hover:text-rooveka-dark border border-rooveka-border/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-3 text-rooveka-muted" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Name, Phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-rooveka-cream border border-rooveka-border rounded-lg text-xs text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-rooveka-cream-soft rounded-2xl border border-rooveka-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-rooveka-dark">
                  <thead className="bg-rooveka-dark text-rooveka-cream uppercase tracking-wider font-mono text-[10px] border-b border-rooveka-gold/20">
                    <tr>
                      <th className="py-3.5 px-4">Order ID & Date</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Items Ordered</th>
                      <th className="py-3.5 px-4">Total & Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-rooveka-border/50">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-rooveka-muted font-serif italic">
                          No orders matching the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-rooveka-cream transition-colors">
                          
                          {/* Order ID & Date */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-mono font-bold text-rooveka-dark text-xs">
                              {ord.orderId}
                            </div>
                            <div className="text-[10px] text-rooveka-muted font-mono mt-0.5">
                              {ord.createdAt}
                            </div>
                          </td>

                          {/* Customer Details */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-rooveka-dark">
                              {ord.customerName}
                            </div>
                            <div className="text-[11px] text-rooveka-muted font-mono flex items-center space-x-1 mt-0.5">
                              <MapPin size={10} className="text-rooveka-gold shrink-0" />
                              <span>{ord.city}, {ord.state} ({ord.pincode})</span>
                            </div>
                            <div className="text-[10px] text-rooveka-muted font-mono">
                              Ph: {ord.phone}
                            </div>
                          </td>

                          {/* Items Ordered */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-[11px]">
                                  <span className="w-4 h-4 bg-rooveka-gold/20 text-rooveka-dark font-mono font-bold rounded flex items-center justify-center text-[9px]">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-medium text-rooveka-dark">{item.name}</span>
                                  <span className="text-rooveka-muted font-mono">({item.selectedSize})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total & Payment Method */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-serif font-bold text-rooveka-dark text-sm">
                              ₹{ord.totalAmount}
                            </div>
                            <div className="text-[10px] font-mono text-rooveka-muted uppercase mt-0.5 flex items-center space-x-1">
                              <CreditCard size={10} className="text-rooveka-gold" />
                              <span>METHOD: {ord.paymentMethod.toUpperCase()}</span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 align-top">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              ord.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              ord.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {ord.status === 'Pending' && <Clock size={12} />}
                              {ord.status === 'Dispatched' && <Truck size={12} />}
                              {ord.status === 'Delivered' && <CheckCircle2 size={12} />}
                              {ord.status === 'Cancelled' && <XCircle size={12} />}
                              <span>{ord.status}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-4 align-top text-right space-y-1">
                            {ord.status === 'Pending' && (
                              <button
                                onClick={() => updateOrderStatus(ord.orderId, 'Dispatched')}
                                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors block w-full text-center"
                              >
                                MARK DISPATCHED
                              </button>
                            )}

                            {(ord.status === 'Pending' || ord.status === 'Dispatched') && (
                              <button
                                onClick={() => updateOrderStatus(ord.orderId, 'Delivered')}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors block w-full text-center"
                              >
                                MARK DELIVERED
                              </button>
                            )}

                            {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                              <button
                                onClick={() => updateOrderStatus(ord.orderId, 'Cancelled')}
                                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[10px] uppercase font-bold tracking-wider transition-colors block w-full text-center"
                              >
                                CANCEL ORDER
                              </button>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: PRICE & CATALOG SETTINGS */}
        {/* =================================================================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Info Banner */}
            <div className="bg-rooveka-dark text-rooveka-cream p-6 rounded-2xl border border-rooveka-gold/30 shadow-lg flex items-start space-x-4">
              <div className="p-3 bg-rooveka-gold/20 text-rooveka-gold rounded-xl shrink-0">
                <Tag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-rooveka-gold uppercase tracking-wider">
                  Live Price Management Center
                </h3>
                <p className="text-xs text-rooveka-cream/80 font-light leading-relaxed">
                  Easily update product pricing across all size options. Any changes made here immediately take effect on the storefront, product catalog, customizer modals, and shopping cart.
                </p>
                <p className="text-[11px] text-rooveka-gold font-mono pt-1">
                  * Note: Master defaults are defined in <code className="bg-black/30 px-1 py-0.5 rounded">src/config/pricing.ts</code> for zero-code price maintenance.
                </p>
              </div>
            </div>

            {/* Products Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border shadow-sm flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-3">
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-rooveka-brown/10 border border-rooveka-border">
                      <ProductImageGraphic tag={prod.imageTag} aspect="aspect-full" className="w-full h-full" />
                    </div>

                    <div>
                      <span className="text-[9px] tracking-mega uppercase font-bold text-rooveka-gold block">
                        {prod.category}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-rooveka-dark">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-rooveka-muted line-clamp-2 mt-0.5">
                        {prod.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Size Variants Pricing Form */}
                  <div className="space-y-3 pt-4 border-t border-rooveka-border/60">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-rooveka-dark block">
                      SIZE & PRICE VARIANTS (INR)
                    </span>

                    {prod.sizes.map((size) => {
                      const inputKey = `${prod.id}-${size.label}`;
                      const currentVal = editingPrices[inputKey] !== undefined ? editingPrices[inputKey] : size.price;
                      return (
                        <div key={size.label} className="p-3 bg-rooveka-cream rounded-xl border border-rooveka-border/60 flex items-center justify-between space-x-3">
                          <div className="text-xs font-mono font-bold text-rooveka-dark">
                            {size.label}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-rooveka-dark font-bold">₹</span>
                            <input
                              type="number"
                              value={currentVal}
                              onChange={(e) => handlePriceInputChange(prod.id, size.label, e.target.value)}
                              className="w-20 px-2 py-1 bg-rooveka-cream-soft border border-rooveka-border rounded text-xs font-mono font-bold text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                            />
                            <button
                              onClick={() => handleSavePrice(prod.id, size.label, size.price)}
                              className="px-2.5 py-1 bg-rooveka-dark hover:bg-rooveka-gold hover:text-rooveka-dark text-rooveka-cream text-[10px] uppercase font-bold tracking-wider rounded transition-colors"
                              title="Save Price"
                            >
                              SAVE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

            {/* Store Shipping Settings */}
            <div className="bg-rooveka-cream-soft p-6 rounded-2xl border border-rooveka-border space-y-4">
              <h3 className="text-base font-serif font-bold text-rooveka-dark uppercase tracking-wider">
                Store Shipping Policy Settings
              </h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-rooveka-cream rounded-xl border border-rooveka-border/60">
                <div>
                  <h4 className="text-xs font-bold text-rooveka-dark uppercase">Free Shipping Threshold</h4>
                  <p className="text-xs text-rooveka-muted font-light">Minimum cart subtotal required for free express delivery in India.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-rooveka-dark font-bold">₹</span>
                  <input
                    type="number"
                    value={editingThreshold}
                    onChange={(e) => setEditingThreshold(parseInt(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 bg-rooveka-cream-soft border border-rooveka-border rounded text-xs font-mono font-bold text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                  />
                  <button
                    onClick={() => updateFreeShippingThreshold(editingThreshold)}
                    className="px-4 py-2 bg-rooveka-dark hover:bg-rooveka-brown text-rooveka-cream text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                  >
                    UPDATE
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: PRODUCTS CATALOG */}
        {/* =================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-rooveka-dark">Products Catalog</h2>
                <p className="text-xs text-rooveka-muted mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in the store</p>
              </div>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-rooveka-dark hover:bg-rooveka-brown text-rooveka-cream text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                <Plus size={15} />
                Add Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-rooveka-border shadow-sm overflow-hidden">
                  {/* Image / graphic area */}
                  <div className="h-40 bg-rooveka-cream-soft flex items-center justify-center relative">
                    {prod.images && prod.images.length > 0 ? (
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-24 h-24">
                        <ProductImageGraphic tag={prod.imageTag} aspect="aspect-square" />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      prod.status === 'Inactive'
                        ? 'bg-stone-200 text-stone-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {prod.status ?? 'Active'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-rooveka-dark text-sm leading-tight">{prod.name}</h3>
                        <p className="text-[11px] text-rooveka-muted mt-0.5">{prod.category}</p>
                      </div>
                      {prod.sku && (
                        <span className="text-[10px] font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded flex-shrink-0">{prod.sku}</span>
                      )}
                    </div>
                    <p className="text-xs text-rooveka-muted line-clamp-2">{prod.shortDescription}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map(s => (
                          <span key={s.label} className="text-[11px] bg-rooveka-cream-soft border border-rooveka-border rounded px-2 py-0.5 font-mono font-semibold text-rooveka-dark">
                            {s.label} — ₹{s.price}
                          </span>
                        ))}
                      </div>
                      {typeof prod.stockQuantity === 'number' && (
                        <span className={`text-[10px] font-semibold ml-2 flex-shrink-0 ${prod.stockQuantity === 0 ? 'text-red-500' : 'text-rooveka-muted'}`}>
                          Stock: {prod.stockQuantity}
                        </span>
                      )}
                    </div>
                    {prod.tags && prod.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {prod.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-rooveka-gold/10 text-rooveka-brown border border-rooveka-gold/30 rounded px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onSuccess={async () => {
            await refreshProducts();
            setShowAddProduct(false);
          }}
        />
      )}

    </div>
  );
};
