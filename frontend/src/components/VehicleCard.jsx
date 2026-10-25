import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  ShieldCheck, 
  Gauge, 
  Sparkles,
  Info,
  Clock,
  Car
} from 'lucide-react';

export default function VehicleCard({
  vehicle,
  currentUser,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  onViewDetails,
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [restockQty, setRestockQty] = useState('1');
  const [justPurchased, setJustPurchased] = useState(false);

  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 2;
  const isAdmin = currentUser?.role === 'admin';

  // Calculate realistic estimated monthly payment (60 mo at 5.9%)
  const monthlyEst = Math.round((vehicle.price * 1.059) / 60);

  const handlePurchaseClick = async () => {
    if (isOutOfStock || purchasing) return;
    setPurchasing(true);
    await onPurchase(vehicle.id);
    setPurchasing(false);
    setJustPurchased(true);
    setTimeout(() => setJustPurchased(false), 3000);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockQty, 10);
    if (qty > 0) {
      await onRestock(vehicle.id, qty);
      setRestockQty('1');
      setShowRestockForm(false);
    }
  };

  return (
    <div className="group relative bg-[#0C1017] rounded-xl border border-[#1E2736] hover:border-[#334155] transition-all duration-300 flex flex-col overflow-hidden hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)]">
      {/* Photo Container */}
      <div className="relative h-52 w-full overflow-hidden bg-[#07090E]">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Top Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1017] via-transparent to-black/40 pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-black/75 backdrop-blur-md text-slate-200 border border-white/10 shadow-sm">
            {vehicle.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-red-950/80 text-rose-300 border border-rose-800/60 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Allocated / Sold</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-950/80 text-amber-300 border border-amber-800/60 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Only {vehicle.quantity} Left</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{vehicle.quantity} in Showroom</span>
            </span>
          )}
        </div>

        {/* Quick Spec Watermark at Bottom of Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 pointer-events-none">
          <span className="flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Certified Dealership Stock</span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">
            VIN #{vehicle.id?.toString().padStart(6, '0')}
          </span>
        </div>
      </div>

      {/* Vehicle Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Make */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-500/90">
              {vehicle.make}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              2025 Model Series
            </span>
          </div>

          <h3 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-slate-100 transition-colors line-clamp-1">
            {vehicle.model}
          </h3>

          {/* Key Automotive Highlights */}
          <div className="mt-3.5 pt-3 border-t border-[#1A2230] grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
            <div className="bg-[#101520] p-1.5 rounded border border-[#1E2736]">
              <span className="block text-[10px] text-slate-500 uppercase">Class</span>
              <span className="font-semibold text-slate-300">{vehicle.category}</span>
            </div>
            <div className="bg-[#101520] p-1.5 rounded border border-[#1E2736]">
              <span className="block text-[10px] text-slate-500 uppercase">Delivery</span>
              <span className="font-semibold text-emerald-400">Immediate</span>
            </div>
            <div className="bg-[#101520] p-1.5 rounded border border-[#1E2736]">
              <span className="block text-[10px] text-slate-500 uppercase">Warranty</span>
              <span className="font-semibold text-slate-300">4yr / 50k</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Showroom Price
              </div>
              <div className="text-2xl font-black text-white font-display tracking-tight">
                ${vehicle.price.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium block">
                Est. ${monthlyEst.toLocaleString()}/mo
              </span>
              <span className="text-[10px] text-slate-500">MSRP Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Actions Area */}
        <div className="mt-5 pt-3.5 border-t border-[#1E2736] space-y-3">
          {/* Purchase Button */}
          <button
            onClick={handlePurchaseClick}
            disabled={isOutOfStock || purchasing}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-200 ${
              isOutOfStock
                ? 'bg-[#141A24] text-slate-500 cursor-not-allowed border border-[#1E2736]'
                : justPurchased
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-white hover:bg-slate-200 text-[#090A0F] active:scale-[0.98] shadow-md shadow-black/40'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : purchasing ? (
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </span>
            ) : justPurchased ? (
              <span className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-white" />
                <span>Vehicle Acquired!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Acquire Vehicle</span>
              </span>
            )}
          </button>

          {/* Admin Fleet Management Bar */}
          {isAdmin && (
            <div className="pt-2 border-t border-[#1A2230]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/90 flex items-center space-x-1">
                  <span>Fleet Controls</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Stock: <strong className="text-slate-300">{vehicle.quantity}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(vehicle)}
                  className="py-1.5 px-2 rounded bg-[#101520] hover:bg-[#161D2B] text-slate-300 text-[11px] font-medium border border-[#1E2736] hover:border-slate-600 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-slate-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRestockForm(!showRestockForm)}
                  className="py-1.5 px-2 rounded bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-[11px] font-medium border border-amber-800/40 hover:border-amber-700/60 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>Restock</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(vehicle.id)}
                  className="py-1.5 px-2 rounded bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-[11px] font-medium border border-rose-800/40 hover:border-rose-700/60 flex items-center justify-center space-x-1 transition-colors"
                  title="Remove from fleet inventory"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Inline Restock Dropdown */}
              {showRestockForm && (
                <form
                  onSubmit={handleRestockSubmit}
                  className="mt-2.5 p-2 rounded-lg bg-[#080B10] border border-amber-800/40 animate-in fade-in duration-150"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      className="w-16 px-2 py-1 rounded bg-[#121824] border border-[#232F42] text-white text-xs font-mono text-center focus:outline-none focus:border-amber-500"
                      required
                    />
                    <div className="flex space-x-1 flex-1">
                      <button
                        type="button"
                        onClick={() => setRestockQty('1')}
                        className="px-1.5 py-1 text-[10px] bg-[#161D2B] hover:bg-[#20293D] text-slate-300 rounded border border-[#232F42]"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestockQty('5')}
                        className="px-1.5 py-1 text-[10px] bg-[#161D2B] hover:bg-[#20293D] text-slate-300 rounded border border-[#232F42]"
                      >
                        +5
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1 px-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Add Stock
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
