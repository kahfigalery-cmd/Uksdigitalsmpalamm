import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AlertTriangle,
  PhoneCall,
  Ambulance,
  Building2,
  ShieldAlert,
  Clock,
  Send,
  X,
  FileCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { settings, addReferral, students } = useUks();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'kontak' | 'sop' | 'form_rujukan'>('kontak');
  const [selectedStudentNis, setSelectedStudentNis] = useState('');
  const [healthFacility, setHealthFacility] = useState('RSUD dr. H. Slamet Martodirdjo (RS Smart) Pamekasan');
  const [contactFacility, setContactFacility] = useState('(0324) 326242');
  const [referralReason, setReferralReason] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState(currentUser.name);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStudentSelect = (nis: string) => {
    setSelectedStudentNis(nis);
  };

  const selectedStudent = students.find((s) => s.nis === selectedStudentNis);

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !referralReason) return;

    await addReferral({
      visitId: 'darurat-' + Date.now(),
      studentNis: selectedStudent.nis,
      studentName: selectedStudent.fullName,
      className: selectedStudent.className,
      healthFacility,
      contactFacility,
      referralReason,
      accompaniedBy,
      referralTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      handoverNotes
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border-2 border-rose-500">
        {/* Header Alert */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Siaga Darurat
                </span>
                <span className="text-rose-100 text-xs">Pamekasan Hotline</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                PROSEDUR KEADAAN DARURAT MEDIS
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-rose-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>PEMBERITAHUAN PENTING:</strong> Aplikasi ini adalah alat bantu administrasi sekolah dan <u>BUKAN</u> pengganti layanan darurat medis. Jika kondisi siswa mengancam keselamatan atau nyawa, dahulukan penanganan fisik dan segera hubungi fasilitas kesehatan di bawah ini.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kontak')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'kontak'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Kontak Darurat Pamekasan
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sop'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            SOP Penanganan Darurat
          </button>
          <button
            onClick={() => setActiveTab('form_rujukan')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'form_rujukan'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Catat Rujukan Faskes
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Catatan Rujukan Berhasil Disimpan</p>
                <p className="text-xs">Data telah dicatat dalam administrasi UKS dan log sistem.</p>
              </div>
            </div>
          )}

          {activeTab === 'kontak' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Daftar Panggilan Cepat Fasilitas & Instansi Darurat (Pamekasan)
                </h3>
                <span className="text-xs text-slate-500">Klik nomor untuk menelepon</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settings.emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50/70 hover:bg-rose-50/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 text-rose-800">
                          {contact.type}
                        </span>
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-2">{contact.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{contact.address}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-700">{contact.phone}</span>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        Panggil
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm">
                Standar Operasional Prosedur (SOP) Keadaan Darurat UKS
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900">Periksa Kesadaran & Tanda Vital (ABC)</h4>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Cek respon suara dan sentuhan (AVPU). Pastikan jalan napas (Airway) bersih, amati hembusan napas (Breathing), dan periksa denyut nadi (Circulation). Jangan memindahkan siswa jika ada kecurigaan cedera tulang leher/punggung.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900">Hubungi Faskes Rujukan / Ambulance Segera</h4>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Segera hubungi IGD RSUD Smart Pamekasan di <strong>(0324) 326242</strong> atau PSC 119 Pamekasan di <strong>119</strong>. Sampaikan lokasi jelas di SMP Alam Excellentia Pamekasan, kondisi umum siswa, dan tindakan yang sedang dilakukan.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">Hubungi Orang Tua / Wali Siswa</h4>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Petugas atau perwakilan guru wajib menghubungi orang tua secara langsung melalui telepon untuk mengabarkan situasi darurat dengan tenang dan jelas, serta meminta orang tua menuju faskes rujukan.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Pendampingan dan Serah Terima Resmi</h4>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Siswa harus didampingi oleh petugas UKS atau guru yang ditunjuk hingga tiba di faskes rujukan dan dilakukan serah terima dengan tenaga medis serta orang tua siswa. Catat waktu serah terima.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form_rujukan' && (
            <form onSubmit={handleSubmitReferral} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Siswa yang Dirujuk *
                </label>
                <select
                  value={selectedStudentNis}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                  required
                >
                  <option value="">-- Pilih Siswa Berdasarkan NIS / Nama --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.nis}>
                      {s.fullName} - Kelas {s.className} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <p className="font-semibold text-slate-800">Identitas Siswa:</p>
                  <p className="text-slate-600">Nama: <span className="font-bold text-slate-900">{selectedStudent.fullName}</span> ({selectedStudent.className})</p>
                  <p className="text-slate-600">Orang Tua: <span className="font-medium text-slate-900">{selectedStudent.parentName}</span> - Telp: <span className="font-mono font-bold text-rose-700">{selectedStudent.parentPhone}</span></p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fasilitas Kesehatan Tujuan Rujukan *
                  </label>
                  <input
                    type="text"
                    value={healthFacility}
                    onChange={(e) => setHealthFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon Faskes
                  </label>
                  <input
                    type="text"
                    value={contactFacility}
                    onChange={(e) => setContactFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Rujukan Medis *
                </label>
                <textarea
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  placeholder="Deskripsikan kondisi siswa yang membutuhkan penanganan faskes (misal: demam tinggi tidak turun, kecurigaan fraktur, pingsan berulang, sesak napas berat)"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Petugas / Guru Pendamping *
                  </label>
                  <input
                    type="text"
                    value={accompaniedBy}
                    onChange={(e) => setAccompaniedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Serah Terima Faskes
                  </label>
                  <input
                    type="text"
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Nama perawat / dokter IGD penerima jika sudah diserahterimakan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentNis || !referralReason}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Simpan Catatan Rujukan
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">UKS SMP Alam Excellentia Pamekasan</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
