import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  UserCheck,
  Search,
  AlertCircle,
  Thermometer,
  Activity,
  Heart,
  Pill,
  Save,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import { VisitStatus } from '../types/index.ts';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { students, healthRecords, inventory, settings, addVisit } = useUks();
  const { currentUser } = useAuth();

  // Search student
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNis, setSelectedNis] = useState('');

  // Visit details
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('Ruang Kelas');
  const [complaintCategory, setComplaintCategory] = useState(settings.complaintCategories[0] || 'Pusing atau sakit kepala');
  const [complaintDetail, setComplaintDetail] = useState('');
  const [status, setStatus] = useState<VisitStatus>('Sedang ditangani');

  // Assessment details
  const [generalCondition, setGeneralCondition] = useState('');
  const [consciousness, setConsciousness] = useState('Compos Mentis (Sadar penuh)');
  const [bodyTemperature, setBodyTemperature] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [objectiveObservation, setObjectiveObservation] = useState('');

  // Action details
  const [initialAction, setInitialAction] = useState(settings.actionCategories[0] || 'Istirahat dan observasi di UKS');
  const [actionDetail, setActionDetail] = useState('');
  const [handledBy, setHandledBy] = useState(currentUser.name || 'Petugas UKS');
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Medicine inventory deduction
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [medicineQuantity, setMedicineQuantity] = useState(1);
  const [medicinesGivenList, setMedicinesGivenList] = useState<
    { itemId: string; name: string; quantity: number; unit: string }[]
  >([]);

  if (!isOpen) return null;

  // Filter students based on search
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find((s) => s.nis === selectedNis);
  const studentHealth = selectedStudent ? healthRecords[selectedStudent.nis] : null;

  const handleSelectStudent = (student: (typeof students)[0]) => {
    setSelectedNis(student.nis);
    setSearchTerm('');
  };

  const handleAddMedicine = () => {
    if (!selectedMedicineId) return;
    const item = inventory.find((i) => i.id === selectedMedicineId);
    if (!item) return;

    if (item.stock < medicineQuantity) {
      alert(`Stok ${item.name} tidak mencukupi (Tersedia: ${item.stock})`);
      return;
    }

    setMedicinesGivenList((prev) => [
      ...prev,
      {
        itemId: item.id,
        name: item.name,
        quantity: medicineQuantity,
        unit: item.unit
      }
    ]);
    setSelectedMedicineId('');
    setMedicineQuantity(1);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicinesGivenList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pilih siswa yang berkunjung terlebih dahulu');
      return;
    }
    if (!complaintDetail) {
      alert('Silakan isi rincian keluhan siswa');
      return;
    }

    const medicinesSummary = medicinesGivenList
      .map((m) => `${m.name} (${m.quantity} ${m.unit})`)
      .join(', ');

    const assessmentPayload =
      bodyTemperature || generalCondition || objectiveObservation || pulseRate
        ? {
            assessmentTime: entryTime,
            generalCondition,
            consciousness,
            bodyTemperature,
            pulseRate,
            objectiveObservation,
            examinerName: handledBy
          }
        : undefined;

    const deductions = medicinesGivenList.map((m) => ({
      itemId: m.itemId,
      quantity: m.quantity
    }));

    await addVisit(
      {
        studentNis: selectedStudent.nis,
        studentName: selectedStudent.fullName,
        className: selectedStudent.className,
        visitDate,
        entryTime,
        accompaniedBy: accompaniedBy || 'Datang sendiri',
        incidentLocation,
        complaintCategory,
        complaintDetail,
        status,
        initialAction,
        actionDetail,
        handledBy,
        needsFollowUp,
        followUpNotes: needsFollowUp ? followUpNotes : '',
        followUpStatus: needsFollowUp ? 'Belum Ditindaklanjuti' : 'Selesai',
        medicinesGiven: medicinesSummary
      },
      assessmentPayload,
      deductions
    );

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Formulir Resmi Pelayanan UKS
              </span>
              <h2 className="text-base sm:text-lg font-bold">CATAT KUNJUNGAN SISWA BARU</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* SECTION A: IDENTITAS SISWA & KUNJUNGAN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h3 className="font-bold text-slate-800 text-sm">Identitas Siswa & Waktu Kunjungan</h3>
            </div>

            {/* Student Search & Selection */}
            {!selectedStudent ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Cari Siswa Berdasarkan Nama atau NIS *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik nama siswa, NIS, atau kelas (contoh: Rizky, 7A, 202607001)..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    autoFocus
                  />
                </div>

                {searchTerm.trim().length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-lg mt-1">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => handleSelectStudent(st)}
                          className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{st.fullName}</p>
                            <p className="text-[11px] text-slate-500">
                              NIS: {st.nis} • Kelas: <span className="font-semibold text-emerald-700">{st.className}</span> • Wali: {st.parentName}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                            Pilih Siswa
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-xs text-slate-500 text-center">
                        Tidak ditemukan siswa dengan kata kunci tersebut.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Student Card */
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Kelas {selectedStudent.className}
                    </span>
                    <span className="text-xs font-mono text-emerald-900 font-semibold">
                      NIS: {selectedStudent.nis}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-1">
                    {selectedStudent.fullName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Orang Tua/Wali: <span className="font-medium">{selectedStudent.parentName}</span> (Telp/WA:{' '}
                    <span className="font-mono text-emerald-800">{selectedStudent.parentPhone}</span>)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNis('')}
                  className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 border border-slate-300 rounded-lg bg-white shrink-0"
                >
                  Ganti Siswa
                </button>
              </div>
            )}

            {/* Confidential Health Alert for Petugas/Admin */}
            {selectedStudent && studentHealth && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Catatan Riwayat Kesehatan Terbatas (Perhatian Khusus Petugas):</span>
                </div>
                {studentHealth.allergies && (
                  <p>
                    <strong>Alergi:</strong> {studentHealth.allergies}
                  </p>
                )}
                {studentHealth.medicalNotes && (
                  <p>
                    <strong>Kondisi Khusus:</strong> {studentHealth.medicalNotes}
                  </p>
                )}
                {studentHealth.specialCareNeeds && (
                  <p>
                    <strong>Instruksi Penanganan:</strong> {studentHealth.specialCareNeeds}
                  </p>
                )}
              </div>
            )}

            {/* Visit Meta Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Kunjungan</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Masuk UKS</label>
                <input
                  type="text"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  placeholder="08:15"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru / Teman Pengantar</label>
                <input
                  type="text"
                  value={accompaniedBy}
                  onChange={(e) => setAccompaniedBy(e.target.value)}
                  placeholder="Nama pengantar (atau 'Sendiri')"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Kejadian</label>
                <select
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Ruang Kelas">Ruang Kelas</option>
                  <option value="Lapangan Olahraga">Lapangan Olahraga</option>
                  <option value="Halaman Alam Sekolah">Halaman Alam Sekolah</option>
                  <option value="Kantin Sekolah">Kantin Sekolah</option>
                  <option value="Laboratorium IPA">Laboratorium IPA</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Musholla Sekolah">Musholla Sekolah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION B: KELUHAN SISWA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h3 className="font-bold text-slate-800 text-sm">Keluhan Siswa</h3>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Kategori Keluhan Umum *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {settings.complaintCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setComplaintCategory(cat)}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center gap-1.5 ${
                      complaintCategory === cat
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        complaintCategory === cat ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    />
                    <span className="line-clamp-1">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian / Keterangan Keluhan yang Disampaikan Siswa *
                </label>
                <textarea
                  value={complaintDetail}
                  onChange={(e) => setComplaintDetail(e.target.value)}
                  placeholder="Contoh: Siswa mengeluhkan kepala pusing berdenyut sejak jam pelajaran kedua, badan terasa panas, dan lemas..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Pilihan keluhan di atas hanya untuk membantu pencatatan, bukan untuk menetapkan diagnosis medis.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION C: PEMERIKSAAN AWAL (VITAL SIGNS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  C
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Pemeriksaan Awal (Tanda-Tanda Fisik)</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                (Isi jika diperiksa, kosongkan jika tidak diukur)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  Suhu Tubuh (°C)
                </label>
                <input
                  type="text"
                  value={bodyTemperature}
                  onChange={(e) => setBodyTemperature(e.target.value)}
                  placeholder="Contoh: 37.8"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Denyut Nadi (bpm)
                </label>
                <input
                  type="text"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  placeholder="Contoh: 84"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Kesadaran</label>
                <select
                  value={consciousness}
                  onChange={(e) => setConsciousness(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Compos Mentis (Sadar penuh)">Compos Mentis (Sadar penuh)</option>
                  <option value="Apatis (Acuh tak acuh)">Apatis (Acuh tak acuh)</option>
                  <option value="Somnolen (Mengantuk berat)">Somnolen (Mengantuk berat)</option>
                  <option value="Pingsan / Menurun">Pingsan / Menurun</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kondisi Umum Siswa</label>
                <input
                  type="text"
                  value={generalCondition}
                  onChange={(e) => setGeneralCondition(e.target.value)}
                  placeholder="Tampak lemas, pucat, dll."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hasil Pengamatan Objektif Petugas
              </label>
              <input
                type="text"
                value={objectiveObservation}
                onChange={(e) => setObjectiveObservation(e.target.value)}
                placeholder="Pengamatan fisik: bibir kering, luka lecet siku 2 cm, tidak ada benjolan, dll."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* SECTION D: TINDAKAN AWAL & PEMBERIAN OBAT */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                D
              </span>
              <h3 className="font-bold text-slate-800 text-sm">
                Tindakan Awal & Pemberian Obat (Sesuai SOP Sekolah)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Tindakan Awal *</label>
                <select
                  value={initialAction}
                  onChange={(e) => setInitialAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  {settings.actionCategories.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kunjungan Saat Ini *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VisitStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-800"
                >
                  <option value="Menunggu pemeriksaan">Menunggu pemeriksaan</option>
                  <option value="Sedang ditangani">Sedang ditangani</option>
                  <option value="Istirahat atau observasi">Istirahat atau observasi</option>
                  <option value="Kembali ke kelas">Kembali ke kelas</option>
                  <option value="Dipulangkan">Dipulangkan</option>
                  <option value="Dirujuk">Dirujuk ke faskes</option>
                  <option value="Penanganan darurat">Penanganan darurat</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Uraian Tindakan Pertolongan Pertama
              </label>
              <textarea
                value={actionDetail}
                onChange={(e) => setActionDetail(e.target.value)}
                placeholder="Rincian tindakan: istirahat 30 menit, kompres dahi dengan air biasa, perawatan luka dibersihkan rivanol & betadine, diberikan minum teh hangat manis..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* PEMBERIAN OBAT / PERLENGKAPAN DARI INVENTARIS */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span>Pemberian Obat Bebas / Perlengkapan P3K dari Inventaris UKS</span>
                </div>
                <span className="text-[11px] text-slate-500">Stok otomatis berkurang</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Pilih Obat / Barang dari Inventaris --</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id} disabled={inv.stock <= 0}>
                      {inv.name} (Tersedia: {inv.stock} {inv.unit}) {inv.stock <= 0 ? '- [HABIS]' : ''}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={medicineQuantity}
                    onChange={(e) => setMedicineQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-xs text-center font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    disabled={!selectedMedicineId}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    + Tambahkan
                  </button>
                </div>
              </div>

              {/* Medicine list chips */}
              {medicinesGivenList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-slate-600">Daftar yang Diberikan:</p>
                  <div className="flex flex-wrap gap-2">
                    {medicinesGivenList.map((med, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs text-emerald-900 font-medium"
                      >
                        <span>
                          {med.name} ({med.quantity} {med.unit})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up & Handled By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={needsFollowUp}
                    onChange={(e) => setNeedsFollowUp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span>Memerlukan Pemantauan Tindak Lanjut</span>
                </label>
                {needsFollowUp && (
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Instruksi tindak lanjut: konfirmasi kondisi sore hari ke ortu, cek suhu besok pagi..."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50/50 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Petugas UKS yang Menangani *</label>
                <input
                  type="text"
                  value={handledBy}
                  onChange={(e) => setHandledBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              * Pastikan data kunjungan telah diverifikasi bersama siswa atau pengantar.
            </span>
            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedStudent || !complaintDetail}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                SIMPAN KUNJUNGAN
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
