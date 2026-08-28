import React, { useState, useMemo } from 'react';
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
  Calendar
} from 'lucide-react';

interface WAMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface WATemplate {
  id: string;
  title: string;
  category: 'KEUANGAN' | 'KEAMANAN' | 'LINGKUNGAN' | 'MUSYAWARAH' | 'SOSIAL' | 'LAINNYA';
  targetType: 'WARGA_INDIVIDU' | 'GRUP_WARGA' | 'PENGURUS' | 'SATPAM';
  description: string;
  templateText: string;
  tags: string[];
  isCustom?: boolean;
}

export const WhatsAppBotSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'simulator' | 'history' | 'settings'>('templates');

  // ================= TEMPLATE DIRECTORY & GENERATOR STATE =================
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-ipl-reminder');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination for Templates
  const [templatePage, setTemplatePage] = useState(1);
  const templatePageSize = 6;

  // Dynamic Variable Replacements
  const [varRecipientPhone, setVarRecipientPhone] = useState('081234567890');
  const [varResidentName, setVarResidentName] = useState('Bpk. Budi Santoso');
  const [varHouseUnit, setVarHouseUnit] = useState('Rumah A-17 (Blok A)');
  const [varMonthPeriod, setVarMonthPeriod] = useState('Agustus 2026');
  const [varAmount, setVarAmount] = useState('750.000');
  const [varBankAccount, setVarBankAccount] = useState('BCA 8830-1928-33 (PENGURUS KOMPLEK)');
  const [varDueDate, setVarDueDate] = useState('10 Agustus 2026');
  const [varPortalLink, setVarPortalLink] = useState('http://localhost:4321/');
  const [varEventName, setVarEventName] = useState('Musyawarah Warga Pemilihan RT/RW');
  const [varEventTime, setVarEventTime] = useState('Sabtu, 30 Agustus 2026 • Pukul 19:30 WIB');
  const [varEventLocation, setVarEventLocation] = useState('Balai Warga Taman Sejahtera');
  const [varGuestName, setVarGuestName] = useState('Kurir Paket / Teknisi');
  const [varCustomNotes, setVarCustomNotes] = useState('Harap konfirmasi jika sudah melakukan transfer.');

  // Modal Create/Edit Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formTplTitle, setFormTplTitle] = useState('');
  const [formTplCategory, setFormTplCategory] = useState<'KEUANGAN' | 'KEAMANAN' | 'LINGKUNGAN' | 'MUSYAWARAH' | 'SOSIAL' | 'LAINNYA'>('KEUANGAN');
  const [formTplTarget, setFormTplTarget] = useState<'WARGA_INDIVIDU' | 'GRUP_WARGA' | 'PENGURUS' | 'SATPAM'>('WARGA_INDIVIDU');
  const [formTplDesc, setFormTplDesc] = useState('');
  const [formTplText, setFormTplText] = useState('');
  const [tplSaving, setTplSaving] = useState(false);

  // Modal Delete Template State
  const [templateToDelete, setTemplateToDelete] = useState<WATemplate | null>(null);

  // Initial Pre-Built Templates Suite for all Events & Needs
  const [templates, setTemplates] = useState<WATemplate[]>([
    // --- KEUANGAN & IURAN ---
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
      description: 'Pemberitahuan resmi bahwa iuran bulanan telah diterima dan diverifikasi bendahara.',
      tags: ['Kuitansi', 'Lunas', 'Verifikasi', 'BCA'],
      templateText: `✅ *KONFIRMASI PEMBAYARAN IURAN LUNAS*\n\nKepada Yth: *{nama_warga}*\nUnit: *{nomor_unit}*\nPeriode: *{bulan}*\nJumlah Diterima: *Rp {nominal}*\nStatus: *LUNAS (TERVERIFIKASI BENDAHARA)*\n\nKuitansi digital ber-QR Code resmi dan hak akses palang gerbang RFID Anda telah otomatis diperpanjang.\n\nUnduh kuitansi resmi: {link_portal}\n\nSalam hangat,\n*Pengurus Komplek Taman Sejahtera*`,
    },
    {
      id: 'tpl-overdue-warning',
      title: 'Surat Peringatan / Teguran Tunggakan Iuran',
      category: 'KEUANGAN',
      targetType: 'WARGA_INDIVIDU',
      description: 'Pemberitahuan persuasif untuk unit yang memiliki tunggakan iuran lebih dari 1 bulan.',
      tags: ['Tunggakan', 'SP', 'Peringatan', 'Bendahara'],
      templateText: `Yth. Bapak/Ibu {nama_warga}\nPemilik/Penghuni *{nomor_unit}*\n\nBerdasarkan rekapitulasi buku kas pengurus, tercatat terdapat *tunggakan iuran IPL* untuk unit Anda sebesar *Rp {nominal}* (Periode: {bulan}).\n\nDemi kelancaran operasional pos satpam 24 jam dan kebersihan lingkungan, kami mohon bantuan Bapak/Ibu untuk menyelesaikan kewajiban tersebut melalui rekening:\n*{no_rekening}*\n\nApabila memerlukan klarifikasi atau penyesuaian jadwal, silakan hubungi Bendahara di nomor ini.\n\nTerima kasih atas perhatian dan kerjasamanya. 🙏`,
    },
    {
      id: 'tpl-kas-transparency',
      title: 'Laporan Kas & Transparansi Keuangan Warga',
      category: 'KEUANGAN',
      targetType: 'GRUP_WARGA',
      description: 'Broadcast laporan kas masuk, kas keluar, dan saldo bank untuk transparansi seluruh warga.',
      tags: ['Transparansi', 'Kas', 'Laporan', 'Grup WA'],
      templateText: `📢 *LAPORAN TRANSPARANSI KAS WARGA BULAN {bulan}* 📊\n\nBapak/Ibu warga yang kami hormati, berikut ringkasan laporan keuangan komplek per bulan ini:\n\n💰 *Total Saldo Kas Bank:* Rp 128.450.000\n📈 *Pemasukan Iuran:* Rp 64.500.000\n📉 *Pengeluaran Operasional:* Rp 39.150.000\n\n🔍 Rincian seluruh nota belanja, slip gaji satpam, dan bukti transaksi dapat diakses secara transparan dan terbuka di portal warga:\n👉 {link_portal}transparency\n\n*Pengurus Paguyuban Warga Bersama*`,
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
      templateText: `🚨 *PERINGATAN DARURAT KEAMANAN KOMPLEK* 🚨\n\nPerhatian seluruh warga Komplek Taman Sejahtera!\nTelah dilaporkan insiden darurat di area sekitar *{nomor_unit}*.\n\nPetugas satpam dan tim tanggap darurat saat ini sedang menuju ke lokasi.\n\nHarap warga tetap tenang, pastikan pintu & pagar rumah terkunci, dan hubungi pos keamanan jika melihat aktivitas mencurigakan:\n📞 *Hotline Satpam:* 0811-9988-7766\n\n*Komando Keamanan Lingkungan*`,
    },
    {
      id: 'tpl-rfid-blocked',
      title: 'Notifikasi Pembatasan Akses Palang Gerbang RFID',
      category: 'KEAMANAN',
      targetType: 'WARGA_INDIVIDU',
      description: 'Pemberitahuan pembatasan akses barrier gate otomatis akibat kendala teknis/tunggakan.',
      tags: ['RFID', 'Barrier Gate', 'Akses', 'Satpam'],
      templateText: `Pemberitahuan Sistem Barrier Gate RFID 🚗\n\nYth. Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nHak akses palang otomatis untuk kendaraan Anda saat ini berstatus *TIDAK AKTIF / TERBATAS*.\n\nUntuk mengaktifkan kembali stiker RFID dan pembukaan palang otomatis gerbang 1 & 2, mohon hubungi pengurus atau selesaikan administrasi di portal:\n👉 {link_portal}\n\nTerima kasih,\n*Sistem Manajemen Akses Gerbang Komplek*`,
    },

    // --- LINGKUNGAN, RENOVASI & UTILITAS ---
    {
      id: 'tpl-renovation-permit',
      title: 'Surat Izin Masuk Tukang & Pekerja Bangunan',
      category: 'LINGKUNGAN',
      targetType: 'WARGA_INDIVIDU',
      description: 'Konfirmasi terbitnya izin kerja renovasi rumah dan nomor ID pass pekerja bangunan.',
      tags: ['Renovasi', 'Tukang', 'Izin', 'Jam Kerja'],
      templateText: `🔨 *SURAT IZIN KERJA RENOVASI RUMAH* 🏗️\n\nKepada Yth. {nama_warga} ({nomor_unit}),\n\nPermohonan izin pekerjaan renovasi rumah Anda telah *DISETUJUI PENGURUS* dengan rincian:\n\n👷 *Penanggung Jawab:* Mandor Sugeng\n🗓️ *Masa Berlaku:* {tgl_tempo}\n⏰ *Jam Kerja Diizinkan:* 08:00 - 17:00 WIB (Senin s/d Sabtu)\n\n*Tata Tertib:* Pekerja wajib mengenakan rompi ID Pass tukang dan dilarang menumpuk material pasir di badan jalan aspal warga.\n\nDokumen izin: {link_portal}\n*Pengurus Lingkungan RT/RW*`,
    },
    {
      id: 'tpl-noise-warning',
      title: 'Teguran Kebisingan / Material Pasir Menutup Jalan',
      category: 'LINGKUNGAN',
      targetType: 'WARGA_INDIVIDU',
      description: 'Teguran sopan terkait pekerjaan bising di luar jam kerja atau tumpukan material.',
      tags: ['Teguran', 'Ketertiban', 'Material', 'Jalan'],
      templateText: `Selamat siang Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nKami menerima masukan dari tetangga sekitar terkait aktivitas pengerjaan / penumpukan material yang berada di depan rumah Anda.\n\nSesuai tata tertib perumahan, mohon bantuan untuk:\n1. Memindahkan material pasir/batu agar tidak mempersempit jalan papasan mobil warga.\n2. Menghentikan suara bising mesin di atas jam 17:00 WIB dan di hari Minggu.\n\nTerima kasih banyak atas pengertian dan toleransi antar tetangga. 🙏`,
    },
    {
      id: 'tpl-fogging-schedule',
      title: 'Jadwal Fogging Nyamuk DBD & Kerja Bakti',
      category: 'LINGKUNGAN',
      targetType: 'GRUP_WARGA',
      description: 'Pengumuman agenda pengasapan nyamuk demam berdarah dan kerja bakti lingkungan.',
      tags: ['Fogging', 'Kerja Bakti', 'DBD', 'Kesehatan'],
      templateText: `🌿 *PEMBERITAHUAN JADWAL FOGGING NYAMUK DBD* 🦟\n\nYth. Seluruh Warga Komplek Taman Sejahtera,\n\nGuna mengantisipasi penyebaran jentik nyamuk DBD di musim penghujan, pengurus akan melaksanakan kegiatan *Fogging & Kerja Bakti Saluran Air* pada:\n\n🗓️ *Hari/Tanggal:* {tgl_acara}\n📍 *Lokasi:* Seluruh Blok A, B, C, D dan Area Kavling\n\n*Himbauan Warga:*\n- Tutup makanan/minuman dan wadah air bersih.\n- Buka jendela dan pintu pagar saat petugas melintas.\n- Amankan hewan peliharaan di tempat yang aman.\n\n*Seksi Kebersihan & Kesehatan Lingkungan*`,
    },
    {
      id: 'tpl-utility-outage',
      title: 'Pemberitahuan Pemadaman Listrik / Gangguan Air PAM',
      category: 'LINGKUNGAN',
      targetType: 'GRUP_WARGA',
      description: 'Informasi awal pemeliharaan gardu listrik PLN atau perbaikan pipa air bersih PAM.',
      tags: ['PLN', 'Air PAM', 'Pemadaman', 'Info Darurat'],
      templateText: `⚠️ *INFORMASI PEMELIHARAAN LISTRIK / AIR PAM* 💧\n\nBapak/Ibu warga komplek,\nBerdasarkan surat edaran dari pihak instansi terkait, akan diadakan pekerjaan pemeliharaan jaringan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n⚡ *Dampak:* Pemadaman aliran listrik / penurunan tekanan air PAM sementara\n\nMohon warga dapat melakukan persiapan cadangan air bersih dan pengisian daya perangkat sebelumnya.\n\n*Pengurus Lingkungan & Sarana*`,
    },

    // --- MUSYAWARAH & RAPAT RT/RW ---
    {
      id: 'tpl-meeting-invitation',
      title: 'Undangan Rapat Warga / Musyawarah RT/RW',
      category: 'MUSYAWARAH',
      targetType: 'GRUP_WARGA',
      description: 'Undangan resmi pertemuan tatap muka musyawarah pengurus dan seluruh kepala keluarga.',
      tags: ['Undangan', 'Musyawarah', 'Rapat', 'RT/RW'],
      templateText: `📜 *UNDANGAN MUSYAWARAH WARGA PAGUYUBAN* 🤝\n\nKepada Yth.\nBapak/Ibu Warga Komplek Taman Sejahtera,\n\nDengan hormat, kami mengundang kehadiran Bapak/Ibu pada agenda *{nama_acara}* yang akan diselenggarakan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n📍 *Tempat:* {lokasi_acara}\n📋 *Agenda Utama:* Evaluasi keamanan lingkungan, laporan keuangan, dan rencana perbaikan aspal jalan.\n\nKehadiran dan sumbang saran Bapak/Ibu sangat berarti bagi kemajuan perumahan kita tercinta.\n\n*Ketua Paguyuban & Jajaran Pengurus*`,
    },
    {
      id: 'tpl-voting-broadcast',
      title: 'Ajakan Partisipasi E-Voting Pemilihan Pengurus',
      category: 'MUSYAWARAH',
      targetType: 'GRUP_WARGA',
      description: 'Broadcast ajakan menggunakan hak suara dalam pemilihan ketua komplek / musyawarah digital.',
      tags: ['Voting', 'E-Voting', 'Pemilihan', 'Demokrasi'],
      templateText: `🗳️ *PEMILIHAN KETUA PAGUYUBAN WARGA 2026-2029* 🇮🇩\n\nSetiap 1 unit rumah berhak memberikan 1 suara sah secara transparan dan rahasia melalui sistem *E-Voting WargaHub*.\n\nBatas waktu pemilihan akan ditutup pada: *{tgl_tempo}*.\n\nSilakan klik tautan berikut untuk melihat visi-misi calon dan berikan suara Anda sekarang:\n👉 {link_portal}admin/voting\n\n*Panitia Pemilihan Warga Mandiri*`,
    },

    // --- SOSIAL & KEMASYARAKATAN ---
    {
      id: 'tpl-welcome-neighbor',
      title: 'Sambutan Penghuni / Warga Baru',
      category: 'SOSIAL',
      targetType: 'GRUP_WARGA',
      description: 'Pesan penyambutan hangat bagi keluarga baru yang baru pindah ke lingkungan komplek.',
      tags: ['Warga Baru', 'Sambutan', 'Sosial', 'Guyub'],
      templateText: `🎉 *SELAMAT DATANG DI KOMPLEK TAMAN SEJAHTERA!* 🏡\n\nMari kita sambut hangat bergabungnya keluarga *{nama_warga}* yang menempati *{nomor_unit}*.\n\nSelamat datang di lingkungan yang aman, asri, dan guyub rukun. Semoga senantiasa betah, nyaman, dan penuh berkah tinggal bersama kita semua.\n\nBagi warga yang berpapasan, jangan sungkan untuk saling bertegur sapa ya! 😊\n\n*Keluarga Besar Paguyuban Warga*`,
    },
    {
      id: 'tpl-condolence',
      title: 'Berita Duka Cita & Lelayu Warga',
      category: 'SOSIAL',
      targetType: 'GRUP_WARGA',
      description: 'Informasi lelayu/duka cita dan informasi takziyah serta pemakaman almarhum/ah.',
      tags: ['Duka Cita', 'Lelayu', 'Takziyah', 'Kemanusiaan'],
      templateText: `Inna lillahi wa inna ilaihi raji'un 🕯️\n\nTelah berpulang ke rahmatullah salah satu keluarga/warga kita tercinta:\n*Almarhum/Almarhumah dari keluarga {nama_warga} ({nomor_unit})*.\n\nRumah Duka: *{nomor_unit}*\nRencana Pemakaman: *{tgl_acara}*\n\nSegenap warga Komplek Taman Sejahtera turut berbelasungkawa yang sedalam-dalamnya. Semoga almarhum/ah husnul khatimah dan keluarga yang ditinggalkan diberikan ketabahan dan keikhlasan. Aamiin ya rabbal 'alamin. 🙏`,
    },
  ]);

  // Active Selected Template
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Render text with variables replaced
  const generatedMessageText = useMemo(() => {
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
    activeTemplate,
    varResidentName,
    varHouseUnit,
    varMonthPeriod,
    varAmount,
    varBankAccount,
    varDueDate,
    varPortalLink,
    varEventName,
    varEventTime,
    varEventLocation,
    varGuestName,
    varCustomNotes,
  ]);

  // Clean phone number for wa.me link (replace 08xx with 628xx)
  const cleanPhoneNumber = useMemo(() => {
    let num = varRecipientPhone.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) {
      num = '62' + num.slice(1);
    }
    return num || '6281234567890';
  }, [varRecipientPhone]);

  // Final wa.me Link
  const finalWaMeLink = useMemo(() => {
    return `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(generatedMessageText)}`;
  }, [cleanPhoneNumber, generatedMessageText]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessageText);
    setCopiedId('msg');
    showToast('Teks pesan WhatsApp berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy wa.me Link to Clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalWaMeLink);
    setCopiedId('link');
    showToast('Tautan wa.me berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open Direct WhatsApp Link
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

  const totalFilteredTemplates = filteredTemplates.length;
  const totalTemplatePages = Math.max(1, Math.ceil(totalFilteredTemplates / templatePageSize));
  const safeTplPage = Math.min(templatePage, totalTemplatePages);
  const tplStartIndex = (safeTplPage - 1) * templatePageSize;
  const tplEndIndex = Math.min(tplStartIndex + templatePageSize, totalFilteredTemplates);
  const paginatedTemplates = filteredTemplates.slice(tplStartIndex, tplEndIndex);

  // Handle Save Template (Create / Update)
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

      const res = await fetch('/api/whatsapp/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (editingTemplateId) {
          setTemplates(
            templates.map((t) =>
              t.id === editingTemplateId ? { ...t, ...payload, id: editingTemplateId } : t
            )
          );
          showToast(`Template "${formTplTitle}" berhasil diperbarui.`);
        } else {
          const newTpl: WATemplate = {
            id: `tpl-${Date.now()}`,
            ...payload,
            isCustom: true,
          };
          setTemplates([newTpl, ...templates]);
          setSelectedTemplateId(newTpl.id);
          showToast(`Template baru "${formTplTitle}" berhasil dibuat.`);
        }
        setShowTemplateModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan template WhatsApp.');
    } finally {
      setTplSaving(false);
    }
  };

  // Handle Confirm Delete Template
  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      const res = await fetch('/api/whatsapp/templates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: templateToDelete.id,
          title: templateToDelete.title,
        }),
      });

      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
        showToast(`Template "${templateToDelete.title}" berhasil dihapus.`);
        if (selectedTemplateId === templateToDelete.id) {
          setSelectedTemplateId(templates[0]?.id || '');
        }
        setTemplateToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus template.');
    }
  };

  // Open Edit Template Modal
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

  // ================= SIMULATOR BOT STATE =================
  const [messages, setMessages] = useState<WAMessage[]>([
    {
      id: 'wa-1',
      sender: 'bot',
      text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
      time: '14:20',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [phoneSim, setPhoneSim] = useState('0812-3456-7890 (Rumah A-17)');

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

    if (clean === '1' || clean.toLowerCase().includes('tagihan') || clean.toLowerCase().includes('iuran')) {
      reply = `📋 *STATUS TAGIHAN IURAN WARGA*\n\n🏡 *Unit:* Rumah A-17 (Bpk. Budi Santoso)\n🗓️ *Periode:* Agustus 2026\n💵 *Nominal:* Rp 750.000\n✅ *Status:* *LUNAS (VERIFIED)*\n\nKuitansi digital ber-QR code dapat diunduh di portal warga: http://localhost:4321/`;
    } else if (clean === '2' || clean.toLowerCase().includes('rekening') || clean.toLowerCase().includes('bca')) {
      reply = `🏦 *REKENING RESMI IURAN KOMPLEK*\n\nBank: *Bank BCA (Bank Central Asia)*\nNo. Rekening: *8830-1928-33*\nAtas Nama: *PENGURUS KOMPLEK TAMAN SEJAHTERA*\nTarif Iuran: *Rp 750.000 / bulan*\n\nHarap simpan bukti transfer untuk konfirmasi di aplikasi.`;
    } else if (clean === '3' || clean.toLowerCase().includes('satpam') || clean.toLowerCase().includes('darurat')) {
      reply = `🚨 *KONTAK DARURAT 24 JAM*\n\n👮 *Pos Satpam Utama:* 0811-9988-7766\n👤 *Ketua RW 05:* 0812-3456-7890\n🔧 *Petugas Sarana:* 0813-8888-9999\n\nPetugas satpam siap membantu 24 jam non-stop.`;
    } else if (clean === '4' || clean.toLowerCase().includes('booking') || clean.toLowerCase().includes('balai')) {
      reply = `🏟️ *PEMESANAN FASILITAS UMUM*\n\nUntuk meminjam Balai Warga atau Lapangan Olahraga, silakan isi formulir tanggal & jam pemakaian di menu *Pesan Sarana* pada aplikasi WargaHub.`;
    } else if (clean === '5' || clean.toLowerCase().includes('kas') || clean.toLowerCase().includes('transparansi')) {
      reply = `📊 *RINGKASAN KAS BULAN AGUSTUS 2026*\n\n💰 *Total Kas BCA:* Rp 128.450.000\n📈 *Pemasukan:* Rp 64.500.000\n📉 *Pengeluaran:* Rp 39.150.000\n\nRincian nota belanja lengkap: http://localhost:4321/transparency`;
    } else {
      reply = `Maaf, pesan tidak dikenali. Ketik angka *1*, *2*, *3*, *4*, atau *5* untuk memilih menu layanan warga.`;
    }

    const botMsg: WAMessage = {
      id: `bot-${Date.now() + 1}`,
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
        text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
        time: '14:20',
      },
    ]);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'KEUANGAN':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">💰 KEUANGAN & IURAN</span>;
      case 'KEAMANAN':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-black border border-rose-200">🚨 KEAMANAN & GATE</span>;
      case 'LINGKUNGAN':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200">🔨 LINGKUNGAN & RENOVASI</span>;
      case 'MUSYAWARAH':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-black border border-indigo-200">🗳️ MUSYAWARAH & VOTING</span>;
      case 'SOSIAL':
        return <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-black border border-sky-200">🎉 SOSIAL & WARGA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink text-[10px] font-bold">{cat}</span>;
    }
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
            Koleksi template pesan resmi WhatsApp untuk segala keperluan komplek (Iuran, Kuitansi, SP Tunggakan, Satpam, Renovasi, Undangan Rapat, hingga Berita Duka). Siap kirim 1-klik via tautan <strong>wa.me</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'templates' && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Template Baru
            </button>
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
                placeholder="Cari template (cth: iuran, kuitansi, satpam, rapat, duka)..."
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

          {/* Main 2-Column Split: Template List & Live Generator + Phone Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Template Cards List (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted px-1">
                <span>Pilih Template Pesan:</span>
                <span>{filteredTemplates.length} Template Ditemukan</span>
              </div>

              <div className="space-y-2.5">
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
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                            : 'bg-surface border-border hover:border-emerald-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {getCategoryBadge(tpl.category)}
                          <div className="flex items-center gap-1">
                            {tpl.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(tpl);
                                }}
                                className="p-1 text-ink-muted hover:text-amber-700 rounded-md"
                                title="Edit Template"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {tpl.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateToDelete(tpl);
                                }}
                                className="p-1 text-ink-muted hover:text-red-600 rounded-md"
                                title="Hapus Template"
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

            {/* Right Column: Customizer Form & Live Smartphone WhatsApp Preview (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Variable Customizer Accordion */}
              <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase block">
                      Generator Tautan wa.me
                    </span>
                    <h3 className="font-black text-base text-ink">{activeTemplate.title}</h3>
                  </div>
                  {getCategoryBadge(activeTemplate.category)}
                </div>

                {/* Form Input Variables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-ink block mb-1">Nomor WhatsApp Penerima *</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={varRecipientPhone}
                      onChange={(e) => setVarRecipientPhone(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                    />
                    <span className="text-[10px] text-ink-muted">Format: 08xx / 628xx (Tujuan link wa.me)</span>
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">Nama Warga / Penerima *</label>
                    <input
                      type="text"
                      placeholder="Bpk. Budi Santoso"
                      value={varResidentName}
                      onChange={(e) => setVarResidentName(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">Nomor / Kode Unit Hunian *</label>
                    <input
                      type="text"
                      placeholder="Rumah A-17 (Blok A)"
                      value={varHouseUnit}
                      onChange={(e) => setVarHouseUnit(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">Periode Bulan / Waktu *</label>
                    <input
                      type="text"
                      placeholder="Agustus 2026"
                      value={varMonthPeriod}
                      onChange={(e) => setVarMonthPeriod(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                    />
                  </div>

                  {activeTemplate.category === 'KEUANGAN' && (
                    <>
                      <div>
                        <label className="font-bold text-ink block mb-1">Nominal Iuran / Tagihan (Rp)</label>
                        <input
                          type="text"
                          placeholder="750.000"
                          value={varAmount}
                          onChange={(e) => setVarAmount(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-ink block mb-1">Batas Jatuh Tempo</label>
                        <input
                          type="text"
                          placeholder="10 Agustus 2026"
                          value={varDueDate}
                          onChange={(e) => setVarDueDate(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-ink block mb-1">Rekening Resmi Pengurus</label>
                        <input
                          type="text"
                          placeholder="BCA 8830-1928-33 (PENGURUS KOMPLEK)"
                          value={varBankAccount}
                          onChange={(e) => setVarBankAccount(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                        />
                      </div>
                    </>
                  )}

                  {activeTemplate.category === 'MUSYAWARAH' && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-ink block mb-1">Nama Acara / Agenda Rapat</label>
                        <input
                          type="text"
                          placeholder="Musyawarah Warga Pemilihan RT/RW"
                          value={varEventName}
                          onChange={(e) => setVarEventName(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-ink block mb-1">Waktu / Jadwal Acara</label>
                        <input
                          type="text"
                          placeholder="Sabtu, 30 Agustus 2026 • 19:30 WIB"
                          value={varEventTime}
                          onChange={(e) => setVarEventTime(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-ink block mb-1">Lokasi Acara</label>
                        <input
                          type="text"
                          placeholder="Balai Warga Taman Sejahtera"
                          value={varEventLocation}
                          onChange={(e) => setVarEventLocation(e.target.value)}
                          className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                        />
                      </div>
                    </>
                  )}

                  {activeTemplate.category === 'KEAMANAN' && (
                    <div className="sm:col-span-2">
                      <label className="font-bold text-ink block mb-1">Nama Tamu / Kurir / Keterangan</label>
                      <input
                        type="text"
                        placeholder="Kurir Paket J&T / Teknisi AC"
                        value={varGuestName}
                        onChange={(e) => setVarGuestName(e.target.value)}
                        className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Generated wa.me Output & Action Buttons */}
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1">
                    <span className="text-[10px] text-ink-muted font-bold block">Tautan Langsung wa.me:</span>
                    <p className="text-xs font-mono text-emerald-700 truncate font-semibold select-all">
                      {finalWaMeLink}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Share2 className="w-4 h-4" />
                      Buka di WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="py-3 px-4 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedId === 'msg' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                      Salin Pesan WA
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-3 px-4 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedId === 'link' ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-ink-muted" />}
                      Salin Link wa.me
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Smartphone WhatsApp Screen Preview */}
              <div className="bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl overflow-hidden">
                {/* Phone Top Bar */}
                <div className="p-3 bg-[#075e54] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                      WH
                    </div>
                    <div>
                      <p className="font-bold text-xs leading-none">Pengurus Paguyuban Warga</p>
                      <p className="text-[9px] text-emerald-200 mt-0.5">Tujuan: {varResidentName} ({cleanPhoneNumber})</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-200 font-mono">Live Preview</span>
                </div>

                {/* Bubble Message Chat Box */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-[#d9fdd3] dark:bg-emerald-950 text-ink p-3.5 rounded-2xl rounded-tr-xs max-w-[90%] shadow-xs text-xs whitespace-pre-wrap leading-relaxed">
                      {generatedMessageText}
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-ink-muted">
                        <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
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
            {/* Quick Menu Buttons */}
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
                  <span>2️⃣ Rekening BCA Iuran</span>
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

            {/* WhatsApp Phone Mockup */}
            <div className="md:col-span-2 bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl flex flex-col h-[520px] overflow-hidden">
              <div className="p-3.5 bg-[#075e54] text-surface flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                    WH
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-tight flex items-center gap-1 text-white">
                      WargaHub Bot Official
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-emerald-200">Online • Layanan Warga 24 Jam</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-200 font-mono">{phoneSim}</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[#d9fdd3] dark:bg-emerald-900 text-ink rounded-tr-xs font-medium'
                          : 'bg-surface text-ink rounded-tl-xs border border-border/40'
                      }`}
                    >
                      {m.text}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-ink-muted">
                        <span>{m.time}</span>
                        {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendBot(inputText);
                }}
                className="p-3 bg-surface border-t border-border flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ketik angka (1-5) atau ketik pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-xl shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: RIWAYAT BROADCAST & LOG PENGIRIMAN ================= */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Log Riwayat Broadcast Pesan WhatsApp
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3 px-4">Waktu Terkirim</th>
                    <th className="py-3 px-4">Kategori / Template</th>
                    <th className="py-3 px-4">Tujuan / Penerima</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { time: '29 Agustus 2026, 00:10 WIB', tpl: 'Pengingat Tagihan Iuran Bulanan', recipient: 'Bpk. Budi Santoso (A-17)', status: 'TERKIRIM (DIBACA)' },
                    { time: '28 Agustus 2026, 17:45 WIB', tpl: 'Pemberitahuan Tamu di Pos Satpam', recipient: 'Ibu Ratna (SW1-12)', status: 'TERKIRIM (DIBACA)' },
                    { time: '28 Agustus 2026, 14:20 WIB', tpl: 'Surat Izin Kerja Renovasi Rumah', recipient: 'Bpk. Hendra Gunawan (A-01)', status: 'TERKIRIM (DIBACA)' },
                    { time: '27 Agustus 2026, 09:00 WIB', tpl: 'Laporan Transparansi Kas Warga', recipient: 'Grup WhatsApp Seluruh Warga (120 Unit)', status: 'TERSIAR (100% SUKSES)' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-canvas/60 text-ink">
                      <td className="py-3 px-4 font-mono">{row.time}</td>
                      <td className="py-3 px-4 font-bold text-ink">{row.tpl}</td>
                      <td className="py-3 px-4 font-semibold text-primary-700">{row.recipient}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-emerald-700 font-bold hover:underline">Detail Log</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PENGATURAN GATEWAY & NOMOR PENGIRIM ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-2xl animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <h3 className="font-black text-base text-ink flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              Konfigurasi WhatsApp Gateway Resmi
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Nomor WhatsApp Resmi Paguyuban Komplek</label>
                <input
                  type="text"
                  defaultValue="0811-9988-7766 (Official WhatsApp Gateway)"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Sender Name (Nama Pengirim)</label>
                <input
                  type="text"
                  defaultValue="WARGAHUB OFFICIAL - KOMPLEK TAMAN SEJAHTERA"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Webhook URL Otomatisasi Bot</label>
                <input
                  type="text"
                  defaultValue="http://localhost:4321/api/whatsapp/webhook"
                  readOnly
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink-muted select-all"
                />
              </div>
              <button
                type="button"
                onClick={() => showToast('Pengaturan gateway WhatsApp berhasil disimpan.')}
                className="py-2.5 px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT TEMPLATE WHATSAPP ================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingTemplateId ? 'Edit Template WhatsApp' : 'Buat Template Pesan Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Mendukung placeholder dinamis: {'{nama_warga}'}, {'{nomor_unit}'}, {'{bulan}'}, dll.</p>
                </div>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Template *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengingat Iuran Bulanan / Surat Izin Tukang"
                  value={formTplTitle}
                  onChange={(e) => setFormTplTitle(e.target.value)}
                  required
                  className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori *</label>
                  <select
                    value={formTplCategory}
                    onChange={(e) => setFormTplCategory(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KEUANGAN">💰 Keuangan & Iuran</option>
                    <option value="KEAMANAN">🚨 Keamanan & Gate</option>
                    <option value="LINGKUNGAN">🔨 Lingkungan & Renovasi</option>
                    <option value="MUSYAWARAH">🗳️ Musyawarah & Rapat</option>
                    <option value="SOSIAL">🎉 Sosial & Warga</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Target Penerima</label>
                  <select
                    value={formTplTarget}
                    onChange={(e) => setFormTplTarget(e.target.value as any)}
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="WARGA_INDIVIDU">Warga Perorangan (Individu)</option>
                    <option value="GRUP_WARGA">Grup Broadcast Seluruh Warga</option>
                    <option value="PENGURUS">Internal Pengurus</option>
                    <option value="SATPAM">Petugas Satpam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Penjelasan kapan template ini digunakan..."
                  value={formTplDesc}
                  onChange={(e) => setFormTplDesc(e.target.value)}
                  className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Format Pesan WhatsApp *</label>
                <textarea
                  rows={6}
                  placeholder={`Halo {nama_warga} ({nomor_unit}),\n\nIsi pesan WhatsApp resmi...\n\nSalam,\n*Pengurus*`}
                  value={formTplText}
                  onChange={(e) => setFormTplText(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs leading-relaxed"
                />
                <p className="text-[10px] text-ink-muted mt-1">
                  Tips Placeholder: <code className="text-emerald-700">{'{nama_warga}'}</code>, <code className="text-emerald-700">{'{nomor_unit}'}</code>, <code className="text-emerald-700">{'{bulan}'}</code>, <code className="text-emerald-700">{'{nominal}'}</code>, <code className="text-emerald-700">{'{no_rekening}'}</code>, <code className="text-emerald-700">{'{link_portal}'}</code>
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tplSaving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {tplSaving ? 'Menyimpan...' : editingTemplateId ? 'Perbarui Template' : 'Simpan Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS TEMPLATE ================= */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Template {templateToDelete.title}?</h3>
              <p className="text-xs text-ink-muted">
                Template pesan WhatsApp ini akan dihapus dari direktori template.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTemplate}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
