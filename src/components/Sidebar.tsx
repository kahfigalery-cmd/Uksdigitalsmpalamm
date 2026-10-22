import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useUks } from '../context/UksContext.tsx';
import {
  LayoutDashboard,
  ClipboardList,
  ClockAlert,
  Users,
  Package,
  FileSpreadsheet,
  AlertOctagon,
  History,
  Settings,
  Phone,
  Cross,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { currentUser, canManageSettings, canViewReports } = useAuth();
  const { visits, inventory, settings } = useUks();

  // Badges
  const activeVisitsCount = visits.filter(
    (v) =>
      v.status === 'Menunggu pemeriksaan' ||
      v.status === 'Sedang ditangani' ||
      v.status === 'Istirahat atau observasi'
  ).length;

  const pendingFollowUpCount = visits.filter(
    (v) => v.needsFollowUp && v.followUpStatus !== 'Selesai'
  ).length;

  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    show?: boolean;
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      show: true
    },
    {
      id: 'visits',
      label: 'Data Kunjungan UKS',
      icon: ClipboardList,
      badge: activeVisitsCount,
      badgeColor: 'bg-emerald-600 text-white',
      show: true
    },
    {
      id: 'followup',
      label: 'Tindak Lanjut Siswa',
      icon: ClockAlert,
      badge: pendingFollowUpCount,
      badgeColor: 'bg-amber-500 text-white',
      show: true
    },
    {
      id: 'students',
      label: 'Data Siswa & Kelas',
      icon: Users,
      show: true
    },
    {
      id: 'inventory',
      label: 'Stok Obat & P3K',
      icon: Package,
      badge: lowStockCount,
      badgeColor: 'bg-rose-500 text-white',
      show: true
    },
    {
      id: 'reports',
      label: 'Laporan UKS',
      icon: FileSpreadsheet,
      show: canViewReports
    },
    {
      id: 'emergency',
      label: 'Prosedur Darurat & Rujukan',
      icon: AlertOctagon,
      show: true
    },
    {
      id: 'logs',
      label: 'Riwayat Aktivitas (Audit)',
      icon: History,
      show: currentUser.role === 'admin' || currentUser.role === 'petugas_uks'
    },
    {
      id: 'settings',
      label: 'Pengaturan Sekolah',
      icon: Settings,
      show: canManageSettings || currentUser.role === 'admin'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Cross className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">PANEL UKS</p>
                <p className="text-[10px] text-emerald-400 font-medium">SMP Alam Excellentia</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>
            {menuItems
              .filter((item) => item.show !== false)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-emerald-800' : item.badgeColor || 'bg-slate-700 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Bottom Card: Kontak Petugas & Darurat */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Kontak Petugas UKS</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              {settings.uksCoordinator}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Telp/WA: {settings.phone.split('/')[0]}
            </p>
            <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                SOP Medis Sekolah
              </span>
              <span className="text-emerald-400">Pamekasan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
