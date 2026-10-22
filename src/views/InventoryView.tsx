import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { InventoryItem, ItemCategory } from '../types/index.ts';
import { StockModal } from '../components/StockModal.tsx';
import {
  Package,
  PlusCircle,
  Download,
  Search,
  Filter,
  AlertTriangle,
  ClockAlert,
  ArrowDownRight,
  ArrowUpRight,
  Edit,
  Trash2,
  Calendar,
  Layers,
  History,
  X,
  Save,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    inventoryTransactions,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    settings
  } = useUks();
  const { canManageInventory } = useAuth();

  const [activeTab, setActiveTab] = useState<'items' | 'mutasi' | 'kedaluwarsa'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [selectedItemForStock, setSelectedItemForStock] = useState<InventoryItem | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form inputs
  const [itemCode, setItemCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Obat Bebas & Terbatas');
  const [unit, setUnit] = useState('strip');
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [batchNumber, setBatchNumber] = useState('');
  const [supplier, setSupplier] = useState('Kimia Farma Pamekasan');
  const [storageLocation, setStorageLocation] = useState('Lemari Obat UKS - Rak A');
  const [notes, setNotes] = useState('');

  // Date calculation for expiry warnings
  const today = new Date();
  const sixtyDays = new Date();
  sixtyDays.setDate(today.getDate() + 60);

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < today;
  };

  const isNearExpiry = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= today && d <= sixtyDays;
  };

  const filteredItems = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        (item.storageLocation && item.storageLocation.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const expiredList = inventory.filter((i) => isExpired(i.expiryDate));
  const nearExpiryList = inventory.filter((i) => isNearExpiry(i.expiryDate));
  const lowStockList = inventory.filter((i) => i.stock <= i.minStock);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemCode('OBT-' + String(inventory.length + 1).padStart(3, '0'));
    setName('');
    setCategory('Obat Bebas & Terbatas');
    setUnit('strip');
    setStock(10);
    setMinStock(5);
    setExpiryDate('2027-12-31');
    setBatchNumber('');
    setSupplier('Kimia Farma Pamekasan');
    setStorageLocation('Lemari Obat UKS - Rak A');
    setNotes('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setItemCode(item.itemCode);
    setName(item.name);
    setCategory(item.category);
    setUnit(item.unit);
    setStock(item.stock);
    setMinStock(item.minStock);
    setExpiryDate(item.expiryDate || '');
    setBatchNumber(item.batchNumber || '');
    setSupplier(item.supplier || '');
    setStorageLocation(item.storageLocation || '');
    setNotes(item.notes || '');
    setIsFormModalOpen(true);
  };

  const handleOpenStockMutate = (item: InventoryItem) => {
    setSelectedItemForStock(item);
    setIsStockModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || !name) return;

    if (editingItem) {
      await updateInventoryItem(editingItem.id, {
        itemCode,
        name,
        category,
        unit,
        stock,
        minStock,
        expiryDate,
        batchNumber,
        supplier,
        storageLocation,
        notes
      });
    } else {
      await addInventoryItem({
        itemCode,
        name,
        category,
        unit,
        stock,
        minStock,
        expiryDate,
        batchNumber,
        supplier,
        storageLocation,
        notes
      });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus item ${item.name} (${item.itemCode})?`)) {
      await deleteInventoryItem(item.id);
    }
  };

  const handleExport = () => {
    const dataToExport = inventory.map((item, idx) => ({
      'No.': idx + 1,
      'Kode Barang': item.itemCode,
      'Nama Barang / Obat': item.name,
      'Kategori': item.category,
      'Satuan': item.unit,
      'Stok Saat Ini': item.stock,
      'Batas Minimum Stok': item.minStock,
      'Status Stok': item.stock <= item.minStock ? 'MENIPIS' : 'AMAN',
      'Tanggal Kedaluwarsa': item.expiryDate || '-',
      'No. Batch': item.batchNumber || '-',
      'Pemasok / Sumber': item.supplier || '-',
      'Lokasi Penyimpanan': item.storageLocation || '-',
      'Catatan': item.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Obat UKS');
    XLSX.writeFile(workbook, `Inventaris_UKS_${settings.schoolName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Inventaris Obat & Perlengkapan P3K UKS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan persediaan obat bebas, pertolongan pertama, pemantauan kedaluwarsa, dan log mutasi stok
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor Excel
          </button>

          {canManageInventory && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Obat / Barang Baru
            </button>
          )}
        </div>
      </div>

      {/* Warning Cards Bar if low stock or expiring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-900 text-xs">Peringatan Stok Menipis</p>
              <p className="text-[11px] text-rose-700">
                {lowStockList.length} item persediaan mencapai atau di bawah batas minimum
              </p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-rose-900 bg-rose-200/60 px-2 py-0.5 rounded-md">
            {lowStockList.length} Item
          </span>
        </div>

        <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
              <ClockAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-orange-900 text-xs">Mendekati / Telah Kedaluwarsa</p>
              <p className="text-[11px] text-orange-700">
                {nearExpiryList.length + expiredList.length} obat perlu dipisahkan atau dicek tanggal ED
              </p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-orange-900 bg-orange-200/60 px-2 py-0.5 rounded-md">
            {nearExpiryList.length + expiredList.length} Item
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Daftar Persediaan ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('mutasi')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'mutasi'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Riwayat Mutasi Stok ({inventoryTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('kedaluwarsa')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'kedaluwarsa'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          Peringatan Kedaluwarsa ({nearExpiryList.length + expiredList.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY ITEMS */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama obat, kode, rak simpan..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="Obat Bebas & Terbatas">Obat Bebas & Terbatas</option>
                <option value="Perlengkapan P3K">Perlengkapan P3K</option>
                <option value="Alat Kesehatan">Alat Kesehatan</option>
                <option value="Bahan Medis Habis Pakai">Bahan Medis Habis Pakai</option>
              </select>
            </div>

            <span className="text-slate-500">
              Menampilkan <strong>{filteredItems.length}</strong> item
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Obat / Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Stok</th>
                    <th className="p-3 text-center">Batas Min</th>
                    <th className="p-3">Kedaluwarsa (ED)</th>
                    <th className="p-3">Penyimpanan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const expired = isExpired(item.expiryDate);
                      const nearExp = isNearExpiry(item.expiryDate);
                      const isLow = item.stock <= item.minStock;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-700">{item.itemCode}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            {item.notes && (
                              <p className="text-[10px] text-slate-500 line-clamp-1">{item.notes}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                                isLow
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.stock} {item.unit}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {item.expiryDate ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  expired
                                    ? 'bg-rose-600 text-white'
                                    : nearExp
                                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                {item.expiryDate} {expired ? '(KEDALUWARSA)' : nearExp ? '(Mendekati)' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 text-[11px]">
                            {item.storageLocation || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canManageInventory && (
                                <>
                                  <button
                                    onClick={() => handleOpenStockMutate(item)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px] flex items-center gap-1 border border-emerald-200"
                                    title="Mutasi Stok Masuk / Keluar"
                                  >
                                    Mutasi
                                  </button>
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                                    title="Edit Informasi Item"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                    title="Hapus Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        Tidak ditemukan item yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY TRANSACTIONS / MUTASI */}
      {activeTab === 'mutasi' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Riwayat Pergerakan & Mutasi Stok Obat / P3K UKS
            </span>
            <span className="text-slate-500">Dicatat otomatis oleh sistem</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3 text-center">Jumlah</th>
                  <th className="p-3">Keterangan / Alasan</th>
                  <th className="p-3">Ref. Kunjungan</th>
                  <th className="p-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryTransactions.length > 0 ? (
                  inventoryTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{tx.date}</td>
                      <td className="p-3 font-bold text-slate-900">{tx.itemName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                            tx.type === 'MASUK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type === 'MASUK' ? (
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {tx.quantity}
                      </td>
                      <td className="p-3 text-slate-700">{tx.reason}</td>
                      <td className="p-3 font-mono text-[11px] text-emerald-800">
                        {tx.visitRef || '-'}
                      </td>
                      <td className="p-3 text-slate-600">{tx.officerName}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      Belum ada riwayat mutasi stok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KEDALUWARSA / PEMUSNAHAN */}
      {activeTab === 'kedaluwarsa' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
            <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              SOP Penanganan Obat & Perlengkapan Mendekati / Melewati Kedaluwarsa
            </h4>
            <p className="leading-relaxed">
              1. Obat atau perlengkapan medis yang telah kedaluwarsa <strong>TIDAK BOLEH</strong> diberikan kepada siswa dengan alasan apa pun.<br />
              2. Pisahkan fisik obat ke dalam kotak khusus barang retur / pemusnahan.<br />
              3. Catat stok keluar dengan alasan 'Pemusnahan Obat Kedaluwarsa' dan koordinasikan dengan Puskesmas / Farmasi.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
              Daftar Obat Perlu Perhatian (Kedaluwarsa atau Mendekati ED)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Obat</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Stok Sisa</th>
                    <th className="p-3">Tanggal ED</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Tindakan SOP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...expiredList, ...nearExpiryList].length > 0 ? (
                    [...expiredList, ...nearExpiryList].map((item) => {
                      const expired = isExpired(item.expiryDate);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono font-bold">{item.itemCode}</td>
                          <td className="p-3 font-bold text-slate-900">{item.name}</td>
                          <td className="p-3 text-slate-600">{item.category}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            {item.stock} {item.unit}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-700">{item.expiryDate}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                expired ? 'bg-rose-600 text-white' : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {expired ? 'SUDAH KEDALUWARSA' : 'MENDEKATI KEDALUWARSA'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenStockMutate(item)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px]"
                            >
                              Keluarkan & Musnahkan
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        Semua obat dan perlengkapan P3K masih dalam masa berlaku yang aman.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INVENTORY ITEM */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingItem ? 'Edit Item Persediaan' : 'Tambah Obat / Barang UKS Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-300">SMP Alam Excellentia Pamekasan</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Barang *</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="OBT-001 / P3K-001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Obat / Perlengkapan *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Paracetamol 500mg / Betadine"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Obat Bebas & Terbatas">Obat Bebas & Terbatas</option>
                    <option value="Perlengkapan P3K">Perlengkapan P3K</option>
                    <option value="Alat Kesehatan">Alat Kesehatan</option>
                    <option value="Bahan Medis Habis Pakai">Bahan Medis Habis Pakai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="strip, tablet, botol, roll, pcs"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stok Saat Ini *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Batas Minimum Stok (Peringatan) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kedaluwarsa (ED)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Batch</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Contoh: PCT2601"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sumber / Pemasok
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Kimia Farma / Puskesmas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Penyimpanan
                  </label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Lemari A Rak 1 / Troli P3K"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Penggunaan & Penyimpanan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Aturan pemakaian singkat sesuai SOP UKS / suhu penyimpanan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MUTATION MODAL */}
      <StockModal
        item={selectedItemForStock}
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedItemForStock(null);
        }}
      />
    </div>
  );
};
