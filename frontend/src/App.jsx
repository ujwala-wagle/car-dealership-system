import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import AuthModal from './components/AuthModal';
import VehicleCard from './components/VehicleCard';
import VehicleFormModal from './components/VehicleFormModal';
import {
  Car,
  Search,
  Filter,
  Plus,
  LogIn,
  LogOut,
  Shield,
  User as UserIcon,
  RefreshCw,
  LayoutGrid,
  List,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';

const CATEGORIES = ['All', 'Sedan', 'Coupe', 'SUV', 'Truck', 'Convertible', 'Electric'];

export default function App() {
  const [vehicles, setVehicles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dealership_token') || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // View state: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('dealership_user');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dealership_user');
      }
    }
  }, [token]);

  const fetchVehicles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let res;
      const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
      if (searchQuery || categoryParam || minPrice || maxPrice) {
        res = await api.searchVehicles(token, {
          make: searchQuery,
          category: categoryParam,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        });
      } else {
        res = await api.getVehicles(token);
      }

      if (res.success) {
        setVehicles(res.vehicles || []);
      } else {
        if (res.message?.includes('token') || res.message?.includes('auth')) {
          handleLogout();
        }
      }
    } catch (err) {
      showToast('Unable to connect to inventory service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicles();
    }
  }, [token, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    if (token) {
      api.getVehicles(token).then((res) => {
        if (res.success) setVehicles(res.vehicles || []);
      });
    }
  };

  const handleAuthSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('dealership_token', newToken);
    localStorage.setItem('dealership_user', JSON.stringify(user));
    showToast(`Access granted. Welcome, ${user.username}`);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setVehicles([]);
    localStorage.removeItem('dealership_token');
    localStorage.removeItem('dealership_user');
    showToast('Signed out of dealership terminal', 'info');
  };

  // Vehicle Actions
  const handlePurchase = async (vehicleId) => {
    try {
      const res = await api.purchaseVehicle(token, vehicleId);
      if (res.success) {
        showToast('Vehicle acquired! Stock allocation updated in real-time.');
        fetchVehicles();
      } else {
        showToast(res.message || 'Acquisition failed', 'error');
      }
    } catch (err) {
      showToast('Acquisition transaction failed', 'error');
    }
  };

  const handleRestock = async (vehicleId, quantity) => {
    try {
      const res = await api.restockVehicle(token, vehicleId, quantity);
      if (res.success) {
        showToast(`Stock replenished by +${quantity} unit(s).`);
        fetchVehicles();
      } else {
        showToast(res.message || 'Restock failed', 'error');
      }
    } catch (err) {
      showToast('Restock command failed', 'error');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Confirm decommissioning of this vehicle from the showroom inventory?')) return;
    try {
      const res = await api.deleteVehicle(token, vehicleId);
      if (res.success) {
        showToast('Vehicle record successfully decommissioned.');
        fetchVehicles();
      } else {
        showToast(res.message || 'Decommissioning failed', 'error');
      }
    } catch (err) {
      showToast('Error removing vehicle record', 'error');
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      let res;
      if (vehicleToEdit) {
        res = await api.updateVehicle(token, vehicleToEdit.id, vehicleData);
      } else {
        res = await api.createVehicle(token, vehicleData);
      }

      if (res.success) {
        showToast(
          vehicleToEdit
            ? 'Vehicle specification updated.'
            : 'New vehicle registered in fleet.'
        );
        fetchVehicles();
      } else {
        throw new Error(res.message || 'Operation failed');
      }
    } catch (err) {
      throw err;
    }
  };

  // Sort and computed vehicles
  const sortedVehicles = useMemo(() => {
    const list = [...vehicles];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'stock') {
      return list.sort((a, b) => b.quantity - a.quantity);
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.make.localeCompare(b.make));
    }
    return list;
  }, [vehicles, sortBy]);

  // Compute Fleet Analytics
  const fleetStats = useMemo(() => {
    const totalValue = vehicles.reduce((sum, v) => sum + v.price * v.quantity, 0);
    const totalUnits = vehicles.reduce((sum, v) => sum + v.quantity, 0);
    const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;
    return {
      totalValue,
      totalUnits,
      modelsCount: vehicles.length,
      outOfStockCount,
    };
  }, [vehicles]);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center space-x-3 text-xs font-semibold tracking-wide animate-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : notification.type === 'info'
              ? 'bg-[#101520] text-slate-200 border-[#1E2736]'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Enterprise Ticker / Market Bar */}
      <div className="bg-[#05060A] border-b border-[#141A24] px-6 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SHOWROOM LIVE</span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              Private Client Exchange & Fleet Operations
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-mono">
            <span>CURRENCY: USD ($)</span>
            <span className="text-slate-600">|</span>
            <span>VERIFIED TITLE PROTOCOL</span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/90 backdrop-blur-md border-b border-[#1A2230] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-[0.15em] text-white font-display">
                  AUTOVANGUARD
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MOTOR GROUP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Dealership Inventory Management
              </p>
            </div>
          </div>

          {/* User Profile / Access Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* User Pill */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#0F141F] border border-[#1E2736]">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block leading-none">
                      {currentUser.username}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400/90 leading-none">
                      {currentUser.role === 'admin' ? 'Dealer Principal' : 'Private Client'}
                    </span>
                  </div>
                </div>

                {/* Add Vehicle Button (Admin) */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setVehicleToEdit(null);
                      setIsVehicleModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-black" />
                    <span>Add Vehicle</span>
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#161D2B] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Showroom Access</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {!currentUser ? (
          /* Unauthenticated Landing / Showroom Teaser */
          <div className="space-y-12 py-6">
            {/* Executive Hero */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#0E131E] to-[#080B10] border border-[#1A2333] p-8 md:p-14 overflow-hidden text-center md:text-left shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Private Dealer Allocation Platform</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  Curated Luxury & High-Performance Vehicle Inventory
                </h1>

                <p className="mt-4 text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl">
                  Enterprise-grade vehicle lifecycle and dealership inventory management.
                  Browse live verified stock, purchase high-value vehicles with instant inventory decrement,
                  and manage showroom allocations with role-based access control.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    Enter Showroom Portal
                  </button>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium px-3 py-2 rounded-lg bg-[#111724] border border-[#1E2736]">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Inventory Synchronization</span>
                  </div>
                </div>
              </div>

              {/* Dealership Highlights */}
              <div className="mt-12 pt-8 border-t border-[#182130] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Verified CPO Fleet</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Every vehicle in stock is backed by full title inspection and immediate transfer eligibility.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Zero-Delay Allocation</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Stock counters update instantaneously upon customer acquisition, strictly preventing overselling.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span>Dealer Principal DMS</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Comprehensive restock, vehicle decommissioning, and price adjustments via administrative controls.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Callout */}
            <div className="max-w-xl mx-auto rounded-xl bg-[#0D121B] border border-[#1E2736] p-6 text-center shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-display">
                Evaluation Credentials Available
              </span>
              <h3 className="text-base font-bold text-white mt-1 mb-2 font-display">
                Test Both Admin & Customer Perspectives
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Click below to open the portal and select pre-seeded 1-click credentials to test purchases,
                out-of-stock boundary conditions, and administrative restock workflows.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-[#141B26] hover:bg-[#1A2332] text-slate-200 border border-[#232F42] hover:border-amber-500/50 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Sign In with Demo Credentials
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-8">
            {/* Executive Fleet KPI Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0C1017] rounded-xl border border-[#1A2230] p-4.5 flex items-center space-x-3.5">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Fleet Value
                  </span>
                  <span className="text-xl font-black text-white font-display">
                    ${fleetStats.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#0C1017] rounded-xl border border-[#1A2230] p-4.5 flex items-center space-x-3.5">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Registered Models
                  </span>
                  <span className="text-xl font-black text-white font-display">
                    {fleetStats.modelsCount} Vehicles
                  </span>
                </div>
              </div>

              <div className="bg-[#0C1017] rounded-xl border border-[#1A2230] p-4.5 flex items-center space-x-3.5">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Units in Showroom
                  </span>
                  <span className="text-xl font-black text-white font-display">
                    {fleetStats.totalUnits} Available
                  </span>
                </div>
              </div>

              <div className="bg-[#0C1017] rounded-xl border border-[#1A2230] p-4.5 flex items-center space-x-3.5">
                <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Sold Out / Allocated
                  </span>
                  <span className="text-xl font-black text-white font-display">
                    {fleetStats.outOfStockCount} Units
                  </span>
                </div>
              </div>
            </section>

            {/* Automotive Concierge Search & Filter Console */}
            <section className="bg-[#0C1017] rounded-xl border border-[#1A2230] p-5 shadow-lg">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {/* Search Bar + Controls Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Make/Model Search Input */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search make or model (e.g. Porsche, Tesla, BMW)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Price Min/Max */}
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      placeholder="Min Price ($)"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <input
                      type="number"
                      placeholder="Max Price ($)"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-3 flex items-center space-x-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Filter className="w-3.5 h-3.5 text-black" />
                      <span>Apply Search</span>
                    </button>

                    {(searchQuery || selectedCategory !== 'All' || minPrice || maxPrice) && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="py-2 px-3 rounded-lg bg-[#141A24] hover:bg-[#1C2534] text-slate-300 text-xs font-medium border border-[#232F42] transition-colors"
                        title="Clear filters"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Pills & Sorting Bar */}
                <div className="pt-3 border-t border-[#182130] flex flex-wrap items-center justify-between gap-3">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                      Category:
                    </span>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-[#101520] hover:bg-[#161D2B] text-slate-400 hover:text-slate-200 border border-[#1E2736]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Right: Sort and View Mode Switcher */}
                  <div className="flex items-center space-x-3 ml-auto">
                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#101520] border border-[#1E2736] rounded-md px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="featured">Featured Order</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="stock">Stock Available</option>
                        <option value="name">Make (A-Z)</option>
                      </select>
                    </div>

                    {/* View Switcher: Grid vs Table */}
                    <div className="flex items-center bg-[#101520] rounded-md border border-[#1E2736] p-0.5">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-1 rounded ${
                          viewMode === 'grid'
                            ? 'bg-[#1E2736] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Showroom Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`p-1 rounded ${
                          viewMode === 'table'
                            ? 'bg-[#1E2736] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Fleet Table View"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </section>

            {/* Inventory Showcase Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display tracking-tight flex items-center space-x-2">
                  <span>Showroom Fleet Inventory</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({sortedVehicles.length} of {vehicles.length} vehicles)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time stock verified by AutoVanguard Dealership Management Protocol
                </p>
              </div>

              <button
                onClick={fetchVehicles}
                disabled={loading}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#141A24] border border-transparent hover:border-[#232F42] transition-colors flex items-center space-x-1.5 text-xs font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Sync Inventory</span>
              </button>
            </div>

            {/* Vehicles Presentation */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
                  Retrieving showroom vehicles...
                </p>
              </div>
            ) : sortedVehicles.length === 0 ? (
              <div className="py-20 text-center bg-[#0C1017] rounded-xl border border-[#1A2230] p-8">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300 font-display">
                  No Showroom Matches Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No vehicles match the selected criteria. Adjust your search keywords or price brackets.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#141A24] hover:bg-[#1C2534] text-xs text-amber-400 font-semibold border border-[#232F42] transition-colors"
                >
                  Reset All Criteria
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    currentUser={currentUser}
                    onPurchase={handlePurchase}
                    onEdit={(veh) => {
                      setVehicleToEdit(veh);
                      setIsVehicleModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    onRestock={handleRestock}
                  />
                ))}
              </div>
            ) : (
              /* Executive Fleet Table View */
              <div className="bg-[#0C1017] rounded-xl border border-[#1A2230] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1A2230] bg-[#080B10] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="py-3 px-4">Vehicle</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price (USD)</th>
                        <th className="py-3 px-4">Showroom Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151D2A]">
                      {sortedVehicles.map((vehicle) => {
                        const isOutOfStock = vehicle.quantity === 0;
                        return (
                          <tr
                            key={vehicle.id}
                            className="hover:bg-[#101520] transition-colors group"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={vehicle.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80'}
                                  alt={vehicle.model}
                                  className="w-12 h-8 rounded object-cover bg-black"
                                />
                                <div>
                                  <div className="font-bold text-white font-display">
                                    {vehicle.make} {vehicle.model}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    VIN #{vehicle.id?.toString().padStart(6, '0')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              <span className="px-2 py-0.5 rounded bg-[#101520] border border-[#1E2736] text-[10px]">
                                {vehicle.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-white font-mono text-sm">
                              ${vehicle.price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-300">
                              {vehicle.quantity} Units
                            </td>
                            <td className="py-3 px-4">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                  <span>Allocated</span>
                                </span>
                              ) : vehicle.quantity <= 2 ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                  <span>Low Stock</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  <span>Available</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handlePurchase(vehicle.id)}
                                  disabled={isOutOfStock}
                                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                    isOutOfStock
                                      ? 'bg-[#151D2A] text-slate-600 cursor-not-allowed'
                                      : 'bg-white hover:bg-slate-200 text-black'
                                  }`}
                                >
                                  Acquire
                                </button>

                                {currentUser.role === 'admin' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setVehicleToEdit(vehicle);
                                        setIsVehicleModalOpen(true);
                                      }}
                                      className="px-2 py-1.5 rounded bg-[#121824] hover:bg-[#1A2230] text-slate-300 border border-[#232F42] text-[11px]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(vehicle.id)}
                                      className="px-2 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px]"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#05060A] border-t border-[#141A24] py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-widest text-slate-300 font-display">
              AUTOVANGUARD
            </span>
            <span className="text-slate-400">•</span>
            <span>Enterprise Dealership Inventory System</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Automotive Fleet Architecture • Verified Title Protocol
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setVehicleToEdit(null);
        }}
        onSubmit={handleSaveVehicle}
        vehicleToEdit={vehicleToEdit}
      />
    </div>
  );
}
