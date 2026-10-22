import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Calendar,
  Building2,
  CheckCircle,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsView: React.FC = () => {
  const { visits, inventory, inventoryTransactions, referrals, settings } = useUks();
  const { currentUser } = useAuth();

  const [reportType, setReportType] = useState<
    | 'harian'
    | 'bulanan'
    | 'tahunan'
    | 'per_kelas'
    | 'keluhan'
    | 'tindakan'
    | 'rujukan'
    | 'pemakaian_obat'
    | 'stok_ed'
  >('bulanan');

  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter visits
  const filteredVisits = visits.filter((v) => {
    if (reportType === 'harian') {
      if (v.visitDate !== selectedDate) return false;
    } else if (reportType === 'bulanan') {
      const ym = `${selectedYear}-${selectedMonth}`;
      if (!v.visitDate.startsWith(ym)) return false;
    } else if (reportType === 'tahunan') {
      if (!v.visitDate.startsWith(selectedYear)) return false;
    }

    if (selectedClass !== 'all' && v.className !== selectedClass) return false;

    return true;
  });

  // Complaint statistics
  const complaintStats: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    complaintStats[v.complaintCategory] = (complaintStats[v.complaintCategory] || 0) + 1;
  });

  // Action & status stats
  const statusStats: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    statusStats[v.status] = (statusStats[v.status] || 0) + 1;
  });

  // Class stats
  const classStats: Record<string, number> = {
    '7A': 0,
    '7B': 0,
    '8A': 0,
    '8B': 0,
    '9A': 0,
    '9B': 0
  };
  filteredVisits.forEach((v) => {
    if (classStats[v.className] !== undefined) {
      classStats[v.className]++;
    }
  });

  const getReportTitle = () => {
    switch (reportType) {
      case 'harian':
        return `LAPORAN HARIAN KUNJUNGAN UKS TANGGAL ${selectedDate}`;
      case 'bulanan':
        return `LAPORAN BULANAN KESEHATAN SISWA UKS (BULAN ${selectedMonth}/${selectedYear})`;
      case 'tahunan':
        return `LAPORAN TAHUNAN KESEHATAN SEKOLAH TAHUN ${selectedYear}`;
      case 'per_kelas':
        return `LAPORAN DISTRIBUSI KESEHATAN PER KELAS TAHUN AJARAN ${settings.academicYear}`;
      case 'keluhan':
        return `REKAPITULASI KATEGORI KELUHAN SISWA UKS`;
      case 'tindakan':
        return `LAPORAN TINDAKAN P3K DAN STATUS KEPULANGAN SISWA`;
      case 'rujukan':
        return `REKAPITULASI RUJUKAN KE FASILITAS KESEHATAN (FASKES)`;
      case 'pemakaian_obat':
        return `LAPORAN PENGGUNAAN OBAT DAN PERLENGKAPAN P3K`;
      case 'stok_ed':
        return `LAPORAN PERSENTASE STOK & STATUS KEDALUWARSA OBAT`;
      default:
        return 'LAPORAN ADMINISTRASI UKS';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let exportData: any[] = [];
    let sheetName = 'Laporan UKS';

    if (reportType === 'keluhan') {
      sheetName = 'Rekap Keluhan';
      exportData = Object.entries(complaintStats).map(([cat, count], i) => ({
        'No.': i + 1,
        'Kategori Keluhan': cat,
        'Jumlah Kasus': count,
        'Persentase': `${Math.round((count / (filteredVisits.length || 1)) * 100)}%`
      }));
    } else if (reportType === 'pemakaian_obat') {
      sheetName = 'Pemakaian Obat';
      exportData = inventoryTransactions.map((tx, i) => ({
        'No.': i + 1,
        'Tanggal': tx.date,
        'Nama Barang': tx.itemName,
        'Jenis Mutasi': tx.type,
        'Jumlah': tx.quantity,
        'Alasan': tx.reason,
        'Ref Kunjungan': tx.visitRef || '-',
        'Petugas': tx.officerName
      }));
    } else if (reportType === 'rujukan') {
      sheetName = 'Rujukan Faskes';
      exportData = referrals.map((r, i) => ({
        'No.': i + 1,
        'Waktu Rujukan': r.referralTime,
        'Nama Siswa': r.studentName,
        'Kelas': r.className,
        'Fasilitas Kesehatan Tujuan': r.healthFacility,
        'Kontak Faskes': r.contactFacility,
        'Alasan Rujukan': r.referralReason,
        'Pendamping': r.accompaniedBy,
        'Catatan Serah Terima': r.handoverNotes || '-'
      }));
    } else {
      sheetName = 'Rekap Kunjungan';
      exportData = filteredVisits.map((v, i) => ({
        'No.': i + 1,
        'No. Kunjungan': v.visitNumber,
        'Tanggal': v.visitDate,
        'Jam Masuk': v.entryTime,
        'Jam Keluar': v.exitTime || '-',
        'Nama Siswa': v.studentName,
        'Kelas': v.className,
        'Keluhan': v.complaintCategory,
        'Rincian Keluhan': v.complaintDetail,
        'Tindakan': v.initialAction,
        'Obat Diberikan': v.medicinesGiven || '-',
        'Status Akhir': v.status,
        'Petugas': v.handledBy
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}_${todayStr}.xlsx`);
  };

  const handleExportCsv = () => {
    let exportData: any[] = filteredVisits.map((v, i) => ({
      No: i + 1,
      NoKunjungan: v.visitNumber,
      Tanggal: v.visitDate,
      JamMasuk: v.entryTime,
      NamaSiswa: v.studentName,
      Kelas: v.className,
      Keluhan: v.complaintCategory,
      Tindakan: v.initialAction,
      Status: v.status,
      Petugas: v.handledBy
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_UKS_${reportType}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-16">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Pusat Pelaporan Administrasi UKS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Format laporan resmi dengan kop surat, tanda tangan pejabat sekolah, dan ekspor data dinas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            CETAK / UNDUH PDF
          </button>
        </div>
      </div>

      {/* Report Configuration & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan Parameter Laporan:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Report Type */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Jenis Laporan *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
            >
              <option value="bulanan">Laporan Bulanan UKS</option>
              <option value="harian">Laporan Kunjungan Harian</option>
              <option value="tahunan">Laporan Tahunan Sekolah</option>
              <option value="per_kelas">Laporan per Kelas</option>
              <option value="keluhan">Rekap Kategori Keluhan</option>
              <option value="tindakan">Laporan Tindakan & Pemulangan</option>
              <option value="rujukan">Rekap Rujukan Faskes</option>
              <option value="pemakaian_obat">Laporan Penggunaan Obat/P3K</option>
              <option value="stok_ed">Laporan Stok & Kedaluwarsa</option>
            </select>
          </div>

          {/* Period selector */}
          {reportType === 'harian' ? (
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Pilih Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </>
          )}

          {/* Class Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
        </div>
      </div>

      {/* OFFICIAL PRINTABLE REPORT CONTAINER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Kop Surat Resmi */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shrink-0 print:border">
              UKS
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                PEMERINTAH KABUPATEN PAMEKASAN • DINAS PENDIDIKAN
              </h2>
              <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-emerald-900 mt-0.5">
                {settings.schoolName}
              </h1>
              <h3 className="text-xs font-bold text-slate-700 uppercase">
                {settings.uksName}
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            {settings.address} • Telp: {settings.phone} • Email: {settings.email}
          </p>
        </div>

        {/* Report Heading */}
        <div className="text-center space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold uppercase underline tracking-wide text-slate-900">
            {getReportTitle()}
          </h3>
          <p className="text-xs text-slate-600">
            Tahun Ajaran: <strong>{settings.academicYear}</strong> • Tanggal Cetak:{' '}
            <strong>{todayStr}</strong>
          </p>
        </div>

        {/* Summary Statistics Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Kunjungan</p>
            <p className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
              {filteredVisits.length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Kembali ke Kelas</p>
            <p className="text-xl font-bold font-mono text-teal-700 mt-0.5">
              {filteredVisits.filter((v) => v.status === 'Kembali ke kelas').length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Dipulangkan</p>
            <p className="text-xl font-bold font-mono text-blue-700 mt-0.5">
              {filteredVisits.filter((v) => v.status === 'Dipulangkan').length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Dirujuk Faskes</p>
            <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
              {filteredVisits.filter((v) => v.status === 'Dirujuk').length}
            </p>
          </div>
        </div>

        {/* Dynamic Table Content based on reportType */}
        {reportType === 'keluhan' ? (
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Distribusi Kasus Keluhan Siswa:</h4>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <th className="p-2 border border-slate-300 text-center w-12">No.</th>
                  <th className="p-2 border border-slate-300">Kategori Keluhan</th>
                  <th className="p-2 border border-slate-300 text-center w-28">Jumlah Kasus</th>
                  <th className="p-2 border border-slate-300 text-center w-28">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(complaintStats).map(([cat, count], idx) => (
                  <tr key={cat}>
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-semibold">{cat}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                      {count}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {Math.round((count / (filteredVisits.length || 1)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'rujukan' ? (
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Daftar Rujukan ke Faskes:</h4>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <th className="p-2 border border-slate-300 text-center w-10">No.</th>
                  <th className="p-2 border border-slate-300">Waktu</th>
                  <th className="p-2 border border-slate-300">Nama Siswa / Kelas</th>
                  <th className="p-2 border border-slate-300">Fasilitas Tujuan</th>
                  <th className="p-2 border border-slate-300">Alasan Rujukan</th>
                  <th className="p-2 border border-slate-300">Pendamping</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length > 0 ? (
                  referrals.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">{r.referralTime}</td>
                      <td className="p-2 border border-slate-300 font-bold">
                        {r.studentName} ({r.className})
                      </td>
                      <td className="p-2 border border-slate-300">{r.healthFacility}</td>
                      <td className="p-2 border border-slate-300">{r.referralReason}</td>
                      <td className="p-2 border border-slate-300">{r.accompaniedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">
                      Tidak ada catatan rujukan fasilitas kesehatan pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Data Rincian Kunjungan UKS:</h4>
            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <th className="p-2 border border-slate-300 text-center w-10">No.</th>
                  <th className="p-2 border border-slate-300">No. Kunjungan</th>
                  <th className="p-2 border border-slate-300">Waktu</th>
                  <th className="p-2 border border-slate-300">Nama Siswa</th>
                  <th className="p-2 border border-slate-300 text-center">Kelas</th>
                  <th className="p-2 border border-slate-300">Keluhan</th>
                  <th className="p-2 border border-slate-300">Tindakan SOP</th>
                  <th className="p-2 border border-slate-300">Status</th>
                  <th className="p-2 border border-slate-300">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length > 0 ? (
                  filteredVisits.map((v, idx) => (
                    <tr key={v.id}>
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono font-semibold text-emerald-800">
                        {v.visitNumber}
                      </td>
                      <td className="p-2 border border-slate-300 whitespace-nowrap">
                        {v.visitDate} ({v.entryTime})
                      </td>
                      <td className="p-2 border border-slate-300 font-bold">{v.studentName}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">
                        {v.className}
                      </td>
                      <td className="p-2 border border-slate-300">
                        <strong>[{v.complaintCategory}]</strong> {v.complaintDetail}
                      </td>
                      <td className="p-2 border border-slate-300">
                        {v.initialAction} {v.medicinesGiven ? `(${v.medicinesGiven})` : ''}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold">{v.status}</td>
                      <td className="p-2 border border-slate-300">{v.handledBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      Tidak ada catatan kunjungan pada filter periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Section */}
        <div className="pt-10 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-semibold text-slate-800">Kepala SMP Alam Excellentia Pamekasan</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-900">{settings.headmaster}</p>
            <p className="text-[10px] text-slate-500 font-mono">NIP / NBM. Sekolah</p>
          </div>

          <div>
            <p className="text-slate-600">Pamekasan, {todayStr}</p>
            <p className="font-semibold text-slate-800">Koordinator / Petugas UKS,</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-900">{settings.uksCoordinator}</p>
            <p className="text-[10px] text-slate-500 font-mono">SIP / Tenaga UKS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
