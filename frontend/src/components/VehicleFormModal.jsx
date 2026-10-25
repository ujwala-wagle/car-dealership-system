import React, { useState, useEffect } from 'react';
import { X, Car, DollarSign, Layers, Hash, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

const LUXURY_PHOTO_PRESETS = [
  { label: 'Porsche 911', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tesla Model S', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' },
  { label: 'BMW M4', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mercedes G63', url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80' },
  { label: 'Audi RS6', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Ferrari F8', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80' },
];

export default function VehicleFormModal({ isOpen, onClose, onSubmit, vehicleToEdit }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    category: 'Coupe',
    price: '',
    quantity: '2',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        make: vehicleToEdit.make,
        model: vehicleToEdit.model,
        category: vehicleToEdit.category,
        price: vehicleToEdit.price.toString(),
        quantity: vehicleToEdit.quantity.toString(),
        image_url: vehicleToEdit.image_url || '',
      });
    } else {
      setFormData({
        make: '',
        model: '',
        category: 'Coupe',
        price: '95000',
        quantity: '2',
        image_url: LUXURY_PHOTO_PRESETS[0].url,
      });
    }
  }, [vehicleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify vehicle parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0D121B] border border-[#1E2736] p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2736] mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-display tracking-tight">
                {vehicleToEdit ? 'Modify Vehicle Record' : 'Register New Vehicle in Inventory'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Dealer Principal Fleet Acquisition Terminal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#161D2B] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form Fields (7 cols) */}
            <div className="md:col-span-7 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Manufacturer / Make
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Porsche, Tesla"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Model Specification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 911 GT3 RS"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Body Class
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Coupe">Coupe</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Price (USD $)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="110000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Units Stocked
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Photo Presets & Custom URL */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  High-Res Showroom Media
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {LUXURY_PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: p.url })}
                      className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                        formData.image_url === p.url
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-[#101520] text-slate-400 border-[#1E2736] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#080B10] border border-[#232F42] text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Live Preview Monroney Card (5 cols) */}
            <div className="md:col-span-5 bg-[#080B10] rounded-xl border border-[#1A2230] p-3 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span>Live Card Preview</span>
                  <span className="text-amber-400 font-mono text-[9px]">REAL-TIME</span>
                </div>

                <div className="relative h-32 rounded-lg overflow-hidden bg-black mb-3">
                  <img
                    src={formData.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-slate-300">
                    {formData.category}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    {formData.quantity || 0} in stock
                  </div>
                </div>

                <div className="text-xs uppercase text-amber-400/90 font-semibold">
                  {formData.make || 'MANUFACTURER'}
                </div>
                <div className="text-sm font-bold text-white truncate font-display">
                  {formData.model || 'Model Designation'}
                </div>
                <div className="mt-1 text-lg font-black text-white font-display">
                  ${parseFloat(formData.price || '0').toLocaleString()}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-[#1E2736]">
                Guaranteed title registration upon record commit.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t border-[#1E2736] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-[#101520] border border-[#1E2736] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-black bg-amber-500 hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : vehicleToEdit ? 'Commit Updates' : 'Add to Showroom Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
