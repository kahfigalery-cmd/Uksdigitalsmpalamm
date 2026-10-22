/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { UksProvider, useUks } from './context/UksContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EmergencyModal } from './components/EmergencyModal.tsx';
import { NewVisitModal } from './components/NewVisitModal.tsx';
import { VisitDetailModal } from './components/VisitDetailModal.tsx';
import { ParentContactModal } from './components/ParentContactModal.tsx';

// Views
import { DashboardView } from './views/DashboardView.tsx';
import { VisitsView } from './views/VisitsView.tsx';
import { FollowUpView } from './views/FollowUpView.tsx';
import { StudentsView } from './views/StudentsView.tsx';
import { InventoryView } from './views/InventoryView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { UksVisit } from './types/index.ts';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<UksVisit | null>(null);
  const [parentContactVisit, setParentContactVisit] = useState<UksVisit | null>(null);

  const { visits } = useUks();

  const handleSelectVisitById = (visitId: string) => {
    const v = visits.find((item) => item.id === visitId);
    if (v) setSelectedVisit(v);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenNewVisit={() => setIsNewVisitOpen(true)}
            onSelectVisit={handleSelectVisitById}
          />
        );
      case 'visits':
        return (
          <VisitsView
            onOpenNewVisit={() => setIsNewVisitOpen(true)}
            onSelectVisit={(v) => setSelectedVisit(v)}
            onOpenParentContact={(v) => setParentContactVisit(v)}
          />
        );
      case 'followup':
        return (
          <FollowUpView
            onSelectVisit={(v) => setSelectedVisit(v)}
            onOpenParentContact={(v) => setParentContactVisit(v)}
          />
        );
      case 'students':
        return <StudentsView />;
      case 'inventory':
        return <InventoryView />;
      case 'reports':
        return <ReportsView />;
      case 'emergency':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-rose-50 border-2 border-rose-400 rounded-2xl text-center space-y-3">
              <h2 className="text-xl font-bold text-rose-900">PROSEDUR DARURAT KESEHATAN UKS</h2>
              <p className="text-xs text-rose-700 max-w-lg mx-auto">
                Buka panel darurat untuk mengakses daftar panggilan cepat ambulance, IGD RSUD Smart Pamekasan, serta formulir rujukan faskes resmi.
              </p>
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-sm inline-flex items-center gap-2"
              >
                BUKA PROTOKOL & PANGGILAN DARURAT
              </button>
            </div>
            <ReportsView />
          </div>
        );
      case 'logs':
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenNewVisit={() => setIsNewVisitOpen(true)}
            onSelectVisit={handleSelectVisitById}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNewVisit={() => setIsNewVisitOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onNavigate={setCurrentView}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <NewVisitModal
        isOpen={isNewVisitOpen}
        onClose={() => setIsNewVisitOpen(false)}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <VisitDetailModal
        visit={selectedVisit}
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onOpenParentContact={(v) => {
          setSelectedVisit(null);
          setParentContactVisit(v);
        }}
      />

      <ParentContactModal
        visit={parentContactVisit}
        isOpen={!!parentContactVisit}
        onClose={() => setParentContactVisit(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <UksProvider>
        <AppContent />
      </UksProvider>
    </AuthProvider>
  );
}
