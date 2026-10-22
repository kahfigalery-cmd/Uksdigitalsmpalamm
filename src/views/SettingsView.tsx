import React, { useState } from 'react';
import { useUks } from '../context/UksContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import {
  Settings,
  Building,
  PhoneCall,
  UserCheck,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  History
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    backupData,
    restoreData,
    resetToSimulationData,
    activityLogs
  } = useUks();
  const {
    availableUsers,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    canManageSettings
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'sekolah' | 'darurat' | 'pengguna' | 'backup' | 'log'>('sekolah');

  // School Form state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [uksName, setUksName] = useState(settings.uksName);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [headmaster, setHeadmaster] = useState(settings.headmaster);
  const [uksCoordinator, setUksCoordinator] = useState(settings.uksCoordinator);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [isSaved, setIsSaved] = useState(false);

  // New user state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('petugas_uks');
  const [newUserPhone, setNewUserPhone] = useState('08');
  const [newUserClass, setNewUserClass] = useState('7A');

  // New emergency contact state
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecAddress, setEcAddress] = useState('');
  const [ecType, setEcType] = useState<'faskes' | 'ambulance' | 'polisi' | 'damkar' | 'lainnya'>('faskes');

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      schoolName,
      uksName,
      address,
      city,
      phone,
      email,
      headmaster,
      uksCoordinator,
      academicYear
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      phone: newUserPhone,
      assignedClass: newUserRole === 'guru' ? newUserClass : undefined,
      active: true
    });
    setNewUserName('');
    setNewUserEmail('');
    alert('Pengguna baru berhasil ditambahkan.');
  };

  const handleAddEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecName || !ecPhone) return;

    const newContact = {
      id: 'ec-' + Date.now(),
      name: ecName,
      institution: ecName,
      phone: ecPhone,
      address: ecAddress || 'Pamekasan',
      type: ecType
    };

    updateSettings({
      emergencyContacts: [...settings.emergencyContacts, newContact]
    });

    setEcName('');
    setEcPhone('');
    setEcAddress('');
  };

  const handleDeleteEmergencyContact = (id: string) => {
    updateSettings({
      emergencyContacts: settings.emergencyContacts.filter((c) => c.id !== id)
    });
  };

  // Download backup JSON
  const handleDownloadBackup = () => {
    const jsonStr = backupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_uks_${settings.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Upload restore JSON
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = restoreData(content);
        if (ok) {
          alert('Database UKS berhasil dipulihkan dari cadangan.');
        } else {
          alert('Format berkas cadangan tidak valid.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-16">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-700" />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Pengaturan Sistem & Konfigurasi Sekolah
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil UKS, kontak darurat Pamekasan, manajemen hak akses pengguna, serta pencadangan database
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('sekolah')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'sekolah'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Profil Sekolah & UKS
        </button>
        <button
          onClick={() => setActiveTab('darurat')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'darurat'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Kontak Darurat Pamekasan
        </button>
        <button
          onClick={() => setActiveTab('pengguna')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'pengguna'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Pengguna & Hak Akses
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Cadangkan & Pulihkan Data
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'log'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Log Riwayat Aktivitas
        </button>
      </div>

      {/* TAB 1: PROFIL SEKOLAH */}
      {activeTab === 'sekolah' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Informasi Identitas UKS & Sekolah</h3>
              <p className="text-[11px] text-slate-500">
                Informasi ini ditampilkan pada halaman muka, judul website, serta kop surat laporan resmi
              </p>
            </div>
            {isSaved && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Tersimpan
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSchool} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Unit UKS *</label>
                <input
                  type="text"
                  value={uksName}
                  onChange={(e) => setUksName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telepon / WhatsApp UKS *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email UKS / Sekolah *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran Aktif *</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah *</label>
                <input
                  type="text"
                  value={headmaster}
                  onChange={(e) => setHeadmaster(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Koordinator / Petugas UKS *
                </label>
                <input
                  type="text"
                  value={uksCoordinator}
                  onChange={(e) => setUksCoordinator(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                SIMPAN PERUBAHAN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: KONTAK DARURAT */}
      {activeTab === 'darurat' && (
        <div className="space-y-4 text-xs">
          {/* Add contact */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Tambah Kontak Darurat Baru (Pamekasan)</h3>
            <form onSubmit={handleAddEmergencyContact} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Instansi / Faskes *</label>
                <input
                  type="text"
                  value={ecName}
                  onChange={(e) => setEcName(e.target.value)}
                  placeholder="Misal: Puskesmas Pademawu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nomor Telepon *</label>
                <input
                  type="text"
                  value={ecPhone}
                  onChange={(e) => setEcPhone(e.target.value)}
                  placeholder="(0324) 321xxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Alamat Singkat</label>
                <input
                  type="text"
                  value={ecAddress}
                  onChange={(e) => setEcAddress(e.target.value)}
                  placeholder="Jl. Raya..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-slate-600 font-semibold mb-1">Kategori</label>
                  <select
                    value={ecType}
                    onChange={(e) => setEcType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="faskes">Fasilitas Medis (RS/Puskesmas)</option>
                    <option value="ambulance">Ambulance (119/PMI)</option>
                    <option value="polisi">Kepolisian</option>
                    <option value="damkar">Pemadam Kebakaran</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </form>
          </div>

          {/* List of contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
              Daftar Kontak Fasilitas Darurat Aktif
            </div>
            <div className="divide-y divide-slate-100">
              {settings.emergencyContacts.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                        {c.type}
                      </span>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                    </div>
                    <p className="text-slate-500 mt-0.5">{c.address}</p>
                    <p className="text-emerald-700 font-mono font-bold mt-1">Telp: {c.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteEmergencyContact(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Hapus Kontak"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGGUNA & HAK AKSES */}
      {activeTab === 'pengguna' && (
        <div className="space-y-4 text-xs">
          {/* Add user */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-800 text-sm">Tambah Akun Pengguna Sistem UKS</h3>
            </div>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nama petugas / guru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Dinas / Akun *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="nama@smpalamexcellentia.sch.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hak Akses / Peran *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="petugas_uks">Petugas UKS (Penuh)</option>
                  <option value="admin">Administrator</option>
                  <option value="guru">Guru / Wali Kelas</option>
                  <option value="kepala_sekolah">Kepala Sekolah (Agregat)</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-slate-600 font-semibold mb-1">Nomor Kontak</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>

          {/* User List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
              Daftar Pengguna Terdaftar & Peran Kewenangan
            </div>
            <div className="divide-y divide-slate-100">
              {availableUsers.map((u) => (
                <div key={u.uid} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{u.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {u.role.replace('_', ' ')}
                      </span>
                      {u.assignedClass && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          Kelas {u.assignedClass}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{u.email}</p>
                    <p className="text-slate-400 font-mono text-[10px] mt-0.5">Telp: {u.phone || '-'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateUser(u.uid, { active: !u.active })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        u.active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {u.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    {u.uid !== currentUser.uid && (
                      <button
                        onClick={() => deleteUser(u.uid)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Download className="w-5 h-5" />
                <span>Pencadangan Database Permanen</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Unduh seluruh data kunjungan siswa, rekam observasi, data siswa, inventaris obat, mutasi stok, dan konfigurasi aplikasi dalam satu berkas cadangan JSON yang aman.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                UNDUH FILE CADANGAN (BACKUP JSON)
              </button>
            </div>

            {/* Restore Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Upload className="w-5 h-5" />
                <span>Pemulihan Data (Restore Database)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Pulihkan seluruh data aplikasi UKS dari berkas cadangan JSON resmi yang telah diunduh sebelumnya jika terjadi migrasi perangkat.
              </p>
              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                PILIH BERKAS CADANGAN (.JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset button card */}
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-rose-900 text-xs">Reset ke Data Standar Simulasi Sekolah</h4>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Mengembalikan seluruh data tabel kunjungan, inventaris, dan siswa ke kondisi awal simulasi SMP Alam Excellentia Pamekasan.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengatur ulang data ke simulasi standar sekolah?')) {
                  resetToSimulationData();
                  alert('Data telah direset ke simulasi standar.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Simulasi
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Riwayat Aktivitas & Jejak Audit Sistem (Audit Log)
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {activityLogs.length} aktivitas tercatat
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full font-semibold">
                      {log.entity}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <p className="text-[10px] text-slate-400">
                    Oleh: <strong className="text-slate-700">{log.userName}</strong> ({log.role})
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
