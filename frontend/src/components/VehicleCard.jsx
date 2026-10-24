import React, { useState } from 'react';
import { ShoppingCart, Edit3, Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function VehicleCard({
  vehicle,
  currentUser,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [restockQty, setRestockQty] = useState('');
  const [showRestockInput, setShowRestockInput] = useState(false);

  const isOutOfStock = vehicle.quantity === 0;
  const isAdmin = currentUser?.role === 'admin';

  const handlePurchaseClick = async () => {
    if (isOutOfStock || purchasing) return;
    setPurchasing(true);
    await onPurchase(vehicle.id);
    setPurchasing(false);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockQty, 10);
    if (qty > 0) {
      await onRestock(vehicle.id, qty);
      setRestockQty('');
      setShowRestockInput(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Vehicle Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-300 border border-slate-700/50">
          {vehicle.category}
        </div>
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Sold Out
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {vehicle.quantity} in Stock
            </span>
          )}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <p className="text-2xl font-black text-indigo-400 tracking-tight mb-4">
            ${vehicle.price.toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          {/* Purchase Button */}
          <button
            onClick={handlePurchaseClick}
            disabled={isOutOfStock || purchasing}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : purchasing
                ? 'Purchasing...'
                : 'Purchase Vehicle'}
            </span>
          </button>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
                <span>Admin Actions</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(vehicle)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setShowRestockInput(!showRestockInput)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium flex items-center justify-center space-x-1.5 border border-emerald-800/50 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restock</span>
                </button>

                <button
                  onClick={() => onDelete(vehicle.id)}
                  className="py-1.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium flex items-center justify-center space-x-1.5 border border-rose-800/50 transition-colors"
                  title="Delete Vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>

              {/* Expandable Restock Field */}
              {showRestockInput && (
                <form
                  onSubmit={handleRestockSubmit}
                  className="mt-3 flex items-center space-x-2 animate-in fade-in duration-150"
                >
                  <input
                    type="number"
                    min="1"
                    placeholder="Units"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                  >
                    Confirm Add
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
