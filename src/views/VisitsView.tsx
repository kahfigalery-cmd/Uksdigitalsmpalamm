import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UksVisit, VisitStatus } from '../types/index.ts';
import {
  ClipboardList,
  Search,
  Filter,
  PlusCircle,
  Download,
  Eye,
  MessageCircle,
  Trash2,
  Calendar,
  Activity,
  CheckCircle,
  ClockAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface VisitsViewProps {
  onOpenNewVisit: () => void;
  onSelectVisit: (visit: UksVisit) => void;
  onOpenParentContact: (visit: UksVisit) => void;
}

export const VisitsView: React.FC<VisitsViewProps> = ({
  onOpenNewVisit,
  onSelectVisit,
  onOpenParentContact
}) => {
  const { visits, deleteVisit, settings } = useUks();
  const { canManageVisits } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick filter tab
  const [quickTab, setQuickTab] = useState<'all' | 'today' | 'active' | 'discharged'>('all');

  const filteredVisits = visits.filter((v) => {
    // Quick tabs
    if (quickTab === 'today' && v.visitDate !== todayStr) return false;
    if (
      quickTab === 'active' &&
      !(
        v.status === 'Sedang ditangani' ||
        v.status === 'Istirahat atau observasi' ||
        v.status === 'Menunggu pemeriksaan'
      )
    )
      return false;
    if (quickTab === 'discharged' && v.status !== 'Dipulangkan' && v.status !== 'Dirujuk')
      return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = v.studentName.toLowerCase().includes(term);
      const matchNis = v.studentNis.includes(term);
      const matchNo = v.visitNumber.toLowerCase().includes(term);
      const matchComplaint = v.complaintDetail.toLowerCase().includes(term);
      if (!matchName && !matchNis && !matchNo && !matchComplaint) return false;
    }

    // Specific filters
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (classFilter !== 'all' && v.className !== classFilter) return false;
    if (categoryFilter !== 'all' && v.complaintCategory !== categoryFilter) return false;
    if (dateFilter && v.visitDate !== dateFilter) return false;

    return true;
  });

  // Export to Excel / CSV
  const handleExport = () => {
    const dataToExport = filteredVisits.map((v, i) => ({
      'No.': i + 1,
      'No. Kunjungan': v.visitNumber,
      'Tanggal': v.visitDate,
      'Jam Masuk': v.entryTime,
      'Jam Keluar': v.exitTime || '-',
      'Nama Siswa': v.studentName,
      'NIS': v.studentNis,
      'Kelas': v.className,
      'Keluhan': `[${v.complaintCategory}] ${v.complaintDetail}`,
      'Tindakan Awal': v.initialAction || '-',
      'Rincian Tindakan': v.actionDetail || '-',
      'Obat Diberikan': v.medicinesGiven || '-',
      'Status': v.status,
      'Penjemput (Jika Pulang)': v.dischargedTo || '-',
      'Petugas': v.handledBy,
      'Tindak Lanjut': v.needsFollowUp ? `Ya (${v.followUpStatus})` : 'Tidak'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kunjungan UKS');
    XLSX.writeFile(workbook, `Data_Kunjungan_UKS_${settings.schoolName.replace(/\s+/g, '_')}_${todayStr}.xlsx`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan kunjungan siswa ${name}?`)) {
      await deleteVisit(id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Buku Registrasi & Kunjungan UKS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh data kunjungan siswa SMP Alam Excellentia Pamekasan tersimpan permanen
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

          {canManageVisits && (
            <button
              onClick={onOpenNewVisit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              Catat Kunjungan Baru
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setQuickTab('all')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            quickTab === 'all'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Kunjungan ({visits.length})
        </button>
        <button
          onClick={() => setQuickTab('today')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            quickTab === 'today'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hari Ini ({visits.filter((v) => v.visitDate === todayStr).length})
        </button>
        <button
          onClick={() => setQuickTab('active')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            quickTab === 'active'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sedang di Ruang UKS (
          {
            visits.filter(
              (v) =>
                v.status === 'Sedang ditangani' ||
                v.status === 'Istirahat atau observasi' ||
                v.status === 'Menunggu pemeriksaan'
            ).length
          }
          )
        </button>
        <button
          onClick={() => setQuickTab('discharged')}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            quickTab === 'discharged'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dipulangkan / Dirujuk (
          {visits.filter((v) => v.status === 'Dipulangkan' || v.status === 'Dirujuk').length})
        </button>
      </div>

      {/* Detailed Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NIS, nomor kunjungan..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu pemeriksaan">Menunggu pemeriksaan</option>
              <option value="Sedang ditangani">Sedang ditangani</option>
              <option value="Istirahat atau observasi">Istirahat atau observasi</option>
              <option value="Kembali ke kelas">Kembali ke kelas</option>
              <option value="Dipulangkan">Dipulangkan</option>
              <option value="Dirujuk">Dirujuk ke faskes</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas</option>
              <option value="7A">Kelas 7A</option>
              <option value="7B">Kelas 7B</option>
              <option value="8A">Kelas 8A</option>
              <option value="8B">Kelas 8B</option>
              <option value="9A">Kelas 9A</option>
              <option value="9B">Kelas 9B</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">No. Registrasi</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Siswa / Kelas</th>
                <th className="p-3">Keluhan</th>
                <th className="p-3">Tindakan & Obat</th>
                <th className="p-3">Status</th>
                <th className="p-3">Petugas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectVisit(v)}
                  >
                    <td className="p-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {v.visitNumber}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{v.visitDate}</p>
                      <p className="text-[11px] text-slate-500">
                        {v.entryTime} {v.exitTime ? `- ${v.exitTime}` : ''} WIB
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{v.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Kelas: <span className="font-semibold text-slate-700">{v.className}</span> • NIS: {v.studentNis}
                      </p>
                    </td>
                    <td className="p-3 max-w-[220px]">
                      <span className="font-semibold text-emerald-800">[{v.complaintCategory}]</span>{' '}
                      <span className="text-slate-600 line-clamp-1">{v.complaintDetail}</span>
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <p className="text-slate-800 font-medium line-clamp-1">{v.initialAction || '-'}</p>
                      {v.medicinesGiven && (
                        <p className="text-[11px] text-emerald-700 font-semibold line-clamp-1">
                          {v.medicinesGiven}
                        </p>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          v.status === 'Sedang ditangani' || v.status === 'Istirahat atau observasi'
                            ? 'bg-amber-100 text-amber-800'
                            : v.status === 'Kembali ke kelas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'Dipulangkan'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'Dirujuk' || v.status === 'Penanganan darurat'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 whitespace-nowrap">{v.handledBy}</td>
                    <td
                      className="p-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectVisit(v)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Lihat Rincian / Ubah Status"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenParentContact(v)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                          title="Kirim WhatsApp ke Orang Tua"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        {canManageVisits && (
                          <button
                            onClick={() => handleDelete(v.id, v.studentName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Kunjungan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data kunjungan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
