import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Users,
  Activity,
  CheckCircle2,
  Home,
  ClockAlert,
  AlertTriangle,
  Calendar,
  Filter,
  PlusCircle,
  Package,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewVisit: () => void;
  onSelectVisit: (visitId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewVisit,
  onSelectVisit
}) => {
  const { visits, inventory, settings } = useUks();
  const { canManageVisits } = useAuth();

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate statistics
  const visitsToday = visits.filter((v) => v.visitDate === todayStr);

  const activeInUksToday = visitsToday.filter(
    (v) =>
      v.status === 'Sedang ditangani' ||
      v.status === 'Istirahat atau observasi' ||
      v.status === 'Menunggu pemeriksaan'
  );

  const returnedToClassToday = visitsToday.filter((v) => v.status === 'Kembali ke kelas');
  const dischargedToday = visitsToday.filter((v) => v.status === 'Dipulangkan');
  const needsFollowUpTotal = visits.filter(
    (v) => v.needsFollowUp && v.followUpStatus !== 'Selesai'
  );

  // Inventory warnings
  const lowStockItems = inventory.filter((i) => i.stock <= i.minStock);

  const todayDate = new Date();
  const sixtyDaysLater = new Date();
  sixtyDaysLater.setDate(todayDate.getDate() + 60);

  const expiringItems = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    return exp <= sixtyDaysLater;
  });

  // Filtered visits for graphs
  const filteredVisits = visits.filter((v) => {
    if (selectedClass !== 'all' && v.className !== selectedClass) return false;
    if (selectedMonth !== 'all') {
      const monthStr = v.visitDate.substring(5, 7);
      if (monthStr !== selectedMonth) return false;
    }
    return true;
  });

  // Complaint category breakdown
  const complaintCounts: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    complaintCounts[v.complaintCategory] = (complaintCounts[v.complaintCategory] || 0) + 1;
  });
  const sortedComplaints = Object.entries(complaintCounts).sort((a, b) => b[1] - a[1]);

  // Class distribution breakdown
  const classCounts: Record<string, number> = {
    '7A': 0,
    '7B': 0,
    '8A': 0,
    '8B': 0,
    '9A': 0,
    '9B': 0
  };
  filteredVisits.forEach((v) => {
    if (classCounts[v.className] !== undefined) {
      classCounts[v.className]++;
    }
  });

  // Daily visits trend (Last 7 days)
  const last7Days: { dateStr: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const count = visits.filter((v) => v.visitDate === dateStr).length;
    last7Days.push({ dateStr, label, count });
  }
  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 4);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform skew-x-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600/80 text-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Tahun Ajaran {settings.academicYear}
              </span>
              <span className="text-emerald-200 text-xs">Pamekasan, Jawa Timur</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang di UKS Digital {settings.schoolName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Sistem administrasi kesehatan terintegrasi untuk pencatatan kunjungan siswa, pemantauan tanda vital, tindakan SOP P3K, dan pengelolaan obat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canManageVisits && (
              <button
                onClick={onOpenNewVisit}
                className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                CATAT KUNJUNGAN SISWA
              </button>
            )}
            <button
              onClick={() => onNavigate('visits')}
              className="px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              DATA KUNJUNGAN
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-4 h-4 text-emerald-300" />
              STOK OBAT
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Statistik UKS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas (7, 8, 9)</option>
              <option value="7A">Kelas 7A</option>
              <option value="7B">Kelas 7B</option>
              <option value="8A">Kelas 8A</option>
              <option value="8B">Kelas 8B</option>
              <option value="9A">Kelas 9A</option>
              <option value="9B">Kelas 9B</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Bulan</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          {(selectedClass !== 'all' || selectedMonth !== 'all') && (
            <button
              onClick={() => {
                setSelectedClass('all');
                setSelectedMonth('all');
              }}
              className="text-xs text-emerald-700 font-semibold hover:underline px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* STATISTIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Kunjungan Hari Ini */}
        <div
          onClick={() => onNavigate('visits')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kunjungan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 mt-2">
            {visitsToday.length}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <span>Lihat daftar kunjungan hari ini</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Card 2: Siswa di UKS Saat Ini */}
        <div
          onClick={() => onNavigate('visits')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Masih di Ruang UKS</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 mt-2">
            {activeInUksToday.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeInUksToday.length > 0 ? 'Sedang istirahat / observasi' : 'Tidak ada siswa di UKS'}
          </p>
        </div>

        {/* Card 3: Kembali ke Kelas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kembali ke Kelas</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-700 mt-2">
            {returnedToClassToday.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Kondisi membaik setelah P3K</p>
        </div>

        {/* Card 4: Dipulangkan Bersama Wali */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dipulangkan ke Rumah</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-700 mt-2">
            {dischargedToday.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Diserahkan ke orang tua/wali</p>
        </div>
      </div>

      {/* SECOND ROW STATS: FOLLOW UP & INVENTORY ALERTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Follow up card */}
        <div
          onClick={() => onNavigate('followup')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ClockAlert className="w-4 h-4 text-amber-600" />
              <span>Butuh Tindak Lanjut</span>
            </div>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
              {needsFollowUpTotal.length} Kasus
            </p>
            <p className="text-[11px] text-slate-500">Perlu pemantauan lanjutan</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-300 shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Stok Obat Menipis / Kritis</span>
            </div>
            <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
              {lowStockItems.length} Item
            </p>
            <p className="text-[11px] text-slate-500">Mencapai batas minimum stok</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 transition-colors" />
        </div>

        {/* Near Expiry Warning */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-300 shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span>Mendekati Kedaluwarsa (≤ 60 Hari)</span>
            </div>
            <p className="text-2xl font-bold font-mono text-orange-600 mt-1">
              {expiringItems.length} Item
            </p>
            <p className="text-[11px] text-slate-500">Periksa tanggal ED obat</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: DAILY VISITS TREND (LAST 7 DAYS) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Tren Kunjungan UKS (7 Hari Terakhir)</h3>
                <p className="text-[11px] text-slate-500">Frekuensi siswa berkunjung ke ruang UKS</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Total {visits.length} Kunjungan
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4">
            <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-slate-200 pb-2">
              {last7Days.map((d, idx) => {
                const heightPercent = Math.max(12, (d.count / maxDayCount) * 100);
                const isToday = d.dateStr === todayStr;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                      {d.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-xs'
                          : 'bg-slate-200 hover:bg-emerald-300'
                      }`}
                    ></div>
                    <span
                      className={`text-[10px] mt-2 font-medium truncate ${
                        isToday ? 'font-bold text-emerald-800' : 'text-slate-500'
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 2: COMPLAINT CATEGORIES BREAKDOWN */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kategori Keluhan yang Paling Sering</h3>
                <p className="text-[11px] text-slate-500">Distribusi keluhan kesehatan yang dicatat</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {sortedComplaints.length > 0 ? (
              sortedComplaints.slice(0, 5).map(([category, count], idx) => {
                const percent = Math.round((count / filteredVisits.length) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{category}</span>
                      <span className="font-mono text-slate-500">
                        {count} kasus ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-emerald-600'
                            : idx === 1
                            ? 'bg-teal-500'
                            : idx === 2
                            ? 'bg-amber-500'
                            : idx === 3
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Belum ada data kunjungan pada filter ini.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CLASS DISTRIBUTION & TODAY'S ACTIVE STUDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Class distribution */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Distribusi Kunjungan per Kelas</h3>
              <p className="text-[11px] text-slate-500">SMP Alam Excellentia Pamekasan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            {Object.entries(classCounts).map(([className, count]) => (
              <div
                key={className}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-700">Kelas {className}</p>
                  <p className="text-[10px] text-slate-400">Tingkat {className.charAt(0)}</p>
                </div>
                <span className="text-sm font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's recent visit stream */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kunjungan Terkini Hari Ini</h3>
              <p className="text-[11px] text-slate-500">Status penanganan siswa di UKS</p>
            </div>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {visitsToday.length > 0 ? (
              visitsToday.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVisit(v.id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-emerald-800">
                        {v.visitNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{v.studentName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded-md">
                        {v.className}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Keluhan: <span className="font-medium text-slate-800">{v.complaintCategory}</span> • Masuk: {v.entryTime} WIB
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      v.status === 'Sedang ditangani' || v.status === 'Istirahat atau observasi'
                        ? 'bg-amber-100 text-amber-800'
                        : v.status === 'Kembali ke kelas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'Dipulangkan'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada siswa yang berkunjung ke UKS hari ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
