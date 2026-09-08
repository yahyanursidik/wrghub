import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  PhoneCall,
  Bot,
  Sparkles,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Copy,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Check,
  Share2,
  DollarSign,
  AlertTriangle,
  Hammer,
  Vote,
  Heart,
  Users,
  Home,
  Clock,
  Trash2,
  Edit3,
  CheckCircle,
  FileText,
  Building,
  Info,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings,
  Flame,
  Droplets,
  Calendar,
  Zap
} from 'lucide-react';
import {
  generateWhatsAppDuesReportText,
  generateWaMeLink,
  getIndonesianFormattedDate,
  type DuesReportPropertyItem
} from '../../lib/whatsapp-report';
import { formatRupiah } from '../../lib/format';

interface WAMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export interface WATemplate {
  id: string;
  title: string;
  category: 'KEUANGAN' | 'KEAMANAN' | 'LINGKUNGAN' | 'MUSYAWARAH' | 'SOSIAL' | 'LAINNYA';
  targetType: 'WARGA_INDIVIDU' | 'GRUP_WARGA' | 'PENGURUS' | 'SATPAM';
  description: string;
  templateText: string;
  tags: string[];
  isCustom?: boolean;
}

export interface WhatsAppBotSimulatorProps {
  initialProperties?: any[];
  allPeriods?: any[];
  allInvoices?: any[];
}

export const CLUSTER_PROPERTIES_FALLBACK = [
  { code: 'Kav A', ownerName: 'Pak Verial', residentName: 'Pak Verial', isRented: false },
  { code: 'Kav B', ownerName: 'Bu Shinta', residentName: 'Mahasiswa Polban', isRented: true },
  { code: 'Kav C', ownerName: 'Bu Rina', residentName: 'Bu Rina (Kosong)', isRented: false },
  { code: 'Kav D', ownerName: 'Pak Rieva', residentName: 'Pak Rieva', isRented: false },
  { code: 'Kav E', ownerName: 'Pak Budi', residentName: 'Pak Budi', isRented: false },
  { code: 'Kav F', ownerName: 'Pak Adi', residentName: 'Pa Anggia', isRented: true },
  { code: 'Kav G', ownerName: 'Pak Misael', residentName: 'Pak Misael', isRented: false },
  { code: 'Kav H', ownerName: 'Pak Fahmi Rizal', residentName: 'Pak Fahmi Rizal', isRented: false },
  { code: 'Kav I', ownerName: 'Bu Hj Yatti', residentName: 'Pak Yahya', isRented: true },
  { code: 'Kav J', ownerName: 'Bu Sofia P', residentName: 'Bu Sofia P (Kosong)', isRented: false },
  { code: 'Kav K', ownerName: 'Pak Eky', residentName: 'Pak Eky', isRented: false },
  { code: 'Kav L', ownerName: 'Pak Haji Ano', residentName: 'Pak Haji Ano', isRented: false },
  { code: 'Kav M', ownerName: 'Pak Dedi N / Pak Jaya', residentName: 'Pak Dedi N / Pak Jaya (Kosong)', isRented: false },
];

export const DEFAULT_TEMPLATES: WATemplate[] = [
  // --- KEUANGAN & IURAN ---
  {
    id: 'tpl-grand-sariwangi-dues-recap',
    title: 'Update Iuran & THR Penjaga Komplek Grand Sariwangi (Grup WA)',
    category: 'KEUANGAN',
    targetType: 'GRUP_WARGA',
    description: 'Laporan otomatis realtime untuk grup WhatsApp warga: update lunas, belum bayar (menunggak per bulan), dan tautan transparansi rutin.',
    tags: ['Grand Sariwangi', 'Iuran', 'THR', 'Rekap Warga', 'Lunas & Menunggak'],
    templateText: `📢 *INFO IURAN KOMPLEK DAN THR PENJAGA KOMPLEK GRAND SARIWANGI – UPDATE UNTUK IURAN PER TANGGAL {tgl_tempo}*\n\nWilujeng wengi/pagi Bapak/Ibu warga Grand Sariwangi, mugia Allah salawasna ngajagi urang sadaya dina kasehatan, kaberkahan, sareng kabagjaan.\n\nBerikut ini adalah update iuran bulanan Komplek Grand Sariwangi pada bulan *{bulan}*, belum semuanya terkumpul:\n\n{daftar_lunas_dan_tunggakan}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 *Catatan Khusus Pengurus:*\n{catatan_tambahan}\n\n━━━━━━━━━━━━━━━━━━━━\n📊 *Ringkasan Status Iuran:*\n• Partisipasi: *{ringkasan_partisipasi}*\n• Total Kas Terkumpul: *{ringkasan_kas}*\n• Sisa Tagihan Berjalan: *{ringkasan_sisa}*\n\n🌐 *Tautan Laporan Rutin & Transparansi:*\n👉 https://wrghub.vercel.app/transparency\n👉 Rekap Warga: https://wrghub.vercel.app/rekap-iuran\n_(Warga bisa login menyusul)_\n\n💳 *Rekening Kas Resmi Paguyuban:*\nBank Mandiri: *1300024446419*\na.n. *Paguyuban Grand Sariwangi*\n_(Pengurus tidak pernah menerima pembayaran iuran melalui rekening pribadi individu)_\n\nHatur nuhun atas perhatosan, partisipasi, sareng kerja sama sadaya warga demi kanyamanan, kabersihan, sareng kaamanan lingkungan komplek urang sadaya. 🙏🌿\n\nSalam silaturahmi,\n*Pengurus Paguyuban Grand Sariwangi*\n*(Kepala Komplek: Yahya Nursidik)*`,
  },
  {
    id: 'tpl-ipl-reminder',
    title: 'Pengingat Tagihan Iuran Bulanan (IPL)',
    category: 'KEUANGAN',
    targetType: 'WARGA_INDIVIDU',
    description: 'Pesan pengingat pembayaran iuran keamanan, kebersihan & IPL bulanan sebelum jatuh tempo.',
    tags: ['IPL', 'Iuran', 'Tagihan', 'Bulanan'],
    templateText: `Halo Bapak/Ibu {nama_warga} ({nomor_unit}) 🌿\n\nKami dari *Pengurus Paguyuban Warga* ingin menginformasikan tagihan *Iuran Pengelolaan Lingkungan (IPL)* untuk periode *{bulan}*:\n\n💵 *Nominal:* Rp {nominal}\n🗓️ *Jatuh Tempo:* {tgl_tempo}\n🏦 *Pembayaran Transfer:*\n*{no_rekening}*\n\n📲 *Konfirmasi & Kuitansi Digital:*\n{link_portal}\n\n{catatan_tambahan}\n\nTerima kasih atas partisipasi dan kerjasamanya menjaga kenyamanan komplek kita bersama. 🙏`,
  },
  {
    id: 'tpl-payment-receipt',
    title: 'Kuitansi & Konfirmasi Pembayaran Lunas',
    category: 'KEUANGAN',
    targetType: 'WARGA_INDIVIDU',
    description: 'Pemberitahuan resmi bahwa iuran bulanan telah diterima dan diverifikasi pengurus.',
    tags: ['Kuitansi', 'Lunas', 'Verifikasi', 'Bank/Kas'],
    templateText: `✅ *KONFIRMASI PEMBAYARAN IURAN LUNAS*\n\nKepada Yth: *{nama_warga}*\nUnit: *{nomor_unit}*\nPeriode: *{bulan}*\nJumlah Diterima: *Rp {nominal}*\nStatus: *LUNAS (TERVERIFIKASI PENGURUS)*\n\nKuitansi digital ber-QR Code resmi dan hak akses palang gerbang RFID Anda telah otomatis diperpanjang.\n\nUnduh kuitansi resmi: {link_portal}\n\nSalam hangat,\n*Pengurus Komplek Grand Sariwangi*`,
  },
  {
    id: 'tpl-overdue-warning',
    title: 'Surat Peringatan / Teguran Tunggakan Iuran',
    category: 'KEUANGAN',
    targetType: 'WARGA_INDIVIDU',
    description: 'Pemberitahuan persuasif untuk unit yang memiliki tunggakan iuran lebih dari 1 bulan.',
    tags: ['Tunggakan', 'SP', 'Peringatan', 'Bendahara'],
    templateText: `Yth. Bapak/Ibu {nama_warga}\nPemilik/Penghuni *{nomor_unit}*\n\nBerdasarkan rekapitulasi buku kas pengurus, tercatat terdapat *tunggakan iuran IPL* untuk unit Anda sebesar *Rp {nominal}* (Periode: {bulan}).\n\nDemi kelancaran operasional pos satpam 24 jam dan kebersihan lingkungan, kami mohon bantuan Bapak/Ibu untuk menyelesaikan kewajiban tersebut melalui rekening:\n*{no_rekening}*\n\nApabila memerlukan klarifikasi atau penyesuaian jadwal, silakan hubungi pengurus di nomor ini.\n\nTerima kasih atas perhatian dan kerjasamanya. 🙏`,
  },
  {
    id: 'tpl-kas-transparency',
    title: 'Laporan Kas & Transparansi Keuangan Warga',
    category: 'KEUANGAN',
    targetType: 'GRUP_WARGA',
    description: 'Broadcast laporan kas masuk, kas keluar, dan saldo bank untuk transparansi seluruh warga.',
    tags: ['Transparansi', 'Kas', 'Laporan', 'Grup WA'],
    templateText: `📢 *LAPORAN TRANSPARANSI KAS WARGA BULAN {bulan}* 📊\n\nBapak/Ibu warga yang kami hormati, berikut ringkasan laporan keuangan komplek per bulan ini:\n\n💰 *Total Saldo Kas Bank:* Rp 2.865.000\n📈 *Pemasukan Iuran:* Rp 2.750.000\n📉 *Pengeluaran Operasional:* Rp 2.400.000\n\n🔍 Rincian seluruh nota belanja, gaji satpam/kebersihan, dan bukti transaksi dapat diakses secara transparan di portal:\n👉 https://wrghub.vercel.app/transparency\n\n*Pengurus Paguyuban Grand Sariwangi*`,
  },
  // --- KEAMANAN & GERBANG ---
  {
    id: 'tpl-security-guest',
    title: 'Pemberitahuan Tamu / Kurir di Pos Satpam',
    category: 'KEAMANAN',
    targetType: 'WARGA_INDIVIDU',
    description: 'Notifikasi satpam kepada warga saat ada kurir paket atau tamu datang berkunjung.',
    tags: ['Satpam', 'Tamu', 'Kurir', 'Gerbang'],
    templateText: `👮 *POS SATPAM GERBANG UTAMA* 🛡️\n\nSelamat siang Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nKami menginformasikan bahwa saat ini ada *{nama_tamu}* di Pos Gerbang Utama yang bermaksud mengantarkan kiriman / berkunjung ke rumah Anda.\n\nMohon konfirmasinya apakah diizinkan masuk ke area perumahan?\n\nTerima kasih,\n*Petugas Jaga Pos Satpam 24 Jam*`,
  },
  {
    id: 'tpl-security-panic',
    title: 'Peringatan Darurat Keamanan (Panic Alert)',
    category: 'KEAMANAN',
    targetType: 'GRUP_WARGA',
    description: 'Broadcast peringatan darurat keamanan, kebakaran, atau evakuasi darurat komplek.',
    tags: ['Darurat', 'Panic Button', 'Satpam', 'Waspada'],
    templateText: `🚨 *PERINGATAN DARURAT KEAMANAN KOMPLEK* 🚨\n\nPerhatian seluruh warga Komplek Grand Sariwangi!\nTelah dilaporkan insiden darurat di area sekitar *{nomor_unit}*.\n\nPetugas satpam saat ini sedang menuju ke lokasi.\n\nHarap warga tetap tenang, pastikan pintu & pagar rumah terkunci, dan hubungi pos keamanan jika melihat aktivitas mencurigakan:\n📞 *Hotline Satpam:* 0811-9988-7766\n\n*Komando Keamanan Lingkungan*`,
  },
  // --- LINGKUNGAN, RENOVASI & UTILITAS ---
  {
    id: 'tpl-renovation-permit',
    title: 'Surat Izin Masuk Tukang & Pekerja Bangunan',
    category: 'LINGKUNGAN',
    targetType: 'WARGA_INDIVIDU',
    description: 'Konfirmasi terbitnya izin kerja renovasi rumah dan nomor ID pass pekerja bangunan.',
    tags: ['Renovasi', 'Tukang', 'Izin', 'Jam Kerja'],
    templateText: `🔨 *SURAT IZIN KERJA RENOVASI RUMAH* 🏗️\n\nKepada Yth. {nama_warga} ({nomor_unit}),\n\nPermohonan izin pekerjaan renovasi rumah Anda telah *DISETUJUI PENGURUS* dengan rincian:\n\n👷 *Penanggung Jawab:* Mandor Tukang\n🗓️ *Masa Berlaku:* {tgl_tempo}\n⏰ *Jam Kerja Diizinkan:* 08:00 - 17:00 WIB (Senin s/d Sabtu)\n\n*Tata Tertib:* Pekerja wajib melapor ke pos satpam dan dilarang menumpuk material pasir di badan jalan warga.\n\n*Pengurus Lingkungan Grand Sariwangi*`,
  },
  {
    id: 'tpl-utility-outage',
    title: 'Pemberitahuan Pemadaman Listrik / Gangguan Air PAM',
    category: 'LINGKUNGAN',
    targetType: 'GRUP_WARGA',
    description: 'Informasi awal pemeliharaan gardu listrik PLN atau perbaikan pipa air bersih PAM.',
    tags: ['PLN', 'Air PAM', 'Pemadaman', 'Info Darurat'],
    templateText: `⚠️ *INFORMASI PEMELIHARAAN LISTRIK / AIR PAM* 💧\n\nBapak/Ibu warga komplek,\nBerdasarkan surat edaran dari instansi terkait, akan diadakan pekerjaan pemeliharaan jaringan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n⚡ *Dampak:* Pemadaman aliran listrik / penurunan tekanan air sementara\n\nMohon warga dapat melakukan persiapan cadangan air bersih dan pengisian daya perangkat.\n\n*Pengurus Lingkungan Grand Sariwangi*`,
  },
  // --- MUSYAWARAH & RAPAT ---
  {
    id: 'tpl-meeting-invitation',
    title: 'Undangan Rapat Warga / Musyawarah Komplek',
    category: 'MUSYAWARAH',
    targetType: 'GRUP_WARGA',
    description: 'Undangan resmi pertemuan tatap muka musyawarah pengurus dan seluruh kepala keluarga.',
    tags: ['Undangan', 'Musyawarah', 'Rapat', 'RT/RW'],
    templateText: `📜 *UNDANGAN MUSYAWARAH WARGA PAGUYUBAN* 🤝\n\nKepada Yth.\nBapak/Ibu Warga Komplek Grand Sariwangi,\n\nDengan hormat, kami mengundang kehadiran Bapak/Ibu pada agenda *{nama_acara}* yang akan diselenggarakan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n📍 *Tempat:* {lokasi_acara}\n📋 *Agenda Utama:* Evaluasi keamanan lingkungan, laporan keuangan kas, dan fasilitas umum.\n\nKehadiran dan sumbang saran Bapak/Ibu sangat berarti bagi kemajuan perumahan kita bersama.\n\n*Pengurus Paguyuban Grand Sariwangi*`,
  },
  // --- SOSIAL ---
  {
    id: 'tpl-welcome-neighbor',
    title: 'Sambutan Penghuni / Warga Baru',
    category: 'SOSIAL',
    targetType: 'GRUP_WARGA',
    description: 'Pesan penyambutan hangat bagi keluarga baru yang baru pindah ke lingkungan komplek.',
    tags: ['Warga Baru', 'Sambutan', 'Sosial', 'Guyub'],
    templateText: `🎉 *SELAMAT DATANG DI KOMPLEK GRAND SARIWANGI!* 🏡\n\nMari kita sambut hangat bergabungnya keluarga *{nama_warga}* yang menempati *{nomor_unit}*.\n\nSelamat datang di lingkungan yang aman, asri, dan guyub rukun. Semoga senantiasa betah, nyaman, dan penuh berkah tinggal bersama kita semua. 😊\n\n*Keluarga Besar Paguyuban Grand Sariwangi*`,
  },
  {
    id: 'tpl-condolence',
    title: 'Berita Duka Cita & Lelayu Warga',
    category: 'SOSIAL',
    targetType: 'GRUP_WARGA',
    description: 'Informasi lelayu/duka cita dan informasi takziyah serta pemakaman almarhum/ah.',
    tags: ['Duka Cita', 'Lelayu', 'Takziyah', 'Kemanusiaan'],
    templateText: `Inna lillahi wa inna ilaihi raji'un 🕯️\n\nTelah berpulang ke rahmatullah salah satu keluarga/warga kita tercinta:\n*Almarhum/Almarhumah dari keluarga {nama_warga} ({nomor_unit})*.\n\nRumah Duka: *{nomor_unit}*\nRencana Pemakaman: *{tgl_acara}*\n\nSegenap warga Komplek Grand Sariwangi turut berbelasungkawa yang sedalam-dalamnya. Semoga almarhum/ah husnul khatimah dan keluarga diberikan ketabahan. Aamiin ya rabbal 'alamin. 🙏`,
  },
];

export const WhatsAppBotSimulator: React.FC<WhatsAppBotSimulatorProps> = ({
  initialProperties = [],
  allPeriods = [],
  allInvoices = [],
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'simulator' | 'history' | 'settings'>('templates');

  // ================= TEMPLATES DIRECTORY STATE =================
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-grand-sariwangi-dues-recap');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination for Templates
  const [templatePage, setTemplatePage] = useState(1);
  const templatePageSize = 6;

  // Load Templates from LocalStorage if available
  const [templates, setTemplates] = useState<WATemplate[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_wa_templates');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_TEMPLATES;
  });

  // Save templates changes to localStorage
  const persistTemplates = (newTemplates: WATemplate[]) => {
    setTemplates(newTemplates);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wargahub_wa_templates', JSON.stringify(newTemplates));
      } catch (e) {}
    }
  };

  // Available Periods for Live System Sync
  const availablePeriods = useMemo(() => {
    const list: string[] = ['September 2026', 'Agustus 2026', 'Juli 2026', 'Juni 2026', 'Mei 2026', 'April 2026'];
    if (allPeriods && allPeriods.length > 0) {
      allPeriods.forEach((p: any) => {
        const pName = p.name || p.id;
        if (pName && !list.includes(pName)) {
          list.unshift(pName);
        }
      });
    }
    return list;
  }, [allPeriods]);

  // Selected Live Period (defaults to September 2026)
  const [selectedLivePeriod, setSelectedLivePeriod] = useState<string>('September 2026');

  // Dynamic Variable Replacements
  const [varRecipientPhone, setVarRecipientPhone] = useState('081234567890');
  const [varResidentName, setVarResidentName] = useState('Bpk. Budi Santoso');
  const [varHouseUnit, setVarHouseUnit] = useState('Kav I (Klaster 14 Kavling)');
  const [varMonthPeriod, setVarMonthPeriod] = useState('September 2026');
  const [varAmount, setVarAmount] = useState('250.000');
  const [varBankAccount, setVarBankAccount] = useState('Bank Mandiri 1300024446419 (PAGUYUBAN GRAND SARIWANGI)');
  const [varDueDate, setVarDueDate] = useState('25 September 2026');
  const [varPortalLink, setVarPortalLink] = useState('https://wrghub.vercel.app/');
  const [varEventName, setVarEventName] = useState('Musyawarah Warga Pemilihan RT/RW');
  const [varEventTime, setVarEventTime] = useState('Sabtu, 30 September 2026 • Pukul 19:30 WIB');
  const [varEventLocation, setVarEventLocation] = useState('Balai Warga Grand Sariwangi');
  const [varGuestName, setVarGuestName] = useState('Kurir Paket / Teknisi');
  const [varCustomNotes, setVarCustomNotes] = useState(
    'Bagi Bapak/Ibu yang belum menitipkan iuran atau dana sukarela THR penjaga komplek, mohon kerjasamanya agar dapat disatukan saat transfer ke rekening kas.'
  );

  // Modal Create/Edit Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formTplTitle, setFormTplTitle] = useState('');
  const [formTplCategory, setFormTplCategory] = useState<'KEUANGAN' | 'KEAMANAN' | 'LINGKUNGAN' | 'MUSYAWARAH' | 'SOSIAL' | 'LAINNYA'>('KEUANGAN');
  const [formTplTarget, setFormTplTarget] = useState<'WARGA_INDIVIDU' | 'GRUP_WARGA' | 'PENGURUS' | 'SATPAM'>('WARGA_INDIVIDU');
  const [formTplDesc, setFormTplDesc] = useState('');
  const [formTplText, setFormTplText] = useState('');
  const [tplSaving, setTplSaving] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WATemplate | null>(null);

  // Active Selected Template
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Is this a live dues recap broadcast template?
  const isLiveDuesTemplate = useMemo(() => {
    return activeTemplate.id === 'tpl-grand-sariwangi-dues-recap' || 
      (activeTemplate.category === 'KEUANGAN' && activeTemplate.targetType === 'GRUP_WARGA');
  }, [activeTemplate]);

  // Properties mapping for Grand Sariwangi
  const clusterProperties = useMemo(() => {
    if (initialProperties && initialProperties.length > 0) {
      const filtered = initialProperties
        .filter((p: any) => p.code && !p.code.toLowerCase().includes('dummy') && p.code !== 'A-99')
        .map((p: any) => {
          const isRented = p.occupancyStatus === 'RENTED' || p.isRented;
          const isVacant = p.occupancyStatus === 'VACANT';
          const resident = isRented
            ? (p.occupantName || p.currentResident || 'Penyewa')
            : (isVacant ? `${p.ownerName || p.legalOwner || 'Warga'} (Kosong)` : (p.occupantName || p.currentResident || p.ownerName || `Warga ${p.code}`));
          return {
            code: p.code,
            residentName: resident,
            ownerName: resident,
            isRented,
          };
        });
      if (filtered.length > 0) return filtered;
    }
    return CLUSTER_PROPERTIES_FALLBACK;
  }, [initialProperties]);

  // Realtime Live Calculation for the chosen period
  const liveReportData = useMemo(() => {
    const list = clusterProperties;
    const invMap = new Map<string, any>();
    
    if (allInvoices && allInvoices.length > 0) {
      allInvoices.forEach((inv: any) => {
        const pCode = (inv.propertyCode || '').toLowerCase();
        const pPeriod = inv.billingPeriodName || inv.billingPeriodId || '';
        if (pPeriod.toLowerCase().includes(selectedLivePeriod.toLowerCase()) || 
            (selectedLivePeriod.includes('September') && pPeriod.includes('09')) ||
            (selectedLivePeriod.includes('Agustus') && pPeriod.includes('08'))) {
          invMap.set(pCode, inv);
        }
      });
    }

    const items: DuesReportPropertyItem[] = list.map((p) => {
      const inv = invMap.get(p.code.toLowerCase());
      // Fallback status if invoice not in map: check known default status
      let isPaid = inv?.status === 'PAID';
      if (!inv) {
        // Fallback for demo periods
        if (selectedLivePeriod.includes('Agustus')) {
          isPaid = p.code !== 'Kav E' && p.code !== 'Kav J';
        } else if (selectedLivePeriod.includes('September')) {
          isPaid = !['Kav B', 'Kav C', 'Kav E', 'Kav J', 'Kav M'].includes(p.code);
        }
      }

      // Calculate historical arrears across all invoices
      let unpaidMonths = isPaid ? 0 : 1;
      let unpaidPeriods: string[] = isPaid ? [] : [selectedLivePeriod];

      if (allInvoices && allInvoices.length > 0) {
        const propAllInvs = allInvoices.filter(
          (ai: any) => (ai.propertyCode || '').toLowerCase() === p.code.toLowerCase() && ai.status !== 'PAID'
        );
        if (propAllInvs.length > 0) {
          unpaidMonths = propAllInvs.length;
          unpaidPeriods = propAllInvs.map((ai: any) => ai.billingPeriodName || ai.billingPeriodId);
        } else if (isPaid) {
          unpaidMonths = 0;
          unpaidPeriods = [];
        }
      } else {
        // Fallback arrears count
        if (p.code === 'Kav E') {
          unpaidMonths = 2;
          unpaidPeriods = ['Agustus 2026', 'September 2026'];
        } else if (p.code === 'Kav J') {
          unpaidMonths = 4;
          unpaidPeriods = ['Juni 2026', 'Juli 2026', 'Agustus 2026', 'September 2026'];
        }
      }

      return {
        code: p.code,
        residentName: p.residentName,
        isRented: p.isRented,
        status: isPaid ? 'PAID' : 'UNPAID',
        unpaidMonthsCount: unpaidMonths,
        unpaidPeriodNames: unpaidPeriods,
        monthlyRate: 250000,
        totalDueAmount: 250000 * (unpaidMonths || 1),
      };
    });

    const paidList = items.filter((i) => i.status === 'PAID');
    const unpaidList = items.filter((i) => i.status !== 'PAID');
    const totalUnits = items.length;
    const paidCount = paidList.length;
    const unpaidCount = unpaidList.length;
    const percentage = totalUnits > 0 ? ((paidCount / totalUnits) * 100).toFixed(1) : '0.0';
    const totalCollected = paidCount * 250000;
    const totalUnpaid = unpaidCount * 250000;

    return {
      items,
      paidList,
      unpaidList,
      totalUnits,
      paidCount,
      unpaidCount,
      percentage,
      totalCollected,
      totalUnpaid,
    };
  }, [clusterProperties, allInvoices, selectedLivePeriod]);

  // Generated Text: If live dues template, use live generator; otherwise use variable template
  const generatedMessageText = useMemo(() => {
    if (isLiveDuesTemplate) {
      return generateWhatsAppDuesReportText({
        periodName: selectedLivePeriod,
        reportDate: varDueDate || getIndonesianFormattedDate(),
        greetingTime: 'wengi/pagi',
        properties: liveReportData.items,
        bankName: 'Bank Mandiri',
        bankAccountNumber: '1300024446419',
        bankAccountHolder: 'Paguyuban Grand Sariwangi',
        transparencyUrl: 'https://wrghub.vercel.app/transparency',
        rekapUrl: 'https://wrghub.vercel.app/rekap-iuran',
        kepalaKomplekName: 'Yahya Nursidik',
        extraNotes: varCustomNotes,
      });
    }

    if (!activeTemplate) return '';
    let txt = activeTemplate.templateText;
    txt = txt.replace(/{nama_warga}/g, varResidentName);
    txt = txt.replace(/{nomor_unit}/g, varHouseUnit);
    txt = txt.replace(/{bulan}/g, varMonthPeriod);
    txt = txt.replace(/{nominal}/g, varAmount);
    txt = txt.replace(/{no_rekening}/g, varBankAccount);
    txt = txt.replace(/{tgl_tempo}/g, varDueDate);
    txt = txt.replace(/{link_portal}/g, varPortalLink);
    txt = txt.replace(/{nama_acara}/g, varEventName);
    txt = txt.replace(/{tgl_acara}/g, varEventTime);
    txt = txt.replace(/{lokasi_acara}/g, varEventLocation);
    txt = txt.replace(/{nama_tamu}/g, varGuestName);
    txt = txt.replace(/{catatan_tambahan}/g, varCustomNotes);
    return txt;
  }, [
    isLiveDuesTemplate,
    activeTemplate,
    selectedLivePeriod,
    liveReportData,
    varDueDate,
    varCustomNotes,
    varResidentName,
    varHouseUnit,
    varMonthPeriod,
    varAmount,
    varBankAccount,
    varPortalLink,
    varEventName,
    varEventTime,
    varEventLocation,
    varGuestName,
  ]);

  // Clean phone number for wa.me link
  const cleanPhoneNumber = useMemo(() => {
    let num = varRecipientPhone.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) {
      num = '62' + num.slice(1);
    }
    return num || '';
  }, [varRecipientPhone]);

  // Final wa.me Link
  const finalWaMeLink = useMemo(() => {
    return generateWaMeLink(generatedMessageText, cleanPhoneNumber);
  }, [generatedMessageText, cleanPhoneNumber]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessageText);
    setCopiedId('msg');
    showToast('Teks pesan WhatsApp berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalWaMeLink);
    setCopiedId('link');
    showToast('Tautan wa.me berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(finalWaMeLink, '_blank', 'noopener,noreferrer');
  };

  // Filter Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
      const matchSearch =
        t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(templateSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [templates, selectedCategory, templateSearch]);

  const totalTemplatePages = Math.max(1, Math.ceil(filteredTemplates.length / templatePageSize));
  const safeTplPage = Math.min(templatePage, totalTemplatePages);
  const paginatedTemplates = filteredTemplates.slice(
    (safeTplPage - 1) * templatePageSize,
    safeTplPage * templatePageSize
  );

  // Save Single Template (Create or Update)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTplSaving(true);
    try {
      const payload = {
        title: formTplTitle,
        category: formTplCategory,
        targetType: formTplTarget,
        description: formTplDesc,
        templateText: formTplText,
        tags: ['Custom', formTplCategory],
      };

      if (editingTemplateId) {
        const updated = templates.map((t) =>
          t.id === editingTemplateId ? { ...t, ...payload, id: editingTemplateId } : t
        );
        persistTemplates(updated);
        showToast(`Template "${formTplTitle}" berhasil diperbarui & disimpan.`);
      } else {
        const newTpl: WATemplate = {
          id: `tpl-${Date.now()}`,
          ...payload,
          isCustom: true,
        };
        const updated = [newTpl, ...templates];
        persistTemplates(updated);
        setSelectedTemplateId(newTpl.id);
        showToast(`Template baru "${formTplTitle}" berhasil dibuat.`);
      }
      setShowTemplateModal(false);

      // Background async call to API (non-blocking)
      fetch('/api/whatsapp/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan template WhatsApp.');
    } finally {
      setTplSaving(false);
    }
  };

  // Open Edit Template Modal (Works for ALL templates)
  const handleOpenEdit = (t: WATemplate) => {
    setEditingTemplateId(t.id);
    setFormTplTitle(t.title);
    setFormTplCategory(t.category);
    setFormTplTarget(t.targetType);
    setFormTplDesc(t.description);
    setFormTplText(t.templateText);
    setShowTemplateModal(true);
  };

  // Open Create Template Modal
  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    setFormTplTitle('');
    setFormTplCategory('KEUANGAN');
    setFormTplTarget('WARGA_INDIVIDU');
    setFormTplDesc('');
    setFormTplText(
      `Halo Bapak/Ibu {nama_warga} ({nomor_unit}) 🌿\n\nKami menginformasikan...\n\nSalam,\n*Pengurus Komplek*`
    );
    setShowTemplateModal(true);
  };

  // Handle Delete Template
  const handleConfirmDeleteTemplate = () => {
    if (!templateToDelete) return;
    const updated = templates.filter((t) => t.id !== templateToDelete.id);
    persistTemplates(updated);
    showToast(`Template "${templateToDelete.title}" berhasil dihapus.`);
    if (selectedTemplateId === templateToDelete.id) {
      setSelectedTemplateId(updated[0]?.id || '');
    }
    setTemplateToDelete(null);
  };

  // Reset to default templates
  const handleResetToDefaults = () => {
    if (window.confirm('Kembalikan seluruh template WhatsApp ke standar bawaan sistem?')) {
      persistTemplates(DEFAULT_TEMPLATES);
      setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
      showToast('Seluruh template berhasil dikembalikan ke standar awal.');
    }
  };

  // Category Badge Helper
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'KEUANGAN':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">💰 KEUANGAN</span>;
      case 'KEAMANAN':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">🚨 KEAMANAN</span>;
      case 'LINGKUNGAN':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">🔨 LINGKUNGAN</span>;
      case 'MUSYAWARAH':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">🗳️ MUSYAWARAH</span>;
      case 'SOSIAL':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">🎉 SOSIAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink text-[10px] font-bold">{cat}</span>;
    }
  };

  // ================= SIMULATOR BOT STATE =================
  const [messages, setMessages] = useState<WAMessage[]>([
    {
      id: 'wa-1',
      sender: 'bot',
      text: `Halo Bapak/Ibu Warga Komplek Grand Sariwangi! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Kas Bank / E-Wallet Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
      time: '14:20',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [phoneSim, setPhoneSim] = useState('0812-3456-7890 (Rumah Kav I)');

  const handleSendBot = (text: string) => {
    if (!text.trim()) return;

    const userMsg: WAMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    let reply = '';
    const clean = text.trim();

    if (clean === '1' || clean.toLowerCase().includes('iuran') || clean.toLowerCase().includes('tagihan')) {
      reply = `📄 *STATUS IURAN UNIT KAV I* 🌿\nPeriode: September 2026\nPenghuni: Pak Yahya\nStatus: *LUNAS (TERVERIFIKASI)* ✅\nNominal: Rp 250.000\n\nKuitansi digital: https://wrghub.vercel.app/transparency`;
    } else if (clean === '2' || clean.toLowerCase().includes('rekening') || clean.toLowerCase().includes('transfer')) {
      reply = `💳 *REKENING KAS RESMI PAGUYUBAN GRAND SARIWANGI*\nBank: Bank Mandiri\nNo. Rekening: *1300024446419*\na.n: *Paguyuban Grand Sariwangi*\n\n(Pengurus tidak pernah menerima iuran melalui rekening pribadi individu)`;
    } else if (clean === '3' || clean.toLowerCase().includes('satpam') || clean.toLowerCase().includes('darurat')) {
      reply = `🚨 *KONTAK DARURAT POS SATPAM*\nKomplek Grand Sariwangi (24 Jam):\nPetugas: Pa Adri Harry\n📞 Telepon / WA: 0812-7777-8888\nLokasi: Pos Gerbang Utama`;
    } else if (clean === '4' || clean.toLowerCase().includes('booking') || clean.toLowerCase().includes('balai')) {
      reply = `🏡 *RESERVASI BALAI WARGA & FASUM*\nFasilitas tersedia:\n- Balai Paguyuban Warga (Kapasitas 40 orang)\n- Lapangan Serbaguna\n\nSilakan ajukan melalui portal warga: https://wrghub.vercel.app/`;
    } else if (clean === '5' || clean.toLowerCase().includes('kas') || clean.toLowerCase().includes('transparansi')) {
      reply = `📊 *LAPORAN KAS GRAND SARIWANGI*\nSaldo Kas Aktif: Rp 2.865.000\nTotal Unit Lunas: 8 dari 13 Unit\n\nLihat bukti kuitansi & buku kas terbuka di:\nhttps://wrghub.vercel.app/transparency`;
    } else {
      reply = `Terima kasih telah menghubungi WhatsApp Komplek Grand Sariwangi. Pesan Anda akan diteruskan kepada Kepala Komplek (Yahya Nursidik) atau petugas piket pos satpam. 🙏`;
    }

    const botMsg: WAMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: reply,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
  };

  const handleResetBot = () => {
    setMessages([
      {
        id: 'wa-1',
        sender: 'bot',
        text: `Halo Bapak/Ibu Warga Komplek Grand Sariwangi! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Kas Bank / E-Wallet Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
        time: '14:20',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              Pusat Komunikasi WhatsApp & Template wa.me
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
              {templates.length} Template Siap Pakai
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Koleksi template pesan WhatsApp resmi komplek. Bisa diedit kapan saja, otomatis sinkron dengan data tagihan riil sistem (September, Agustus, dst), dan siap kirim via tautan <strong>wa.me</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'templates' && (
            <>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                Buat Template Baru
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="inline-flex items-center gap-1 px-3 py-2.5 bg-surface hover:bg-canvas text-ink-muted hover:text-ink text-xs font-bold rounded-xl border border-border transition-colors"
                title="Reset seluruh template ke bawaan pabrik"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Standar
              </button>
            </>
          )}
          {activeTab === 'simulator' && (
            <button
              type="button"
              onClick={handleResetBot}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-ink-muted" />
              Reset Percakapan
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'templates', label: 'Direktori & Generator Template wa.me', icon: MessageSquare, count: templates.length },
          { id: 'simulator', label: 'Simulator Bot Otomatis 24 Jam', icon: Bot },
          { id: 'history', label: 'Riwayat Broadcast & Log Pengiriman', icon: Clock, count: 24 },
          { id: 'settings', label: 'Pengaturan Gateway & No. Pengirim', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: DIREKTORI & GENERATOR TEMPLATE WA.ME ================= */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Filter, Kategori & Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari template (cth: iuran, THR, kuitansi, satpam, rapat)..."
                value={templateSearch}
                onChange={(e) => {
                  setTemplateSearch(e.target.value);
                  setTemplatePage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'Semua Kategori' },
                { id: 'KEUANGAN', label: '💰 Keuangan & Iuran' },
                { id: 'KEAMANAN', label: '🚨 Keamanan & Gate' },
                { id: 'LINGKUNGAN', label: '🔨 Lingkungan & Renovasi' },
                { id: 'MUSYAWARAH', label: '🗳️ Musyawarah & Rapat' },
                { id: 'SOSIAL', label: '🎉 Sosial & Warga' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setTemplatePage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-canvas border border-border text-ink hover:bg-surface'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Split: Template List & Live Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Template Cards List (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted px-1">
                <span>Pilih Template Pesan:</span>
                <span>{filteredTemplates.length} Template Ditemukan</span>
              </div>

              <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
                {paginatedTemplates.length === 0 ? (
                  <div className="p-8 text-center bg-surface rounded-2xl border border-border text-ink-muted text-xs">
                    Tidak ada template yang cocok dengan pencarian "{templateSearch}".
                  </div>
                ) : (
                  paginatedTemplates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                            : 'bg-surface border-border hover:border-emerald-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {getCategoryBadge(tpl.category)}
                            {tpl.id === 'tpl-grand-sariwangi-dues-recap' && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Live Auto
                              </span>
                            )}
                          </div>
                          
                          {/* Edit Button for EVERY Template */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(tpl);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-ink hover:text-amber-800 border border-border rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-[0.98] transition-all"
                              title="Edit Teks & Parameter Template Ini"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Edit</span>
                            </button>

                            {tpl.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateToDelete(tpl);
                                }}
                                className="p-1 text-ink-muted hover:text-red-600 rounded-md"
                                title="Hapus Template Kustom"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-ink">{tpl.title}</h4>
                          <p className="text-[11px] text-ink-muted line-clamp-2 mt-0.5">{tpl.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {tpl.tags.map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-canvas text-ink-muted rounded text-[9px] font-mono border border-border">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Template Pagination */}
              {totalTemplatePages > 1 && (
                <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs">
                  <span className="text-ink-muted">
                    Hal <strong className="text-ink">{safeTplPage}</strong> dari <strong className="text-ink">{totalTemplatePages}</strong>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={safeTplPage === 1}
                      onClick={() => setTemplatePage(safeTplPage - 1)}
                      className="p-1 rounded-lg border border-border bg-canvas text-ink disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={safeTplPage === totalTemplatePages}
                      onClick={() => setTemplatePage(safeTplPage + 1)}
                      className="p-1 rounded-lg border border-border bg-canvas text-ink disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Generator & Prominent Screen Preview (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Card 1: Top Inspector Header & Action Bar */}
              <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase">
                        Pratinjau & Generator wa.me
                      </span>
                      {isLiveDuesTemplate && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          ⚡ Sinkron Database Riil
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-base text-ink mt-0.5">{activeTemplate.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {getCategoryBadge(activeTemplate.category)}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(activeTemplate)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit Template Ini</span>
                    </button>
                  </div>
                </div>

                {/* Live System Control Bar (If Dues/Report Template) */}
                {isLiveDuesTemplate && (
                  <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-black text-emerald-950">
                          Pilih Bulan / Periode Update Laporan:
                        </span>
                      </div>
                      
                      {/* Period Switcher */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedLivePeriod}
                          onChange={(e) => {
                            setSelectedLivePeriod(e.target.value);
                            setVarDueDate(e.target.value.includes('Agustus') ? '25 Agustus 2026' : getIndonesianFormattedDate());
                          }}
                          className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 shadow-2xs focus:outline-hidden"
                        >
                          {availablePeriods.map((period) => (
                            <option key={period} value={period}>{period}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLivePeriod('September 2026');
                            setVarDueDate(getIndonesianFormattedDate());
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            selectedLivePeriod === 'September 2026'
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          September
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLivePeriod('Agustus 2026');
                            setVarDueDate('25 Agustus 2026');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            selectedLivePeriod === 'Agustus 2026'
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          Agustus
                        </button>
                      </div>
                    </div>

                    {/* Live KPI Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block">🟢 Sudah Lunas</span>
                        <strong className="text-emerald-900 text-sm">{liveReportData.paidCount} Unit</strong>
                        <span className="text-[10px] text-emerald-700 block">({liveReportData.percentage}%)</span>
                      </div>
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-rose-800 font-bold block">⏳ Belum Bayar</span>
                        <strong className="text-rose-700 text-sm">{liveReportData.unpaidCount} Unit</strong>
                        <span className="text-[10px] text-rose-600 block">Menunggak</span>
                      </div>
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block">💰 Kas Terkumpul</span>
                        <strong className="text-emerald-900 text-xs font-mono">{formatRupiah(liveReportData.totalCollected)}</strong>
                      </div>
                      <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-amber-800 font-bold block">📑 Total Kavling</span>
                        <strong className="text-ink text-sm">{liveReportData.totalUnits} Rumah</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Smartphone WhatsApp Screen (Prominently Visible Here!) */}
                <div className="bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-lg overflow-hidden">
                  {/* Phone Top Header */}
                  <div className="p-3.5 bg-[#075e54] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shadow-xs">
                        WH
                      </div>
                      <div>
                        <p className="font-bold text-xs leading-none">Pengurus Paguyuban Grand Sariwangi</p>
                        <p className="text-[9px] text-emerald-200 mt-0.5">
                          {isLiveDuesTemplate ? `Update Laporan: ${selectedLivePeriod}` : `Tujuan: ${varResidentName} (${cleanPhoneNumber || 'Grup'})`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-100 font-mono">
                      Live WhatsApp
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-[#d9fdd3] dark:bg-emerald-950 text-ink p-4 rounded-2xl rounded-tr-xs max-w-[95%] shadow-xs text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-[380px] overflow-y-auto">
                        {generatedMessageText}
                        <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-ink-muted">
                          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated wa.me URL Box & Action Buttons */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
                    <span className="text-[10px] text-ink-muted font-bold block">Tautan Langsung wa.me:</span>
                    <p className="text-xs font-mono text-emerald-700 truncate font-semibold select-all">
                      {finalWaMeLink}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="sm:col-span-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Buka di WhatsApp (wa.me)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="py-3 px-3 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedId === 'msg' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                      <span>Salin Pesan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-3 px-3 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      title="Salin tautan wa.me"
                    >
                      {copiedId === 'link' ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-ink-muted" />}
                      <span>Salin Link</span>
                    </button>
                  </div>
                </div>

                {/* Variable & Additional Settings Collapsible */}
                <div className="pt-3 border-t border-border space-y-3">
                  <h4 className="font-bold text-xs text-ink flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Kustomisasi Tanggal, Catatan & Variabel:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-ink block mb-1">Tanggal Laporan (Di Judul Pesan):</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={varDueDate}
                          onChange={(e) => setVarDueDate(e.target.value)}
                          placeholder="25 Agustus 2026"
                          className="flex-1 p-2 bg-canvas border border-border rounded-xl text-ink font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setVarDueDate('25 Agustus 2026')}
                          className="px-2 py-1 bg-canvas hover:bg-surface border border-border rounded-lg text-[10px] font-bold text-ink shrink-0"
                        >
                          25 Ags
                        </button>
                        <button
                          type="button"
                          onClick={() => setVarDueDate(getIndonesianFormattedDate())}
                          className="px-2 py-1 bg-canvas hover:bg-surface border border-border rounded-lg text-[10px] font-bold text-ink shrink-0"
                        >
                          Hari Ini
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-ink block mb-1">Nomor WhatsApp Tujuan (Opsional):</label>
                      <input
                        type="text"
                        placeholder="Kosongkan untuk broadcast grup"
                        value={varRecipientPhone}
                        onChange={(e) => setVarRecipientPhone(e.target.value)}
                        className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-medium"
                      />
                      <span className="text-[10px] text-ink-muted">Kosongkan untuk broadcast ke grup WhatsApp warga.</span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-ink block mb-1">Catatan Tambahan / Info THR Penjaga Komplek:</label>
                      <textarea
                        rows={2}
                        value={varCustomNotes}
                        onChange={(e) => setVarCustomNotes(e.target.value)}
                        placeholder="Ketik catatan tambahan pengurus..."
                        className="w-full p-2 bg-canvas border border-border rounded-xl text-ink font-medium text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SIMULATOR BOT OTOMATIS 24 JAM ================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-3 text-xs">
              <h3 className="font-bold text-sm text-ink">Simulasi Perintah Cepat</h3>
              <p className="text-ink-muted text-[11px]">Klik salah satu tombol di bawah untuk menguji respon bot WhatsApp:</p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendBot('1')}
                  className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
                >
                  <span>1️⃣ Cek Status Iuran</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendBot('2')}
                  className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
                >
                  <span>2️⃣ Rekening Kas Paguyuban</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendBot('3')}
                  className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
                >
                  <span>3️⃣ Kontak Satpam Darurat</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendBot('4')}
                  className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
                >
                  <span>4️⃣ Booking Balai Warga</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendBot('5')}
                  className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
                >
                  <span>5️⃣ Info Kas & Transparansi</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </button>
              </div>
            </div>

            <div className="md:col-span-2 bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl flex flex-col h-[520px] overflow-hidden">
              <div className="p-3.5 bg-[#075e54] text-surface flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                    WH
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">WargaHub Bot Komplek</h3>
                    <p className="text-[10px] text-emerald-200">Online 24 Jam • AI Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetBot}
                    className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                    title="Bersihkan chat"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[#d9fdd3] dark:bg-emerald-900 text-ink rounded-tr-xs'
                          : 'bg-surface text-ink border border-border rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-ink-muted">
                        <span>{m.time}</span>
                        {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-canvas border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan atau angka menu..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendBot(inputText);
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-ink focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSendBot(inputText)}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: RIWAYAT BROADCAST ================= */}
      {activeTab === 'history' && (
        <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Log Broadcast & Riwayat Pesan Terkirim
            </h3>
            <span className="text-xs text-ink-muted">Total 24 Catatan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-ink-muted font-semibold">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Template</th>
                  <th className="p-3">Tujuan</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { time: '08 Sep 2026, 20:30', tpl: 'Update Iuran & THR Penjaga Komplek', target: 'Grup Warga Grand Sariwangi', type: 'GRUP', status: 'TERKIRIM' },
                  { time: '25 Ags 2026, 19:15', tpl: 'Pengingat Tagihan Iuran Bulanan', target: 'Kav E (Pak Budi)', type: 'INDIVIDU', status: 'DIBACA' },
                  { time: '20 Ags 2026, 09:00', tpl: 'Kuitansi & Pembayaran Lunas', target: 'Kav I (Pak Yahya)', type: 'INDIVIDU', status: 'DIBACA' },
                  { time: '15 Ags 2026, 14:00', tpl: 'Undangan Rapat Musyawarah', target: 'Grup Warga Grand Sariwangi', type: 'GRUP', status: 'TERKIRIM' },
                ].map((log, idx) => (
                  <tr key={idx} className="hover:bg-canvas/60">
                    <td className="p-3 font-mono text-ink-muted">{log.time}</td>
                    <td className="p-3 font-bold text-ink">{log.tpl}</td>
                    <td className="p-3 text-ink">{log.target}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-canvas text-ink text-[10px] font-bold border border-border">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PENGATURAN GATEWAY ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-surface p-6 rounded-3xl border border-border shadow-card space-y-4 text-xs">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            Pengaturan Integrasi WhatsApp Gateway
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-ink block mb-1">Nomor Pengirim Resmi Paguyuban:</label>
              <input
                type="text"
                defaultValue="0812-3456-7890 (Kepala Komplek: Yahya Nursidik)"
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Mode Pengiriman Default:</label>
              <select className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold">
                <option>Tautan Langsung wa.me (Tanpa Biaya API / Tanpa Provider Pihak Ketiga)</option>
                <option>WhatsApp Business Cloud API (Meta Official)</option>
                <option>Fonnte / Wwebjs Gateway</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
              💡 <strong>Rekomendasi WargaHub:</strong> Mode tautan <code>wa.me</code> adalah cara termudah, teraman, dan 100% gratis untuk mengirim pesan langsung ke warga atau menyebarkan laporan ke grup WhatsApp warga tanpa risiko nomor terblokir.
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT TEMPLATE ================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink">
                {editingTemplateId ? 'Edit Template WhatsApp' : 'Buat Template WhatsApp Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Template *</label>
                <input
                  type="text"
                  required
                  value={formTplTitle}
                  onChange={(e) => setFormTplTitle(e.target.value)}
                  placeholder="Contoh: Update Iuran & THR Penjaga Komplek"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori</label>
                  <select
                    value={formTplCategory}
                    onChange={(e) => setFormTplCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="KEUANGAN">💰 Keuangan & Iuran</option>
                    <option value="KEAMANAN">🚨 Keamanan & Gate</option>
                    <option value="LINGKUNGAN">🔨 Lingkungan & Renovasi</option>
                    <option value="MUSYAWARAH">🗳️ Musyawarah & Rapat</option>
                    <option value="SOSIAL">🎉 Sosial & Warga</option>
                    <option value="LAINNYA">📌 Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Target Pengiriman</label>
                  <select
                    value={formTplTarget}
                    onChange={(e) => setFormTplTarget(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-semibold"
                  >
                    <option value="GRUP_WARGA">Grup Warga (Broadcast)</option>
                    <option value="WARGA_INDIVIDU">Warga Individu / Per Unit</option>
                    <option value="PENGURUS">Pengurus Komplek</option>
                    <option value="SATPAM">Petugas Satpam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formTplDesc}
                  onChange={(e) => setFormTplDesc(e.target.value)}
                  placeholder="Keterangan fungsi template ini..."
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-ink">Isi Pesan Template *</label>
                  <span className="text-[10px] text-ink-muted">Gunakan *tebal*, _miring_, & tag {`{tag}`}</span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={formTplText}
                  onChange={(e) => setFormTplText(e.target.value)}
                  className="w-full p-3 bg-canvas border border-border rounded-xl font-mono text-xs text-ink leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-border rounded-xl text-ink hover:bg-canvas font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tplSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs active:scale-[0.98] transition-all"
                >
                  {tplSaving ? 'Menyimpan...' : 'Simpan Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4">
            <h3 className="font-black text-base text-ink">Hapus Template?</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus template <strong>"{templateToDelete.title}"</strong>?
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-ink hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTemplate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
