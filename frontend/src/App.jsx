import React, { useState, useEffect } from 'react';
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
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [vehicles, setVehicles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dealership_token') || '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
      if (searchQuery || categoryFilter || minPrice || maxPrice) {
        res = await api.searchVehicles(token, {
          make: searchQuery,
          category: categoryFilter,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        });
      } else {
        res = await api.getVehicles(token);
      }

      if (res.success) {
        setVehicles(res.vehicles || []);
      } else {
        if (res.message?.includes('token')) {
          handleLogout();
        }
      }
    } catch (err) {
      showToast('Error connecting to backend service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicles();
    }
  }, [token, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
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
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setVehicles([]);
    localStorage.removeItem('dealership_token');
    localStorage.removeItem('dealership_user');
    showToast('Logged out successfully', 'info');
  };

  // Vehicle Actions
  const handlePurchase = async (vehicleId) => {
    try {
      const res = await api.purchaseVehicle(token, vehicleId);
      if (res.success) {
        showToast('Vehicle purchased successfully! Inventory updated.');
        fetchVehicles();
      } else {
        showToast(res.message || 'Purchase failed', 'error');
      }
    } catch (err) {
      showToast('Failed to purchase vehicle', 'error');
    }
  };

  const handleRestock = async (vehicleId, quantity) => {
    try {
      const res = await api.restockVehicle(token, vehicleId, quantity);
      if (res.success) {
        showToast(`Successfully restocked ${quantity} vehicle(s).`);
        fetchVehicles();
      } else {
        showToast(res.message || 'Restock failed', 'error');
      }
    } catch (err) {
      showToast('Restock error', 'error');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from inventory?')) return;
    try {
      const res = await api.deleteVehicle(token, vehicleId);
      if (res.success) {
        showToast('Vehicle deleted successfully.');
        fetchVehicles();
      } else {
        showToast(res.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Failed to delete vehicle', 'error');
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
            ? 'Vehicle updated successfully!'
            : 'New vehicle added to inventory!'
        );
        fetchVehicles();
      } else {
        throw new Error(res.message || 'Action failed');
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center space-x-3 text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
              : notification.type === 'info'
              ? 'bg-slate-900/90 text-slate-300 border-slate-700'
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>AutoVanguard</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Dealership
                </span>
              </h1>
              <p className="text-xs text-slate-400">Inventory Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-amber-400" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="text-xs font-semibold text-slate-200">
                    {currentUser.username}
                  </span>
                  <span
                    className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setVehicleToEdit(null);
                      setIsVehicleModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Vehicle</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {!currentUser ? (
          /* Unauthenticated Landing State */
          <div className="py-16 text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              High Performance Vehicle Inventory
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Welcome to the full-stack Car Dealership Inventory System built with
              Node/Express, TypeScript, SQLite, and React with Tailwind CSS. Sign in to
              browse luxury inventory, purchase cars, or manage vehicles as an Administrator.
            </p>

            <div className="pt-4 flex justify-center space-x-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/30 transition-all text-sm"
              >
                Get Started / Sign In
              </button>
            </div>

            {/* Quick credentials card */}
            <div className="mt-8 p-5 rounded-2xl glass-card text-left max-w-md mx-auto border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200 uppercase tracking-wider mb-2">
                Available Demo Credentials
              </p>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Admin User:</span>
                <span className="text-amber-300 font-mono">admin@dealership.com / AdminPassword123!</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Customer User:</span>
                <span className="text-indigo-300 font-mono">customer@dealership.com / UserPassword123!</span>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div>
            {/* Search and Filters Bar */}
            <section className="glass-card rounded-2xl p-5 mb-8 border border-slate-800/80 shadow-lg">
              <form
                onSubmit={handleSearchSubmit}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                {/* Make Search */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by make (e.g. Tesla, Porsche)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="md:col-span-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Truck">Truck</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Min Price */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    placeholder="Min Price ($)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Max Price */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    placeholder="Max Price ($)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Filter Actions */}
                <div className="md:col-span-1 flex space-x-1.5">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center shadow"
                    title="Apply Search"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  {(searchQuery || categoryFilter || minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      title="Clear Filters"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Inventory Section Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Available Showroom Inventory
                </h2>
                <p className="text-xs text-slate-400">
                  Showing {vehicles.length} vehicle(s) in database
                </p>
              </div>

              <button
                onClick={fetchVehicles}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="mt-3 text-sm text-slate-400">Loading vehicles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-2xl border border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-300">No Vehicles Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No vehicles match the selected search or filter criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicles.map((vehicle) => (
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
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AutoVanguard Car Dealership Inventory System • TDD Kata Project</p>
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
