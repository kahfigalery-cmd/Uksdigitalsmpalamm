import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UksVisit, FollowUpStatus } from '../types/index.ts';
import {
  ClockAlert,
  CheckCircle,
  AlertCircle,
  Search,
  MessageCircle,
  User,
  Calendar,
  Save,
  Check
} from 'lucide-react';

interface FollowUpViewProps {
  onSelectVisit: (visit: UksVisit) => void;
  onOpenParentContact: (visit: UksVisit) => void;
}

export const FollowUpView: React.FC<FollowUpViewProps> = ({
  onSelectVisit,
  onOpenParentContact
}) => {
  const { visits, updateVisit, students } = useUks();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | FollowUpStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Visits with follow up
  const followUpVisits = visits.filter((v) => v.needsFollowUp);

  const filtered = followUpVisits.filter((v) => {
    if (statusFilter !== 'all' && v.followUpStatus !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        v.studentName.toLowerCase().includes(term) ||
        v.studentNis.includes(term) ||
        v.visitNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pendingCount = followUpVisits.filter(
    (v) => v.followUpStatus !== 'Selesai'
  ).length;

  const handleUpdateStatus = async (visitId: string, status: FollowUpStatus) => {
    await updateVisit(visitId, {
      followUpStatus: status
    });
  };

  const handleAddNote = async (v: UksVisit) => {
    if (!newNote) return;
    const existing = v.followUpNotes || '';
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const combined = existing
      ? `${existing}\n[${nowStr} - ${currentUser.name}]: ${newNote}`
      : `[${nowStr} - ${currentUser.name}]: ${newNote}`;

    await updateVisit(v.id, {
      followUpNotes: combined,
      followUpStatus: 'Dalam Pemantauan'
    });
    setNewNote('');
    setSelectedVisitId(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClockAlert className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Pemantauan Tindak Lanjut Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kasus kunjungan UKS yang memerlukan observasi berkelanjutan dan konfirmasi orang tua
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Ada <strong>{pendingCount} Kasus</strong> yang belum selesai dipantau
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({followUpVisits.length})
          </button>
          <button
            onClick={() => setStatusFilter('Belum Ditindaklanjuti')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'Belum Ditindaklanjuti'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Belum Ditindaklanjuti
          </button>
          <button
            onClick={() => setStatusFilter('Dalam Pemantauan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'Dalam Pemantauan'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Dalam Pemantauan
          </button>
          <button
            onClick={() => setStatusFilter('Selesai')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'Selesai'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Selesai
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa atau NIS..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* List of Follow-up Cases */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((v) => {
            const student = students.find((s) => s.nis === v.studentNis);
            return (
              <div
                key={v.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 transition-all"
              >
                {/* Top Row: Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {v.visitNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{v.studentName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      Kelas {v.className}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                        v.followUpStatus === 'Belum Ditindaklanjuti'
                          ? 'bg-rose-100 text-rose-800'
                          : v.followUpStatus === 'Dalam Pemantauan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {v.followUpStatus}
                    </span>
                  </div>
                </div>

                {/* Complaint & Action snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <p className="text-slate-500 font-semibold">Keluhan Saat Kunjungan ({v.visitDate}):</p>
                    <p className="font-bold text-slate-800">
                      [{v.complaintCategory}] {v.complaintDetail}
                    </p>
                    <p className="text-slate-600 mt-1">
                      Status Kunjungan: <span className="font-semibold">{v.status}</span>
                      {v.dischargedTo ? ` (Dijemput: ${v.dischargedTo})` : ''}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg space-y-1">
                    <p className="text-amber-900 font-semibold">Catatan Tindak Lanjut:</p>
                    <p className="text-slate-800 whitespace-pre-line">
                      {v.followUpNotes || 'Belum ada catatan tindak lanjut yang dimasukkan.'}
                    </p>
                  </div>
                </div>

                {/* Inline Note Addition Box */}
                {selectedVisitId === v.id && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                    <label className="block font-semibold text-slate-700">
                      Tambah Catatan Perkembangan Siswa:
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Contoh: Ortu konfirmasi melalui WA bahwa siswa sudah diperiksakan ke puskesmas, suhu sudah 37°C..."
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitId(null)}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-white"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddNote(v)}
                        className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Simpan Catatan
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenParentContact(v)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Hubungi Orang Tua ({student?.parentPhone || 'WA'})
                    </button>
                    <button
                      onClick={() => onSelectVisit(v)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      Buka Rincian Kunjungan
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedVisitId(v.id)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-semibold text-slate-700"
                    >
                      + Tambah Catatan
                    </button>

                    {v.followUpStatus !== 'Selesai' ? (
                      <button
                        onClick={() => handleUpdateStatus(v.id, 'Selesai')}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Tandai Selesai
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(v.id, 'Dalam Pemantauan')}
                        className="px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:underline"
                      >
                        Buka Kembali Pemantauan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Kasus yang Perlu Dipantau</h4>
            <p className="text-xs text-slate-500">
              Semua kunjungan yang memerlukan pemantauan lanjutan telah selesai atau ditangani.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
