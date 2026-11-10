import type { UserRole } from '../types/auth';
import { navigationForRole } from './navigation';

export const workspaceRoles = ['SUPER_ADMIN', 'CHAIRMAN', 'TREASURER', 'SECRETARY', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE', 'AUDITOR'] as const satisfies readonly UserRole[];
export type WorkspaceRole = typeof workspaceRoles[number];
export const hasWorkspace = (role: UserRole): role is WorkspaceRole => workspaceRoles.some(value => value === role);

export const workItems = {
  payments: { label: 'Verifikasi pembayaran', href: '/admin/payments?tab=verification', tone: 'amber' },
  complaints: { label: 'Aduan terbuka', href: '/admin/complaints?status=OPEN', tone: 'amber' },
  bookings: { label: 'Reservasi menunggu', href: '/admin/facilities?tab=bookings', tone: 'blue' },
  maintenance: { label: 'Fasilitas perlu dirawat', href: '/admin/facilities?tab=facilities', tone: 'amber' },
  households: { label: 'Rumah terdaftar', href: '/admin/properties?tab=units', tone: 'mint' },
  vehicles: { label: 'Kendaraan terdaftar', href: '/admin/security-gate?tab=gate', tone: 'blue' },
  announcements: { label: 'Pengumuman terbit', href: '/admin/announcements?tab=announcements', tone: 'blue' },
  documents: { label: 'Dokumen tersimpan', href: '/admin/documents', tone: 'blue' },
  audit: { label: 'Aktivitas tercatat terbaru', href: '/admin/audit', tone: 'blue' },
  cash: { label: 'Saldo kas utama', href: '/admin/ledger?tab=accounts_manage', tone: 'mint' },
  billing: { label: 'Tagihan belum lunas', href: '/admin/billing?tab=invoices', tone: 'amber' },
} as const;
export type WorkKey = keyof typeof workItems;

type Workspace = { title: string; items: readonly WorkKey[]; shortcuts: readonly { label: string; href: string }[] };
export const workspaces: Record<WorkspaceRole, Workspace> = {
  SUPER_ADMIN: { title: 'Administrasi lingkungan', items: ['audit', 'households', 'payments', 'complaints', 'bookings'], shortcuts: [{ label: 'Kelola akun', href: '/admin/passwords' }, { label: 'Pengaturan', href: '/admin/settings?tab=profile' }, { label: 'Cadangan data', href: '/admin/backup' }] },
  CHAIRMAN: { title: 'Ringkasan lingkungan', items: ['complaints', 'payments', 'bookings', 'maintenance', 'households', 'cash'], shortcuts: [{ label: 'Buat tagihan', href: '/admin/billing?tab=batch' }, { label: 'Pengumuman', href: '/admin/announcements?tab=announcements' }, { label: 'Musyawarah', href: '/admin/voting?tab=election' }] },
  TREASURER: { title: 'Ruang bendahara', items: ['payments', 'cash', 'billing'], shortcuts: [{ label: 'Catat pembayaran', href: '/admin/payments?tab=manual_counter' }, { label: 'Pengeluaran', href: '/admin/expenses' }, { label: 'Rekap iuran', href: '/admin/billing?tab=annual_matrix' }] },
  SECRETARY: { title: 'Ruang sekretariat', items: ['announcements', 'documents', 'complaints', 'bookings'], shortcuts: [{ label: 'Pengumuman', href: '/admin/announcements?tab=announcements' }, { label: 'Agenda', href: '/admin/announcements?tab=agenda' }, { label: 'Musyawarah', href: '/admin/voting?tab=election' }] },
  RESIDENT_ADMIN: { title: 'Administrasi warga', items: ['households'], shortcuts: [{ label: 'Penghuni', href: '/admin/properties?tab=residents' }, { label: 'Kendaraan', href: '/admin/properties?tab=vehicles' }, { label: 'Daftar akun', href: '/admin/passwords' }] },
  SECURITY: { title: 'Pos keamanan', items: ['complaints', 'vehicles', 'bookings'], shortcuts: [{ label: 'Periksa kendaraan', href: '/admin/security-gate?tab=gate' }, { label: 'Jadwal piket', href: '/admin/security-gate?tab=roster' }, { label: 'Kontak darurat', href: '/admin/security-gate?tab=emergency' }] },
  MAINTENANCE: { title: 'Perawatan lingkungan', items: ['maintenance', 'complaints', 'bookings'], shortcuts: [{ label: 'Daftar fasilitas', href: '/admin/facilities?tab=facilities' }, { label: 'Jadwal kebersihan', href: '/admin/cleaning-staff?tab=routes_schedule' }, { label: 'Checklist', href: '/admin/cleaning-staff?tab=daily_checklist' }] },
  AUDITOR: { title: 'Pemeriksaan dan audit', items: ['audit', 'cash', 'billing', 'documents'], shortcuts: [{ label: 'Buku kas', href: '/admin/ledger?tab=ledger_list' }, { label: 'Laporan', href: '/admin/analytics?tab=financial_trends' }, { label: 'Jejak perubahan', href: '/admin/audit' }] },
};

export function getWorkspaceNavigation(role: WorkspaceRole) {
  const groups = navigationForRole(role);
  const allowed = new Set(groups.flatMap(group => group.items.map(item => item.href)));
  const workspace = workspaces[role];
  return {
    title: workspace.title, groups,
    items: workspace.items.filter(key => allowed.has(workItems[key].href.split('?')[0])),
    shortcuts: workspace.shortcuts.filter(item => allowed.has(item.href.split('?')[0])),
  };
}

export function getNotificationItems(role: WorkspaceRole): WorkKey[] {
  const allowed = new Set(navigationForRole(role).flatMap(group => group.items.map(item => item.href)));
  return (['payments', 'complaints', 'bookings', 'maintenance'] as const).filter(key => allowed.has(workItems[key].href.split('?')[0]));
}
