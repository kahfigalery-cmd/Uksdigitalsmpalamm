import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UksVisit, VisitStatus } from '../types/index.ts';
import {
  X,
  Clock,
  Calendar,
  User,
  HeartPulse,
  Thermometer,
  Activity,
  Pill,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Send,
  AlertCircle,
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface VisitDetailModalProps {
  visit: UksVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenParentContact?: (visit: UksVisit) => void;
}

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
  onOpenParentContact
}) => {
  const { assessments, updateVisitStatus, updateVisit, settings, students, healthRecords } = useUks();
  const { currentUser, canManageVisits, canViewConfidentialHealth } = useAuth();

  const [activeTab, setActiveTab] = useState<'detail' | 'status' | 'wa' | 'cetak'>('detail');
  const [dischargePerson, setDischargePerson] = useState('');
  const [dischargeTimeInput, setDischargeTimeInput] = useState(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [isCopied, setIsCopied] = useState(false);
  const [followUpNotesInput, setFollowUpNotesInput] = useState(visit?.followUpNotes || '');

  if (!isOpen || !visit) return null;

  const assessment = assessments[visit.id];
  const student = students.find((s) => s.nis === visit.studentNis);
  const healthInfo = canViewConfidentialHealth ? healthRecords[visit.studentNis] : null;

  const allStatuses: VisitStatus[] = [
    'Menunggu pemeriksaan',
    'Sedang ditangani',
    'Istirahat atau observasi',
    'Kembali ke kelas',
    'Dipulangkan',
    'Dirujuk',
    'Penanganan darurat',
    'Selesai'
  ];

  const handleQuickStatusChange = async (newStatus: VisitStatus) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (newStatus === 'Dipulangkan') {
      if (!dischargePerson) {
        alert('Mohon isi nama orang tua / pihak penjemput siswa sebelum memulangkan.');
        setActiveTab('status');
        return;
      }
      await updateVisitStatus(visit.id, newStatus, {
        exitTime: dischargeTimeInput || nowTime,
        dischargedTo: dischargePerson,
        dischargeTime: dischargeTimeInput || nowTime,
        handledBy: currentUser.name
      });
    } else if (newStatus === 'Kembali ke kelas' || newStatus === 'Selesai') {
      await updateVisitStatus(visit.id, newStatus, {
        exitTime: visit.exitTime || nowTime,
        handledBy: currentUser.name
      });
    } else {
      await updateVisitStatus(visit.id, newStatus, {
        handledBy: currentUser.name
      });
    }
  };

  const handleSaveFollowUp = async () => {
    await updateVisit(visit.id, {
      followUpNotes: followUpNotesInput,
      needsFollowUp: true,
      followUpStatus: 'Dalam Pemantauan'
    });
    alert('Catatan tindak lanjut berhasil diperbarui.');
  };

  const handleResolveFollowUp = async () => {
    await updateVisit(visit.id, {
      followUpStatus: 'Selesai'
    });
    alert('Kasus tindak lanjut telah diselesaikan.');
  };

  // WhatsApp message template generator
  const parentName = student?.parentName || 'Orang Tua / Wali';
  const parentPhone = student?.parentPhone || '';
  const waMessage = `Assalamu’alaikum warahmatullahi wabarakatuh.
Bapak/Ibu Orang Tua/Wali dari ${visit.studentName} (Kelas ${visit.className}),

Kami menginformasikan dari UKS SMP ALAM EXCELLENTIA PAMEKASAN bahwa putra/putri Bapak/Ibu saat ini sedang berada di ruang UKS karena mengalami keluhan: *${visit.complaintCategory}* (${visit.complaintDetail}).

Status penanganan saat ini: *${visit.status}*
Tindakan yang telah dilakukan: ${visit.initialAction || 'Istirahat dan observasi'}.
Petugas UKS yang menangani: ${visit.handledBy}.

${
  visit.status === 'Dipulangkan'
    ? 'Mohon kesediaannya untuk menjemput putra/putri Bapak/Ibu di ruang UKS sekolah untuk beristirahat di rumah.'
    : 'Kami akan terus memantau perkembangan kondisinya dan menginformasikan kembali jika diperlukan.'
}

Terima kasih atas kerja samanya.
Wassalamu’alaikum warahmatullahi wabarakatuh.

*UKS SMP ALAM EXCELLENTIA PAMEKASAN*
Telepon/WA UKS: ${settings.phone.split('/')[0]}`;

  const handleCopyWa = () => {
    navigator.clipboard.writeText(waMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenWaWeb = () => {
    const cleanPhone = parentPhone.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {visit.visitNumber}
              </span>
              <span className="text-emerald-200 text-xs font-semibold">
                {visit.visitDate} • {visit.entryTime} WIB
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1">
              {visit.studentName}{' '}
              <span className="text-sm font-normal text-emerald-200">({visit.className})</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
              title="Cetak Lembar Kunjungan"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'detail'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Rincian Kunjungan
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Pembaruan Status
          </button>
          <button
            onClick={() => setActiveTab('wa')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'wa'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Pemberitahuan Orang Tua
          </button>
          <button
            onClick={() => setActiveTab('cetak')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cetak'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Format Cetak Resmi
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
          {activeTab === 'detail' && (
            <div className="space-y-4">
              {/* Status Header Badge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Status Saat Ini:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      visit.status === 'Sedang ditangani' || visit.status === 'Istirahat atau observasi'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : visit.status === 'Kembali ke kelas'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : visit.status === 'Dipulangkan'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : visit.status === 'Dirujuk' || visit.status === 'Penanganan darurat'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {visit.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <span>
                    Masuk: <strong>{visit.entryTime} WIB</strong>
                  </span>
                  {visit.exitTime && (
                    <span>
                      Keluar: <strong>{visit.exitTime} WIB</strong>
                    </span>
                  )}
                  <span>
                    Petugas: <strong>{visit.handledBy}</strong>
                  </span>
                </div>
              </div>

              {/* Student & Parent Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1.5 bg-white">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Data Siswa
                  </h4>
                  <p className="text-slate-600">NIS: <span className="font-mono font-semibold text-slate-900">{visit.studentNis}</span></p>
                  <p className="text-slate-600">Kelas: <span className="font-semibold text-slate-900">{visit.className}</span></p>
                  <p className="text-slate-600">Pengantar: <span className="font-medium text-slate-900">{visit.accompaniedBy || '-'}</span></p>
                  <p className="text-slate-600">Lokasi Kejadian: <span className="font-medium text-slate-900">{visit.incidentLocation || '-'}</span></p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1.5 bg-white">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Kontak Orang Tua / Wali
                  </h4>
                  <p className="text-slate-600">Nama Wali: <span className="font-semibold text-slate-900">{student?.parentName || '-'}</span></p>
                  <p className="text-slate-600">Nomor Telp/WA: <span className="font-mono font-semibold text-emerald-800">{student?.parentPhone || '-'}</span></p>
                  {visit.dischargedTo && (
                    <p className="p-2 bg-blue-50 text-blue-900 rounded-lg font-medium mt-1">
                      Dijemput pulang oleh: <strong>{visit.dischargedTo}</strong> (Pukul {visit.dischargeTime || '-'})
                    </p>
                  )}
                </div>
              </div>

              {/* Health confidential note if any */}
              {healthInfo && (healthInfo.allergies || healthInfo.medicalNotes) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-xs text-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Catatan Kesehatan Siswa Terverifikasi:
                  </div>
                  {healthInfo.allergies && <p>• Alergi: {healthInfo.allergies}</p>}
                  {healthInfo.medicalNotes && <p>• Catatan Medis: {healthInfo.medicalNotes}</p>}
                </div>
              )}

              {/* Keluhan & Observasi */}
              <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-white">
                <h4 className="font-bold text-slate-800 text-xs">Keluhan Siswa</h4>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-bold text-emerald-800">[{visit.complaintCategory}]</span>{' '}
                  <span className="text-slate-700">{visit.complaintDetail}</span>
                </div>
              </div>

              {/* Pemeriksaan Fisik Vital Signs */}
              <div className="p-3.5 border border-slate-200 rounded-xl space-y-2.5 bg-white">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  Hasil Pengamatan & Pemeriksaan Awal
                </h4>

                {assessment ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                      <p className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> Suhu Tubuh
                      </p>
                      <p className="text-sm font-bold font-mono text-rose-900 mt-0.5">
                        {assessment.bodyTemperature ? `${assessment.bodyTemperature} °C` : '-'}
                      </p>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Denyut Nadi
                      </p>
                      <p className="text-sm font-bold font-mono text-emerald-900 mt-0.5">
                        {assessment.pulseRate ? `${assessment.pulseRate} bpm` : '-'}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                      <p className="text-[10px] text-slate-500 font-semibold">Tingkat Kesadaran</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {assessment.consciousness || 'Compos Mentis'}
                      </p>
                    </div>

                    {assessment.objectiveObservation && (
                      <div className="col-span-2 sm:col-span-4 p-2 bg-slate-50 rounded-lg text-slate-700">
                        <strong>Pengamatan Objektif:</strong> {assessment.objectiveObservation}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    Tidak ada pemeriksaan tanda vital fisik tambahan yang dicatat saat kunjungan.
                  </p>
                )}
              </div>

              {/* Tindakan & Obat */}
              <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-white">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-600" />
                  Tindakan Pertolongan Pertama & Obat yang Diberikan
                </h4>
                <p className="text-slate-700">
                  <strong>Tindakan:</strong> {visit.initialAction}
                </p>
                {visit.actionDetail && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">{visit.actionDetail}</p>
                )}
                {visit.medicinesGiven && (
                  <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                    <strong>Obat / Alat P3K Diberikan:</strong> {visit.medicinesGiven}
                  </p>
                )}
              </div>

              {/* Follow-up Note */}
              <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">Pemantauan & Tindak Lanjut</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      visit.followUpStatus === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {visit.followUpStatus}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followUpNotesInput}
                    onChange={(e) => setFollowUpNotesInput(e.target.value)}
                    placeholder="Catatan perkembangan tindak lanjut..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveFollowUp}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs"
                  >
                    Simpan Catatan
                  </button>
                  {visit.followUpStatus !== 'Selesai' && (
                    <button
                      onClick={handleResolveFollowUp}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-bold text-emerald-900 text-xs">Perbarui Status Kunjungan Siswa</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Pilih status yang sesuai dengan kondisi aktual siswa saat ini. Status akan tersimpan ke database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allStatuses.map((st) => {
                  const isActive = visit.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatusChange(st)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-100/70 text-emerald-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700'
                      }`}
                    >
                      <span>{st}</span>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Status Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Discharge specifics */}
              <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl space-y-3 mt-4">
                <h4 className="font-bold text-blue-900 text-xs">
                  Prosedur Siswa Dipulangkan (Konfirmasi Penjemputan)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Sesuai ketentuan, catat pihak keluarga yang menjemput siswa dan jam penyerahan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nama Orang Tua / Penjemput
                    </label>
                    <input
                      type="text"
                      value={dischargePerson}
                      onChange={(e) => setDischargePerson(e.target.value)}
                      placeholder="Contoh: Hj. Mardiyah (Ibu Kandung)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Jam Penyerahan Siswa
                    </label>
                    <input
                      type="text"
                      value={dischargeTimeInput}
                      onChange={(e) => setDischargeTimeInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickStatusChange('Dipulangkan')}
                  disabled={!dischargePerson}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Konfirmasi Siswa Dipulangkan Bersama Penjemput
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wa' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Pesan Otomatis WhatsApp untuk Orang Tua</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Gunakan tombol Salin atau Buka di WhatsApp untuk mengabarkan kondisi putra/putri kepada orang tua/wali secara sopan dan informatif.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-slate-600">Nama Siswa: <strong className="text-slate-900">{visit.studentName}</strong> ({visit.className})</p>
                <p className="text-slate-600">Orang Tua / Wali: <strong className="text-slate-900">{parentName}</strong></p>
                <p className="text-slate-600">Nomor WhatsApp: <strong className="font-mono text-emerald-800">{parentPhone || 'Belum ada nomor'}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan WhatsApp:</label>
                <textarea
                  readOnly
                  value={waMessage}
                  rows={9}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCopyWa}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Tersalin ke Clipboard!' : 'Salin Pesan WhatsApp'}
                </button>

                {parentPhone && (
                  <button
                    type="button"
                    onClick={handleOpenWaWeb}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Kirim via WhatsApp
                  </button>
                )}

                {onOpenParentContact && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenParentContact(visit);
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Catat Riwayat Komunikasi Ortu
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cetak' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 flex items-center justify-between">
                <span>Pratinjau Lembar Pelayanan UKS Resmi untuk Cetak / Tanda Terima</span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
                </button>
              </div>

              {/* Printable sheet container */}
              <div className="p-6 bg-white border border-slate-300 rounded-xl shadow-xs space-y-4 print:p-0 print:border-none">
                {/* Official Header */}
                <div className="text-center border-b-2 border-slate-800 pb-3">
                  <h3 className="font-bold text-sm tracking-wide uppercase text-slate-900">
                    {settings.schoolName}
                  </h3>
                  <h4 className="font-extrabold text-base tracking-wider uppercase text-emerald-800">
                    {settings.uksName}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {settings.address} • Telp: {settings.phone}
                  </p>
                </div>

                <div className="text-center py-1">
                  <h5 className="font-bold text-xs uppercase underline">
                    LEMBAR CATATAN PELAYANAN KUNJUNGAN UKS
                  </h5>
                  <p className="text-[10px] font-mono font-semibold text-slate-600">
                    No. Kunjungan: {visit.visitNumber}
                  </p>
                </div>

                {/* Table Data */}
                <table className="w-full text-[11px] border-collapse border border-slate-300">
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50 w-1/4">Nama Siswa</td>
                      <td className="p-2 border border-slate-300 font-bold">{visit.studentName}</td>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50 w-1/4">Kelas / NIS</td>
                      <td className="p-2 border border-slate-300 font-mono">{visit.className} / {visit.studentNis}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Waktu Pelayanan</td>
                      <td className="p-2 border border-slate-300">
                        {visit.visitDate} (Pukul {visit.entryTime} {visit.exitTime ? `- ${visit.exitTime}` : ''} WIB)
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Lokasi / Pengantar</td>
                      <td className="p-2 border border-slate-300">{visit.incidentLocation} / {visit.accompaniedBy}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Keluhan Siswa</td>
                      <td colSpan={3} className="p-2 border border-slate-300">
                        <strong>[{visit.complaintCategory}]</strong> {visit.complaintDetail}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Hasil Pemeriksaan</td>
                      <td colSpan={3} className="p-2 border border-slate-300">
                        Suhu: {assessment?.bodyTemperature ? `${assessment.bodyTemperature} °C` : '-'} | Nadi: {assessment?.pulseRate ? `${assessment.pulseRate} bpm` : '-'} | Kesadaran: {assessment?.consciousness || 'Compos Mentis'} | Catatan: {assessment?.objectiveObservation || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Tindakan / Pertolongan</td>
                      <td colSpan={3} className="p-2 border border-slate-300">
                        {visit.initialAction}. {visit.actionDetail}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Obat / Perlengkapan</td>
                      <td colSpan={3} className="p-2 border border-slate-300 font-semibold text-emerald-800">
                        {visit.medicinesGiven || 'Tidak ada obat'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-semibold bg-slate-50">Status Akhir</td>
                      <td colSpan={3} className="p-2 border border-slate-300 font-bold">
                        {visit.status}{' '}
                        {visit.dischargedTo ? `(Diserahkan kepada: ${visit.dischargedTo} pada jam ${visit.dischargeTime})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signature box */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs">
                  <div>
                    <p className="text-[11px] text-slate-500">Mengetahui Orang Tua / Wali Siswa,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">({student?.parentName || '...................................'})</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Pamekasan, {visit.visitDate}</p>
                    <p className="text-[11px] text-slate-500">Petugas UKS yang Melayani,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">({visit.handledBy})</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs">
          <span className="text-slate-500">SMP Alam Excellentia Pamekasan • UKS Digital</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
