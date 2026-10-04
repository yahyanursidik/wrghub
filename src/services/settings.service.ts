import { neonSql } from '../db/neon';

export interface CommunityProfileSettings {
  communityName: string;
  rtRw: string;
  address: string;
  monthlyRate: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  qrisNmid?: string;
  securityPhone: string;
  rwHeadPhone: string;
  balance?: number;
}

export const DEFAULT_COMMUNITY_PROFILE: CommunityProfileSettings = {
  communityName: 'Komplek Grand Sariwangi',
  rtRw: 'RT 01 / RW 08',
  address: 'Grand Sariwangi, Sariwangi, Parongpong, Bandung Barat',
  monthlyRate: 250000,
  bankName: 'Bank Mandiri',
  bankAccount: '1300024446419',
  accountHolder: 'Paguyuban Grand Sariwangi',
  qrisNmid: 'ID102008891230',
  securityPhone: '0812-2008-2240',
  rwHeadPhone: '0812-3456-7890',
  balance: 21850000,
};

/**
 * Mengambil profil pengaturan komplek terpadu dari database Neon
 * Menggabungkan tabel settings ('community_profile') dan akun kas utama di tabel accounts.
 */
export async function getCommunityProfile(): Promise<CommunityProfileSettings> {
  const profile: CommunityProfileSettings = { ...DEFAULT_COMMUNITY_PROFILE };

  if (process.env.DATABASE_URL) {
    try {
      const [setRows, accRows] = await Promise.all([
        neonSql`SELECT value FROM settings WHERE key = 'community_profile' LIMIT 1`,
        neonSql`SELECT id, code, name, bank_name, account_number, balance FROM accounts WHERE id = 'acc-main' OR code = 'BCA_MAIN' OR code = 'BCA-UTAMA' LIMIT 1`,
      ]);

      if (setRows.length && setRows[0].value) {
        const val = typeof setRows[0].value === 'string' ? JSON.parse(setRows[0].value) : setRows[0].value;
        if (val.communityName) profile.communityName = val.communityName;
        if (val.rtRw) profile.rtRw = val.rtRw;
        if (val.address) profile.address = val.address;
        if (typeof val.monthlyRate === 'number') profile.monthlyRate = val.monthlyRate;
        if (val.bankName) profile.bankName = val.bankName;
        if (val.bankAccount) profile.bankAccount = val.bankAccount;
        if (val.accountHolder) profile.accountHolder = val.accountHolder;
        if (val.qrisNmid) profile.qrisNmid = val.qrisNmid;
        if (val.securityPhone) profile.securityPhone = val.securityPhone;
        if (val.rwHeadPhone) profile.rwHeadPhone = val.rwHeadPhone;
        if (typeof val.balance === 'number') profile.balance = val.balance;
      }

      if (accRows.length) {
        const acc = accRows[0];
        // Jika rekening bank di akun terdefinisi dan valid
        if (acc.bank_name && acc.bank_name !== 'BCA_MAIN') {
          profile.bankName = acc.bank_name;
        }
        if (acc.account_number && acc.account_number !== 'BCA_MAIN') {
          profile.bankAccount = acc.account_number;
        }
        if (acc.balance !== undefined && acc.balance !== null) {
          profile.balance = Number(acc.balance) || 0;
        }
      }
    } catch (err) {
      console.warn('Gagal membaca profil pengaturan dari Neon DB:', err);
    }
  }

  return profile;
}

/**
 * Mengambil informasi rekening master kas resmi paguyuban (Single Source of Truth)
 */
export async function getMasterBankAccount(): Promise<{
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisNmid: string;
}> {
  const profile = await getCommunityProfile();
  return {
    bankName: profile.bankName || 'Bank Mandiri',
    accountNumber: profile.bankAccount || '1300024446419',
    accountHolder: profile.accountHolder || 'Paguyuban Grand Sariwangi',
    qrisNmid: profile.qrisNmid || 'ID102008891230',
  };
}

// ================= ROSTER JADWAL SHIFT & PENUGASAN AREA JAGA =================

export interface SecurityShiftEntry {
  id: string;
  name: string;        // cth: 'Shift Pagi'
  time: string;        // cth: '06:00 - 18:00 WIB'
  staffName: string;
  role: string;
  phone: string;
  areas: string[];     // daftar penugasan area jaga
}

export interface SecurityShiftRoster {
  shifts: SecurityShiftEntry[];
  notes: string;
  updatedAt?: string;
}

// Default dibangun dari roster riil petugas jaga Grand Sariwangi
// (sumber: konfigurasi honor petugas di modul keuangan).
export const DEFAULT_SECURITY_SHIFT_ROSTER: SecurityShiftRoster = {
  shifts: [
    {
      id: 'shift-pagi',
      name: 'Shift Pagi',
      time: '06:00 - 18:00 WIB',
      staffName: 'Pa Adri Harry',
      role: 'Petugas Jaga Utama',
      phone: '0812-2008-2240',
      areas: [
        'Gerbang Utama & Barrier Gate',
        'Pos Satpam & Buku Mutasi Tamu',
        'Patroli Blok A - D & Taman Fasum',
      ],
    },
    {
      id: 'shift-malam',
      name: 'Shift Malam',
      time: '18:00 - 06:00 WIB',
      staffName: 'Pak Slamet Radiyanto',
      role: 'Petugas Jaga Malam',
      phone: '0813-8899-2241',
      areas: [
        'Gerbang Utama & Kontrol Akses Malam',
        'Pos Satpam (Jaga Malam)',
        'Patroli Keamanan & Kontrol PJU Lingkungan',
      ],
    },
  ],
  notes:
    'Penjagaan komplek berjalan 24 jam secara bergantian (2 shift x 12 jam). Perubahan jadwal atau penugasan area ditetapkan oleh Pengurus Paguyuban dan dapat diperbarui melalui menu Pengaturan > Keamanan.',
};

export async function getSecurityShiftRoster(): Promise<SecurityShiftRoster> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT value FROM settings WHERE key = 'security_shift_roster' LIMIT 1`;
      if (rows.length && rows[0].value) {
        const parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        if (Array.isArray(parsed?.shifts) && parsed.shifts.length > 0) {
          return parsed as SecurityShiftRoster;
        }
      }
    } catch (e) {
      console.warn('Neon get security roster error:', e);
    }
  }
  return DEFAULT_SECURITY_SHIFT_ROSTER;
}

export async function saveSecurityShiftRoster(roster: SecurityShiftRoster): Promise<void> {
  const jsonStr = JSON.stringify({ ...roster, updatedAt: new Date().toISOString() });
  if (process.env.DATABASE_URL) {
    await neonSql`
      INSERT INTO settings (id, community_id, key, value, description, updated_at)
      VALUES ('set-security-roster', 'comm-01', 'security_shift_roster', ${jsonStr}, 'Roster Jadwal Shift & Penugasan Area Jaga (halaman publik Transparency)', NOW())
      ON CONFLICT (id) DO UPDATE SET value = ${jsonStr}, updated_at = NOW();
    `;
    return;
  }
  throw new Error('Database tidak tersedia untuk menyimpan roster jadwal shift.');
}
