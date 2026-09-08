import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  Save,
  Check,
  ShieldAlert,
  Building,
  CreditCard,
  PhoneCall,
  Users,
  Bell,
  Sparkles,
  QrCode,
  Shield,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Car,
  Receipt,
  Wallet,
  Wrench,
  Megaphone,
  Vote,
  FolderOpen,
  HelpCircle,
  Truck,
  DollarSign,
  Palette,
  Eye,
  Type,
  Layout,
  Smartphone,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  MessageCircle,
  KeyRound,
  Trash2,
  Info,
  RefreshCw,
  UserCheck,
  Heart,
  ShieldCheck,
  AlertCircle,
  Building2,
  Zap
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { UserPasswordSettingsTab } from './UserPasswordSettingsTab';

export interface TariffComponent {
  id: string;
  name: string;
  fee: number;
  desc: string;
}

export const GRAND_SARIWANGI_TARIFF_COMPONENTS: TariffComponent[] = [
  { id: 'tf-rt', name: '1. Iuran RT (Pengangkutan Sampah, Kebersihan Lingkungan & Fasum RT)', fee: 250000, desc: 'Pengangkutan armada sampah dinas LH, kebersihan saluran air, pemotongan rumput dan operasional RT' },
  { id: 'tf-rw', name: '2. Iuran RW (Retribusi Paguyuban & Wilayah RW)', fee: 100000, desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW dan administrasi' },
];

export const DEFAULT_TARIFF_COMPONENTS: TariffComponent[] = GRAND_SARIWANGI_TARIFF_COMPONENTS;

export interface ExpenseComponentConfig {
  id: string;
  name: string;
  code: string;
  budgetAmount: number;
  recipientOrVendor: string;
  desc: string;
  iconName: string;
}

export const GRAND_SARIWANGI_EXPENSE_COMPONENTS: ExpenseComponentConfig[] = [
  {
    id: 'exp-gaji',
    name: 'Gaji Satpam',
    code: 'GAJI',
    budgetAmount: 2450000,
    recipientOrVendor: 'Pa Adri Harry (Rp 1.350.000) & Pak Slamet Radiyanto (Rp 1.100.000)',
    desc: 'Honorarium bulanan 2 personil satpam piket gerbang & patroli 24 jam Komplek Grand Sariwangi',
    iconName: 'ShieldCheck',
  },
  {
    id: 'exp-iuran-rt',
    name: 'Iuran RT',
    code: 'IURAN_RT',
    budgetAmount: 250000,
    recipientOrVendor: 'Bendahara RT 01',
    desc: 'Armada pengangkutan sampah dinas LH, kebersihan saluran air/got, pemotongan rumput dan operasional RT',
    iconName: 'Sparkles',
  },
  {
    id: 'exp-iuran-rw',
    name: 'Iuran RW',
    code: 'IURAN_RW',
    budgetAmount: 100000,
    recipientOrVendor: 'Pengurus RW 08 Sariwangi',
    desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW 08 dan administrasi kewilayahan',
    iconName: 'Building2',
  },
  {
    id: 'exp-operasional',
    name: 'Operasional Pos & PJU',
    code: 'OPERASIONAL',
    budgetAmount: 75000,
    recipientOrVendor: 'PLN & Pengadaan Air Minum Galon',
    desc: 'Token listrik penerangan jalan umum (PJU), pompa air fasum, serta air minum galon pos jaga',
    iconName: 'Zap',
  },
  {
    id: 'exp-dana-kesehatan',
    name: 'Dana Kesehatan / Bantuan Satpam',
    code: 'DANA_KESEHATAN',
    budgetAmount: 100000,
    recipientOrVendor: 'Kas P3K & Bantuan Medis Satpam',
    desc: 'Bantuan suplemen, obat P3K jaga malam & santunan medis satpam (fluktuatif: kadang kurang kadang lebih, pagu referensi Rp 100.000, ditalangi dari saldo kas berjalan)',
    iconName: 'Heart',
  },
  {
    id: 'exp-dana-tak-terduga',
    name: 'Dana Tak Terduga',
    code: 'DANA_TAK_TERDUGA',
    budgetAmount: 200000,
    recipientOrVendor: 'Panitia Agustusan HUT RI RW 08 / Kas Darurat',
    desc: 'Dana sumbangan untuk agustusan, acara sekitar kelurahan/rw, santunan kondolensi dan kebutuhan mendadak warga (dapat ditalangi saldo kas akhir berjalan bila mendadak)',
    iconName: 'AlertCircle',
  },
];

export interface ClusterSecurityGuard {
  id: string;
  nip: string;
  fullName: string;
  role: string;
  dutyCategory?: string;
  team?: string;
  phone: string;
  emergencyContact?: string;
  assignedPost?: string;
  shift?: string;
  status?: string;
}

export const DEFAULT_CLUSTER_GUARDS: ClusterSecurityGuard[] = [
  {
    id: 'GUARD-001',
    nip: 'SEC.2026.2280',
    fullName: 'Pa Adri Harry',
    role: 'Satpam Utama (Piket Gerbang & Patroli 24 Jam)',
    dutyCategory: 'KEAMANAN_MURNI',
    team: 'Regu Piket Gerbang',
    phone: '0812-2008-2240',
    emergencyContact: '0812-3456-7801',
    assignedPost: 'Pos Gerbang Utama (Main Gate)',
    shift: 'SHIFT_24_JAM',
    status: 'AKTIF_BERTUGAS',
  },
  {
    id: 'GUARD-002',
    nip: 'SEC.2026.2281',
    fullName: 'Pak Slamet Radiyanto',
    role: 'Petugas Jaga & Keamanan Komplek',
    dutyCategory: 'KEAMANAN_MURNI',
    team: 'Regu Piket Gerbang',
    phone: '0813-8899-2241',
    emergencyContact: '0812-3456-7802',
    assignedPost: 'Pos Gerbang Utama (Main Gate)',
    shift: 'SHIFT_24_JAM',
    status: 'LEPAS_PIKET',
  }
];


interface SettingsManagerProps {
  initialTab?: string;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ initialTab = 'branding' }) => {
  // Persistence helpers
  const getPersisted = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const savePersisted = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to persist storage:', e);
    }
  };

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<
    'branding' | 'profile' | 'finances' | 'security' | 'sanitation' | 'notifications' | 'committee' | 'inputs_directory' | 'passwords'
  >(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'passwords' || tabParam === 'users' || tabParam === 'auth' || tabParam === 'password') {
        return 'passwords';
      }
      if (tabParam === 'financial' || tabParam === 'keuangan' || tabParam === 'tarif' || tabParam === 'billing' || tabParam === 'tariffs') {
        return 'finances';
      }
      if (tabParam && ['branding', 'profile', 'finances', 'security', 'sanitation', 'notifications', 'committee', 'inputs_directory'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return (initialTab as any) || 'branding';
  });

  // Preview Mode for Branding
  const [brandingPreviewScreen, setBrandingPreviewScreen] = useState<'login' | 'admin_dash' | 'resident_dash'>('login');

  const sanitizeCommunityValue = (val: string, fallback: string) => {
    if (!val || val.toLowerCase().includes('taman sejahtera')) return fallback;
    return val;
  };

  // ================= 1. BRANDING, TITLES & SUBTITLES =================
  const [systemTitle, setSystemTitle] = useState(() => getPersisted('wargahub_set_sys_title', 'WargaHub'));
  const [systemSubtitle, setSystemSubtitle] = useState(() => getPersisted('wargahub_set_sys_sub', 'Sistem Tata Kelola & Transparansi Komplek Terpadu'));
  const [loginTitle, setLoginTitle] = useState(() => getPersisted('wargahub_set_login_title', 'WargaHub'));
  const [loginSubtitle, setLoginSubtitle] = useState(() => sanitizeCommunityValue(getPersisted('wargahub_set_login_subtitle', ''), 'Sistem Tata Kelola & Transparansi Komplek Grand Sariwangi'));
  const [adminDashTitle, setAdminDashTitle] = useState(() => getPersisted('wargahub_set_dash_heading', 'Dashboard Ketua Komplek'));
  const [adminDashSubtitle, setAdminDashSubtitle] = useState(() => sanitizeCommunityValue(getPersisted('wargahub_set_dash_subheading', ''), 'Ringkasan informasi, kas keuangan & aktivitas penting Komplek Grand Sariwangi.'));
  const [residentPortalTitle, setResidentPortalTitle] = useState(() => getPersisted('wargahub_set_res_title', 'Portal Warga Komplek'));
  const [residentPortalSubtitle, setResidentPortalSubtitle] = useState(() => getPersisted('wargahub_set_res_subtitle', 'Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam'));
  const [footerBadgeText, setFooterBadgeText] = useState(() => getPersisted('wargahub_set_footer_badge', 'Guyub Rukun, Aman, Asri & Transparan Berbasis Digital'));

  // ================= 2. PROFIL LINGKUNGAN =================
  const [communityName, setCommunityName] = useState(() => sanitizeCommunityValue(getPersisted('wargahub_set_comm_name', ''), 'Komplek Grand Sariwangi'));
  const [rtRw, setRtRw] = useState(() => getPersisted('wargahub_set_rtrw', 'RT 01 / RW 08'));
  const [address, setAddress] = useState(() => sanitizeCommunityValue(getPersisted('wargahub_set_address', ''), 'Grand Sariwangi, Sariwangi, Bandung Barat'));
  const [subdistrict, setSubdistrict] = useState(() => getPersisted('wargahub_set_subdistrict', 'Kel. Sariwangi, Kec. Parongpong'));
  const [cityPostal, setCityPostal] = useState(() => getPersisted('wargahub_set_citypostal', 'Kab. Bandung Barat, Jawa Barat 40559'));
  const [skNumber, setSkNumber] = useState(() => getPersisted('wargahub_set_sk_number', 'SK-LUR/SRW/012/VIII/2026'));
  const [motto, setMotto] = useState(() => getPersisted('wargahub_set_motto', 'Guyub Rukun, Aman, Asri, dan Transparan Berbasis Digital'));

  // ================= 3. KEUANGAN, TARIF & REKENING BANK =================
  // Mode Tarif: 'FLAT' (Tarif Tunggal Langsung All-in) vs 'DETAILED' (Rincian Komponen Multi-Pos)
  const [tariffMode, setTariffMode] = useState<'FLAT' | 'DETAILED'>(() => {
    return getPersisted<'FLAT' | 'DETAILED'>('wargahub_set_tariff_mode', 'FLAT');
  });

  const [flatFee, setFlatFee] = useState<number>(() => {
    return getPersisted<number>('wargahub_set_flat_fee', 250000);
  });

  const [flatFeeName, setFlatFeeName] = useState<string>(() => {
    return getPersisted<string>('wargahub_set_flat_name', 'Iuran Pengelolaan Lingkungan (IPL) Bulanan Warga');
  });

  const [flatFeeDesc, setFlatFeeDesc] = useState<string>(() => {
    return getPersisted<string>('wargahub_set_flat_desc', 'Iuran standar bulanan klaster per unit rumah (All-in)');
  });

  // Komponen pos terinci (Satpam, Sampah, Fasum, dll.)
  const [detailedComponents, setDetailedComponents] = useState<TariffComponent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDetailed = localStorage.getItem('wargahub_detailed_tariff_components');
        if (savedDetailed) {
          const parsed = JSON.parse(savedDetailed);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        const saved = localStorage.getItem('wargahub_tariff_components');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 1) {
            const total = parsed.reduce((a: number, b: any) => a + (Number(b.fee) || 0), 0);
            if (total === 750000) return DEFAULT_TARIFF_COMPONENTS;
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_TARIFF_COMPONENTS;
  });

  const [tariffNote, setTariffNote] = useState<string>(() => {
    return getPersisted<string>('wargahub_tariff_note', 'Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 01 / RW 08 (Komplek Grand Sariwangi)');
  });

  const totalDetailedTariff = useMemo(() => {
    return detailedComponents.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
  }, [detailedComponents]);

  // Nominal tarif aktif yang berlaku (Flat Rp 250.000 vs Rincian Pos)
  const totalTariff = useMemo(() => {
    return tariffMode === 'FLAT' ? flatFee : totalDetailedTariff;
  }, [tariffMode, flatFee, totalDetailedTariff]);

  // Unified components list for external listeners / sync
  const currentTariffComponents = useMemo<TariffComponent[]>(() => {
    if (tariffMode === 'FLAT') {
      return [{
        id: 'tf-flat',
        name: flatFeeName || 'Iuran Pengelolaan Lingkungan (IPL)',
        fee: flatFee,
        desc: flatFeeDesc || 'Iuran standar bulanan warga (All-in)',
      }];
    }
    return detailedComponents;
  }, [tariffMode, flatFee, flatFeeName, flatFeeDesc, detailedComponents]);

  const [monthlyFee, setMonthlyFee] = useState(() => String(totalTariff));

  // Keep monthlyFee in sync with totalTariff
  useEffect(() => {
    setMonthlyFee(String(totalTariff));
  }, [totalTariff]);

  // Reactive listener to keep Settings and Billing 100% in sync
  useEffect(() => {
    const handleTariffsUpdated = (e: any) => {
      if (e.detail) {
        if (e.detail.mode) {
          setTariffMode(e.detail.mode);
        }
        if (e.detail.mode === 'FLAT' && typeof e.detail.total === 'number') {
          setFlatFee(e.detail.total);
        }
        const comps = e.detail.components || (Array.isArray(e.detail) ? e.detail : null);
        if (comps && Array.isArray(comps)) {
          if (e.detail.mode === 'DETAILED' || comps.length > 1) {
            setDetailedComponents(comps);
          } else if (comps.length === 1) {
            setFlatFee(comps[0].fee);
            if (comps[0].name) setFlatFeeName(comps[0].name);
            if (comps[0].desc) setFlatFeeDesc(comps[0].desc);
          }
        }
        if (e.detail.note) {
          setTariffNote(e.detail.note);
        }
      }
    };
    window.addEventListener('wargahub_tariffs_updated', handleTariffsUpdated);
    return () => window.removeEventListener('wargahub_tariffs_updated', handleTariffsUpdated);
  }, []);

  const [dueDay, setDueDay] = useState(() => getPersisted('wargahub_set_dueday', '10'));
  const [gracePeriodDays, setGracePeriodDays] = useState(() => getPersisted('wargahub_set_grace_days', '5'));
  const [latePenaltyType, setLatePenaltyType] = useState(() => getPersisted('wargahub_set_penalty_type', 'NONE'));
  const [bankName, setBankName] = useState(() => getPersisted('wargahub_set_bankname', 'Bank Kas Paguyuban (Bank Syariah / Kas Utama)'));
  const [bankAccount, setBankAccount] = useState(() => getPersisted('wargahub_set_bankacc', '8830-1928-33'));
  const [accountHolder, setAccountHolder] = useState(() => getPersisted('wargahub_set_accholder', 'PENGURUS KOMPLEK WARGAHUB'));
  const [qrisNmid, setQrisNmid] = useState(() => getPersisted('wargahub_set_qris', 'ID1020088921829'));

  // Master Komponen Alokasi Pengeluaran Riil (Khusus Grand Sariwangi)
  const [expenseComponents, setExpenseComponents] = useState<ExpenseComponentConfig[]>(() => {
    const saved = getPersisted<ExpenseComponentConfig[]>('wargahub_expense_components', GRAND_SARIWANGI_EXPENSE_COMPONENTS);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map((item) => {
        if (item.id === 'exp-dana-kesehatan' && item.budgetAmount === 50000) {
          return {
            ...item,
            budgetAmount: 100000,
            desc: 'Bantuan suplemen, obat P3K jaga malam & santunan medis satpam (fluktuatif: kadang kurang kadang lebih, pagu referensi Rp 100.000, ditalangi dari saldo kas berjalan)',
          };
        }
        return item;
      });
    }
    return GRAND_SARIWANGI_EXPENSE_COMPONENTS;
  });

  const totalExpenseBudget = useMemo(() => {
    return expenseComponents.reduce((sum, item) => sum + (Number(item.budgetAmount) || 0), 0);
  }, [expenseComponents]);

  const getExpenseIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-primary-600" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-600" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-600" />;
      case 'AlertCircle': return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default: return <DollarSign className="w-4 h-4 text-ink-muted" />;
    }
  };

  // ================= 4. KEAMANAN & POS SATPAM (INTEGRASI DATA SATPAM) =================
  const loadStoredGuards = (): ClusterSecurityGuard[] => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_security_guards');
        const deletedStr = localStorage.getItem('wargahub_deleted_guards');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter((g: any) => 
              !deletedIds.includes(g.id) && 
              !deletedIds.includes(g.fullName) &&
              !g.fullName?.toLowerCase().includes('suparman') &&
              !g.fullName?.toLowerCase().includes('joko') &&
              !g.fullName?.toLowerCase().includes('bambang')
            );
            if (filtered.length > 0) return filtered;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_CLUSTER_GUARDS;
  };

  const [guardsList, setGuardsList] = useState<ClusterSecurityGuard[]>(loadStoredGuards);

  useEffect(() => {
    const handleGuardsUpdated = () => {
      const fresh = loadStoredGuards();
      setGuardsList(fresh);
    };
    window.addEventListener('wargahub_guards_updated', handleGuardsUpdated);
    return () => window.removeEventListener('wargahub_guards_updated', handleGuardsUpdated);
  }, []);

  const [selectedGuardId, setSelectedGuardId] = useState<string>(() => {
    const saved = getPersisted<string>('wargahub_set_active_guard_id', '');
    if (saved) return saved;
    const active = guardsList.find(g => g.status === 'AKTIF_BERTUGAS');
    return active ? active.id : (guardsList[0]?.id || '__CUSTOM__');
  });

  const [selectedGuardId2, setSelectedGuardId2] = useState<string>(() => {
    const saved = getPersisted<string>('wargahub_set_active_guard_id2', '');
    if (saved) return saved;
    return guardsList[1]?.id || '__CUSTOM__';
  });

  const [securityPhone, setSecurityPhone] = useState(() => {
    const saved = getPersisted('wargahub_set_secphone', '');
    if (!saved || saved === '0812-3456-7801') {
      const active = guardsList.find(g => g.status === 'AKTIF_BERTUGAS') || guardsList[0];
      return active?.phone || '0812-2008-2240';
    }
    return saved;
  });

  const [securityPhone2, setSecurityPhone2] = useState(() => {
    const saved = getPersisted('wargahub_set_secphone2', '');
    if (!saved || saved === '0812-3456-7802') {
      const secondary = guardsList[1] || guardsList[0];
      return secondary?.phone || '0813-8899-2241';
    }
    return saved;
  });

  const activeGuard = useMemo(() => {
    return guardsList.find(g => g.id === selectedGuardId) || null;
  }, [guardsList, selectedGuardId]);

  const activeGuard2 = useMemo(() => {
    return guardsList.find(g => g.id === selectedGuardId2) || null;
  }, [guardsList, selectedGuardId2]);

  const handleSelectGuard1 = (guardId: string) => {
    setSelectedGuardId(guardId);
    if (guardId !== '__CUSTOM__') {
      const g = guardsList.find(item => item.id === guardId);
      if (g && g.phone) {
        setSecurityPhone(g.phone);
      }
    }
  };

  const handleSelectGuard2 = (guardId: string) => {
    setSelectedGuardId2(guardId);
    if (guardId !== '__CUSTOM__') {
      const g = guardsList.find(item => item.id === guardId);
      if (g && g.phone) {
        setSecurityPhone2(g.phone);
      }
    }
  };

  const handleSwapGuards = () => {
    if (guardsList.length < 2) return;
    const cur1 = selectedGuardId;
    const cur2 = selectedGuardId2;
    const g1 = guardsList.find(g => g.id === cur2) || guardsList[1] || guardsList[0];
    const g2 = guardsList.find(g => g.id === cur1) || guardsList[0];

    setSelectedGuardId(g1.id);
    setSecurityPhone(g1.phone);

    setSelectedGuardId2(g2.id);
    setSecurityPhone2(g2.phone);
  };

  const [gateClosingTime, setGateClosingTime] = useState(() => getPersisted('wargahub_set_gateclose', '23:00'));
  const [guestPassExpiryHours, setGuestPassExpiryHours] = useState(() => getPersisted('wargahub_set_guesthours', '24'));
  const [maxGuestCars, setMaxGuestCars] = useState(() => getPersisted('wargahub_set_max_guest_cars', '3'));
  const [patrolFrequency, setPatrolFrequency] = useState(() => getPersisted('wargahub_set_patrolfreq', 'Setiap 2 Jam (22:00 - 05:00 WIB)'));


  // ================= 5. KEBERSIHAN & SAMPAH =================
  const [organicWasteDays, setOrganicWasteDays] = useState(() => getPersisted('wargahub_set_waste_org', 'Senin, Rabu, Jumat'));
  const [inorganicWasteDays, setInorganicWasteDays] = useState(() => getPersisted('wargahub_set_waste_inorg', 'Rabu & Sabtu'));
  const [collectionHours, setCollectionHours] = useState(() => getPersisted('wargahub_set_collection_hours', '06:30 - 10:30 WIB'));
  const [tpsLocation, setTpsLocation] = useState(() => getPersisted('wargahub_set_tps_loc', 'Area Belakang TPS3R Fasum Blok D'));

  // ================= 6. NOTIFIKASI & WHATSAPP =================
  const [waSenderName, setWaSenderName] = useState(() => getPersisted('wargahub_set_wasender', 'WargaHub Official Broadcast'));
  const [adminWaPhone, setAdminWaPhone] = useState(() => getPersisted('wargahub_set_admin_wa', '0812-3456-7890'));
  const [autoReminderDays, setAutoReminderDays] = useState(() => getPersisted('wargahub_set_reminderdays', 'H-5, H-3 & H-0 Jatuh Tempo'));

  // ================= 7. PENGURUS INTI =================
  const [kepalaKomplekName, setKepalaKomplekName] = useState(() => getPersisted('wargahub_set_kepala_komplek', 'Bpk. Ir. H. Bambang Sutrisno'));
  const [rwHeadName, setRwHeadName] = useState(() => getPersisted('wargahub_set_rwheadname', 'Bpk. Ir. H. Bambang Sutrisno'));
  const [rwHeadPhone, setRwHeadPhone] = useState(() => getPersisted('wargahub_set_rwheadphone', '0812-3456-7890'));
  const [secretaryName, setSecretaryName] = useState(() => getPersisted('wargahub_set_secname', 'Bpk. Hendra Wijaya, S.T.'));
  const [treasurerName, setTreasurerName] = useState(() => {
    const val = getPersisted('wargahub_set_treasname', 'Yahya Nursidik');
    if (typeof val === 'string' && (val.toLowerCase().includes('siti rahmawati') || val.toLowerCase().includes('hendra wijaya'))) {
      savePersisted('wargahub_set_treasname', 'Yahya Nursidik');
      return 'Yahya Nursidik';
    }
    return val || 'Yahya Nursidik';
  });
  const [securityCoordName, setSecurityCoordName] = useState(() => getPersisted('wargahub_set_seccoord', 'Pa Adri Harry (Satpam Utama)'));
  const [cleaningCoordName, setCleaningCoordName] = useState(() => getPersisted('wargahub_set_clncoord', 'Pak Slamet Radiyanto (Kebersihan & Jaga)'));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Save Settings Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. API Call to update database
      await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName,
          rtRw,
          address,
          monthlyRate: totalTariff,
          bankName,
          bankAccount,
          accountHolder,
          securityPhone,
          rwHeadPhone,
        }),
      }).catch(() => {});

      // 2. Persist Branding, Titles & Subtitles
      savePersisted('wargahub_set_sys_title', systemTitle);
      savePersisted('wargahub_set_sys_sub', systemSubtitle);
      savePersisted('wargahub_set_login_title', loginTitle);
      savePersisted('wargahub_set_login_subtitle', loginSubtitle);
      savePersisted('wargahub_set_dash_heading', adminDashTitle);
      savePersisted('wargahub_set_dash_subheading', adminDashSubtitle);
      savePersisted('wargahub_set_res_title', residentPortalTitle);
      savePersisted('wargahub_set_res_subtitle', residentPortalSubtitle);
      savePersisted('wargahub_set_footer_badge', footerBadgeText);

      // 3. Persist Profile
      savePersisted('wargahub_set_comm_name', communityName);
      savePersisted('wargahub_set_rtrw', rtRw);
      savePersisted('wargahub_set_address', address);
      savePersisted('wargahub_set_subdistrict', subdistrict);
      savePersisted('wargahub_set_citypostal', cityPostal);
      savePersisted('wargahub_set_sk_number', skNumber);
      savePersisted('wargahub_set_motto', motto);

      // 4. Persist Finances & Tariff Structure (Unified Single Source of Truth)
      savePersisted('wargahub_set_tariff_mode', tariffMode);
      savePersisted('wargahub_set_flat_fee', flatFee);
      savePersisted('wargahub_set_flat_name', flatFeeName);
      savePersisted('wargahub_set_flat_desc', flatFeeDesc);
      savePersisted('wargahub_detailed_tariff_components', detailedComponents);
      savePersisted('wargahub_tariff_components', currentTariffComponents);
      savePersisted('wargahub_tariff_note', tariffNote);
      savePersisted('wargahub_set_fee', String(totalTariff));

      // Synchronize legacy keys so there is no inconsistency anywhere in older views
      const secComp = currentTariffComponents.find(c => c.name.toLowerCase().includes('satpam') || c.name.toLowerCase().includes('aman'))?.fee ?? (tariffMode === 'FLAT' ? Math.round(flatFee * 0.6) : 150000);
      const trshComp = currentTariffComponents.find(c => c.name.toLowerCase().includes('sampah') || c.name.toLowerCase().includes('bersih'))?.fee ?? (tariffMode === 'FLAT' ? Math.round(flatFee * 0.2) : 50000);
      const resComp = currentTariffComponents.find(c => c.name.toLowerCase().includes('kas') || c.name.toLowerCase().includes('perawatan') || c.name.toLowerCase().includes('fasum'))?.fee ?? (tariffMode === 'FLAT' ? Math.round(flatFee * 0.2) : 50000);

      savePersisted('wargahub_set_trash_fee', String(trshComp));
      savePersisted('wargahub_set_security_fee', String(secComp));
      savePersisted('wargahub_set_reserve_fee', String(resComp));
      savePersisted('wargahub_set_dueday', dueDay);
      savePersisted('wargahub_set_grace_days', gracePeriodDays);
      savePersisted('wargahub_set_penalty_type', latePenaltyType);
      savePersisted('wargahub_set_bankname', bankName);
      savePersisted('wargahub_set_bankacc', bankAccount);
      savePersisted('wargahub_set_accholder', accountHolder);
      savePersisted('wargahub_set_qris', qrisNmid);
      savePersisted('wargahub_expense_components', expenseComponents);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wargahub_expense_components_updated', {
          detail: expenseComponents
        }));
      }

      // Dispatch global event for instantaneous synchronization across open pages/tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wargahub_tariffs_updated', {
          detail: {
            mode: tariffMode,
            components: currentTariffComponents,
            total: totalTariff,
            note: tariffNote,
          }
        }));
      }

      // 5. Persist Security & Dynamic Guards Roster Sync
      savePersisted('wargahub_set_secphone', securityPhone);
      savePersisted('wargahub_set_secphone2', securityPhone2);
      savePersisted('wargahub_set_active_guard_id', selectedGuardId);
      const activeGuardObj = guardsList.find(g => g.id === selectedGuardId);
      const activeGuardName = activeGuardObj ? activeGuardObj.fullName : (selectedGuardId === '__CUSTOM__' ? 'Petugas Khusus' : 'Pa Adri Harry');
      savePersisted('wargahub_set_active_guard_name', activeGuardName);

      savePersisted('wargahub_set_active_guard_id2', selectedGuardId2);
      const activeGuardObj2 = guardsList.find(g => g.id === selectedGuardId2);
      const activeGuardName2 = activeGuardObj2 ? activeGuardObj2.fullName : (selectedGuardId2 === '__CUSTOM__' ? 'Petugas Pos 2' : 'Pak Slamet Radiyanto');
      savePersisted('wargahub_set_active_guard_name2', activeGuardName2);

      savePersisted('wargahub_set_gateclose', gateClosingTime);
      savePersisted('wargahub_set_guesthours', guestPassExpiryHours);
      savePersisted('wargahub_set_max_guest_cars', maxGuestCars);
      savePersisted('wargahub_set_patrolfreq', patrolFrequency);

      // Synchronize guard statuses in wargahub_security_guards so Security Gate & Roster stays aligned
      try {
        const nextGuards = guardsList.map(g => {
          if (g.id === selectedGuardId) {
            return { ...g, status: 'AKTIF_BERTUGAS' };
          } else if (g.id === selectedGuardId2) {
            return { ...g, status: 'LEPAS_PIKET' };
          }
          return g;
        });
        savePersisted('wargahub_security_guards', nextGuards);
      } catch (e) {}

      // Dispatch global events for instant reactivity across all tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wargahub_security_updated', {
          detail: {
            guardId: selectedGuardId,
            guardName: activeGuardName,
            phone: securityPhone,
            guardId2: selectedGuardId2,
            guardName2: activeGuardName2,
            phone2: securityPhone2,
          }
        }));
        window.dispatchEvent(new CustomEvent('wargahub_guards_updated'));
      }


      // 6. Persist Sanitation
      savePersisted('wargahub_set_waste_org', organicWasteDays);
      savePersisted('wargahub_set_waste_inorg', inorganicWasteDays);
      savePersisted('wargahub_set_collection_hours', collectionHours);
      savePersisted('wargahub_set_tps_loc', tpsLocation);

      // 7. Persist Notifications & WhatsApp
      savePersisted('wargahub_set_wasender', waSenderName);
      savePersisted('wargahub_set_admin_wa', adminWaPhone);
      savePersisted('wargahub_set_reminderdays', autoReminderDays);

      // 8. Persist Committee
      savePersisted('wargahub_set_kepala_komplek', kepalaKomplekName);
      savePersisted('wargahub_set_rwheadname', rwHeadName);
      savePersisted('wargahub_set_rwheadphone', rwHeadPhone);
      savePersisted('wargahub_set_secname', secretaryName);
      savePersisted('wargahub_set_treasname', treasurerName);
      savePersisted('wargahub_set_seccoord', securityCoordName);
      savePersisted('wargahub_set_clncoord', cleaningCoordName);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wargahub_committee_updated', {
          detail: {
            kepalaKomplekName,
            rwHeadName,
            rwHeadPhone,
            treasurerName,
          }
        }));
      }

      // 9. Sync Bank Account list for payment portals
      savePersisted('wargahub_bank_accounts', [
        {
          id: 'acc-bca',
          bankName: bankName,
          accountNumber: bankAccount,
          accountHolder: accountHolder,
          isPrimary: true,
          qrisNmid: qrisNmid
        }
      ]);

      setSaved(true);
      showToast('Seluruh pengaturan, judul & sub-judul sistem berhasil disimpan dan seketika aktif!');
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Input Directory Mapping
  const inputModulesDirectory = [
    {
      category: 'DATA WARGA & PROPERTI',
      color: 'border-blue-200 bg-blue-50/40 text-blue-900',
      items: [
        { title: 'Input Rumah & Spesifikasi Teknis', url: '/admin/properties', desc: 'Tambah/edit data unit rumah, luas tanah/bangunan, status hunian, daya PLN.', icon: Building },
        { title: 'Input Anggota Keluarga & Penghuni', url: '/admin/properties?tab=occupants', desc: 'Tambah/edit/hapus data KK, NIK, hubungan keluarga, status tinggal.', icon: Users },
        { title: 'Input Kendaraan & Kartu Akses RFID', url: '/admin/properties?tab=vehicles', desc: 'Daftarkan mobil, motor, plat nomor, nomor seri RFID pass gerbang.', icon: Car },
        { title: 'Input Izin Renovasi & Utilitas', url: '/admin/properties?tab=permits', desc: 'Catat izin renovasi bangunan, uang jaminan, serta meteran air/listrik.', icon: Wrench },
      ]
    },
    {
      category: 'KEUANGAN, IURAN & KASBON',
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
      items: [
        { title: 'Terbitkan Tagihan Iuran Bulanan (Billing)', url: '/admin/billing', desc: 'Generate invoice iuran bulanan per unit atau massal seluruh rumah warga.', icon: Receipt },
        { title: 'Input Pembayaran & Verifikasi Transfer/QRIS', url: '/admin/payments', desc: 'Verifikasi setoran iuran warga, catat pembayaran tunai/manual & cetak kuitansi.', icon: CreditCard },
        { title: 'Input Pengeluaran Operasional Kas', url: '/admin/expenses', desc: 'Catat voucher belanja, kuitansi keluar kas, dan upload bukti transfer belanja.', icon: DollarSign },
        { title: 'Input Kasbon & Gaji Awal Staf', url: '/admin/staff-loans', desc: 'Kelola kasbon satpam/kebersihan, jadwal cicilan potong gaji, dan cetak slip kasbon.', icon: DollarSign },
        { title: 'Input Jurnal Buku Kas Umum (Ledger)', url: '/admin/ledger', desc: 'Catat debit/kredit manual kas paguyuban dan rekonsiliasi saldo bank.', icon: Wallet },
      ]
    },
    {
      category: 'OPERASIONAL KEAMANAN & KEBERSIHAN',
      color: 'border-amber-200 bg-amber-50/40 text-amber-900',
      items: [
        { title: 'Input Data Satpam, Roster & Patroli', url: '/admin/security-gate', desc: 'Kelola tim jaga pos, jadwal shift, absensi, checkpoint QR patroli & log tamu.', icon: Shield },
        { title: 'Input Staf Kebersihan, Rute Tossa & Checklist', url: '/admin/cleaning-staff', desc: 'Kelola petugas sampah, jadwal rute blok, armada Tossa, dan checklist harian.', icon: Truck },
        { title: 'Input Sarana, Fasilitas & Booking Fasum', url: '/admin/facilities', desc: 'Input aset balai warga/lapangan, catat izin peminjaman acara, jadwal servis.', icon: Building },
        { title: 'Input & Disposisi Aduan Masuk Warga', url: '/admin/complaints', desc: 'Tindak lanjuti komplain sampah, selokan got mampet, kebisingan, dsb.', icon: MessageCircle },
      ]
    },
    {
      category: 'KOMUNIKASI, VOTING & ARSIP DOKUMEN',
      color: 'border-purple-200 bg-purple-50/40 text-purple-900',
      items: [
        { title: 'Input Pengumuman & Broadcast WhatsApp', url: '/admin/announcements', desc: 'Buat pengumuman baru, sematkan di portal warga, kirim siaran massal WA.', icon: Megaphone },
        { title: 'Input Polling Musyawarah & E-Voting', url: '/admin/voting', desc: 'Buat polling persetujuan proyek fasilitas, pantau quick count pemilihan RT/RW.', icon: Vote },
        { title: 'Upload Arsip Dokumen & Peraturan', url: '/admin/documents', desc: 'Unggah file PDF SK pengurus, notulen rapat warga, tata tertib lingkungan.', icon: FolderOpen },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-600" />
              Pusat Pengaturan, Branding & Direktori Sistem
            </h1>
            <span className="px-2.5 py-0.5 bg-primary-100 text-primary-900 font-black text-xs rounded-full border border-primary-300">
              Master Configuration
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Konfigurasi kustomisasi judul & sub-judul sistem, identitas perumahan, tarif iuran bulanan, rekening kas & bank paguyuban, keamanan satpam, dan panduan form input.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tersimpan & Sinkron</span>
          </div>
        )}
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Status Sistem</span>
          <p className="text-lg font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Aktif & Siap</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Terhubung Database Neon DB</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Rekening Kas Utama</span>
          <p className="text-base font-black text-primary-700 mt-1 truncate">
            {bankName.split(' ')[0]} {bankAccount}
          </p>
          <span className="text-[10px] text-ink-muted font-bold truncate block">{accountHolder}</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Iuran Default Bulanan</span>
          <p className="text-xl font-black text-ink mt-1 font-mono">
            {formatRupiah(Number(monthlyFee))}
          </p>
          <span className="text-[10px] text-primary-600 font-bold">Jatuh Tempo: Tgl {dueDay}</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Hotline Satpam 24 Jam</span>
          <p className="text-sm font-black text-purple-700 mt-1 font-mono">
            {securityPhone}
          </p>
          <span className="text-[10px] text-purple-600 font-bold">Pos Utama & Gerbang Portal</span>
        </div>
      </div>

      {/* Subtabs Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'passwords', label: '🔑 Manajemen Akun & Password', icon: KeyRound, highlight: true },
          { id: 'branding', label: '🎨 Judul, Sub-Judul & Branding', icon: Palette, highlight: false },
          { id: 'profile', label: '🏛️ Identitas & Wilayah', icon: Building },
          { id: 'finances', label: '💳 Tarif Iuran & Bank Kas', icon: CreditCard },
          { id: 'security', label: '🛡️ Keamanan & Satpam', icon: Shield },
          { id: 'sanitation', label: '🧹 Kebersihan & Sampah', icon: Truck },
          { id: 'notifications', label: '🔔 Bot WhatsApp & Broadcast', icon: Bell },
          { id: 'committee', label: '👥 Pengurus RT/RW', icon: Users },
          { id: 'inputs_directory', label: '📍 Peta Jalan Form Input Data', icon: Layers },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : tab.highlight
                  ? 'bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: BRANDING, JUDUL & SUB-JUDUL SISTEM ================= */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Palette className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Kustomisasi Judul & Sub-Judul Sistem</h3>
                <p className="text-ink-muted text-[11px]">
                  Ubah nama aplikasi, teks banner login, heading dashboard admin, dan portal warga sesuai identitas komplek Anda.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-5 bg-canvas rounded-3xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary-600" />
                  <span>Simulasi Preview Langsung Tampilan Teks:</span>
                </span>

                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('login')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'login' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Layar Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('admin_dash')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'admin_dash' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Dashboard Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingPreviewScreen('resident_dash')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      brandingPreviewScreen === 'resident_dash' ? 'bg-primary-600 text-white' : 'text-ink-muted'
                    }`}
                  >
                    Portal Warga
                  </button>
                </div>
              </div>

              {/* Screen Preview Render */}
              <div className="p-6 bg-surface rounded-2xl border border-border shadow-inner text-center space-y-2">
                {brandingPreviewScreen === 'login' && (
                  <div className="max-w-md mx-auto space-y-2 py-4">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Building className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-ink">{loginTitle || 'WargaHub'}</h2>
                    <p className="text-xs text-ink-muted">{loginSubtitle || 'Sistem Tata Kelola & Transparansi Komplek'}</p>
                    <div className="p-3 bg-canvas rounded-xl border border-border/80 text-[10px] text-ink-muted mt-2">
                      [Form Input Username & Password Warga/Pengurus]
                    </div>
                  </div>
                )}

                {brandingPreviewScreen === 'admin_dash' && (
                  <div className="text-left space-y-1 py-2">
                    <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider">Halaman Admin</span>
                    <h2 className="text-2xl font-black text-ink">{adminDashTitle || 'Dashboard Ketua Komplek'}</h2>
                    <p className="text-xs text-ink-muted">{adminDashSubtitle || 'Ringkasan informasi dan aktivitas penting komplek.'}</p>
                  </div>
                )}

                {brandingPreviewScreen === 'resident_dash' && (
                  <div className="text-left space-y-1 py-2">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Halaman Warga</span>
                    <h2 className="text-2xl font-black text-ink">{residentPortalTitle || 'Portal Warga Komplek'}</h2>
                    <p className="text-xs text-ink-muted">{residentPortalSubtitle || 'Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Login Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <strong className="text-xs text-ink">1. Teks Halaman Login Masuk</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Login (Title) *</label>
                  <input
                    type="text"
                    value={loginTitle}
                    onChange={(e) => setLoginTitle(e.target.value)}
                    required
                    placeholder="Contoh: WargaHub / Portal Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Login (Subtitle) *</label>
                  <input
                    type="text"
                    value={loginSubtitle}
                    onChange={(e) => setLoginSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Sistem Tata Kelola & Transparansi Komplek Grand Sariwangi"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Admin Dashboard Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Layout className="w-4 h-4 text-emerald-600" />
                  <strong className="text-xs text-ink">2. Teks Heading Dashboard Admin</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Dashboard Admin (Heading) *</label>
                  <input
                    type="text"
                    value={adminDashTitle}
                    onChange={(e) => setAdminDashTitle(e.target.value)}
                    required
                    placeholder="Contoh: Dashboard Ketua Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Dashboard Admin (Subheading) *</label>
                  <input
                    type="text"
                    value={adminDashSubtitle}
                    onChange={(e) => setAdminDashSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Ringkasan informasi dan aktivitas penting komplek."
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Resident Portal Title & Subtitle */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <strong className="text-xs text-ink">3. Teks Heading Portal Warga</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Judul Portal Warga (Title) *</label>
                  <input
                    type="text"
                    value={residentPortalTitle}
                    onChange={(e) => setResidentPortalTitle(e.target.value)}
                    required
                    placeholder="Contoh: Portal Warga Komplek"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sub-Judul Portal Warga (Subtitle) *</label>
                  <input
                    type="text"
                    value={residentPortalSubtitle}
                    onChange={(e) => setResidentPortalSubtitle(e.target.value)}
                    required
                    placeholder="Contoh: Layanan Iuran, Keamanan, Fasilitas & Aduan Warga 24 Jam"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Master System Name & Slogan */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <strong className="text-xs text-ink">4. Nama Master Sistem & Tagline</strong>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Utama Aplikasi / Sistem</label>
                  <input
                    type="text"
                    value={systemTitle}
                    onChange={(e) => setSystemTitle(e.target.value)}
                    placeholder="WargaHub"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Tagline Slogan Footer</label>
                  <input
                    type="text"
                    value={footerBadgeText}
                    onChange={(e) => setFooterBadgeText(e.target.value)}
                    placeholder="Guyub Rukun, Aman, Asri & Transparan Berbasis Digital"
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink italic"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink-muted text-xs">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Perubahan judul dan sub-judul akan seketika tampil di login, dashboard dan seluruh modul.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan Judul...' : 'Simpan Kustomisasi Judul'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: IDENTITAS & WILAYAH ================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Identitas & Wilayah Lingkungan Komplek</h3>
                <p className="text-ink-muted text-[11px]">Nama resmi dan alamat administratif perumahan yang tampil di kuitansi dan portal warga.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Komplek / Perumahan *</label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Rukun Tetangga / RW *</label>
                <input
                  type="text"
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Alamat Lengkap / Jalan Utama *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Kelurahan & Kecamatan</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Kota & Kode Pos</label>
                <input
                  type="text"
                  value={cityPostal}
                  onChange={(e) => setCityPostal(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nomor SK Penetapan Kepengurusan</label>
                <input
                  type="text"
                  value={skNumber}
                  onChange={(e) => setSkNumber(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Motto / Slogan Lingkungan</label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink italic"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Identitas'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: KEUANGAN, TARIF & REKENING BANK ================= */}
      {activeTab === 'finances' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Tarif Iuran Bulanan, Rekening Kas & QRIS</h3>
                <p className="text-ink-muted text-[11px]">Konfigurasi nominal tagihan bulanan default dan rekening resmi penerima iuran warga.</p>
              </div>
            </div>

            {/* Flexible Tariff Mode Switcher (Flat Single Fee vs Detailed Multi-Pos) */}
            <div className="bg-canvas p-4 sm:p-5 rounded-2xl border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink-muted block">
                    SKEMA STRUKTUR TARIF IURAN LINGKUNGAN (IPL)
                  </span>
                  <h4 className="font-black text-sm text-ink flex items-center gap-2 mt-0.5">
                    <Sliders className="w-4 h-4 text-primary-600" />
                    Pilih Format Penagihan Iuran Warga
                  </h4>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                    Tersinkronisasi Otomatis ke Billing
                  </span>
                  <a
                    href="/admin/billing"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border text-ink-muted hover:text-ink font-semibold rounded-lg text-[10px] inline-flex items-center gap-1 transition-all"
                  >
                    <span>Cek Menu Tagihan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode 1: FLAT / LANGSUNG */}
                <button
                  type="button"
                  onClick={() => setTariffMode('FLAT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    tariffMode === 'FLAT'
                      ? 'bg-primary-50/70 border-primary-600 ring-2 ring-primary-500/20 shadow-xs'
                      : 'bg-surface border-border hover:bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${tariffMode === 'FLAT' ? 'bg-primary-600 text-white shadow-2xs' : 'bg-canvas text-ink-muted border border-border'}`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-ink block">Tarif Tunggal Langsung (All-in)</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          Pilihan Klaster (Rp 250.000)
                        </span>
                      </div>
                    </div>
                    {tariffMode === 'FLAT' && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-2.5 leading-relaxed">
                    Satu nominal tagihan bulanan langsung tanpa pecahan pos terpisah. Sangat cocok untuk komplek/klaster yang memberlakukan iuran bersih <strong>Rp 250.000 / bulan</strong>.
                  </p>
                </button>

                {/* Mode 2: DETAILED / MULTI-POS */}
                <button
                  type="button"
                  onClick={() => setTariffMode('DETAILED')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    tariffMode === 'DETAILED'
                      ? 'bg-primary-50/70 border-primary-600 ring-2 ring-primary-500/20 shadow-xs'
                      : 'bg-surface border-border hover:bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${tariffMode === 'DETAILED' ? 'bg-primary-600 text-white shadow-2xs' : 'bg-canvas text-ink-muted border border-border'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-ink block">Rincian Komponen Pos (Terinci)</span>
                        <span className="text-[10px] text-ink-muted block mt-0.5">Satpam, Sampah, Kas & Fasum</span>
                      </div>
                    </div>
                    {tariffMode === 'DETAILED' && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-2.5 leading-relaxed">
                    Bagi komplek yang mewajibkan invoice iuran dirinci ke dalam pecahan pos spesifik (seperti Satpam Rp 150rb, Sampah Rp 50rb, Fasum Rp 50rb).
                  </p>
                </button>
              </div>

              {/* View 1: FLAT SINGLE FEE EDITOR */}
              {tariffMode === 'FLAT' && (
                <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border space-y-4 mt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div>
                      <h4 className="font-black text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Konfigurasi Tarif Tunggal Bulanan (Tanpa Pecahan Pos)
                      </h4>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Tagihan dibuat bulat utuh per unit rumah warga tanpa membagi ke pos satpam/kebersihan/kas terpisah.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                      All-in Klaster
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-ink block">
                        Nama Tagihan Resmi Warga *
                      </label>
                      <input
                        type="text"
                        value={flatFeeName}
                        onChange={(e) => setFlatFeeName(e.target.value)}
                        placeholder="Contoh: Iuran Pengelolaan Lingkungan (IPL) Bulanan Warga"
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                      />
                      <span className="text-[10px] text-ink-muted block">Tercetak pada invoice tagihan dan kwitansi warga</span>
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-ink block">
                        Nominal Iuran Bulanan Per Unit Rumah (Rp) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-ink-muted">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={flatFee}
                          onChange={(e) => setFlatFee(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl font-mono text-base font-black text-primary-800 text-right tabular-nums focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                        <span className="text-[10px] text-ink-muted">Preset Cepat:</span>
                        <div className="flex flex-wrap gap-1">
                          {[250000, 350000, 200000, 150000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setFlatFee(preset)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                                flatFee === preset
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-canvas hover:bg-surface border border-border text-ink-muted hover:text-ink'
                              }`}
                            >
                              {formatRupiah(preset)}{preset === 250000 ? ' (RT)' : preset === 350000 ? ' (RT+RW)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[11px] font-bold text-ink block">
                        Keterangan Tagihan / Peruntukan Ringkas (Opsional)
                      </label>
                      <input
                        type="text"
                        value={flatFeeDesc}
                        onChange={(e) => setFlatFeeDesc(e.target.value)}
                        placeholder="Contoh: Iuran standar bulanan warga (All-in keamanan pos satpam, sampah dinas LH & pemeliharaan klaster)"
                        className="w-full p-2 bg-canvas border border-border rounded-xl text-xs text-ink-muted"
                      />
                    </div>
                  </div>

                  {/* Total Calculation Card for Flat */}
                  <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-primary-950 text-xs uppercase tracking-wide">
                          Total Iuran Flat Per Unit Rumah
                        </h4>
                        <span className="px-2 py-0.5 bg-white text-primary-900 rounded font-mono font-bold text-[10px] border border-primary-200">
                          14 Kavling Klaster
                        </span>
                      </div>
                      <p className="text-[11px] text-primary-800 mt-0.5">
                        Diterbitkan langsung bulat ke seluruh kavling warga tiap tanggal 1 awal bulan.
                      </p>
                      <p className="text-[10px] text-primary-700 mt-0.5">
                        Akumulasi potensi kas klaster: 14 unit × {formatRupiah(flatFee)} = <strong>{formatRupiah(flatFee * 14)} / bulan</strong>.
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-2xl font-black font-mono text-primary-900 block tabular-nums">
                        {formatRupiah(flatFee)} <span className="text-xs font-normal text-primary-700">/ bln</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                        Sesuai Karakter Klaster (Flat)
                      </span>
                    </div>
                  </div>

                  {/* Clarification Alert */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-950">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Model Tarif Tunggal Aktif:</strong> Warga melihat tagihan langsung sebesar <strong>{formatRupiah(flatFee)}</strong> pada invoice tagihan dan Portal Warga tanpa pembagian pecahan komponen satpam/sampah/fasum. Pengeluaran riil satpam (Rp 2.450.000) dan vendor sampah (Rp 350.000) dikelola utuh pada menu <strong>Buku Kas & Pengeluaran (`/admin/expenses`)</strong>.
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: DETAILED MULTI-POS COMPONENT MATRIX */}
              {tariffMode === 'DETAILED' && (
                <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border space-y-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-primary-600" />
                          Rincian Struktur Komponen Pos Iuran (Terinci)
                        </h4>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200">
                          Mode Multi-Pos
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Setiap komponen pos memiliki nominal tersendiri dan otomatis dijumlahkan menjadi total tagihan bulanan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newId = `tf-${Date.now()}`;
                        setDetailedComponents([
                          ...detailedComponents,
                          { id: newId, name: `${detailedComponents.length + 1}. Komponen Pos Baru`, fee: 50000, desc: 'Alokasi pemeliharaan/sarana komplek' },
                        ]);
                      }}
                      className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 active:scale-[0.96] transition-all self-start sm:self-auto"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Tambah Pos Iuran</span>
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-canvas/80 rounded-xl border border-border">
                    <span className="text-[10px] font-bold text-ink-muted">Preset Struktur:</span>
                    <button
                      type="button"
                      onClick={() => setDetailedComponents([
                        { id: 'tf-rt', name: '1. Iuran RT (Pengangkutan Sampah, Fasum & Operasional RT)', fee: 250000, desc: 'Armada sampah dinas LH, kebersihan saluran air, pemotongan rumput dan operasional RT' },
                        { id: 'tf-rw', name: '2. Iuran RW (Retribusi Paguyuban & Wilayah RW)', fee: 100000, desc: 'Retribusi paguyuban komplek, koordinasi keamanan wilayah RW dan administrasi' },
                      ])}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                    >
                      ⭐ Khusus Grand Sariwangi (RT 250rb + RW 100rb)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailedComponents([
                        { id: 'tf-1', name: '1. Iuran Pengamanan Pos Satpam 24 Jam', fee: 150000, desc: 'Operasional pos satpam, barrier gate RFID, HT, dan pemantauan keamanan' },
                        { id: 'tf-2', name: '2. Iuran Pengangkutan Sampah & Kebersihan', fee: 50000, desc: 'Armada pengangkutan sampah dinas LH dan pemotongan rumput berkala' },
                        { id: 'tf-3', name: '3. Dana Kas Operasional & Perawatan Komplek', fee: 50000, desc: 'Penerangan jalan PJU, genset darurat, dan sarana balai warga' },
                      ])}
                      className="px-2 py-1 bg-surface hover:bg-canvas text-ink-muted border border-border font-bold rounded-lg text-[10px] inline-flex items-center gap-1 active:scale-95 transition-all"
                    >
                      Standar 3 Pos (250rb)
                    </button>
                  </div>

                  {/* Editable Component Rows */}
                  <div className="space-y-2.5">
                    {detailedComponents.map((item, idx) => (
                      <div key={item.id || idx} className="p-3 bg-canvas rounded-xl border border-border space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...detailedComponents];
                              updated[idx].name = e.target.value;
                              setDetailedComponents(updated);
                            }}
                            placeholder="Nama Komponen Pos (Contoh: 1. Iuran Satpam 24 Jam)"
                            className="flex-1 p-1.5 bg-surface border border-border rounded-lg text-xs font-bold text-ink"
                          />
                          {detailedComponents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setDetailedComponents(detailedComponents.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="Hapus Pos Iuran Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => {
                            const updated = [...detailedComponents];
                            updated[idx].desc = e.target.value;
                            setDetailedComponents(updated);
                          }}
                          placeholder="Keterangan alokasi/peruntukan biaya bagi warga"
                          className="w-full p-1.5 bg-surface border border-border rounded-lg text-[11px] text-ink-muted"
                        />

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                          <span className="text-[11px] font-bold text-ink-muted">Tarif Per Unit Rumah (Rp):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.fee}
                              onChange={(e) => {
                                const updated = [...detailedComponents];
                                updated[idx].fee = Number(e.target.value) || 0;
                                setDetailedComponents(updated);
                              }}
                              className="w-36 p-1.5 bg-surface border border-border rounded-lg text-right font-mono font-bold text-primary-700 text-xs"
                            />
                            <span className="text-[11px] font-mono text-ink-muted font-bold min-w-[75px] text-right">
                              {formatRupiah(item.fee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Calculation Card for Detailed */}
                  <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-primary-950 text-xs uppercase tracking-wide">
                          Total Akumulasi Komponen Pos
                        </h4>
                        <span className="px-2 py-0.5 bg-white text-primary-900 rounded font-mono font-bold text-[10px] border border-primary-200">
                          14 Kavling Klaster
                        </span>
                      </div>
                      <p className="text-[11px] text-primary-800 mt-0.5">
                        Dihitung otomatis dari akumulasi {detailedComponents.length} pos iuran di atas.
                      </p>
                      <p className="text-[10px] text-primary-700 mt-0.5">
                        Akumulasi potensi penerimaan kas: 14 unit × {formatRupiah(totalDetailedTariff)} = <strong>{formatRupiah(totalDetailedTariff * 14)} / bulan</strong>.
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xl font-black font-mono text-primary-900 block">
                        {formatRupiah(totalDetailedTariff)} <span className="text-xs font-normal text-primary-700">/ bln</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                        Total {detailedComponents.length} Pos Terinci
                      </span>
                    </div>
                  </div>

                  {/* Clarification Alert */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Penting untuk Diketahui Pengurus:</strong> Rincian di atas adalah tarif yang dibebankan per unit rumah warga ({formatRupiah(totalDetailedTariff)}/rumah), <em>bukan</em> total pengeluaran belanja/vendor klaster (seperti tagihan vendor sampah klaster Rp 350.000 atau gaji satpam Rp 2.450.000). Total pengeluaran operasional klaster dikelola pada menu <strong>Pengeluaran & Buku Kas (`/admin/expenses`)</strong>.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo *</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink font-mono"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Tiap tgl {dueDay} per bulan</span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Masa Tenggang (Hari)</label>
                <input
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kode QRIS NMID Nasional</label>
                <input
                  type="text"
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-ink block">Nama Bank Kas Paguyuban *</label>
                  <span className="text-[10px] text-ink-muted">Preset Cepat:</span>
                </div>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  placeholder="Contoh: Bank Syariah Indonesia (BSI) / GoPay Kas"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    { label: '🌙 BSI', val: 'Bank Syariah Indonesia (BSI)' },
                    { label: '🌙 Muamalat', val: 'Bank Muamalat Indonesia' },
                    { label: '🌙 BCA Syariah', val: 'BCA Syariah' },
                    { label: '💳 GoPay Kas', val: 'GoPay Kas Paguyuban' },
                    { label: '💳 DANA Bisnis', val: 'DANA Bisnis Kas Paguyuban' },
                    { label: '🏦 BCA', val: 'Bank Central Asia (BCA)' },
                    { label: '🏦 Mandiri', val: 'Bank Mandiri' },
                    { label: '🏦 BRI', val: 'Bank Rakyat Indonesia (BRI)' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBankName(p.val)}
                      className="px-2 py-0.5 bg-surface hover:bg-canvas border border-border rounded text-[10px] font-semibold text-ink-muted hover:text-ink transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor Rekening Bank *</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-black text-ink text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Pemilik Rekening (Atas Nama) *</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION KHUSUS GRAND SARIWANGI: 6 KOMPONEN PENGELUARAN RIIL ================= */}
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-ink">6 Komponen Pos Alokasi Pengeluaran Riil Kas</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                      Khusus Komplek Grand Sariwangi
                    </span>
                  </div>
                  <p className="text-ink-muted text-[11px] mt-0.5">
                    Master pos beban kas operasional bulanan yang ditampilkan pada Laporan Transparansi Warga (<a href="/transparency" target="_blank" className="text-primary-600 underline font-semibold">/transparency</a>) & Modul Pengeluaran Kas (<a href="/admin/expenses" target="_blank" className="text-primary-600 underline font-semibold">/admin/expenses</a>).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExpenseComponents(GRAND_SARIWANGI_EXPENSE_COMPONENTS);
                    showToast('Preset 6 komponen pengeluaran Grand Sariwangi berhasil dipulihkan.');
                  }}
                  className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border text-ink-muted hover:text-ink font-bold rounded-xl text-[11px] inline-flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-2xs"
                  title="Kembalikan standar 6 pos Grand Sariwangi"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Standar Grand Sariwangi</span>
                </button>
                <a
                  href="/admin/expenses"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 font-bold rounded-xl text-[11px] inline-flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-2xs"
                >
                  <span>Buka Kas Pengeluaran</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Total Calculation & Cashflow Projection Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-canvas border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                    AKUMULASI ANGGARAN RUTIN BULANAN
                  </span>
                  <span className="text-[11px] font-bold text-ink-muted">6 Pos Resmi</span>
                </div>
                <p className="text-xs text-emerald-950 font-bold">
                  Total anggaran operasional rutin: <strong>{formatRupiah(totalExpenseBudget)} / bulan</strong>
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Dengan tarif iuran {formatRupiah(totalTariff)} × 14 unit rumah = <strong>{formatRupiah(totalTariff * 14)}</strong> potensi kas masuk/bulan.
                  {totalTariff * 14 >= totalExpenseBudget ? (
                    <span className="text-emerald-700 font-bold ml-1">
                      (Surplus Kas: +{formatRupiah(totalTariff * 14 - totalExpenseBudget)}/bulan untuk tabungan cadangan komplek)
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold ml-1">
                      (Defisit Kas Operasional: -{formatRupiah(totalExpenseBudget - totalTariff * 14)}/bulan)
                    </span>
                  )}
                </p>
              </div>

              <div className="text-left md:text-right shrink-0 bg-surface/80 p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
                <span className="text-[10px] text-ink-muted uppercase font-bold block">Anggaran Beban Rutin</span>
                <span className="text-xl font-black font-mono text-emerald-900 block tabular-nums">
                  {formatRupiah(totalExpenseBudget)}
                  <span className="text-xs font-normal text-ink-muted"> / bln</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                  100% Tercover Kas Warga
                </span>
              </div>
            </div>

            {/* Matrix of the 6 Expense Components */}
            <div className="space-y-3">
              {expenseComponents.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 bg-canvas rounded-2xl border border-border space-y-3 hover:border-border-strong transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs">
                        {getExpenseIcon(item.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...expenseComponents];
                              updated[idx].name = e.target.value;
                              setExpenseComponents(updated);
                            }}
                            className="font-black text-xs text-ink bg-transparent border-b border-dashed border-border/80 hover:border-primary-500 focus:outline-hidden focus:border-primary-600 px-0.5 py-0.5"
                          />
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-ink-muted">
                            {item.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-primary-700 font-semibold block mt-0.5">
                          Pos Pengeluaran #{idx + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-bold text-ink-muted">Plafon Anggaran / Bln:</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 font-mono text-xs font-bold text-ink-muted">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={item.budgetAmount}
                          onChange={(e) => {
                            const updated = [...expenseComponents];
                            updated[idx].budgetAmount = Number(e.target.value) || 0;
                            setExpenseComponents(updated);
                          }}
                          className="w-36 pl-8 pr-2.5 py-1.5 bg-surface border border-border rounded-xl font-mono text-xs font-black text-emerald-800 text-right tabular-nums focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-border/60">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-bold text-ink-muted block">
                        Penerima Hak / Vendor / Rekening Tujuan
                      </label>
                      <input
                        type="text"
                        value={item.recipientOrVendor}
                        onChange={(e) => {
                          const updated = [...expenseComponents];
                          updated[idx].recipientOrVendor = e.target.value;
                          setExpenseComponents(updated);
                        }}
                        placeholder="Nama penerima dana atau pihak vendor"
                        className="w-full p-2 bg-surface border border-border rounded-xl text-xs font-semibold text-ink"
                      />
                    </div>

                    <div className="sm:col-span-7 space-y-1">
                      <label className="text-[10px] font-bold text-ink-muted block">
                        Keterangan Rincian Alokasi Pengeluaran
                      </label>
                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...expenseComponents];
                          updated[idx].desc = e.target.value;
                          setExpenseComponents(updated);
                        }}
                        placeholder="Rincian peruntukan biaya belanja / pengeluaran kas"
                        className="w-full p-2 bg-surface border border-border rounded-xl text-xs text-ink-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanatory Info Card */}
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-[11px] text-emerald-950">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed space-y-1">
                <p>
                  <strong>Sinkronisasi Otomatis Transparansi & Pengeluaran:</strong> Keenam komponen pos di atas telah tersinkronisasi dengan master kategori database Neon DB (<code>expense_categories</code>). Setiap kali bendahara mencatat pengeluaran di <strong>/admin/expenses</strong> dengan salah satu pos ini, transaksi langsung tampil di <strong>Laporan Transparansi Warga (/transparency)</strong> lengkap dengan nota kuitansi dan persentase alokasinya.
                </p>
                <p className="text-emerald-900 font-medium">
                  💡 <strong>Fleksibilitas Saldo Kas Berjalan:</strong> Pos <strong>Dana Kesehatan Satpam</strong> (pagu referensi Rp 100.000) dan <strong>Dana Tak Terduga</strong> bersifat dinamis/fluktuatif (kadang kurang atau lebih dari pagu). Pengeluaran kebutuhan medis obat/vitamin dan dana dadakan darurat/acara dapat ditalangi langsung dari akumulasi <strong>Saldo Akhir Kas Berjalan</strong> komplek.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Keuangan & Bank'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: KEAMANAN & SATPAM (INTEGRASI DATA SATPAM) ================= */}
      {activeTab === 'security' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-ink">Keamanan Lingkungan, Barrier Gate & Personil Satpam</h3>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                      Roster Terintegrasi
                    </span>
                  </div>
                  <p className="text-ink-muted text-[11px]">
                    Hotline panggilan darurat warga terhubung otomatis ke personil satpam yang sedang bertugas hari ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/admin/security-gate"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-canvas hover:bg-surface text-ink font-bold text-[11px] rounded-xl border border-border shadow-2xs hover:border-purple-300 transition-all"
                >
                  <span>Buka Modul Keamanan & Jadwal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                </a>
              </div>
            </div>

            {/* Banner Integrasi Data Satpam */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-purple-900 text-xs">
                    Tersinkronisasi dengan Data Master Satpam ({guardsList.length} Personil Terdaftar)
                  </p>
                  <p className="text-purple-700 text-[11px] leading-relaxed">
                    Setiap pergantian petugas piket di bawah ini akan secara otomatis memperbarui nomor kontak darurat di <strong>Portal Warga (Tombol Hotline Darurat SOS)</strong> secara real-time.
                  </p>
                </div>
              </div>

              {guardsList.length >= 2 && (
                <button
                  type="button"
                  onClick={handleSwapGuards}
                  className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tukar Petugas Piket (Shift Swap)</span>
                </button>
              )}
            </div>

            {/* Grid 2 Kolom: Pos Utama & Pos Gerbang 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kolom 1: Pos Satpam Utama (24 Jam) */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="font-bold text-xs text-ink uppercase tracking-wide">Pos Satpam Utama (24 Jam)</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Pos Gerbang Depan
                  </span>
                </div>

                {/* Pilih Petugas Bertugas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink block">
                      Petugas yang Sedang Bertugas (Hari Ini) *
                    </label>
                    <span className="text-[10px] text-ink-muted">Ambil dari Data Satpam</span>
                  </div>
                  <select
                    value={selectedGuardId}
                    onChange={(e) => handleSelectGuard1(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    {guardsList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.fullName} — {g.phone} ({g.role})
                      </option>
                    ))}
                    <option value="__CUSTOM__">✏️ Kustom / Hotline Pos Terpisah (Manual)</option>
                  </select>
                </div>

                {/* Nomor Telepon / WhatsApp Bertugas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink block">
                      Hotline Pos Satpam Utama (24 Jam) *
                    </label>
                    {activeGuard ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terisi otomatis dari {activeGuard.fullName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-medium">Nomor hotline kustom</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={securityPhone}
                      onChange={(e) => setSecurityPhone(e.target.value)}
                      required
                      placeholder="08xx-xxxx-xxxx"
                      className="flex-1 p-2.5 bg-surface border border-border rounded-xl font-mono font-black text-ink text-sm"
                    />
                    <a
                      href={`https://wa.me/62${securityPhone.replace(/^0/, '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${activeGuard ? activeGuard.fullName : 'Satpam'}, ini uji kontak hotline keamanan komplek WargaHub.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all active:scale-95"
                      title="Tes Hubungi via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${securityPhone.replace(/[^0-9]/g, '')}`}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-all active:scale-95"
                      title="Uji Panggilan Telepon"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Live Preview Kartu Identitas Petugas Aktif */}
                {activeGuard ? (
                  <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center border border-purple-200">
                        {activeGuard.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-ink text-xs">{activeGuard.fullName}</p>
                        <p className="text-[10px] text-ink-muted">
                          NIP: {activeGuard.nip} • {activeGuard.shift || 'Piket 24 Jam'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      🟢 Sedang Dinas
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                    Hotline saat ini menggunakan nomor mandiri (pos tetap).
                  </div>
                )}
              </div>

              {/* Kolom 2: Pos Gerbang 2 (Belakang) / Petugas Pendamping */}
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h4 className="font-bold text-xs text-ink uppercase tracking-wide">Pos Gerbang 2 / Cadangan</h4>
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                    Pos Gerbang Belakang
                  </span>
                </div>

                {/* Pilih Petugas Pendamping */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink block">
                      Petugas Jaga Gerbang 2 / Pendamping
                    </label>
                    <span className="text-[10px] text-ink-muted">Ambil dari Data Satpam</span>
                  </div>
                  <select
                    value={selectedGuardId2}
                    onChange={(e) => handleSelectGuard2(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl font-bold text-ink text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {guardsList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.fullName} — {g.phone} ({g.role})
                      </option>
                    ))}
                    <option value="__CUSTOM__">✏️ Kustom / Hotline Pos Terpisah (Manual)</option>
                  </select>
                </div>

                {/* Nomor Telepon Gerbang 2 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-ink block">
                      Hotline Pos Gerbang 2 (Belakang)
                    </label>
                    {activeGuard2 ? (
                      <span className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Terisi otomatis dari {activeGuard2.fullName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-ink-muted">Opsional</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={securityPhone2}
                      onChange={(e) => setSecurityPhone2(e.target.value)}
                      placeholder="08xx-xxxx-xxxx"
                      className="flex-1 p-2.5 bg-surface border border-border rounded-xl font-mono text-ink text-sm font-bold"
                    />
                    <a
                      href={`https://wa.me/62${securityPhone2.replace(/^0/, '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${activeGuard2 ? activeGuard2.fullName : 'Satpam'}, ini uji kontak hotline keamanan komplek WargaHub.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all active:scale-95"
                      title="Tes Hubungi via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${securityPhone2.replace(/[^0-9]/g, '')}`}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-all active:scale-95"
                      title="Uji Panggilan Telepon"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Live Preview Kartu Identitas Petugas 2 */}
                {activeGuard2 ? (
                  <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center border border-blue-200">
                        {activeGuard2.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-ink text-xs">{activeGuard2.fullName}</p>
                        <p className="text-[10px] text-ink-muted">
                          NIP: {activeGuard2.nip} • {activeGuard2.shift || 'Piket Bergilir'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      🟡 Siaga / Cadangan
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-canvas rounded-xl border border-border text-ink-muted text-[11px]">
                    Hotline Gerbang 2 menggunakan nomor pos statis atau manual.
                  </div>
                )}
              </div>
            </div>

            {/* SOP Portal, Tamu & Patroli */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h4 className="font-bold text-xs text-ink">Standar Operasional Prosedur (SOP) Portal & Ronda</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Malam Penutupan Portal</label>
                  <input
                    type="text"
                    value={gateClosingTime}
                    onChange={(e) => setGateClosingTime(e.target.value)}
                    placeholder="Contoh: 23:00"
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs font-bold"
                  />
                  <span className="text-[10px] text-ink-muted block mt-1">Akses gerbang dikunci penuh</span>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Masa Berlaku QR Pass Tamu (Jam)</label>
                  <input
                    type="number"
                    value={guestPassExpiryHours}
                    onChange={(e) => setGuestPassExpiryHours(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs font-bold"
                  />
                  <span className="text-[10px] text-ink-muted block mt-1">Durasi izin akses barcode tamu</span>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Frekuensi Patroli Malam</label>
                  <input
                    type="text"
                    value={patrolFrequency}
                    onChange={(e) => setPatrolFrequency(e.target.value)}
                    placeholder="Contoh: Setiap 2 Jam"
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-xs font-bold"
                  />
                  <span className="text-[10px] text-ink-muted block mt-1">Jadwal keliling klaster</span>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Maks. Kendaraan Tamu / Kavling</label>
                  <input
                    type="number"
                    value={maxGuestCars}
                    onChange={(e) => setMaxGuestCars(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs font-bold"
                  />
                  <span className="text-[10px] text-ink-muted block mt-1">Kapasitas parkir jalan komplek</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-ink-muted flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>
                Petugas piket aktif saat ini:{' '}
                <strong className="text-ink font-bold">
                  {activeGuard ? `${activeGuard.fullName} (${securityPhone})` : securityPhone}
                </strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Konfigurasi Keamanan'}</span>
            </button>
          </div>
        </form>
      )}


      {/* ================= TAB 5: KEBERSIHAN & SAMPAH ================= */}
      {activeTab === 'sanitation' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Truck className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Standar Operasional Pengangkutan Sampah Komplek</h3>
                <p className="text-ink-muted text-[11px]">Jadwal operasional motor Tossa door-to-door dan pengelolaan TPS3R.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Hari Pengangkutan Sampah Organik/Basah</label>
                <input
                  type="text"
                  value={organicWasteDays}
                  onChange={(e) => setOrganicWasteDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Hari Pengangkutan Sampah Anorganik/Daur Ulang</label>
                <input
                  type="text"
                  value={inorganicWasteDays}
                  onChange={(e) => setInorganicWasteDays(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Jam Operasional Pengambilan Sampah</label>
                <input
                  type="text"
                  value={collectionHours}
                  onChange={(e) => setCollectionHours(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi TPS Penampungan Sementara</label>
                <input
                  type="text"
                  value={tpsLocation}
                  onChange={(e) => setTpsLocation(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Kebersihan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 6: NOTIFIKASI & WHATSAPP ================= */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Bell className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Pengaturan Notifikasi & Broadcast WhatsApp</h3>
                <p className="text-ink-muted text-[11px]">Konfigurasi bot pengirim pesan WhatsApp dan jadwal reminder otomatis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Pengirim Broadcast WA</label>
                <input
                  type="text"
                  value={waSenderName}
                  onChange={(e) => setWaSenderName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nomor WhatsApp Admin Pengurus</label>
                <input
                  type="text"
                  value={adminWaPhone}
                  onChange={(e) => setAdminWaPhone(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Jadwal Pengingat Tagihan Otomatis</label>
              <input
                type="text"
                value={autoReminderDays}
                onChange={(e) => setAutoReminderDays(e.target.value)}
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
              />
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Notifikasi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 7: PENGURUS INTI ================= */}
      {activeTab === 'committee' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs animate-in fade-in duration-150">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-black text-sm text-ink">Susunan & Kontak Pengurus Inti Paguyuban</h3>
                <p className="text-ink-muted text-[11px]">Nama dan nomor kontak pengurus yang tercantum di surat pengumuman resmi dan kuitansi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">
                  Nama Kepala Komplek / Ketua Paguyuban *
                </label>
                <input
                  type="text"
                  value={kepalaKomplekName}
                  onChange={(e) => {
                    setKepalaKomplekName(e.target.value);
                    if (!rwHeadName || rwHeadName === kepalaKomplekName) setRwHeadName(e.target.value);
                  }}
                  required
                  placeholder="Contoh: Bpk. Ir. H. Bambang Sutrisno"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
                <span className="text-[10px] text-ink-muted block mt-0.5">Tercantum resmi pada tanda tangan dokumen Invoice & Kuitansi WargaHub</span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">No. WhatsApp Kepala Komplek / RW *</label>
                <input
                  type="text"
                  value={rwHeadPhone}
                  onChange={(e) => setRwHeadPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
                <span className="text-[10px] text-ink-muted block mt-0.5">Kontak resmi konfirmasi & layanan warga</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Sekretaris Paguyuban</label>
                <input
                  type="text"
                  value={secretaryName}
                  onChange={(e) => setSecretaryName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Pengelola Kas / Admin Paguyuban (Fleksibel)
                </label>
                <input
                  type="text"
                  value={treasurerName}
                  onChange={(e) => setTreasurerName(e.target.value)}
                  placeholder="Yahya Nursidik"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
                <span className="text-[10px] text-ink-muted block mt-0.5">
                  Khusus Komplek Grand Sariwangi diisi <strong>Yahya Nursidik</strong> (Pengelola Kas/Sistem karena tidak ada bendahara formal).
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-ink block mb-1">Danru Keamanan Satpam</label>
                <input
                  type="text"
                  value={securityCoordName}
                  onChange={(e) => setSecurityCoordName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Koordinator Kebersihan Lingkungan</label>
                <input
                  type="text"
                  value={cleaningCoordName}
                  onChange={(e) => setCleaningCoordName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl border border-border shadow-card flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengurus'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 8: PUSAT DIREKTORI INPUT DATA LENGKAP ================= */}
      {activeTab === 'inputs_directory' && (
        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-primary-50/70 border border-primary-200 rounded-3xl space-y-1">
            <h3 className="font-black text-sm text-primary-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Pusat Panduan & Akses Cepat Form Input Data WargaHub
            </h3>
            <p className="text-primary-800 leading-relaxed">
              Berikut adalah peta jalan lengkap letak form penambahan dan pengeditan data di seluruh modul WargaHub. Klik pada tombol kartu untuk langsung membuka form input:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inputModulesDirectory.map((group) => (
              <div key={group.category} className={`p-5 rounded-3xl border shadow-card space-y-3 ${group.color}`}>
                <h4 className="font-black text-xs tracking-wider uppercase flex items-center justify-between border-b border-black/10 pb-2">
                  <span>{group.category}</span>
                  <span className="text-[10px] font-bold opacity-80">{group.items.length} Form Input</span>
                </h4>

                <div className="space-y-2.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.title}
                        href={item.url}
                        className="p-3 bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-md transition-all flex items-start justify-between gap-3 group text-ink"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-canvas border border-border flex items-center justify-center shrink-0 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="block text-xs font-bold text-ink group-hover:text-primary-700 transition-colors">
                              {item.title}
                            </strong>
                            <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB: MANAJEMEN AKUN & PASSWORD WARGA / STAFF ================= */}
      {activeTab === 'passwords' && (
        <UserPasswordSettingsTab />
      )}
    </div>
  );
};
