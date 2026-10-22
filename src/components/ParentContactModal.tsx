import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UksVisit } from '../types/index.ts';
import {
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Send,
  Save,
  CheckCircle,
  User
} from 'lucide-react';

interface ParentContactModalProps {
  visit: UksVisit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParentContactModal: React.FC<ParentContactModalProps> = ({
  visit,
  isOpen,
  onClose
}) => {
  const { addParentContact, students, settings } = useUks();
  const { currentUser } = useAuth();

  const student = visit ? students.find((s) => s.nis === visit.studentNis) : null;

  const [parentName, setParentName] = useState(student?.parentName || '');
  const [contactNumber, setContactNumber] = useState(student?.parentPhone || '');
  const [method, setMethod] = useState<'WhatsApp' | 'Telepon' | 'Tatap Muka'>('WhatsApp');
  const [summary, setSummary] = useState(
    visit
      ? `Mengabarkan bahwa siswa mengalami keluhan ${visit.complaintCategory} (${visit.complaintDetail}) dan sedang istirahat di UKS.`
      : ''
  );
  const [result, setResult] = useState('Orang tua telah memahami dan memantau kondisi siswa.');
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !visit) return null;

  const waTemplate = `Assalamu’alaikum warahmatullahi wabarakatuh. Bapak/Ibu Orang Tua/Wali dari ${visit.studentName}, kami menginformasikan bahwa putra/putri Bapak/Ibu sedang berada di UKS SMP Alam Excellentia Pamekasan karena mengalami keluhan ${visit.complaintCategory}. Saat ini petugas sedang melakukan penanganan awal sesuai prosedur sekolah. Kami akan menginformasikan perkembangan selanjutnya apabila diperlukan. Terima kasih.`;

  const handleCopyWa = () => {
    navigator.clipboard.writeText(waTemplate);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendWa = () => {
    const cleanPhone = contactNumber.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waTemplate)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !contactNumber || !summary) return;

    await addParentContact({
      visitId: visit.id,
      studentNis: visit.studentNis,
      studentName: visit.studentName,
      parentName,
      contactNumber,
      contactDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      method,
      summary,
      result,
      officerName
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Pencatatan Komunikasi Orang Tua / Wali</h3>
              <p className="text-[11px] text-emerald-200">
                Siswa: {visit.studentName} ({visit.className})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Komunikasi Berhasil Dicatat</h4>
            <p className="text-xs text-slate-500">
              Riwayat telah tersimpan dalam arsip kunjungan dan log aktivitas UKS.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
            {/* Quick WhatsApp helper */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Format Standar Pesan WhatsApp Sekolah
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Resmi</span>
              </div>
              <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100 font-mono">
                {waTemplate}
              </p>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCopyWa}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold flex items-center gap-1 shadow-2xs"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Tersalin!' : 'Salin Pesan WA'}
                </button>
                {contactNumber && (
                  <button
                    type="button"
                    onClick={handleSendWa}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    Kirim via WA
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Wali *
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WA *
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Komunikasi *</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="WhatsApp">WhatsApp Message / Call</option>
                  <option value="Telepon">Panggilan Suara Langsung</option>
                  <option value="Tatap Muka">Tatap Muka di Sekolah</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Petugas yang Menghubungi *
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ringkasan Informasi yang Disampaikan *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hasil Komunikasi & Kesepakatan
              </label>
              <input
                type="text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Misal: Orang tua akan menjemput siswa pukul 11.00 / Ortu mengizinkan minum obat paracetamol"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Arsip Komunikasi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
