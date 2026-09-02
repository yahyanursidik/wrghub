import React, { useState, useMemo, useEffect } from 'react';
import {
  Megaphone,
  PlusCircle,
  Calendar,
  MapPin,
  Pin,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Send,
  Bell,
  Clock,
  LayoutGrid,
  List,
  Flame,
  Shield,
  Building,
  CreditCard,
  Wrench,
  HelpCircle,
  X
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'KEGIATAN' | 'MAINTENANCE' | 'KEUANGAN' | 'KEAMANAN' | 'INFO' | 'DARURAT';
  audience?: 'ALL' | 'BLOK_A_B' | 'BLOK_C_D' | 'KAVLING' | 'PEMILIK_SAJA' | 'PENYEWA_SAJA';
  scheduledAt: string | null;
  location: string | null;
  isPinned: boolean | null;
  authorName?: string;
  createdAt: string | null;
  viewCount?: number;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: string;
  description: string;
  targetParticipants: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
}

interface AnnouncementsManagerProps {
  initialAnnouncements: AnnouncementItem[];
  initialTab?: string;
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
  initialAnnouncements,
  initialTab = 'announcements',
}) => {
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

  const addDeletedIds = (key: string, ids: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      const updated = Array.from(new Set([...list, ...ids]));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save deleted IDs:', e);
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Announcements Data with Rich Seed
  const defaultAnnouncements: AnnouncementItem[] = [
    {
      id: 'ANN-001',
      title: 'Kerja Bakti Massal Kebersihan Lingkungan & Fogging Nyamuk DBD',
      content: 'Dihimbau kepada seluruh warga komplek untuk berpartisipasi dalam kegiatan kerja bakti pembersihan saluran got selokan depan rumah masing-masing dan area fasum taman. Dilanjutkan penyemprotan fogging oleh Puskesmas.',
      category: 'KEGIATAN',
      audience: 'ALL',
      scheduledAt: 'Minggu, 06 September 2026 • 07:00 WIB',
      location: 'Balai Warga & Seluruh Blok A-D Komplek',
      isPinned: true,
      authorName: 'Ketua RW 05 / Pengurus',
      createdAt: '2026-09-01T08:00:00Z',
      viewCount: 118,
    },
    {
      id: 'ANN-002',
      title: 'Pemberitahuan Pemadaman Sementara Pompa Air PDAM untuk Pembersihan Tandon',
      content: 'Sehubungan dengan jadwal kuras dan sterilisasi tandon penampungan air utama komplek, aliran air bersih akan dihentikan sementara selama 4 jam. Mohon warga menampung air secukupnya sebelum waktu pemadaman.',
      category: 'MAINTENANCE',
      audience: 'ALL',
      scheduledAt: 'Kamis, 10 September 2026 • 09:00 - 13:00 WIB',
      location: 'Tandon Utama Fasum Blok B',
      isPinned: true,
      authorName: 'Seksi Sarana & Prasarana',
      createdAt: '2026-09-02T06:30:00Z',
      viewCount: 94,
    },
    {
      id: 'ANN-003',
      title: 'Rekapitulasi Iuran Warga Periode September 2026 & Petunjuk QRIS',
      content: 'Tagihan iuran pengelolaan lingkungan (IPL & Kebersihan) bulan September telah terbit. Warga dapat menyetorkan melalui transfer Bank BCA Kas Paguyuban atau scan QRIS WargaHub. Laporan transparansi dapat diakses realtime.',
      category: 'KEUANGAN',
      audience: 'ALL',
      scheduledAt: 'Jatuh Tempo: 15 September 2026',
      location: 'Portal Online & Rekening Kas BCA',
      isPinned: false,
      authorName: 'Bendahara Paguyuban',
      createdAt: '2026-09-01T10:00:00Z',
      viewCount: 121,
    },
    {
      id: 'ANN-004',
      title: 'Pemberlakuan Jam Malam Barrier Gate & Kewajiban Tamu Lapor 1x24 Jam',
      content: 'Demi menjaga keamanan bersama, gerbang portal utama akan ditutup otomatis pada pukul 23:00 WIB. Tamu yang menginap wajib menyerahkan identitas ke Pos Satpam 1. Warga diharapkan membawa kartu RFID/QR Pass.',
      category: 'KEAMANAN',
      audience: 'ALL',
      scheduledAt: 'Berlaku Setiap Hari (23:00 - 05:00 WIB)',
      location: 'Pos Satpam Utama & Gerbang Portal 1',
      isPinned: false,
      authorName: 'Danru Keamanan Komplek',
      createdAt: '2026-08-28T14:00:00Z',
      viewCount: 105,
    },
    {
      id: 'ANN-005',
      title: 'Layanan Pemeriksaan Kesehatan Gratis Lansia & Balita Posyandu Mawar',
      content: 'Kegiatan posyandu bulanan meliputi penimbangan balita, imunisasi vitamin A, serta cek tensi, gula darah, dan kolesterol gratis bagi warga lansia komplek bersama tenaga medis Puskesmas Sariwangi.',
      category: 'KEGIATAN',
      audience: 'ALL',
      scheduledAt: 'Sabtu, 12 September 2026 • 08:30 WIB',
      location: 'Gedung Balai Warga Serbaguna',
      isPinned: false,
      authorName: 'Kader Posyandu PKK',
      createdAt: '2026-08-25T09:00:00Z',
      viewCount: 88,
    },
    {
      id: 'ANN-006',
      title: 'Peremajaan Lampu Sorot LED & Pengecatan Lapangan Badminton Fasum',
      content: 'Pekerjaan peremajaan 4 unit lampu LED sorot dan penggantian jaring net baru telah selesai dikerjakan oleh tim sarana. Lapangan kini siap digunakan kembali untuk olahraga bulutangkis warga malam hari.',
      category: 'MAINTENANCE',
      audience: 'ALL',
      scheduledAt: 'Selesai Dikerjakan',
      location: 'Lapangan Badminton Indoor Balai Warga',
      isPinned: false,
      authorName: 'Pengurus Sarana',
      createdAt: '2026-08-20T11:00:00Z',
      viewCount: 76,
    },
    {
      id: 'ANN-007',
      title: 'Himbauan Pemangkasan Ranting Pohon yang Menghalangi Kabel Listrik & PJU',
      content: 'Memasuki awal musim penghujan disertai angin kencang, pemilik rumah dihimbau merapikan dahan pohon di halaman depan yang berdekatan dengan jalur kabel PLN atau lampu penerangan jalan umum.',
      category: 'INFO',
      audience: 'ALL',
      scheduledAt: 'Sebelum 15 September 2026',
      location: 'Sepanjang Jalur Rumah Warga',
      isPinned: false,
      authorName: 'Seksi Lingkungan Hidup',
      createdAt: '2026-08-18T13:30:00Z',
      viewCount: 65,
    },
    {
      id: 'ANN-008',
      title: 'Peringatan Waspada Penipuan Mengatasnamakan Pengurus / Petugas Tagihan Air',
      content: 'Ditegaskan bahwa seluruh pembayaran iuran komplek HANYA dilakukan ke rekening resmi Paguyuban BCA atau QRIS resmi WargaHub. Petugas satpam dan kebersihan tidak pernah meminta uang tunai di rumah tanpa kuitansi berstempel.',
      category: 'DARURAT',
      audience: 'ALL',
      scheduledAt: 'Penting & Segera',
      location: 'Papan Informasi Warga',
      isPinned: false,
      authorName: 'Ketua Paguyuban',
      createdAt: '2026-08-15T08:00:00Z',
      viewCount: 112,
    }
  ];

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_announcements');
        const deletedStr = localStorage.getItem('wargahub_deleted_announcements');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((a: any) => !deletedIds.includes(a.id));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return defaultAnnouncements;
  });

  // 2. Agenda Items
  const defaultAgenda: AgendaItem[] = [
    {
      id: 'AGD-01',
      title: 'Kerja Bakti Massal & Fogging Pencegahan DBD',
      date: '2026-09-06',
      time: '07:00 - 11:30 WIB',
      location: 'Balai Warga & Lingkungan Blok A-D',
      organizer: 'Seksi Lingkungan & Pengurus RW',
      category: 'KERJA_BAKTI',
      description: 'Pembersihan got selokan serentak dan pengasapan fogging jentik nyamuk.',
      targetParticipants: 'Seluruh Kepala Keluarga (123 Rumah)'
    },
    {
      id: 'AGD-02',
      title: 'Pembersihan Tandon Air Utama Komplek',
      date: '2026-09-10',
      time: '09:00 - 13:00 WIB',
      location: 'Tandon Fasum Blok B',
      organizer: 'Tim Teknisi Sarana',
      category: 'MAINTENANCE',
      description: 'Pengurasan sedimen lumpur dan sterilisasi tangki penampung air.',
      targetParticipants: 'Teknisi & Warga Terdampak'
    },
    {
      id: 'AGD-03',
      title: 'Posyandu Balita & Pemeriksaan Kesehatan Lansia',
      date: '2026-09-12',
      time: '08:30 - 12:00 WIB',
      location: 'Gedung Balai Warga',
      organizer: 'Kader Posyandu PKK & Bidan Desa',
      category: 'KESEHATAN',
      description: 'Penimbangan balita, vitamin A, dan tes gula darah/tensi gratis lansia.',
      targetParticipants: 'Balita & Warga Usia 50+ Tahun'
    },
    {
      id: 'AGD-04',
      title: 'Rapat Evaluasi Triwulan 3 & Musyawarah Paguyuban',
      date: '2026-09-20',
      time: '19:30 - 22:00 WIB',
      location: 'Balai Warga Serbaguna',
      organizer: 'Pengurus Inti RW / RT',
      category: 'RAPAT',
      description: 'Laporan keuangan kas triwulan 3 dan perencanaan renovasi jalan paving.',
      targetParticipants: 'Perwakilan Warga Tiap Blok'
    },
    {
      id: 'AGD-05',
      title: 'Turnamen Badminton WargaHub Cup 2026',
      date: '2026-09-27',
      time: '08:00 - 17:00 WIB',
      location: 'Lapangan Badminton Balai Warga',
      organizer: 'Seksi Pemuda & Olahraga',
      category: 'OLAHRAGA',
      description: 'Pertandingan bulutangkis ganda putra dan ganda campuran antar blok.',
      targetParticipants: 'Seluruh Warga Pendaftar'
    }
  ];

  const [agendaList, setAgendaList] = useState<AgendaItem[]>(() =>
    getPersisted('wargahub_announcement_agenda', defaultAgenda)
  );

  // 3. WhatsApp Templates
  const defaultTemplates: BroadcastTemplate[] = [
    {
      id: 'TPL-01',
      name: 'Pengingat Pembayaran Iuran Bulanan',
      category: 'KEUANGAN',
      subject: 'PENGINGAT IURAN KOMPLEK WARGAHUB',
      content: 'Kepada Yth. Bapak/Ibu Warga Komplek,\n\nKami mengingatkan bahwa tagihan iuran bulan berjalan telah terbit. Mohon melakukan penyetoran sebelum tanggal 15 melalui transfer BCA 8830-1928-33 a.n PENGURUS KOMPLEK atau QRIS di portal WargaHub.\n\nTerima kasih atas partisipasi aktif Bapak/Ibu dalam menjaga kenyamanan komplek kita.'
    },
    {
      id: 'TPL-02',
      name: 'Undangan Kerja Bakti & Gotong Royong',
      category: 'KEGIATAN',
      subject: 'UNDANGAN KERJA BAKTI LINGKUNGAN',
      content: 'Kepada Yth. Seluruh Warga Komplek,\n\nMari bersama menjaga kebersihan dan kesehatan lingkungan komplek kita melalui Kerja Bakti Bersama pada:\n🗓️ Hari/Tgl: Minggu, [TANGGAL]\n⏰ Waktu: 07:00 WIB - Selesai\n📍 Titik Kumpul: Balai Warga\n\nPartisipasi dan kehadiran Bapak/Ibu sangat berarti bagi kenyamanan bersama.'
    },
    {
      id: 'TPL-03',
      name: 'Pemberitahuan Pemadaman Listrik / Air PDAM',
      category: 'MAINTENANCE',
      subject: 'INFO PEMADAMAN SEMENTARA',
      content: 'Pemberitahuan Penting untuk Warga Komplek:\n\nSehubungan dengan pekerjaan perbaikan dan pemeliharaan sarana, pasokan [AIR / LISTRIK] akan dihentikan sementara pada:\n🗓️ Waktu: [HARI, TANGGAL & JAM]\n📍 Wilayah Terdampak: [BLOK / SELURUH AREA]\n\nMohon warga dapat melakukan antisipasi terlebih dahulu. Mohon maaf atas ketidaknyamanannya.'
    },
    {
      id: 'TPL-04',
      name: 'Peringatan Keamanan & Tamu 1x24 Jam',
      category: 'KEAMANAN',
      subject: 'HIMBAUAN KEAMANAN & KETERTIBAN KOMPLEK',
      content: 'Menghimbau kepada seluruh warga demi keamanan bersama:\n1. Tamu yang berkunjung/menginap wajib melapor ke Pos Satpam.\n2. Pastikan pintu rumah, pagar, dan kendaraan terkunci ganda.\n3. Laporkan aktivitas mencurigakan ke Satpam Pos 1 (0812-3456-7801).\n\nMari bersama menjaga ketertiban lingkungan kita.'
    }
  ];

  const [templates, setTemplates] = useState<BroadcastTemplate[]>(() =>
    getPersisted('wargahub_broadcast_templates', defaultTemplates)
  );

  // Active Subtab matching query parameter
  const validTabs = ['announcements', 'agenda', 'templates', 'audience'];
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'agenda' | 'templates' | 'audience'>(
    validTabs.includes(initialTab) ? (initialTab as any) : 'announcements'
  );

  // View Mode: Cards vs Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [pinFilter, setPinFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'category'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Multi-Selection State for Bulk Actions
  const [selectedAnnIds, setSelectedAnnIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annToDelete, setAnnToDelete] = useState<AnnouncementItem | null>(null);
  const [previewAnn, setPreviewAnn] = useState<AnnouncementItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Announcement
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementItem['category']>('KEGIATAN');
  const [formAudience, setFormAudience] = useState<AnnouncementItem['audience']>('ALL');
  const [formSchedule, setFormSchedule] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formAuthor, setFormAuthor] = useState('Pengurus Komplek WargaHub');

  // KPIs
  const totalAnnouncementsCount = announcements.length;
  const pinnedAnnouncementsCount = announcements.filter(a => a.isPinned).length;
  const totalAgendaCount = agendaList.length;

  // Filtered & Sorted Announcements
  const filteredAnnouncements = useMemo(() => {
    let list = announcements.filter(a => {
      const matchSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.scheduledAt && a.scheduledAt.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchPin =
        pinFilter === 'ALL' ||
        (pinFilter === 'PINNED' && a.isPinned) ||
        (pinFilter === 'UNPINNED' && !a.isPinned);
      const matchAudience = audienceFilter === 'ALL' || a.audience === audienceFilter;

      return matchSearch && matchCategory && matchPin && matchAudience;
    });

    list.sort((a, b) => {
      // Pinned items stay on top unless sorted strictly
      if (sortBy === 'newest') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return list;
  }, [announcements, searchTerm, categoryFilter, pinFilter, audienceFilter, sortBy]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, pinFilter, audienceFilter, pageSize]);

  // Paginated Sliced Announcements
  const totalFilteredCount = filteredAnnouncements.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(startIndex, startIndex + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  // Handlers for Add / Edit Announcement
  const handleOpenCreateModal = () => {
    setEditingAnnId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('KEGIATAN');
    setFormAudience('ALL');
    setFormSchedule('');
    setFormLocation('Balai Warga Serbaguna');
    setFormIsPinned(false);
    setFormAuthor('Pengurus Komplek WargaHub');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (ann: AnnouncementItem) => {
    setEditingAnnId(ann.id);
    setFormTitle(ann.title);
    setFormContent(ann.content);
    setFormCategory(ann.category);
    setFormAudience(ann.audience || 'ALL');
    setFormSchedule(ann.scheduledAt || '');
    setFormLocation(ann.location || '');
    setFormIsPinned(Boolean(ann.isPinned));
    setFormAuthor(ann.authorName || 'Pengurus Komplek WargaHub');
    setShowCreateModal(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;
    setIsSaving(true);
    try {
      if (editingAnnId) {
        await fetch('/api/announcements/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAnnId,
            title: formTitle,
            content: formContent,
            category: formCategory,
            audience: formAudience,
            scheduledAt: formSchedule || null,
            location: formLocation || null,
            isPinned: formIsPinned,
          }),
        }).catch(() => {});

        const updated = announcements.map(a => {
          if (a.id === editingAnnId) {
            return {
              ...a,
              title: formTitle,
              content: formContent,
              category: formCategory,
              audience: formAudience,
              scheduledAt: formSchedule || null,
              location: formLocation || null,
              isPinned: formIsPinned,
              authorName: formAuthor,
            };
          }
          return a;
        });

        setAnnouncements(updated);
        savePersisted('wargahub_announcements', updated);
        showToast(`Pengumuman "${formTitle}" berhasil diperbarui.`);
        setShowCreateModal(false);
      } else {
        await fetch('/api/announcements/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content: formContent,
            category: formCategory,
            audience: formAudience,
            scheduledAt: formSchedule || undefined,
            location: formLocation || undefined,
            isPinned: formIsPinned,
            createdBy: formAuthor,
          }),
        }).catch(() => {});

        const newId = `ANN-${Date.now().toString().slice(-4)}`;
        const newAnn: AnnouncementItem = {
          id: newId,
          title: formTitle,
          content: formContent,
          category: formCategory,
          audience: formAudience,
          scheduledAt: formSchedule || null,
          location: formLocation || null,
          isPinned: formIsPinned,
          authorName: formAuthor,
          createdAt: new Date().toISOString(),
          viewCount: 1,
        };

        const updated = [newAnn, ...announcements];
        setAnnouncements(updated);
        savePersisted('wargahub_announcements', updated);
        showToast(`Pengumuman baru "${formTitle}" berhasil dipublikasikan.`);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses pengumuman.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (ann: AnnouncementItem) => {
    const nextPin = !ann.isPinned;
    try {
      await fetch('/api/announcements/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ann.id, isPinned: nextPin }),
      }).catch(() => {});

      const updated = announcements.map(a => a.id === ann.id ? { ...a, isPinned: nextPin } : a);
      setAnnouncements(updated);
      savePersisted('wargahub_announcements', updated);
      showToast(nextPin ? `Pengumuman "${ann.title}" disematkan ke paling atas.` : `Sematkan "${ann.title}" dilepas.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!annToDelete) return;
    try {
      await fetch('/api/announcements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: annToDelete.id, title: annToDelete.title }),
      }).catch(() => {});

      const updated = announcements.filter(a => a.id !== annToDelete.id);
      setAnnouncements(updated);
      savePersisted('wargahub_announcements', updated);
      addDeletedIds('wargahub_deleted_announcements', [annToDelete.id]);
      showToast(`Pengumuman "${annToDelete.title}" berhasil dihapus.`);
      setAnnToDelete(null);
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus pengumuman.');
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedAnnIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await fetch('/api/announcements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedAnnIds }),
      }).catch(() => {});

      const updated = announcements.filter(a => !selectedAnnIds.includes(a.id));
      setAnnouncements(updated);
      savePersisted('wargahub_announcements', updated);
      addDeletedIds('wargahub_deleted_announcements', selectedAnnIds);
      showToast(`${selectedAnnIds.length} pengumuman berhasil dihapus.`);
      setSelectedAnnIds([]);
      setShowBulkDeleteModal(false);
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Helper WhatsApp broadcast message generator
  const getWhatsAppBroadcastUrl = (ann: AnnouncementItem) => {
    const text = `📢 *PENGUMUMAN KOMPLEK WARGAHUB*\n\n*${ann.title.toUpperCase()}*\n\n${ann.content}\n\n${ann.scheduledAt ? '🗓️ *Waktu:* ' + ann.scheduledAt + '\n' : ''}${ann.location ? '📍 *Lokasi:* ' + ann.location + '\n' : ''}\nPengurus Komplek WargaHub\n_Tautan Portal:_ http://localhost:4321/warga`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Pengumuman', 'Judul', 'Kategori', 'Target Sasaran', 'Jadwal / Waktu', 'Lokasi', 'Disematkan', 'Penulis', 'Tanggal Publikasi'];
    const rows = announcements.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.category,
      a.audience || 'ALL',
      `"${(a.scheduledAt || '-').replace(/"/g, '""')}"`,
      `"${(a.location || '-').replace(/"/g, '""')}"`,
      a.isPinned ? 'YA' : 'TIDAK',
      `"${(a.authorName || 'Pengurus').replace(/"/g, '""')}"`,
      a.createdAt ? a.createdAt.slice(0, 10) : '-'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PENGUMUMAN_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pengumuman berhasil diekspor ke CSV.');
  };

  const getCategoryBadge = (cat: AnnouncementItem['category']) => {
    switch (cat) {
      case 'KEGIATAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200">🌿 Kegiatan & Kerja Bakti</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-200">🔧 Maintenance Sarana</span>;
      case 'KEUANGAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-[10px] border border-teal-200">💳 Info Iuran & Kas</span>;
      case 'KEAMANAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-200">🛡️ Keamanan & Portal</span>;
      case 'DARURAT':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] border border-rose-200 animate-pulse">🚨 PENTING & DARURAT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">📢 Info Umum</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
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
              <Megaphone className="w-6 h-6 text-primary-600" />
              Pusat Pengumuman, Agenda & Siaran Warga
            </h1>
            <span className="px-2.5 py-0.5 bg-primary-100 text-primary-900 font-black text-xs rounded-full border border-primary-300">
              {totalAnnouncementsCount} Publikasi Aktif
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Saluran komunikasi resmi paguyuban untuk mempublikasikan maklumat, jadwal kerja bakti, himbauan keamanan, dan broadcast WhatsApp massal ke 123 rumah warga.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Pengumuman Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Total Pengumuman</span>
          <p className="text-2xl font-black text-primary-700 mt-1 tabular-nums">
            {totalAnnouncementsCount} <span className="text-xs font-normal text-ink-muted">Publikasi</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Tersebar di Portal Warga</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Disematkan (Pinned)</span>
          <p className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {pinnedAnnouncementsCount} <span className="text-xs font-normal text-ink-muted">Highlight</span>
          </p>
          <span className="text-[10px] text-amber-600 font-bold">Muncul Prioritas di Paling Atas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Agenda & Kegiatan Bulan Ini</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {totalAgendaCount} <span className="text-xs font-normal text-ink-muted">Kegiatan</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Kerja Bakti, Rapat & Posyandu</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Jangkauan Warga Siaran</span>
          <p className="text-2xl font-black text-teal-700 mt-1 tabular-nums">
            123 <span className="text-xs font-normal text-ink-muted">Rumah</span>
          </p>
          <span className="text-[10px] text-teal-600 font-bold">100% Terintegrasi WhatsApp</span>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'announcements', label: 'Daftar Pengumuman Warga', icon: Megaphone, count: totalAnnouncementsCount },
          { id: 'agenda', label: 'Kalender & Agenda Kegiatan', icon: Calendar, count: totalAgendaCount },
          { id: 'templates', label: 'Template Siaran WhatsApp', icon: MessageCircle, count: templates.length },
          { id: 'audience', label: 'Sasaran Distribusi Siaran', icon: Users, count: '123 Unit' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 1: DAFTAR PENGUMUMAN WARGA ================= */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Floating Bulk Action Bar */}
          {selectedAnnIds.length > 0 && (
            <div className="p-3.5 bg-primary-50 border border-primary-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedAnnIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-primary-950">
                    {selectedAnnIds.length} Pengumuman Terpilih
                  </p>
                  <p className="text-[11px] text-primary-700">
                    Pilih aksi massal untuk pengumuman yang telah diceklis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAnnIds([])}
                  className="px-3.5 py-2 rounded-xl border border-primary-200 bg-surface text-ink text-xs font-bold hover:bg-canvas"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Massal</span>
                </button>
              </div>
            </div>
          )}

          {/* Search, Filter & Layout Controls */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari judul, kata kunci pengumuman, lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori ({announcements.length})</option>
                <option value="KEGIATAN">Kegiatan & Kerja Bakti</option>
                <option value="MAINTENANCE">Maintenance Sarana</option>
                <option value="KEUANGAN">Iuran & Keuangan</option>
                <option value="KEAMANAN">Keamanan & Portal</option>
                <option value="INFO">Informasi Umum</option>
                <option value="DARURAT">Darurat / Penting</option>
              </select>

              <select
                value={pinFilter}
                onChange={(e) => setPinFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Pin</option>
                <option value="PINNED">Disematkan (Pinned)</option>
                <option value="UNPINNED">Tidak Disematkan</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
                <option value="category">Kategori</option>
              </select>

              {/* View Switcher: Card vs Table */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden p-0.5 bg-canvas">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                  title="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                  title="Tampilan Tabel"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sliced Paginated Feed (Grid or Table View) */}
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-ink-muted font-medium bg-surface rounded-3xl border border-border">
              <Megaphone className="w-10 h-10 text-primary-400 mx-auto mb-2 opacity-60" />
              Tidak ada pengumuman yang sesuai dengan filter pencarian.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-4">
              {paginatedAnnouncements.map((ann) => {
                const isSelected = selectedAnnIds.includes(ann.id);
                return (
                  <div
                    key={ann.id}
                    className={`p-6 bg-surface rounded-3xl border transition-all shadow-card space-y-3 relative overflow-hidden ${
                      isSelected ? 'border-primary-500 ring-2 ring-primary-300' : 'border-border'
                    } ${ann.isPinned ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedAnnIds(prev =>
                              prev.includes(ann.id) ? prev.filter(id => id !== ann.id) : [...prev, ann.id]
                            );
                          }}
                          className="rounded border-border text-primary-600"
                        />
                        {getCategoryBadge(ann.category)}
                        {ann.isPinned && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                            <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                            <span>Disematkan</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ann.createdAt ? ann.createdAt.slice(0, 10) : 'Baru'}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-ink hover:text-primary-700 transition-colors">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>

                    {/* Metadata: Schedule & Location */}
                    {(ann.scheduledAt || ann.location) && (
                      <div className="p-3 bg-canvas rounded-2xl border border-border/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-primary-800">
                        {ann.scheduledAt && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span>{ann.scheduledAt}</span>
                          </span>
                        )}
                        {ann.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span>{ann.location}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-[11px] text-ink-muted font-medium">
                        Penulis: <strong>{ann.authorName || 'Pengurus Komplek'}</strong>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(ann)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                            ann.isPinned
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-canvas border-border text-ink-muted hover:text-ink'
                          }`}
                          title={ann.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span>{ann.isPinned ? 'Tersemat' : 'Sematkan'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewAnn(ann)}
                          className="p-2 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold flex items-center gap-1"
                          title="Preview Tampilan Mobile"
                        >
                          <Eye className="w-3.5 h-3.5 text-ink-muted" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(ann)}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold"
                          title="Edit Pengumuman"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAnnToDelete(ann)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={getWhatsAppBroadcastUrl(ann)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Broadcast WA</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={paginatedAnnouncements.length > 0 && paginatedAnnouncements.every(a => selectedAnnIds.includes(a.id))}
                          onChange={() => {
                            if (paginatedAnnouncements.every(a => selectedAnnIds.includes(a.id))) {
                              setSelectedAnnIds([]);
                            } else {
                              setSelectedAnnIds(paginatedAnnouncements.map(a => a.id));
                            }
                          }}
                          className="rounded border-border text-primary-600"
                        />
                      </th>
                      <th className="py-3 px-4">Judul Pengumuman</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Jadwal / Lokasi</th>
                      <th className="py-3 px-4">Tanggal Buat</th>
                      <th className="py-3 px-4 text-center">Pin</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedAnnouncements.map((ann) => {
                      const isSelected = selectedAnnIds.includes(ann.id);
                      return (
                        <tr key={ann.id} className={`hover:bg-canvas/50 transition-colors ${isSelected ? 'bg-primary-50/40' : ''}`}>
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedAnnIds(prev =>
                                  prev.includes(ann.id) ? prev.filter(id => id !== ann.id) : [...prev, ann.id]
                                );
                              }}
                              className="rounded border-border text-primary-600"
                            />
                          </td>

                          <td className="py-3.5 px-4 max-w-[280px]">
                            <span className="font-bold text-ink block truncate" title={ann.title}>{ann.title}</span>
                            <span className="text-[10px] text-ink-muted line-clamp-1">{ann.content}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {getCategoryBadge(ann.category)}
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-primary-800">
                            {ann.scheduledAt && <p className="font-semibold">{ann.scheduledAt}</p>}
                            {ann.location && <p className="text-ink-muted">{ann.location}</p>}
                          </td>

                          <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px]">
                            {ann.createdAt ? ann.createdAt.slice(0, 10) : '-'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePin(ann)}
                              className={`p-1.5 rounded-lg ${ann.isPinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-ink'}`}
                              title={ann.isPinned ? 'Lepas Sematan' : 'Sematkan'}
                            >
                              <Pin className={`w-3.5 h-3.5 ${ann.isPinned ? 'fill-amber-600' : ''}`} />
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <a
                                href={getWhatsAppBroadcastUrl(ann)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold"
                                title="Broadcast WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(ann)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setAnnToDelete(ann)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= PAGINATION CONTROLS ================= */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <span>Menampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-canvas border border-border rounded-lg font-bold text-ink"
              >
                <option value={5}>5 Data</option>
                <option value={10}>10 Data</option>
                <option value={20}>20 Data</option>
                <option value={50}>50 Data</option>
              </select>
              <span>
                dari <strong>{totalFilteredCount}</strong> Total Pengumuman
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && <span className="text-ink-muted px-1">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl font-black text-xs transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'bg-canvas hover:bg-surface text-ink border border-border'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                title="Halaman Berikutnya"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 rounded-xl border border-border bg-canvas hover:bg-surface text-ink font-bold disabled:opacity-30 disabled:pointer-events-none"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: KALENDER & AGENDA KEGIATAN ================= */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Kalender Kegiatan & Agenda Warga Komplek
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Jadwal agenda musyawarah paguyuban, kerja bakti, pemeliharaan sarana, dan turnamen olahraga komplek.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const content = `AGENDA KEGIATAN WARGA KOMPLEK WARGAHUB\n==============================================\n${agendaList.map(a => `• ${a.title}\n  Tanggal: ${a.date} | Pukul: ${a.time}\n  Lokasi: ${a.location}\n  Penyelenggara: ${a.organizer}\n  Peserta: ${a.targetParticipants}\n  Deskripsi: ${a.description}\n`).join('\n')}\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `AGENDA_KEGIATAN_WARGAHUB_${new Date().toISOString().slice(0, 10)}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast('Jadwal agenda kegiatan berhasil diunduh.');
                }}
                className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-ink-muted" />
                <span>Unduh Jadwal Agenda (.txt)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendaList.map((agd) => (
                <div key={agd.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-primary-800 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200">
                      {agd.date}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[10px]">
                      ⏰ {agd.time}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-ink">{agd.title}</h4>
                    <p className="text-primary-700 font-bold mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary-600" />
                      <span>{agd.location}</span>
                    </p>
                    <p className="text-ink-muted mt-1 leading-relaxed">{agd.description}</p>
                  </div>

                  <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Penyelenggara:</span>
                      <strong className="text-ink">{agd.organizer}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Target Peserta:</span>
                      <strong className="text-emerald-700">{agd.targetParticipants}</strong>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🗓️ *AGENDA KEGIATAN KOMPLEK WARGAHUB*\n\n*${agd.title}*\n\n📅 Tanggal: ${agd.date}\n⏰ Waktu: ${agd.time}\n📍 Lokasi: ${agd.location}\n👥 Peserta: ${agd.targetParticipants}\n\n${agd.description}\n\n- Pengurus Komplek WargaHub`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 text-[11px]"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Bagikan Agenda ke WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: TEMPLATE SIARAN WHATSAPP ================= */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  Template Siaran Pesan Broadcast WhatsApp Resmi
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Template draf siap pakai untuk broadcast massal WhatsApp grup warga komplek.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-primary-100 text-primary-900 font-bold rounded text-[10px]">
                      {tpl.category}
                    </span>
                    <span className="font-mono text-[10px] text-ink-muted">{tpl.id}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-ink">{tpl.name}</h4>
                    <p className="font-mono text-[11px] text-primary-700 font-bold mt-0.5">Subjek: {tpl.subject}</p>
                  </div>

                  <div className="p-3 bg-surface rounded-xl border border-border font-mono text-[11px] text-ink whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                    {tpl.content}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`*${tpl.subject}*\n\n${tpl.content}\n\n- Pengurus Komplek WargaHub`);
                        showToast(`Template "${tpl.name}" berhasil disalin ke clipboard.`);
                      }}
                      className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border text-ink font-bold rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-ink-muted" />
                      <span>Salin Teks</span>
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`*${tpl.subject}*\n\n${tpl.content}\n\n- Pengurus Komplek WargaHub`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Buka WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: SASARAN DISTRIBUSI ================= */}
      {activeSubTab === 'audience' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Segmen Target Sasaran Pengumuman Komplek
              </h3>
              <p className="text-ink-muted mt-0.5">
                Pilah pengiriman informasi agar pengumuman spesifik sampai ke warga yang tepat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">🌐 Seluruh Warga Komplek</span>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-900 font-bold rounded text-[10px]">123 Rumah</span>
                </div>
                <p className="text-ink-muted text-[11px] leading-relaxed">
                  Blok A, Blok B, Blok C, Blok D, Kavling Mandiri, dan Jl. Sariwangi Indah 1 & 2.
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">🏘️ Kluster Blok A & B</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[10px]">60 Rumah</span>
                </div>
                <p className="text-ink-muted text-[11px] leading-relaxed">
                  Pengumuman khusus pemeliharaan pipa air blok barat dan jadwal posyandu balai warga.
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">🏡 Kluster Blok C, D & Kavling</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded text-[10px]">63 Rumah</span>
                </div>
                <p className="text-ink-muted text-[11px] leading-relaxed">
                  Pengumuman khusus pemangkasan pohon jalan belakang dan servis PJU solar cell.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BUAT / EDIT PENGUMUMAN ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary-600" />
                <span>{editingAnnId ? 'Edit Pengumuman Warga' : 'Buat Pengumuman Baru'}</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kerja Bakti Massal Kebersihan Lingkungan"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KEGIATAN">Kegiatan & Kerja Bakti</option>
                    <option value="MAINTENANCE">Maintenance Sarana</option>
                    <option value="KEUANGAN">Iuran & Keuangan</option>
                    <option value="KEAMANAN">Keamanan & Portal</option>
                    <option value="INFO">Informasi Umum</option>
                    <option value="DARURAT">Darurat / Penting</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Target Sasaran *</label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="ALL">Seluruh Warga (123 Unit)</option>
                    <option value="BLOK_A_B">Khusus Blok A & B</option>
                    <option value="BLOK_C_D">Khusus Blok C & D</option>
                    <option value="KAVLING">Khusus Kavling Mandiri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Isi Pesan Pengumuman *</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan isi pengumuman secara rinci dan jelas untuk warga..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jadwal / Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Minggu, 06 Sep • 07:00 WIB"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Balai Warga Serbaguna"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-canvas rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-border text-primary-600"
                />
                <label htmlFor="isPinnedCheck" className="font-bold text-ink cursor-pointer select-none">
                  📌 Sematkan Pengumuman (Tampil di bagian paling atas beranda warga)
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Publikasikan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SIMULASI PREVIEW MOBILE ================= */}
      {previewAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-ink flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary-600" />
                <span>Simulasi Tampilan Layar Warga</span>
              </h3>
              <button onClick={() => setPreviewAnn(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                {getCategoryBadge(previewAnn.category)}
                {previewAnn.isPinned && (
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                    📌 Pinned
                  </span>
                )}
              </div>

              <h4 className="font-black text-base text-ink">{previewAnn.title}</h4>
              <p className="text-ink-muted text-xs leading-relaxed whitespace-pre-line">{previewAnn.content}</p>

              {(previewAnn.scheduledAt || previewAnn.location) && (
                <div className="p-2.5 bg-surface rounded-xl border border-border text-[11px] space-y-1 font-semibold text-primary-800">
                  {previewAnn.scheduledAt && <p>🗓️ {previewAnn.scheduledAt}</p>}
                  {previewAnn.location && <p>📍 {previewAnn.location}</p>}
                </div>
              )}

              <p className="text-[10px] text-ink-muted font-mono">Diterbitkan oleh: {previewAnn.authorName || 'Pengurus'}</p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewAnn(null)}
              className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
      {annToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Pengumuman Ini?</h3>
              <p className="text-ink-muted">
                Pengumuman <strong>"{annToDelete.title}"</strong> akan dihapus permanen dari portal warga.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAnnToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus {selectedAnnIds.length} Pengumuman Terpilih?</h3>
              <p className="text-ink-muted">
                Sebanyak <strong>{selectedAnnIds.length} pengumuman</strong> yang telah diceklis akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkProcessing ? 'Menghapus...' : `Ya, Hapus (${selectedAnnIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
