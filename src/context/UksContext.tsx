import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UksVisit,
  VisitAssessment,
  Student,
  StudentHealthInfo,
  InventoryItem,
  InventoryTransaction,
  ParentContact,
  Referral,
  ActivityLog,
  SchoolSettings,
  VisitStatus
} from '../types/index.ts';
import {
  initialVisits,
  initialStudents,
  initialHealthInfo,
  initialInventory,
  initialSchoolSettings
} from '../data/initialData.ts';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  collection,
  doc,
  setDoc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';

interface UksContextType {
  visits: UksVisit[];
  assessments: Record<string, VisitAssessment>;
  students: Student[];
  healthRecords: Record<string, StudentHealthInfo>;
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  parentContacts: ParentContact[];
  referrals: Referral[];
  activityLogs: ActivityLog[];
  settings: SchoolSettings;
  isLoading: boolean;
  
  // Actions
  addVisit: (
    visit: Omit<UksVisit, 'id' | 'visitNumber' | 'createdAt' | 'updatedAt'>,
    assessment?: Omit<VisitAssessment, 'id' | 'visitId'>,
    medicinesToDeduct?: { itemId: string; quantity: number }[]
  ) => Promise<UksVisit>;
  updateVisitStatus: (
    visitId: string,
    status: VisitStatus,
    extra?: {
      exitTime?: string;
      dischargedTo?: string;
      dischargeTime?: string;
      actionDetail?: string;
      handledBy?: string;
    }
  ) => Promise<void>;
  updateVisit: (visitId: string, updates: Partial<UksVisit>) => Promise<void>;
  deleteVisit: (visitId: string) => Promise<void>;
  
  // Students
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>, health?: Partial<StudentHealthInfo>) => Promise<void>;
  updateStudent: (studentId: string, updates: Partial<Student>, healthUpdates?: Partial<StudentHealthInfo>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  importStudents: (newStudents: Omit<Student, 'id' | 'createdAt'>[]) => Promise<number>;
  
  // Parent & Referral
  addParentContact: (contact: Omit<ParentContact, 'id'>) => Promise<void>;
  addReferral: (referral: Omit<Referral, 'id'>) => Promise<void>;
  
  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => Promise<void>;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
  mutateStock: (
    itemId: string,
    type: 'MASUK' | 'KELUAR',
    quantity: number,
    reason: string,
    visitRef?: string,
    officerName?: string
  ) => Promise<void>;
  
  // Settings & System
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  backupData: () => string;
  restoreData: (jsonStr: string) => boolean;
  resetToSimulationData: () => void;
  logActivity: (action: string, entity: string, details: string, userName?: string, role?: string) => void;
}

const UksContext = createContext<UksContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'uks_pamekasan_';

export const UksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // State initialization with localStorage fallback
  const [visits, setVisits] = useState<UksVisit[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'visits');
    return s ? JSON.parse(s) : initialVisits;
  });

  const [assessments, setAssessments] = useState<Record<string, VisitAssessment>>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'assessments');
    return s ? JSON.parse(s) : {
      'vis-001': {
        id: 'ass-001',
        visitId: 'vis-001',
        assessmentTime: '08:20',
        generalCondition: 'Tampak cemas dan lemas karena mimisan',
        consciousness: 'Compos Mentis (Sadar penuh)',
        bodyTemperature: '37.1',
        pulseRate: '86',
        objectiveObservation: 'Perdarahan dari lubang hidung kanan, tidak ada tanda deformitas hidung',
        examinerName: 'Siti Nurhalizah, S.Kep., Ners'
      },
      'vis-002': {
        id: 'ass-002',
        visitId: 'vis-002',
        assessmentTime: '09:10',
        generalCondition: 'Memegang perut, tampak meringis',
        consciousness: 'Compos Mentis (Sadar penuh)',
        bodyTemperature: '36.8',
        pulseRate: '80',
        objectiveObservation: 'Nyeri tekan ringan regio epigastrium / ulu hati, bising usus normal',
        examinerName: 'Siti Nurhalizah, S.Kep., Ners'
      }
    };
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'students');
    return s ? JSON.parse(s) : initialStudents;
  });

  const [healthRecords, setHealthRecords] = useState<Record<string, StudentHealthInfo>>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'health');
    return s ? JSON.parse(s) : initialHealthInfo;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'inventory');
    return s ? JSON.parse(s) : initialInventory;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'transactions');
    return s ? JSON.parse(s) : [
      {
        id: 'tx-001',
        itemId: 'inv-001',
        itemName: 'Paracetamol Tablet 500 mg',
        type: 'KELUAR',
        quantity: 1,
        date: '2026-10-20 11:35',
        reason: 'Pemberian obat demam kunjungan UKS',
        visitRef: 'UKS-202610-005',
        officerName: 'Siti Nurhalizah, S.Kep., Ners'
      },
      {
        id: 'tx-002',
        itemId: 'inv-005',
        itemName: 'Povidone Iodine 10% (Betadine) 60 ml',
        type: 'KELUAR',
        quantity: 1,
        date: '2026-10-21 10:25',
        reason: 'Pembersihan luka lecet berkebun',
        visitRef: 'UKS-202610-004',
        officerName: 'Siti Nurhalizah, S.Kep., Ners'
      }
    ];
  });

  const [parentContacts, setParentContacts] = useState<ParentContact[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'parent_contacts');
    return s ? JSON.parse(s) : [
      {
        id: 'pc-001',
        visitId: 'vis-005',
        studentNis: '202607008',
        studentName: 'Syifa Syahirah Ramadhani',
        parentName: 'Hj. Mardiyah',
        contactNumber: '081901889900',
        contactDateTime: '2026-10-20 11:45',
        method: 'WhatsApp',
        summary: 'Mengabarkan kondisi siswa demam 38.6°C dan meminta izin penjemputan pulang',
        result: 'Orang tua menyetujui dan menuju sekolah untuk menjemput pukul 12.30',
        officerName: 'Siti Nurhalizah, S.Kep., Ners'
      }
    ];
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'referrals');
    return s ? JSON.parse(s) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'activity_logs');
    return s ? JSON.parse(s) : [
      {
        id: 'log-001',
        userName: 'Siti Nurhalizah, S.Kep., Ners',
        role: 'Petugas UKS',
        action: 'Pencatatan Kunjungan',
        entity: 'UKS-202610-001',
        details: 'Mencatat kunjungan siswa Muhammad Rizky Pratama keluhan mimisan',
        timestamp: '2026-10-22 08:15'
      },
      {
        id: 'log-002',
        userName: 'Siti Nurhalizah, S.Kep., Ners',
        role: 'Petugas UKS',
        action: 'Pencatatan Kunjungan',
        entity: 'UKS-202610-002',
        details: 'Mencatat kunjungan siswi Nayla Zahra Salsabila keluhan sakit perut',
        timestamp: '2026-10-22 09:05'
      }
    ];
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const s = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'settings');
    return s ? JSON.parse(s) : initialSchoolSettings;
  });

  // Local storage auto-sync
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'visits', JSON.stringify(visits));
  }, [visits]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'assessments', JSON.stringify(assessments));
  }, [assessments]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'health', JSON.stringify(healthRecords));
  }, [healthRecords]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transactions', JSON.stringify(inventoryTransactions));
  }, [inventoryTransactions]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'parent_contacts', JSON.stringify(parentContacts));
  }, [parentContacts]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'referrals', JSON.stringify(referrals));
  }, [referrals]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  // Firestore connection test and sync
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firebase client in offline mode. Local cache active.');
        }
      }
    };
    testConnection();
  }, []);

  // Activity logger helper
  const logActivity = (
    action: string,
    entity: string,
    details: string,
    userName: string = 'Petugas UKS',
    role: string = 'Petugas UKS'
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userName,
      role,
      action,
      entity,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Generate unique visit number: UKS-YYYYMM-XXX
  const generateVisitNumber = (): string => {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
    const todayPrefix = `UKS-${yearMonth}-`;
    const matchingVisits = visits.filter((v) => v.visitNumber && v.visitNumber.startsWith(todayPrefix));
    const nextSeq = matchingVisits.length + 1;
    return `${todayPrefix}${String(nextSeq).padStart(3, '0')}`;
  };

  // Add Visit
  const addVisit = async (
    visitData: Omit<UksVisit, 'id' | 'visitNumber' | 'createdAt' | 'updatedAt'>,
    assessmentData?: Omit<VisitAssessment, 'id' | 'visitId'>,
    medicinesToDeduct?: { itemId: string; quantity: number }[]
  ): Promise<UksVisit> => {
    setIsLoading(true);
    const newId = 'vis-' + Date.now();
    const visitNumber = generateVisitNumber();
    const nowIso = new Date().toISOString();

    const newVisit: UksVisit = {
      ...visitData,
      id: newId,
      visitNumber,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setVisits((prev) => [newVisit, ...prev]);

    // Save assessment if provided
    if (assessmentData) {
      const assessmentId = 'ass-' + Date.now();
      const newAssessment: VisitAssessment = {
        ...assessmentData,
        id: assessmentId,
        visitId: newId
      };
      setAssessments((prev) => ({ ...prev, [newId]: newAssessment }));
    }

    // Deduct medicines if specified
    if (medicinesToDeduct && medicinesToDeduct.length > 0) {
      medicinesToDeduct.forEach((med) => {
        mutateStock(
          med.itemId,
          'KELUAR',
          med.quantity,
          `Pelayanan Kunjungan UKS (${visitNumber})`,
          visitNumber,
          visitData.handledBy
        );
      });
    }

    logActivity(
      'Catat Kunjungan',
      visitNumber,
      `Kunjungan baru siswa ${visitData.studentName} (${visitData.className}) - Keluhan: ${visitData.complaintCategory}`,
      visitData.handledBy
    );

    // Sync to Firestore asynchronously
    try {
      await setDoc(doc(db, 'uks_visits', newId), newVisit);
    } catch (err) {
      console.warn('Firestore sync uks_visits fallback to local:', err);
    }

    setIsLoading(false);
    return newVisit;
  };

  // Update Visit Status
  const updateVisitStatus = async (
    visitId: string,
    status: VisitStatus,
    extra?: {
      exitTime?: string;
      dischargedTo?: string;
      dischargeTime?: string;
      actionDetail?: string;
      handledBy?: string;
    }
  ) => {
    const nowIso = new Date().toISOString();
    let updatedVisit: UksVisit | null = null;

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          const item: UksVisit = {
            ...v,
            status,
            updatedAt: nowIso,
            ...(extra?.exitTime ? { exitTime: extra.exitTime } : {}),
            ...(extra?.dischargedTo ? { dischargedTo: extra.dischargedTo } : {}),
            ...(extra?.dischargeTime ? { dischargeTime: extra.dischargeTime } : {}),
            ...(extra?.actionDetail ? { actionDetail: extra.actionDetail } : {}),
            ...(extra?.handledBy ? { handledBy: extra.handledBy } : {})
          };
          updatedVisit = item;
          return item;
        }
        return v;
      })
    );

    if (updatedVisit) {
      logActivity(
        'Update Status Kunjungan',
        (updatedVisit as UksVisit).visitNumber,
        `Status diperbarui menjadi: ${status}${extra?.dischargedTo ? ` (Dijemput oleh: ${extra.dischargedTo})` : ''}`,
        extra?.handledBy || (updatedVisit as UksVisit).handledBy
      );

      try {
        await setDoc(doc(db, 'uks_visits', visitId), updatedVisit, { merge: true });
      } catch (err) {
        console.warn('Firestore update visit error:', err);
      }
    }
  };

  const updateVisit = async (visitId: string, updates: Partial<UksVisit>) => {
    const nowIso = new Date().toISOString();
    let updated: UksVisit | undefined;
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          updated = { ...v, ...updates, updatedAt: nowIso };
          return updated;
        }
        return v;
      })
    );
    if (updated) {
      try {
        await setDoc(doc(db, 'uks_visits', visitId), updated, { merge: true });
      } catch (err) {
        console.warn('Firestore update visit error:', err);
      }
    }
  };

  const deleteVisit = async (visitId: string) => {
    const target = visits.find((v) => v.id === visitId);
    setVisits((prev) => prev.filter((v) => v.id !== visitId));
    if (target) {
      logActivity('Hapus Kunjungan', target.visitNumber, `Menghapus catatan kunjungan ${target.studentName}`);
    }
  };

  // Student operations
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>, health?: Partial<StudentHealthInfo>) => {
    const newId = 'std-' + Date.now();
    const newStudent: Student = {
      ...studentData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setStudents((prev) => [newStudent, ...prev]);

    if (health) {
      const newHealth: StudentHealthInfo = {
        studentNis: studentData.nis,
        allergies: health.allergies || '',
        medicalNotes: health.medicalNotes || '',
        specialCareNeeds: health.specialCareNeeds || '',
        bloodType: health.bloodType || '-',
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: health.updatedBy || 'Petugas UKS'
      };
      setHealthRecords((prev) => ({ ...prev, [studentData.nis]: newHealth }));
    }

    logActivity('Tambah Siswa', studentData.nis, `Mendaftarkan siswa baru: ${studentData.fullName} (${studentData.className})`);

    try {
      await setDoc(doc(db, 'students', newId), newStudent);
    } catch (err) {
      console.warn('Firestore add student error:', err);
    }
  };

  const updateStudent = async (studentId: string, updates: Partial<Student>, healthUpdates?: Partial<StudentHealthInfo>) => {
    let studentNis = '';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          studentNis = updates.nis || s.nis;
          return { ...s, ...updates };
        }
        return s;
      })
    );

    if (healthUpdates && studentNis) {
      setHealthRecords((prev) => ({
        ...prev,
        [studentNis]: {
          ...prev[studentNis],
          ...healthUpdates,
          studentNis,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }));
    }

    logActivity('Perbarui Data Siswa', studentNis, `Memperbarui data dan rekam kesehatan siswa`);
  };

  const deleteStudent = async (studentId: string) => {
    const s = students.find((item) => item.id === studentId);
    setStudents((prev) => prev.filter((item) => item.id !== studentId));
    if (s) {
      logActivity('Hapus Siswa', s.nis, `Menghapus data siswa ${s.fullName}`);
    }
  };

  const importStudents = async (newStudents: Omit<Student, 'id' | 'createdAt'>[]): Promise<number> => {
    let count = 0;
    const nowIso = new Date().toISOString();
    const toAdd: Student[] = [];

    newStudents.forEach((st) => {
      // Check duplicate NIS
      if (!students.some((existing) => existing.nis === st.nis)) {
        toAdd.push({
          ...st,
          id: 'std-' + Date.now() + '-' + count,
          createdAt: nowIso
        });
        count++;
      }
    });

    if (toAdd.length > 0) {
      setStudents((prev) => [...toAdd, ...prev]);
      logActivity('Impor Siswa', `${count} Siswa`, `Berhasil mengimpor ${count} data siswa dari file Excel/CSV`);
    }
    return count;
  };

  // Parent contacts
  const addParentContact = async (contact: Omit<ParentContact, 'id'>) => {
    const newId = 'pc-' + Date.now();
    const item: ParentContact = { ...contact, id: newId };
    setParentContacts((prev) => [item, ...prev]);
    logActivity('Kontak Orang Tua', contact.studentName, `Komunikasi via ${contact.method} terkait kunjungan: ${contact.summary}`, contact.officerName);
  };

  // Referral
  const addReferral = async (referral: Omit<Referral, 'id'>) => {
    const newId = 'ref-' + Date.now();
    const item: Referral = { ...referral, id: newId };
    setReferrals((prev) => [item, ...prev]);
    logActivity('Rujukan Faskes', referral.studentName, `Rujukan ke ${referral.healthFacility} - Alasan: ${referral.referralReason}`, referral.accompaniedBy);
  };

  // Inventory
  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newId = 'inv-' + Date.now();
    const newItem: InventoryItem = {
      ...itemData,
      id: newId,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setInventory((prev) => [newItem, ...prev]);
    logActivity('Tambah Barang UKS', newItem.itemCode, `Menambahkan item inventaris: ${newItem.name} (${newItem.stock} ${newItem.unit})`);
  };

  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : i))
    );
  };

  const deleteInventoryItem = async (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      logActivity('Hapus Barang UKS', item.itemCode, `Menghapus item obat/P3K: ${item.name}`);
    }
  };

  const mutateStock = async (
    itemId: string,
    type: 'MASUK' | 'KELUAR',
    quantity: number,
    reason: string,
    visitRef?: string,
    officerName: string = 'Petugas UKS'
  ) => {
    let targetItemName = '';
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemName = item.name;
          const newStock = type === 'MASUK' ? item.stock + quantity : Math.max(0, item.stock - quantity);
          return {
            ...item,
            stock: newStock,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      })
    );

    const newTx: InventoryTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      itemId,
      itemName: targetItemName,
      type,
      quantity,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reason,
      visitRef,
      officerName
    };

    setInventoryTransactions((prev) => [newTx, ...prev]);
    logActivity('Mutasi Stok', targetItemName, `${type} ${quantity} (${reason})`, officerName);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Update Konfigurasi', 'Identitas Sekolah', 'Memperbarui profil sekolah dan kontak darurat UKS');
  };

  // Backup & Restore
  const backupData = (): string => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      school: settings.schoolName,
      visits,
      assessments,
      students,
      healthRecords,
      inventory,
      inventoryTransactions,
      parentContacts,
      referrals,
      activityLogs,
      settings
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const restoreData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.visits && data.students && data.inventory) {
        setVisits(data.visits);
        if (data.assessments) setAssessments(data.assessments);
        setStudents(data.students);
        if (data.healthRecords) setHealthRecords(data.healthRecords);
        setInventory(data.inventory);
        if (data.inventoryTransactions) setInventoryTransactions(data.inventoryTransactions);
        if (data.parentContacts) setParentContacts(data.parentContacts);
        if (data.referrals) setReferrals(data.referrals);
        if (data.settings) setSettings(data.settings);
        logActivity('Pemulihan Database', 'Backup Restore', 'Database UKS berhasil dipulihkan dari file cadangan');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to parse backup JSON:', err);
      return false;
    }
  };

  const resetToSimulationData = () => {
    setVisits(initialVisits);
    setStudents(initialStudents);
    setHealthRecords(initialHealthInfo);
    setInventory(initialInventory);
    setSettings(initialSchoolSettings);
    logActivity('Reset Data', 'Simulasi Awal', 'Mengatur ulang data sistem ke data simulasi resmi');
  };

  return (
    <UksContext.Provider
      value={{
        visits,
        assessments,
        students,
        healthRecords,
        inventory,
        inventoryTransactions,
        parentContacts,
        referrals,
        activityLogs,
        settings,
        isLoading,
        addVisit,
        updateVisitStatus,
        updateVisit,
        deleteVisit,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        addParentContact,
        addReferral,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        mutateStock,
        updateSettings,
        backupData,
        restoreData,
        resetToSimulationData,
        logActivity
      }}
    >
      {children}
    </UksContext.Provider>
  );
};

export const useUks = () => {
  const context = useContext(UksContext);
  if (!context) {
    throw new Error('useUks must be used within a UksProvider');
  }
  return context;
};
