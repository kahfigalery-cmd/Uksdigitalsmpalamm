import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Student, StudentHealthInfo } from '../types/index.ts';
import {
  Users,
  Search,
  PlusCircle,
  Download,
  Upload,
  Edit,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Phone,
  X,
  Save,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const StudentsView: React.FC = () => {
  const {
    students,
    healthRecords,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    settings
  } = useUks();
  const { canManageStudents, canViewConfidentialHealth, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForHealth, setSelectedStudentForHealth] = useState<Student | null>(null);

  // Student Form fields
  const [nis, setNis] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [className, setClassName] = useState('7A');
  const [academicYear, setAcademicYear] = useState(settings.academicYear || '2026/2027');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [active, setActive] = useState(true);

  // Health Form fields
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [specialCareNeeds, setSpecialCareNeeds] = useState('');
  const [bloodType, setBloodType] = useState('O');

  const filteredStudents = students.filter((s) => {
    if (classFilter !== 'all' && s.className !== classFilter) return false;
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      if (s.active !== isActive) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(term) ||
        s.nis.includes(term) ||
        s.parentName.toLowerCase().includes(term) ||
        s.className.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNis('202607' + String(students.length + 1).padStart(3, '0'));
    setFullName('');
    setGender('L');
    setClassName('7A');
    setParentName('');
    setParentPhone('08');
    setEmergencyContact('');
    setActive(true);
    setAllergies('');
    setMedicalNotes('');
    setSpecialCareNeeds('');
    setBloodType('-');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setNis(st.nis);
    setFullName(st.fullName);
    setGender(st.gender);
    setClassName(st.className);
    setAcademicYear(st.academicYear);
    setParentName(st.parentName);
    setParentPhone(st.parentPhone);
    setEmergencyContact(st.emergencyContact || '');
    setActive(st.active);

    const h = healthRecords[st.nis];
    if (h) {
      setAllergies(h.allergies || '');
      setMedicalNotes(h.medicalNotes || '');
      setSpecialCareNeeds(h.specialCareNeeds || '');
      setBloodType(h.bloodType || '-');
    } else {
      setAllergies('');
      setMedicalNotes('');
      setSpecialCareNeeds('');
      setBloodType('-');
    }
    setIsFormOpen(true);
  };

  const handleOpenHealth = (st: Student) => {
    setSelectedStudentForHealth(st);
    const h = healthRecords[st.nis];
    if (h) {
      setAllergies(h.allergies || '');
      setMedicalNotes(h.medicalNotes || '');
      setSpecialCareNeeds(h.specialCareNeeds || '');
      setBloodType(h.bloodType || '-');
    } else {
      setAllergies('');
      setMedicalNotes('');
      setSpecialCareNeeds('');
      setBloodType('-');
    }
    setIsHealthModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !fullName || !parentName || !parentPhone) return;

    if (editingStudent) {
      await updateStudent(
        editingStudent.id,
        {
          nis,
          fullName,
          gender,
          className,
          academicYear,
          parentName,
          parentPhone,
          emergencyContact,
          active
        },
        canViewConfidentialHealth
          ? {
              allergies,
              medicalNotes,
              specialCareNeeds,
              bloodType,
              updatedBy: currentUser.name
            }
          : undefined
      );
    } else {
      // Check duplicate NIS
      if (students.some((s) => s.nis === nis)) {
        alert('NIS sudah terdaftar. Mohon gunakan NIS yang unik.');
        return;
      }
      await addStudent(
        {
          nis,
          fullName,
          gender,
          className,
          academicYear,
          parentName,
          parentPhone,
          emergencyContact,
          active
        },
        canViewConfidentialHealth
          ? {
              allergies,
              medicalNotes,
              specialCareNeeds,
              bloodType,
              updatedBy: currentUser.name
            }
          : undefined
      );
    }
    setIsFormOpen(false);
  };

  const handleSaveHealthOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForHealth) return;
    await updateStudent(selectedStudentForHealth.id, {}, {
      allergies,
      medicalNotes,
      specialCareNeeds,
      bloodType,
      updatedBy: currentUser.name
    });
    setIsHealthModalOpen(false);
  };

  const handleDelete = async (st: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${st.fullName} (NIS: ${st.nis})?`)) {
      await deleteStudent(st.id);
    }
  };

  // Export to Excel
  const handleExport = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      'No.': idx + 1,
      'NIS': s.nis,
      'Nama Lengkap': s.fullName,
      'L/P': s.gender,
      'Kelas': s.className,
      'Tahun Ajaran': s.academicYear,
      'Nama Orang Tua / Wali': s.parentName,
      'No. Telp / WA Orang Tua': s.parentPhone,
      'Kontak Darurat': s.emergencyContact || '-',
      'Status': s.active ? 'Aktif' : 'Tidak Aktif'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_${settings.schoolName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Import from Excel or CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const newStudents = data.map((row) => ({
          nis: String(row.NIS || row.nis || Math.floor(Math.random() * 900000 + 100000)),
          fullName: String(row['Nama Lengkap'] || row.nama || row.fullName || 'Siswa Baru'),
          gender: (row['L/P'] || row.gender || 'L') === 'P' ? ('P' as const) : ('L' as const),
          className: String(row.Kelas || row.kelas || row.className || '7A'),
          academicYear: String(row['Tahun Ajaran'] || settings.academicYear || '2026/2027'),
          parentName: String(row['Nama Orang Tua'] || row.parentName || 'Orang Tua'),
          parentPhone: String(row['No. Telp / WA'] || row.parentPhone || '08123456789'),
          emergencyContact: row['Kontak Darurat'] || '',
          active: true
        }));

        const importedCount = await importStudents(newStudents);
        alert(`Berhasil mengimpor ${importedCount} data siswa baru.`);
      } catch (err) {
        console.error('Import error:', err);
        alert('Gagal membaca file Excel/CSV. Pastikan format kolom sesuai.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Manajemen Data Siswa & Catatan Kesehatan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar siswa aktif SMP Alam Excellentia Pamekasan beserta nomor kontak wali dan riwayat khusus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Import File Button */}
          {canManageStudents && (
            <label className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Impor Excel/CSV</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Data</span>
          </button>

          {canManageStudents && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Siswa Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NIS, atau wali..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas</option>
            <option value="7A">Kelas 7A</option>
            <option value="7B">Kelas 7B</option>
            <option value="8A">Kelas 8A</option>
            <option value="8B">Kelas 8B</option>
            <option value="9A">Kelas 9A</option>
            <option value="9B">Kelas 9B</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Siswa Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} siswa
        </span>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">NIS</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">L/P</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Orang Tua / Wali</th>
                <th className="p-3">Kontak WA / Darurat</th>
                <th className="p-3">Informasi Medis</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => {
                  const health = healthRecords[st.nis];
                  const hasHealthNote = health && (health.allergies || health.medicalNotes);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">{st.nis}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{st.fullName}</p>
                        <p className="text-[10px] text-slate-400">TA: {st.academicYear}</p>
                      </td>
                      <td className="p-3 font-semibold">{st.gender}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800">
                          {st.className}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{st.parentName}</td>
                      <td className="p-3 font-mono">
                        <p className="font-semibold text-emerald-800">{st.parentPhone}</p>
                        {st.emergencyContact && (
                          <p className="text-[10px] text-slate-500 font-sans">{st.emergencyContact}</p>
                        )}
                      </td>
                      <td className="p-3">
                        {canViewConfidentialHealth ? (
                          <button
                            onClick={() => handleOpenHealth(st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              hasHealthNote
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Heart className="w-3 h-3 text-rose-500" />
                            {hasHealthNote ? 'Ada Catatan Alergi' : 'Catatan Kesehatan'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Terbatas (Hanya Petugas)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {st.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageStudents && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(st)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                title="Edit Data Siswa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(st)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
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
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data siswa yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT STUDENT */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-300">SMP Alam Excellentia Pamekasan</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIS (Nomor Induk Siswa - Unik) *
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 202607001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap siswa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran *</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
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
                    placeholder="Nama orang tua atau wali"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp Orang Tua *
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kontak Darurat Alternatif (Opsional)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Nama paman / kakek / nomor telepon alternatif"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Protected Confidential Health fields */}
              {canViewConfidentialHealth && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-emerald-900 text-xs">
                      Informasi Kesehatan Terbatas Siswa (Akses Petugas Berwenang)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Alergi Terverifikasi (Makanan / Obat)
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Contoh: Alergi seafood / paracetamol / debu..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Golongan Darah
                      </label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="-">- Belum Diketahui -</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kondisi Kesehatan Khusus yang Disampaikan Wali
                    </label>
                    <input
                      type="text"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Contoh: Riwayat asma saat olahraga / sering mimisan saat panas..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Catatan Pertolongan Khusus jika Kambuh
                    </label>
                    <input
                      type="text"
                      value={specialCareNeeds}
                      onChange={(e) => setSpecialCareNeeds(e.target.value)}
                      placeholder="Instruksi SOP khusus saat siswa ditangani..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                  <span>Status Siswa Aktif</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Data
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HEALTH CONFIDENTIAL DETAIL */}
      {isHealthModalOpen && selectedStudentForHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm">Rekam Informasi Kesehatan Terbatas</h3>
                  <p className="text-[11px] text-emerald-200">
                    {selectedStudentForHealth.fullName} (NIS: {selectedStudentForHealth.nis})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHealthOnly} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>Catatan Kerahasiaan:</strong> Informasi kesehatan ini hanya digunakan untuk kepentingan pelayanan medis di UKS dan tidak ditampilkan kepada publik atau siswa lain.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alergi Terverifikasi
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Contoh: Alergi udang, antibiotik penisilin, asma debu..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Golongan Darah</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="-">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kontak Darurat
                  </label>
                  <input
                    type="text"
                    value={selectedStudentForHealth.emergencyContact || selectedStudentForHealth.parentPhone}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kondisi Kesehatan Khusus
                </label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  rows={2}
                  placeholder="Riwayat penyakit atau kondisi penting yang disampaikan wali..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instruksi Kebutuhan Pertolongan Khusus
                </label>
                <textarea
                  value={specialCareNeeds}
                  onChange={(e) => setSpecialCareNeeds(e.target.value)}
                  rows={2}
                  placeholder="Instruksi SOP bila kondisi khusus tersebut kambuh..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHealthModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  Perbarui Informasi Kesehatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
