export type UserRole =
  | 'SUPER_ADMIN'
  | 'CHAIRMAN'
  | 'SECRETARY'
  | 'TREASURER'
  | 'RESIDENT_ADMIN'
  | 'SECURITY'
  | 'MAINTENANCE'
  | 'HOUSE_OWNER'
  | 'HOUSEHOLD_HEAD'
  | 'RESIDENT'
  | 'AUDITOR'
  | 'VIEWER';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  propertyCode?: string;
  propertyId?: string;
}

export interface DemoAccountInfo {
  id: string;
  username: string;
  name: string;
  roleTitle: string;
  role: UserRole;
  passwordHint: string;
  defaultPassword: string;
  targetPortal: 'resident' | 'admin';
  targetUrl: string;
  avatarUrl: string;
  propertyCode?: string;
  badge: string;
  description: string;
}

export const PORTAL_ACCOUNTS: Record<string, DemoAccountInfo> = {
  ketua: {
    id: 'user-ketua',
    username: 'ketua',
    name: 'Budi Santoso',
    roleTitle: 'Ketua Komplek',
    role: 'CHAIRMAN',
    passwordHint: 'admin123',
    defaultPassword: 'admin123',
    targetPortal: 'admin',
    targetUrl: '/admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-17',
    badge: 'Akses Penuh',
    description: 'Akses ke seluruh modul: dashboard, persetujuan pengeluaran, aduan, dan tata kelola warga.'
  },
  bendahara: {
    id: 'user-bendahara',
    username: 'bendahara',
    name: 'Hendra Wijaya',
    roleTitle: 'Bendahara Komplek',
    role: 'TREASURER',
    passwordHint: 'bendahara123',
    defaultPassword: 'bendahara123',
    targetPortal: 'admin',
    targetUrl: '/admin/payments',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'B-01',
    badge: 'Keuangan & Kas',
    description: 'Akses khusus verifikasi bukti transfer, pencatatan pengeluaran, arus kas, dan anggaran.'
  },
  sekretaris: {
    id: 'user-sekretaris',
    username: 'sekretaris',
    name: 'Siti Rahmawati',
    roleTitle: 'Sekretaris Komplek',
    role: 'SECRETARY',
    passwordHint: 'sekretaris123',
    defaultPassword: 'sekretaris123',
    targetPortal: 'admin',
    targetUrl: '/admin/announcements',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-05',
    badge: 'Administrasi Warga',
    description: 'Akses administrasi data warga, surat edaran, e-voting musyawarah, dan broadcast pengumuman.'
  },
  warga_a17: {
    id: 'user-warga-a17',
    username: 'warga_a17',
    name: 'Budi Santoso (Rumah A-17)',
    roleTitle: 'Warga / Kepala Keluarga',
    role: 'HOUSEHOLD_HEAD',
    passwordHint: 'warga123',
    defaultPassword: 'warga123',
    targetPortal: 'resident',
    targetUrl: '/',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-17',
    badge: 'Status: Lunas',
    description: 'Portal mandiri warga Rumah A-17: pantau iuran, kartu keluarga, dan kendaraan terdaftar.'
  },
  warga_b07: {
    id: 'user-warga-b07',
    username: 'warga_b07',
    name: 'Agus Priyono (Rumah B-07)',
    roleTitle: 'Warga / Penghuni',
    role: 'RESIDENT',
    passwordHint: 'warga123',
    defaultPassword: 'warga123',
    targetPortal: 'resident',
    targetUrl: '/',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'B-07',
    badge: 'Status: Belum Bayar',
    description: 'Portal mandiri warga Rumah B-07 untuk mencoba konfirmasi pembayaran dan upload bukti transfer.'
  },
  satpam: {
    id: 'user-satpam',
    username: 'satpam',
    name: 'Joko Santoso (Komandan Satpam)',
    roleTitle: 'Petugas Keamanan Pos',
    role: 'SECURITY',
    passwordHint: 'satpam123',
    defaultPassword: 'satpam123',
    targetPortal: 'admin',
    targetUrl: '/admin/security-gate',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Pos Gerbang & Patroli',
    description: 'Akses operasional pos keamanan, kontrol barrier gate, buku tamu, plat nomor, dan patroli QR.'
  },
  teknisi: {
    id: 'user-teknisi',
    username: 'teknisi',
    name: 'Sugeng Riyadi (Koordinator Kebersihan & Fasum)',
    roleTitle: 'Petugas Kebersihan & Teknisi',
    role: 'MAINTENANCE',
    passwordHint: 'teknisi123',
    defaultPassword: 'teknisi123',
    targetPortal: 'admin',
    targetUrl: '/admin/cleaning-staff',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    badge: 'Armada & Fasilitas',
    description: 'Akses jadwal armada Viar Tossa, TPS3R, pemeliharaan pompa air, dan perawatan fasum.'
  }
};

export const DEMO_USERS: Record<string, UserSession> = {
  ketua: {
    id: 'user-ketua',
    username: 'ketua',
    fullName: 'Budi Santoso',
    email: 'ketua@wargahub.id',
    role: 'CHAIRMAN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-17',
    propertyId: 'prop-a-17'
  },
  bendahara: {
    id: 'user-bendahara',
    username: 'bendahara',
    fullName: 'Hendra Wijaya',
    email: 'bendahara@wargahub.id',
    role: 'TREASURER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'B-01',
    propertyId: 'prop-b-01'
  },
  sekretaris: {
    id: 'user-sekretaris',
    username: 'sekretaris',
    fullName: 'Siti Rahmawati',
    email: 'sekretaris@wargahub.id',
    role: 'SECRETARY',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-05',
    propertyId: 'prop-a-05'
  },
  warga: {
    id: 'user-warga-a17',
    username: 'warga_a17',
    fullName: 'Budi Santoso',
    email: 'budi.santoso@wargahub.id',
    role: 'HOUSEHOLD_HEAD',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'A-17',
    propertyId: 'prop-a-17'
  },
  warga_unpaid: {
    id: 'user-warga-b07',
    username: 'warga_b07',
    fullName: 'Agus Priyono',
    email: 'agus.b07@wargahub.id',
    role: 'RESIDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    propertyCode: 'B-07',
    propertyId: 'prop-b-07'
  },
  satpam: {
    id: 'user-satpam',
    username: 'satpam',
    fullName: 'Joko Santoso',
    email: 'satpam@wargahub.id',
    role: 'SECURITY',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  teknisi: {
    id: 'user-teknisi',
    username: 'teknisi',
    fullName: 'Sugeng Riyadi',
    email: 'teknisi@wargahub.id',
    role: 'MAINTENANCE',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  }
};
