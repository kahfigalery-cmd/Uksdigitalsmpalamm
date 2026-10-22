import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useUks } from '../context/UksContext.tsx';
import { UserRole } from '../types/index.ts';
import {
  HeartPulse,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Shield,
  ChevronDown,
  PlusCircle,
  Menu,
  PhoneCall,
  Activity,
  LogOut,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenNewVisit: () => void;
  onOpenEmergency: () => void;
  onNavigate: (view: string) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewVisit,
  onOpenEmergency,
  onNavigate,
  onToggleSidebar
}) => {
  const { currentUser, switchRole, canManageVisits, logout } = useAuth();
  const { visits, settings } = useUks();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta'
        }) + ' WIB'
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeInUksCount = visits.filter(
    (v) =>
      v.visitDate === todayStr &&
      (v.status === 'Sedang ditangani' ||
        v.status === 'Istirahat atau observasi' ||
        v.status === 'Menunggu pemeriksaan')
  ).length;

  const roleLabels: Record<UserRole, { label: string; color: string; badge: string }> = {
    admin: { label: 'Administrator', color: 'bg-purple-100 text-purple-800 border-purple-200', badge: 'Admin Utama' },
    petugas_uks: { label: 'Petugas UKS', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', badge: 'Tenaga Medis UKS' },
    guru: { label: 'Guru / Wali Kelas', color: 'bg-blue-100 text-blue-800 border-blue-200', badge: 'Wali Kelas' },
    kepala_sekolah: { label: 'Kepala Sekolah', color: 'bg-amber-100 text-amber-800 border-amber-200', badge: 'Pimpinan' }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-emerald-100 shadow-xs">
      {/* Top emergency ribbon if any active emergency */}
      <div className="bg-emerald-800 text-emerald-50 px-4 py-1 text-xs flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">Unit Kesehatan Sekolah Terpadu</span>
          <span className="hidden sm:inline text-emerald-300">•</span>
          <span className="hidden sm:inline text-emerald-200">{settings.schoolName}</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-mono font-medium">{time}</span>
          </div>
          <span className="hidden md:inline text-emerald-300">•</span>
          <div className="hidden md:flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>{date}</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg lg:hidden"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School Emblem Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-sm flex items-center justify-center text-white shrink-0">
              <div className="w-full h-full bg-emerald-700 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-emerald-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight tracking-tight">
                  UKS DIGITAL
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium tracking-wide truncate max-w-[200px] sm:max-w-none">
                SMP ALAM EXCELLENTIA PAMEKASAN
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Action Buttons & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick status pill */}
          <div
            onClick={() => onNavigate('visits')}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Siswa di UKS Saat Ini:</span>
            <span className={`font-bold px-1.5 py-0.2 rounded-full ${activeInUksCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
              {activeInUksCount} Siswa
            </span>
          </div>

          {/* EMERGENCY PROCEDURE BUTTON - RED & BOLD */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all border border-rose-700"
            title="Klik jika terjadi kondisi darurat medis"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span className="hidden xs:inline">PROSEDUR</span> DARURAT
          </button>

          {/* CATAT KUNJUNGAN BUTTON */}
          {canManageVisits && (
            <button
              onClick={onOpenNewVisit}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">CATAT</span> KUNJUNGAN
            </button>
          )}

          {/* ROLE SWITCHER / USER PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors bg-white text-left"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${roleLabels[currentUser.role].color}`}>
                    {roleLabels[currentUser.role].label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isRoleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setIsRoleMenuOpen(false)}
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-800">Sistem Hak Akses Berbasis Peran</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan pemilih peran di bawah ini untuk menguji akses hak pengguna sistem UKS.
                  </p>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">
                  Uji Mode Peran Pengguna:
                </div>

                <div className="space-y-1">
                  {(['admin', 'petugas_uks', 'guru', 'kepala_sekolah'] as UserRole[]).map((r) => {
                    const isSelected = currentUser.role === r;
                    const info = roleLabels[r];
                    return (
                      <button
                        key={r}
                        onClick={() => switchRole(r)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{info.label}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                            Aktif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar / Reset Sesi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
