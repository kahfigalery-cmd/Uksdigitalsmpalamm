import { Student, StudentHealthInfo, UksVisit, InventoryItem, SchoolSettings, UserAccount } from '../types/index.ts';

export const initialSchoolSettings: SchoolSettings = {
  schoolName: 'SMP Alam Excellentia Pamekasan',
  uksName: 'Unit Kesehatan Sekolah (UKS) Terpadu Excellentia',
  address: 'Jl. Raya Samatan, Samatan, Kec. Proppo, Kabupaten Pamekasan, Jawa Timur 69363',
  city: 'Pamekasan',
  phone: '(0324) 328890 / 0812-3456-7890',
  email: 'uks@smpalamexcellentia.sch.id',
  headmaster: 'Ahmad Fauzi, M.Pd.',
  uksCoordinator: 'Siti Nurhalizah, S.Kep., Ners',
  academicYear: '2026/2027',
  emergencyContacts: [
    {
      id: 'ec-1',
      name: 'IGD RSUD dr. H. Slamet Martodirdjo (RS Smart)',
      institution: 'RSUD dr. H. Slamet Martodirdjo Pamekasan',
      phone: '(0324) 326242',
      address: 'Jl. Raya Panglegur No.4, Pamekasan',
      type: 'faskes'
    },
    {
      id: 'ec-2',
      name: 'Puskesmas Teja Pamekasan',
      institution: 'Puskesmas Teja',
      phone: '(0324) 321550',
      address: 'Jl. Teja No. 12, Pamekasan',
      type: 'faskes'
    },
    {
      id: 'ec-3',
      name: 'PSC 119 Pamekasan (Ambulance Darurat)',
      institution: 'Dinas Kesehatan Kabupaten Pamekasan',
      phone: '119 / 0811-3333-119',
      address: 'Pamekasan',
      type: 'ambulance'
    },
    {
      id: 'ec-4',
      name: 'PMI Cabang Pamekasan',
      institution: 'Palang Merah Indonesia Pamekasan',
      phone: '(0324) 322431',
      address: 'Jl. Jokotole No. 43, Pamekasan',
      type: 'ambulance'
    },
    {
      id: 'ec-5',
      name: 'Polsek Pamekasan Kota',
      institution: 'Kepolisian Sektor Pamekasan',
      phone: '(0324) 321110',
      address: 'Jl. Stadion No. 1, Pamekasan',
      type: 'polisi'
    },
    {
      id: 'ec-6',
      name: 'Pemadam Kebakaran & Penyelamatan Pamekasan',
      institution: 'Satpol PP & Damkar Pamekasan',
      phone: '(0324) 322113',
      address: 'Jl. Pamong Praja No. 1, Pamekasan',
      type: 'damkar'
    }
  ],
  complaintCategories: [
    'Pusing atau sakit kepala',
    'Demam atau badan terasa panas',
    'Mual atau muntah',
    'Sakit perut / Maag / Diare',
    'Batuk atau pilek',
    'Luka ringan / Lecet',
    'Mimisan',
    'Terjatuh atau terbentur',
    'Kelelahan / Dehidrasi',
    'Tidak enak badan',
    'Keluhan lain'
  ],
  actionCategories: [
    'Istirahat dan observasi di UKS',
    'Pertolongan pertama sesuai SOP',
    'Pembersihan & perawatan luka ringan',
    'Kompres hangat / dingin',
    'Pemberian obat bebas sesuai SOP & izin',
    'Menghubungi orang tua / wali',
    'Kembali ke kelas setelah membaik',
    'Dipulangkan bersama orang tua / wali',
    'Dirujuk ke fasilitas kesehatan',
    'Penanganan darurat'
  ]
};

export const initialUsers: UserAccount[] = [
  {
    uid: 'user-admin',
    name: 'Administrator UKS',
    email: 'admin.uks@smpalamexcellentia.sch.id',
    role: 'admin',
    phone: '081234567891',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    uid: 'user-petugas',
    name: 'Siti Nurhalizah, S.Kep., Ners',
    email: 'siti.nurhalizah@smpalamexcellentia.sch.id',
    role: 'petugas_uks',
    phone: '081345678912',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    uid: 'user-guru',
    name: 'Budi Santoso, S.Pd. (Wali Kelas 7A)',
    email: 'budi.santoso@smpalamexcellentia.sch.id',
    role: 'guru',
    assignedClass: '7A',
    phone: '081456789123',
    active: true,
    createdAt: '2026-07-01'
  },
  {
    uid: 'user-kepsek',
    name: 'Ahmad Fauzi, M.Pd.',
    email: 'ahmad.fauzi@smpalamexcellentia.sch.id',
    role: 'kepala_sekolah',
    phone: '081567891234',
    active: true,
    createdAt: '2026-07-01'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'std-001',
    nis: '202607001',
    fullName: 'Muhammad Rizky Pratama',
    gender: 'L',
    className: '7A',
    academicYear: '2026/2027',
    parentName: 'H. Bambang Sugiarto',
    parentPhone: '081234112233',
    active: true,
    emergencyContact: '081234998877 (Paman)'
  },
  {
    id: 'std-002',
    nis: '202607002',
    fullName: 'Aisyah Putri Azzahra',
    gender: 'P',
    className: '7A',
    academicYear: '2026/2027',
    parentName: 'Hj. Siti Aminah',
    parentPhone: '081345223344',
    active: true
  },
  {
    id: 'std-003',
    nis: '202607003',
    fullName: 'Fathir Ahmad Dani',
    gender: 'L',
    className: '7B',
    academicYear: '2026/2027',
    parentName: 'Drs. Subhan',
    parentPhone: '081456334455',
    active: true
  },
  {
    id: 'std-004',
    nis: '202607004',
    fullName: 'Nayla Zahra Salsabila',
    gender: 'P',
    className: '7B',
    academicYear: '2026/2027',
    parentName: 'Rahmat Hidayat',
    parentPhone: '081567445566',
    active: true
  },
  {
    id: 'std-005',
    nis: '202607005',
    fullName: 'Dimas Arya Yudhistira',
    gender: 'L',
    className: '8A',
    academicYear: '2026/2027',
    parentName: 'Ir. Agus Wijaya',
    parentPhone: '081678556677',
    active: true
  },
  {
    id: 'std-006',
    nis: '202607006',
    fullName: 'Zaskia Nur Fadhilah',
    gender: 'P',
    className: '8A',
    academicYear: '2026/2027',
    parentName: 'Nurul Huda',
    parentPhone: '081789667788',
    active: true
  },
  {
    id: 'std-007',
    nis: '202607007',
    fullName: 'Farhan Maulana Malik',
    gender: 'L',
    className: '8B',
    academicYear: '2026/2027',
    parentName: 'M. Mansur',
    parentPhone: '081890778899',
    active: true
  },
  {
    id: 'std-008',
    nis: '202607008',
    fullName: 'Syifa Syahirah Ramadhani',
    gender: 'P',
    className: '8B',
    academicYear: '2026/2027',
    parentName: 'Dr. Hendra Gunawan',
    parentPhone: '081901889900',
    active: true
  },
  {
    id: 'std-009',
    nis: '202607009',
    fullName: 'Bagas Aditya Putra',
    gender: 'L',
    className: '9A',
    academicYear: '2026/2027',
    parentName: 'Suryanto',
    parentPhone: '082123990011',
    active: true
  },
  {
    id: 'std-010',
    nis: '202607010',
    fullName: 'Khadijah Maryam',
    gender: 'P',
    className: '9A',
    academicYear: '2026/2027',
    parentName: 'Ust. Zainal Abidin',
    parentPhone: '082234001122',
    active: true
  },
  {
    id: 'std-011',
    nis: '202607011',
    fullName: 'Revalina Cahya Ramadhani',
    gender: 'P',
    className: '9B',
    academicYear: '2026/2027',
    parentName: 'Gunawan Prasetyo',
    parentPhone: '082345112233',
    active: true
  },
  {
    id: 'std-012',
    nis: '202607012',
    fullName: 'Alif Zaidan Ar-Rasyid',
    gender: 'L',
    className: '9B',
    academicYear: '2026/2027',
    parentName: 'Ahmad Muzakki',
    parentPhone: '082456223344',
    active: true
  }
];

export const initialHealthInfo: Record<string, StudentHealthInfo> = {
  '202607001': {
    studentNis: '202607001',
    allergies: 'Alergi dingin & debu (sering bersin), tidak ada alergi obat',
    medicalNotes: 'Pernah ada riwayat mimisan jika terpapar panas terik terlalu lama',
    specialCareNeeds: 'Jika mimisan, posisikan duduk tegak condong ke depan dan kompres dingin pangkal hidung',
    bloodType: 'O',
    lastUpdated: '2026-08-10',
    updatedBy: 'Siti Nurhalizah, S.Kep., Ners'
  },
  '202607004': {
    studentNis: '202607004',
    allergies: 'Alergi udang / kepiting (bintik merah gatal)',
    medicalNotes: 'Ada riwayat maag ringan jika terlambat sarapan pagi',
    specialCareNeeds: 'Berikan air hangat dan istirahat jika perut kembung atau nyeri ulu hati',
    bloodType: 'B',
    lastUpdated: '2026-08-15',
    updatedBy: 'Siti Nurhalizah, S.Kep., Ners'
  },
  '202607008': {
    studentNis: '202607008',
    allergies: 'Tidak ada alergi yang diketahui',
    medicalNotes: 'Membawa inhaler pribadi jika asma kambuh setelah olahraga berat',
    specialCareNeeds: 'Dampingi saat istirahat dan longgarkan kerah pakaian jika napas berat',
    bloodType: 'A',
    lastUpdated: '2026-09-02',
    updatedBy: 'Siti Nurhalizah, S.Kep., Ners'
  }
};

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-001',
    itemCode: 'OBT-001',
    name: 'Paracetamol Tablet 500 mg',
    category: 'Obat Bebas & Terbatas',
    unit: 'strip (10 tab)',
    stock: 18,
    minStock: 5,
    expiryDate: '2027-11-30',
    batchNumber: 'PCT26K04',
    supplier: 'Kimia Farma Pamekasan',
    storageLocation: 'Lemari Obat UKS - Rak A1',
    notes: 'Pereda nyeri dan penurun demam ringan. Sesuai SOP UKS 1 tablet setelah makan.',
    updatedAt: '2026-10-15'
  },
  {
    id: 'inv-002',
    itemCode: 'OBT-002',
    name: 'Antasida Doen Kunyah',
    category: 'Obat Bebas & Terbatas',
    unit: 'strip (10 tab)',
    stock: 12,
    minStock: 5,
    expiryDate: '2027-09-15',
    batchNumber: 'ATD2608',
    supplier: 'Kimia Farma Pamekasan',
    storageLocation: 'Lemari Obat UKS - Rak A2',
    notes: 'Untuk kembung dan perih lambung. Dikunyah 15-30 menit sebelum makan.',
    updatedAt: '2026-10-12'
  },
  {
    id: 'inv-003',
    itemCode: 'OBT-003',
    name: 'Oralit 200 ml Sachet',
    category: 'Obat Bebas & Terbatas',
    unit: 'sachet',
    stock: 4,
    minStock: 10, // Stock low alert!
    expiryDate: '2027-06-20',
    batchNumber: 'ORL2603',
    supplier: 'Dinas Kesehatan / Puskesmas',
    storageLocation: 'Lemari Obat UKS - Rak A3',
    notes: 'Pengganti cairan dan elektrolit saat dehidrasi / diare.',
    updatedAt: '2026-10-20'
  },
  {
    id: 'inv-004',
    itemCode: 'OBT-004',
    name: 'Minyak Kayu Putih 60 ml',
    category: 'Obat Bebas & Terbatas',
    unit: 'botol',
    stock: 8,
    minStock: 3,
    expiryDate: '2028-04-10',
    batchNumber: 'MKP2601',
    supplier: 'Apotek K-24 Pamekasan',
    storageLocation: 'Meja Periksa & Rak B1',
    notes: 'Menghangatkan tubuh, meredakan mual dan pusing.',
    updatedAt: '2026-10-10'
  },
  {
    id: 'inv-005',
    itemCode: 'P3K-001',
    name: 'Povidone Iodine 10% (Betadine) 60 ml',
    category: 'Perlengkapan P3K',
    unit: 'botol',
    stock: 6,
    minStock: 2,
    expiryDate: '2027-12-31',
    batchNumber: 'PVD26J',
    supplier: 'Kimia Farma Pamekasan',
    storageLocation: 'Troli Tindakan P3K',
    notes: 'Antiseptik untuk luka lecet dan sayat luar.',
    updatedAt: '2026-10-14'
  },
  {
    id: 'inv-006',
    itemCode: 'P3K-002',
    name: 'Kasa Steril Hidrofil 16x16 cm',
    category: 'Perlengkapan P3K',
    unit: 'kotak (10 lbr)',
    stock: 3,
    minStock: 6, // Stock low alert!
    expiryDate: '2028-01-01',
    batchNumber: 'KSA25M',
    supplier: 'Apotek Mandiri Pamekasan',
    storageLocation: 'Troli Tindakan P3K',
    notes: 'Penutup luka steril.',
    updatedAt: '2026-10-18'
  },
  {
    id: 'inv-007',
    itemCode: 'P3K-003',
    name: 'Plester Cepat Elastis (Hansaplast)',
    category: 'Perlengkapan P3K',
    unit: 'kotak (100 pcs)',
    stock: 2,
    minStock: 1,
    expiryDate: '2027-08-30',
    batchNumber: 'PLS26B',
    supplier: 'Kimia Farma Pamekasan',
    storageLocation: 'Troli Tindakan P3K',
    notes: 'Plester luka kecil.',
    updatedAt: '2026-10-05'
  },
  {
    id: 'inv-008',
    itemCode: 'P3K-004',
    name: 'Rivanol Kompres 100 ml',
    category: 'Perlengkapan P3K',
    unit: 'botol',
    stock: 5,
    minStock: 2,
    expiryDate: '2026-11-20', // Approaching expiry alert! (< 60 days)
    batchNumber: 'RVN24H',
    supplier: 'Apotek Berkah Pamekasan',
    storageLocation: 'Troli Tindakan P3K',
    notes: 'Cairan antiseptik pembersih luka kotor / kompres bisul.',
    updatedAt: '2026-10-01'
  },
  {
    id: 'inv-009',
    itemCode: 'P3K-005',
    name: 'Perban Elastis (Elastic Bandage) 3 inch',
    category: 'Perlengkapan P3K',
    unit: 'roll',
    stock: 7,
    minStock: 3,
    expiryDate: '2029-12-31',
    batchNumber: 'ELB25',
    supplier: 'Kimia Farma Pamekasan',
    storageLocation: 'Kotak Khusus Cedera Fisik',
    notes: 'Fiksasi cedera terkilir / sprain saat aktivitas fisik.',
    updatedAt: '2026-10-08'
  },
  {
    id: 'inv-010',
    itemCode: 'ALKES-001',
    name: 'Termometer Digital Non-Kontak / Dahi',
    category: 'Alat Kesehatan',
    unit: 'unit',
    stock: 2,
    minStock: 1,
    supplier: 'Pengadaan Sarpras Sekolah',
    storageLocation: 'Meja Pemeriksaan UKS',
    notes: 'Kalibrasi rutin per semester.',
    updatedAt: '2026-10-01'
  },
  {
    id: 'inv-011',
    itemCode: 'ALKES-002',
    name: 'Tensimeter Digital Lengan Omron',
    category: 'Alat Kesehatan',
    unit: 'unit',
    stock: 1,
    minStock: 1,
    supplier: 'Pengadaan Sarpras Sekolah',
    storageLocation: 'Meja Pemeriksaan UKS',
    notes: 'Pemeriksaan tekanan darah dan denyut nadi oleh petugas berwenang.',
    updatedAt: '2026-10-01'
  },
  {
    id: 'inv-012',
    itemCode: 'ALKES-003',
    name: 'Oxycan / Oksigen Portable 500 cc',
    category: 'Alat Kesehatan',
    unit: 'kaleng',
    stock: 4,
    minStock: 2,
    expiryDate: '2027-10-15',
    batchNumber: 'OXY25',
    supplier: 'Apotek K-24 Pamekasan',
    storageLocation: 'Dekat Ranjang Observasi 1',
    notes: 'Untuk pertolongan pertama sesak napas / pingsan sebelum rujukan.',
    updatedAt: '2026-10-05'
  }
];

export const initialVisits: UksVisit[] = [
  {
    id: 'vis-001',
    visitNumber: 'UKS-202610-001',
    studentNis: '202607001',
    studentName: 'Muhammad Rizky Pratama',
    className: '7A',
    visitDate: '2026-10-22',
    entryTime: '08:15',
    accompaniedBy: 'Ahmad Fauzi (Guru PJOK)',
    incidentLocation: 'Lapangan Olahraga SMP Alam',
    complaintCategory: 'Mimisan',
    complaintDetail: 'Mengalami mimisan ringan setelah kegiatan senam pagi terpapar panas matahari',
    status: 'Istirahat atau observasi',
    initialAction: 'Pertolongan pertama sesuai SOP',
    actionDetail: 'Diposisikan duduk tegak condong ke depan, ditekan cuping hidung selama 10 menit, dikompres dingin pangkal hidung.',
    handledBy: 'Siti Nurhalizah, S.Kep., Ners',
    needsFollowUp: true,
    followUpNotes: 'Pantau apakah darah sudah berhenti total dan istirahat 30 menit.',
    followUpStatus: 'Dalam Pemantauan',
    medicinesGiven: 'Kompres Es & Kasa Steril roll hidung',
    createdAt: '2026-10-22T08:15:00',
    updatedAt: '2026-10-22T08:30:00'
  },
  {
    id: 'vis-002',
    visitNumber: 'UKS-202610-002',
    studentNis: '202607004',
    studentName: 'Nayla Zahra Salsabila',
    className: '7B',
    visitDate: '2026-10-22',
    entryTime: '09:05',
    accompaniedBy: 'Teman sekelas (Aisyah)',
    incidentLocation: 'Ruang Kelas 7B',
    complaintCategory: 'Sakit perut / Maag / Diare',
    complaintDetail: 'Perut terasa melilit dan kembung karena belum sempat sarapan pagi',
    status: 'Sedang ditangani',
    initialAction: 'Istirahat dan observasi di UKS',
    actionDetail: 'Diberikan air hangat, istirahat berbaring di bed 2, diolesi minyak kayu putih di area perut.',
    handledBy: 'Siti Nurhalizah, S.Kep., Ners',
    needsFollowUp: false,
    followUpStatus: 'Belum Ditindaklanjuti',
    medicinesGiven: 'Minyak Kayu Putih & Air Hangat',
    createdAt: '2026-10-22T09:05:00',
    updatedAt: '2026-10-22T09:15:00'
  },
  {
    id: 'vis-003',
    visitNumber: 'UKS-202610-003',
    studentNis: '202607006',
    studentName: 'Zaskia Nur Fadhilah',
    className: '8A',
    visitDate: '2026-10-22',
    entryTime: '07:45',
    exitTime: '08:35',
    accompaniedBy: 'Datang sendiri',
    incidentLocation: 'Ruang Kelas 8A',
    complaintCategory: 'Pusing atau sakit kepala',
    complaintDetail: 'Kepala pusing dan mata lelah, kurang tidur semalam',
    status: 'Kembali ke kelas',
    initialAction: 'Istirahat dan observasi di UKS',
    actionDetail: 'Istirahat di ruang hening UKS selama 45 menit, minum air putih cukup, suhu normal 36.6°C. Kondisi membaik segar kembali.',
    handledBy: 'Siti Nurhalizah, S.Kep., Ners',
    needsFollowUp: false,
    followUpStatus: 'Selesai',
    medicinesGiven: 'Minyak Kayu Putih oles dahi',
    createdAt: '2026-10-22T07:45:00',
    updatedAt: '2026-10-22T08:35:00'
  },
  {
    id: 'vis-004',
    visitNumber: 'UKS-202610-004',
    studentNis: '202607005',
    studentName: 'Dimas Arya Yudhistira',
    className: '8A',
    visitDate: '2026-10-21',
    entryTime: '10:20',
    exitTime: '11:15',
    accompaniedBy: 'Guru Piket',
    incidentLocation: 'Halaman Kebun Sekolah',
    complaintCategory: 'Luka ringan / Lecet',
    complaintDetail: 'Lutut kanan lecet tergores ranting saat kegiatan berkebun alam',
    status: 'Kembali ke kelas',
    initialAction: 'Pembersihan & perawatan luka ringan',
    actionDetail: 'Luka dicuci air bersih mengalir, dibersihkan dengan rivanol, dioles povidone iodine, ditutup plester steril.',
    handledBy: 'Siti Nurhalizah, S.Kep., Ners',
    needsFollowUp: false,
    followUpStatus: 'Selesai',
    medicinesGiven: 'Povidone Iodine & Hansaplast',
    createdAt: '2026-10-21T10:20:00',
    updatedAt: '2026-10-21T11:15:00'
  },
  {
    id: 'vis-005',
    visitNumber: 'UKS-202610-005',
    studentNis: '202607008',
    studentName: 'Syifa Syahirah Ramadhani',
    className: '8B',
    visitDate: '2026-10-20',
    entryTime: '11:30',
    exitTime: '12:40',
    accompaniedBy: 'Wali Kelas 8B',
    incidentLocation: 'Ruang Kelas 8B',
    complaintCategory: 'Demam atau badan terasa panas',
    complaintDetail: 'Suhu tubuh 38.6°C, menggigil ringan dan lemas',
    status: 'Dipulangkan',
    initialAction: 'Menghubungi orang tua / wali',
    actionDetail: 'Kompres hangat dahi dan ketiak, diberikan minum air hangat. Orang tua dihubungi untuk penjemputan ke rumah.',
    handledBy: 'Siti Nurhalizah, S.Kep., Ners',
    dischargedTo: 'Hj. Mardiyah (Ibu Kandung)',
    dischargeTime: '12:40',
    needsFollowUp: true,
    followUpNotes: 'Orang tua konfirmasi siswa sudah dibawa ke dokter keluarga, suhu mulai turun.',
    followUpStatus: 'Selesai',
    medicinesGiven: 'Paracetamol 500mg 1 tab atas izin ortu',
    createdAt: '2026-10-20T11:30:00',
    updatedAt: '2026-10-20T12:40:00'
  }
];
