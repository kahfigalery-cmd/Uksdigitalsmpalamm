export type UserRole = 'admin' | 'petugas_uks' | 'guru' | 'kepala_sekolah';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  assignedClass?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  nis: string;
  fullName: string;
  gender: 'L' | 'P';
  className: string;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  active: boolean;
  emergencyContact?: string;
  createdAt?: string;
}

export interface StudentHealthInfo {
  studentNis: string;
  allergies?: string;
  medicalNotes?: string;
  specialCareNeeds?: string;
  bloodType?: string;
  lastUpdated: string;
  updatedBy: string;
}

export type VisitStatus =
  | 'Menunggu pemeriksaan'
  | 'Sedang ditangani'
  | 'Istirahat atau observasi'
  | 'Kembali ke kelas'
  | 'Dipulangkan'
  | 'Dirujuk'
  | 'Penanganan darurat'
  | 'Selesai';

export type FollowUpStatus = 'Belum Ditindaklanjuti' | 'Dalam Pemantauan' | 'Selesai';

export interface UksVisit {
  id: string;
  visitNumber: string; // e.g. UKS-202610-001
  studentNis: string;
  studentName: string;
  className: string;
  visitDate: string; // YYYY-MM-DD
  entryTime: string; // HH:mm
  exitTime?: string; // HH:mm
  accompaniedBy?: string;
  incidentLocation?: string;
  complaintCategory: string;
  complaintDetail: string;
  status: VisitStatus;
  initialAction?: string;
  actionDetail?: string;
  handledBy: string;
  needsFollowUp: boolean;
  followUpNotes?: string;
  followUpStatus: FollowUpStatus;
  dischargedTo?: string; // Penjemput jika dipulangkan
  dischargeTime?: string;
  medicinesGiven?: string; // Rincian obat bebas/P3K
  createdAt: string;
  updatedAt: string;
}

export interface VisitAssessment {
  id: string;
  visitId: string;
  assessmentTime: string;
  generalCondition?: string;
  consciousness?: string;
  bodyTemperature?: string; // e.g. "37.5"
  pulseRate?: string; // bpm
  objectiveObservation?: string;
  examinerName: string;
}

export interface ParentContact {
  id: string;
  visitId: string;
  studentNis: string;
  studentName: string;
  parentName: string;
  contactNumber: string;
  contactDateTime: string;
  method: 'WhatsApp' | 'Telepon' | 'Tatap Muka';
  summary: string;
  result: string;
  officerName: string;
}

export type ItemCategory =
  | 'Obat Bebas & Terbatas'
  | 'Perlengkapan P3K'
  | 'Alat Kesehatan'
  | 'Bahan Medis Habis Pakai';

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: ItemCategory;
  unit: string;
  stock: number;
  minStock: number;
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  supplier?: string;
  storageLocation?: string;
  notes?: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'MASUK' | 'KELUAR';
  quantity: number;
  date: string; // YYYY-MM-DD HH:mm
  reason: string;
  visitRef?: string;
  officerName: string;
}

export interface Referral {
  id: string;
  visitId: string;
  studentNis: string;
  studentName: string;
  className: string;
  healthFacility: string;
  contactFacility: string;
  referralReason: string;
  accompaniedBy: string;
  referralTime: string;
  handoverNotes?: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  institution: string;
  phone: string;
  address: string;
  type: 'faskes' | 'ambulance' | 'polisi' | 'damkar' | 'lainnya';
}

export interface SchoolSettings {
  schoolName: string;
  uksName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  headmaster: string;
  uksCoordinator: string;
  academicYear: string;
  emergencyContacts: EmergencyContact[];
  complaintCategories: string[];
  actionCategories: string[];
}
