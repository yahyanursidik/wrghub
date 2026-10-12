import {
  LayoutDashboard, Home, KeyRound, Receipt, CreditCard, FileMinus, Banknote,
  Wallet, Calendar, BarChart3, ShieldCheck, Truck, Building2, MessageCircle,
  Megaphone, Vote, Bell, FolderOpen, History, Database, Settings,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types/auth';

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  keywords?: string;
  roles?: UserRole[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const finance: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'AUDITOR'];
const financeWrite: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER'];
const residents: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN'];
const governance: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'AUDITOR'];
const leaders: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN'];

// One source for sidebar, breadcrumbs and search. These are UI visibility rules,
// not a substitute for authorization on the server.
export const adminNavigation: NavigationGroup[] = [
  { label: 'Warga', items: [
    { label: 'Rumah & warga', href: '/admin/properties', icon: Home, description: 'Rumah, penghuni, kendaraan dan izin renovasi', keywords: 'kavling kavling penghuni pemilik kendaraan rfid utilitas', roles: residents },
    { label: 'Akun warga', href: '/admin/passwords', icon: KeyRound, description: 'Kelola akun dan kata sandi warga', keywords: 'password pin akses', roles: residents },
  ] },
  { label: 'Keuangan', items: [
    { label: 'Tagihan iuran', href: '/admin/billing', icon: Receipt, description: 'Tagihan bulanan dan status pembayaran', keywords: 'ipl invoice tunggakan', roles: finance },
    { label: 'Pembayaran', href: '/admin/payments', icon: CreditCard, description: 'Catat pembayaran dan verifikasi bukti transfer', keywords: 'bayar kuitansi transfer', roles: financeWrite },
    { label: 'Pengeluaran', href: '/admin/expenses', icon: FileMinus, description: 'Pengeluaran operasional dan bukti belanja', roles: financeWrite },
    { label: 'Buku kas', href: '/admin/ledger', icon: Wallet, description: 'Saldo, mutasi dan rekonsiliasi kas', keywords: 'ledger buku besar bank', roles: finance },
    { label: 'Anggaran', href: '/admin/budget', icon: Calendar, description: 'Rencana dan realisasi anggaran', keywords: 'apb budget cadangan', roles: finance },
    { label: 'Laporan & tren', href: '/admin/analytics', icon: BarChart3, description: 'Analisis iuran dan keuangan', keywords: 'analitik grafik statistik', roles: finance },
    { label: 'Kasbon petugas', href: '/admin/staff-loans', icon: Banknote, description: 'Pinjaman dan cicilan petugas', roles: financeWrite },
  ] },
  { label: 'Operasional', items: [
    { label: 'Aduan warga', href: '/admin/complaints', icon: MessageCircle, description: 'Tindak lanjuti laporan warga', keywords: 'keluhan rusak', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY', 'MAINTENANCE', 'SECRETARY'] },
    { label: 'Keamanan', href: '/admin/security-gate', icon: ShieldCheck, description: 'Buku tamu, gerbang dan patroli', keywords: 'satpam pos qr pass', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECURITY'] },
    { label: 'Kebersihan', href: '/admin/cleaning-staff', icon: Truck, description: 'Petugas dan jadwal pengangkutan sampah', keywords: 'tps armada', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE', 'SECURITY'] },
    { label: 'Fasilitas', href: '/admin/facilities', icon: Building2, description: 'Sarana, pemesanan dan perawatan', keywords: 'fasum maintenance booking', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'MAINTENANCE', 'SECRETARY', 'SECURITY'] },
  ] },
  { label: 'Komunikasi', items: [
    { label: 'Pengumuman & agenda', href: '/admin/announcements', icon: Megaphone, description: 'Informasi dan kegiatan warga', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'SECURITY', 'MAINTENANCE'] },
    { label: 'Musyawarah', href: '/admin/voting', icon: Vote, description: 'Pemungutan suara dan jajak pendapat', keywords: 'voting polling', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY'] },
    { label: 'WhatsApp', href: '/admin/whatsapp-bot', icon: MessageCircle, description: 'Template dan simulator pesan WhatsApp', keywords: 'bot wa', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER'] },
    { label: 'Notifikasi', href: '/admin/notifications', icon: Bell, description: 'Pemberitahuan dan aktivitas', roles: ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'SECURITY'] },
  ] },
  { label: 'Administrasi', items: [
    { label: 'Dokumen', href: '/admin/documents', icon: FolderOpen, description: 'Arsip dan dokumen komunitas', roles: governance },
    { label: 'Riwayat aktivitas', href: '/admin/audit', icon: History, description: 'Jejak audit perubahan data', roles: governance },
    { label: 'Cadangan data', href: '/admin/backup', icon: Database, description: 'Ekspor dan pencadangan data', keywords: 'backup restore', roles: leaders },
    { label: 'Pengaturan', href: '/admin/settings', icon: Settings, description: 'Profil komunitas, rekening dan tarif', roles: leaders },
  ] },
];

export const dashboardItem: NavigationItem = {
  label: 'Ringkasan', href: '/admin', icon: LayoutDashboard,
  description: 'Ringkasan keuangan dan pekerjaan hari ini', keywords: 'dashboard beranda',
};

export function navigationForRole(role: UserRole): NavigationGroup[] {
  return adminNavigation.map(group => ({
    ...group, items: group.items.filter(item => !item.roles || item.roles.includes(role)),
  })).filter(group => group.items.length > 0);
}

export function isNavigationActive(href: string, currentPath: string): boolean {
  return href.split('?')[0].replace(/\/$/, '') === currentPath.split('?')[0].replace(/\/$/, '');
}

export function pageContext(path: string) {
  for (const group of adminNavigation) {
    const item = group.items.find(item => isNavigationActive(item.href, path));
    if (item) return { group: group.label, ...item };
  }
  return { group: 'Pengurus', ...dashboardItem };
}

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Administrator', CHAIRMAN: 'Ketua komplek', TREASURER: 'Bendahara',
  SECRETARY: 'Sekretaris', RESIDENT_ADMIN: 'Admin warga', SECURITY: 'Petugas keamanan',
  MAINTENANCE: 'Petugas kebersihan', HOUSE_OWNER: 'Pemilik rumah',
  HOUSEHOLD_HEAD: 'Kepala keluarga', RESIDENT: 'Warga', AUDITOR: 'Auditor', VIEWER: 'Pengamat',
};
