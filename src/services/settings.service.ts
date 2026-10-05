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
  name: string;        // cth: 'Dinas Hari Ini (Rotasi 1)'
  time: string;        // cth: '07:00 - 07:00 WIB'
  staffName: string;
  role: string;
  phone: string;
  areas: string[];     // penugasan area jaga (editor admin)
  badgeNo?: string;    // cth: 'SEC.2026.2280'
  post?: string;       // titik jaga, cth: 'Pos Gerbang Utama (Main Gate)'
  specialDuties?: string; // tugas khusus harian petugas
}

export interface RosterTimelineItem {
  time: string;        // '07:00 WIB'
  title: string;
  label: string;       // badge kategori, cth: 'Waktu Masuk'
  description: string;
}

export interface SecurityShiftRoster {
  shifts: SecurityShiftEntry[];
  notes: string;
  // Model dinas estafet 24 jam (pagi s/d pagi): petugas bergantian selang-seling
  // setiap hari pada jam serah terima. rotationStartDate = tanggal petugas
  // shifts[0] mulai dinas (patokan paritas rotasi).
  rotationStartDate?: string; // 'YYYY-MM-DD'
  handoverTime?: string;      // '07:00'
  timeline?: RosterTimelineItem[];
  updatedAt?: string;
}

// Default dibangun dari roster riil petugas jaga Grand Sariwangi
// (sumber: Modul Keamanan & Jadwal — siklus piket estafet 24 jam).
export const DEFAULT_SECURITY_SHIFT_ROSTER: SecurityShiftRoster = {
  shifts: [
    {
      id: 'officer-adri',
      name: 'Dinas Hari Ini (Rotasi 1)',
      time: '07:00 - 07:00 WIB',
      staffName: 'Pa Adri Harry',
      role: 'Satpam Utama (Piket Gerbang & Patroli 24 Jam)',
      phone: '0812-2008-2240',
      badgeNo: 'SEC.2026.2280',
      post: 'Pos Gerbang Utama (Main Gate)',
      specialDuties: 'Standby Gerbang, PJU 18:00, Portal 21:00, Ronda 02:30',
      areas: [
        'Pos Jaga Depan (Pintu Utama)',
        'Patroli Keliling Komplek',
        'Pengawasan CCTV & Penerangan Jalan (PJU)',
      ],
    },
    {
      id: 'officer-slamet',
      name: 'Dinas Berikutnya (Rotasi 2)',
      time: '07:00 - 07:00 WIB',
      staffName: 'Pak Slamet Radiyanto',
      role: 'Petugas Jaga & Keamanan Komplek',
      phone: '0813-8899-2241',
      badgeNo: 'SEC.2026.2281',
      post: 'Pos Gerbang Utama (Main Gate)',
      specialDuties: 'Serah Terima Piket 07:00, Standby Gerbang & Ronda Malam',
      areas: [
        'Pos Jaga Depan (Pintu Utama)',
        'Patroli Keliling & Keamanan Malam',
        'Kontrol Portal & Akses Tamu',
      ],
    },
  ],
  rotationStartDate: '2026-10-04',
  handoverTime: '07:00',
  timeline: [
    {
      time: '07:00 WIB',
      title: 'Serah Terima Piket & Cek HT/Kunci',
      label: 'Waktu Masuk',
      description: 'Serah terima mutasi pos antara Pa Adri Harry & Pak Slamet Radiyanto.',
    },
    {
      time: '08:00 - 16:00 WIB',
      title: 'Standby Gerbang, Tamu & Kurir Paket',
      label: 'Siang Hari',
      description: 'Pemeriksaan akses tamu kavling A - M, ojol makanan, paket kurir, dan keamanan jalan.',
    },
    {
      time: '18:00 WIB',
      title: 'Nyalakan Lampu Penerangan Jalan (PJU)',
      label: 'Wajib Sore',
      description: 'Mengaktifkan saklar PJU utama di gardu dan cek lampu jalan di sepanjang kavling A - M.',
    },
    {
      time: '21:00 WIB',
      title: 'Gembok & Kunci Portal Utama',
      label: 'Keamanan Malam',
      description: 'Akses terbatas 1 pintu diberlakukan. Setiap tamu malam wajib lapor satpam bertugas.',
    },
    {
      time: '23:30 & 02:30 WIB',
      title: 'Ronda Keliling Malam & Dini Hari',
      label: 'Ronda Dini Hari',
      description: 'Patroli jalan kaki bersenter keliling Kav A s/d Kav M, cek mobil di carport dan pagar keliling.',
    },
    {
      time: '07:00 WIB Besok',
      title: 'Buka Portal & Estafet ke Satpam Berikutnya',
      label: 'Serah Terima',
      description: 'Buka gembok portal, padamkan PJU, dan estafet tugas diserahkan kepada petugas mitra berikutnya.',
    },
  ],
  notes:
    'Rotasi estafet petugas jaga bergantian otomatis setiap pukul 07:00 WIB (pagi s/d pagi, dinas 24 jam). Perubahan jadwal atau penugasan area ditetapkan oleh Pengurus Paguyuban melalui menu Pengaturan > Keamanan.',
};

export async function getSecurityShiftRoster(): Promise<SecurityShiftRoster> {
  const base = DEFAULT_SECURITY_SHIFT_ROSTER;
  if (process.env.DATABASE_URL) {
    try {
      const rows = await neonSql`SELECT value FROM settings WHERE key = 'security_shift_roster' LIMIT 1`;
      if (rows.length && rows[0].value) {
        const parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        if (Array.isArray(parsed?.shifts) && parsed.shifts.length > 0) {
          // Normalisasi data lama agar field baru selalu terisi
          return {
            ...base,
            ...parsed,
            shifts: parsed.shifts.map((s: any, i: number) => ({
              badgeNo: '',
              post: '',
              specialDuties: '',
              ...base.shifts[i % base.shifts.length],
              ...s,
            })),
            timeline: Array.isArray(parsed.timeline) && parsed.timeline.length > 0 ? parsed.timeline : base.timeline,
            rotationStartDate: parsed.rotationStartDate || base.rotationStartDate,
            handoverTime: parsed.handoverTime || base.handoverTime,
          } as SecurityShiftRoster;
        }
      }
    } catch (e) {
      console.warn('Neon get security roster error:', e);
    }
  }
  return base;
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
