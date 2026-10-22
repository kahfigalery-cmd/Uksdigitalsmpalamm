import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { InventoryItem } from '../types/index.ts';
import { X, ArrowDownRight, ArrowUpRight, Package, Save } from 'lucide-react';

interface StockModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockModal: React.FC<StockModalProps> = ({ item, isOpen, onClose }) => {
  const { mutateStock } = useUks();
  const { currentUser } = useAuth();

  const [type, setType] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Restock Pengadaan Rutin Sekolah');
  const [officerName, setOfficerName] = useState(currentUser.name);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    await mutateStock(item.id, type, quantity, reason, undefined, officerName);
    onClose();
  };

  const calculatedNewStock =
    type === 'MASUK' ? item.stock + quantity : Math.max(0, item.stock - quantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Mutasi Stok Persediaan UKS</h3>
              <p className="text-[11px] text-slate-300 truncate max-w-[240px]">
                {item.name} ({item.itemCode})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Current Stock Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500">Stok Saat Ini:</p>
              <p className="text-base font-bold font-mono text-slate-800">
                {item.stock} {item.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Estimasi Stok Baru:</p>
              <p
                className={`text-base font-bold font-mono ${
                  calculatedNewStock <= item.minStock ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {calculatedNewStock} {item.unit}
              </p>
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Jenis Mutasi *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('MASUK');
                  setReason('Restock Pengadaan Rutin Sekolah');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  type === 'MASUK'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                Stok Masuk (+)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('KELUAR');
                  setReason('Pemakaian Pelayanan / Kegiatan Sekolah');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  type === 'KELUAR'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                Stok Keluar (-)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jumlah Barang ({item.unit}) *
            </label>
            <input
              type="number"
              min={1}
              max={type === 'KELUAR' ? item.stock : 9999}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan / Alasan *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Pengadaan Bantuan Dinas Kesehatan / Pemakaian Upacara / Pemusnahan ED"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Officer */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Petugas Pencatat Mutasi *
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
