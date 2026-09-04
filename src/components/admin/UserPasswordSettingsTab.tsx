import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Copy,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Lock,
  Sparkles,
  ExternalLink,
  Shield,
  Smartphone,
  Info,
  Sliders,
  Send,
  X,
  RotateCcw,
  Zap,
  Phone
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  propertyId?: string | null;
  propertyCode?: string | null;
  passwordHash?: string;
  isActive: boolean;
  phone?: string;
  propertyAddress?: string;
  occupancyStatus?: string;
  createdAt?: string;
}

export const UserPasswordSettingsTab: React.FC = () => {
  // Main state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Password Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRole, setCreateRole] = useState('HOUSEHOLD_HEAD');
  const [createFullName, setCreateFullName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPropCode, setCreatePropCode] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('warga123');
  const [showCreatePasswordText, setShowCreatePasswordText] = useState(false);
  const [savingNewUser, setSavingNewUser] = useState(false);

  // Bulk Reset Modal State
  const [showBulkResetModal, setShowBulkResetModal] = useState(false);
  const [bulkScope, setBulkScope] = useState<'KAVLING_ONLY' | 'ALL_RESIDENTS' | 'ALL_STAFF'>('KAVLING_ONLY');
  const [bulkPassword, setBulkPassword] = useState('warga123');
  const [bulkResetting, setBulkResetting] = useState(false);

  // Password Policy State (persisted)
  const [policyMinLength, setPolicyMinLength] = useState(() => {
    if (typeof window === 'undefined') return 6;
    return Number(localStorage.getItem('wargahub_policy_min_len') || 6);
  });
  const [policyAllowWaLogin, setPolicyAllowWaLogin] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('wargahub_policy_wa_login') !== 'false';
  });
  const [policyAllowHouseLogin, setPolicyAllowHouseLogin] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('wargahub_policy_house_login') !== 'false';
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setUsers(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Gagal memuat daftar pengguna dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      // Role Filter
      if (roleFilter === 'RESIDENT') {
        if (!['HOUSEHOLD_HEAD', 'RESIDENT', 'HOUSE_OWNER'].includes(u.role)) return false;
      } else if (roleFilter === 'SECURITY') {
        if (u.role !== 'SECURITY') return false;
      } else if (roleFilter === 'MAINTENANCE') {
        if (u.role !== 'MAINTENANCE') return false;
      } else if (roleFilter === 'OFFICER') {
        if (!['CHAIRMAN', 'TREASURER', 'SECRETARY', 'SUPER_ADMIN', 'RESIDENT_ADMIN'].includes(u.role)) return false;
      }

      // Status Filter
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      // Text Search
      if (!q) return true;
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchUser = u.username.toLowerCase().includes(q);
      const matchProp = (u.propertyCode || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchUser || matchProp || matchPhone || matchEmail;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Random Password Generator
  const generateRandomPassword = () => {
    const words = ['warga', 'kavling', 'aman', 'sejahtera', 'asri', 'harmoni', 'berkah'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const chars = '!@#$';
    const char = chars[Math.floor(Math.random() * chars.length)];
    return `${word}${char}${num}`;
  };

  // Open Edit Password Modal
  const handleOpenEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setNewPassword(user.passwordHash || 'warga123');
    setShowPasswordText(false);
    setShowEditModal(true);
    setCopiedWa(false);
  };

  // Submit Edit Password
  const handleSubmitUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < policyMinLength) {
      showToast(`Password minimal ${policyMinLength} karakter sesuai kebijakan sistem.`);
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/users/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword,
          actorName: 'Admin Pengurus Komplek',
          reason: `Pembaruan password akun ${selectedUser.propertyCode || selectedUser.username}`
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        showToast(`✓ ${json.data.message}`);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, passwordHash: newPassword } : u));
        setSelectedUser(prev => prev ? { ...prev, passwordHash: newPassword } : null);
      } else {
        showToast(json.error || 'Gagal memperbarui password.');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Submit Create New User
  const handleSubmitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName || !createUsername || !createPassword) {
      showToast('Nama lengkap, username, dan password wajib diisi.');
      return;
    }
    if (createPassword.length < policyMinLength) {
      showToast(`Password minimal ${policyMinLength} karakter.`);
      return;
    }

    setSavingNewUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createUsername,
          fullName: createFullName,
          role: createRole,
          propertyCode: createPropCode || undefined,
          phone: createPhone || undefined,
          email: createEmail || undefined,
          password: createPassword,
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        showToast(`✓ Akun ${createFullName} berhasil didaftarkan ke sistem!`);
        setShowCreateModal(false);
        setCreateFullName('');
        setCreateUsername('');
        setCreatePropCode('');
        setCreatePhone('');
        setCreateEmail('');
        setCreatePassword('warga123');
        fetchUsers();
      } else {
        showToast(json.error || 'Gagal membuat akun.');
      }
    } catch (err) {
      showToast('Terjadi gangguan koneksi server.');
    } finally {
      setSavingNewUser(false);
    }
  };

  // Submit Bulk Reset
  const handleSubmitBulkReset = async () => {
    setBulkResetting(true);
    try {
      const res = await fetch('/api/users/reset-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: bulkScope,
          defaultPassword: bulkPassword,
          actorName: 'Admin Pengurus Komplek'
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        showToast(`✓ ${json.data.message}`);
        setShowBulkResetModal(false);
        fetchUsers();
      } else {
        showToast(json.error || 'Gagal melakukan reset massal.');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.');
    } finally {
      setBulkResetting(false);
    }
  };

  // WhatsApp Message Generator
  const getWaNotificationText = (user: UserItem, pwd: string) => {
    const propName = user.propertyCode || 'Komplek Taman Sejahtera';
    return (
      `*INFORMASI AKSES LOGIN WARGAHUB*\n` +
      `Komplek Taman Sejahtera RT 02 / RW 05\n\n` +
      `Halo Bapak/Ibu *${user.fullName}*,\n` +
      `Berikut adalah informasi akun akses Portal WargaHub Anda:\n\n` +
      `🏡 *Unit / No. Rumah:* ${propName}\n` +
      `👤 *ID / Username Login:* ${user.propertyCode || user.username}\n` +
      `🔑 *Password Baru / PIN:* *${pwd}*\n\n` +
      `🌐 *Tautan Masuk Portal:*\nhttp://localhost:4321/login\n\n` +
      `_Catatan: Anda juga dapat masuk langsung menggunakan Nomor WhatsApp yang terdaftar dan password di atas. Harap simpan informasi ini dengan baik._\n\n` +
      `Salam hangat,\n*Pengurus Komplek Taman Sejahtera*`
    );
  };

  const handleCopyWa = (user: UserItem, pwd: string) => {
    const text = getWaNotificationText(user, pwd);
    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    showToast('Pesan kredensial login disalin ke clipboard!');
    setTimeout(() => setCopiedWa(false), 3000);
  };

  const getWaLink = (user: UserItem, pwd: string) => {
    const text = encodeURIComponent(getWaNotificationText(user, pwd));
    const phoneClean = (user.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
    return phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  // Auto-fill username when property code or name changes
  const handlePropCodeChange = (val: string) => {
    setCreatePropCode(val);
    if (!createUsername || createUsername.startsWith('kav_') || createUsername.startsWith('warga_')) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^kavling_/, 'kav_');
      setCreateUsername(clean.startsWith('kav_') ? clean : `warga_${clean}`);
    }
  };

  // Role Badge Helper
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">Super Admin</span>;
      case 'CHAIRMAN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Ketua Komplek</span>;
      case 'TREASURER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">Bendahara</span>;
      case 'SECRETARY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">Sekretaris</span>;
      case 'SECURITY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Petugas Satpam</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">Teknisi / Kebersihan</span>;
      case 'HOUSEHOLD_HEAD':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">Kepala Keluarga</span>;
      case 'RESIDENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">Penghuni / Sewa</span>;
      case 'HOUSE_OWNER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200">Pemilik Rumah</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">{role}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-zinc-900/95 text-white text-xs font-bold shadow-2xl flex items-center gap-3 border border-zinc-700 animate-in slide-in-from-bottom-3 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
              Total Akun Terdaftar
            </span>
            <p className="text-2xl font-black font-mono text-ink mt-0.5 tabular-nums">
              {users.length} Akun
            </p>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">100% AKTIF & TERDATA</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
              Warga Sistem Kavling
            </span>
            <p className="text-2xl font-black font-mono text-indigo-700 mt-0.5 tabular-nums">
              {users.filter(u => u.propertyCode && (u.propertyCode.startsWith('Kav') || u.propertyCode.startsWith('KV'))).length} Unit
            </p>
            <span className="text-[10px] text-indigo-600 font-bold">Kav A s/d Kav M</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
              Staff & Petugas
            </span>
            <p className="text-2xl font-black font-mono text-amber-700 mt-0.5 tabular-nums">
              {users.filter(u => ['SECURITY', 'MAINTENANCE'].includes(u.role)).length} Personil
            </p>
            <span className="text-[10px] text-amber-600 font-bold">Satpam & Teknisi TPS</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
              Kebijakan Password
            </span>
            <p className="text-base font-black font-mono text-emerald-700 mt-0.5">
              Default: warga123
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Min. {policyMinLength} Karakter</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs space-y-5">
        {/* Card Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
              <h3 className="text-sm font-black text-ink uppercase tracking-wide">
                Pengaturan Pembuatan & Pembaruan Password
              </h3>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Kelola kredensial akses masuk warga, petugas keamanan, teknisi, dan pengurus komplek.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-xs active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Buat Akun Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkResetModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Reset Massal Password</span>
            </button>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 rounded-xl border border-border text-ink-muted hover:text-ink hover:bg-canvas transition-all"
              title="Segarkan data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Cari warga, kavling (Kav A), username, no. WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
            >
              <option value="ALL">Semua Peran / Role</option>
              <option value="RESIDENT">Warga & Penghuni Kavling</option>
              <option value="SECURITY">Petugas Satpam Pos</option>
              <option value="MAINTENANCE">Teknisi & Kebersihan</option>
              <option value="OFFICER">Pengurus Inti & Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (Dapat Login)</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-border/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border/80 text-[11px] font-black uppercase text-ink-muted tracking-wider">
                <th className="py-3 px-4">No. Rumah / Kavling</th>
                <th className="py-3 px-4">Nama Lengkap & Kontak</th>
                <th className="py-3 px-4">Username & Peran</th>
                <th className="py-3 px-4">Status Password</th>
                <th className="py-3 px-4 text-right">Aksi Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary-600 mb-2" />
                    Memuat data pengguna dan password...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Tidak ditemukan data pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isKavling = (u.propertyCode || '').toUpperCase().startsWith('KAV');
                  return (
                    <tr key={u.id} className="hover:bg-canvas/60 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border ${
                            isKavling
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : u.propertyCode
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                          }`}>
                            {u.propertyCode || 'Non-Rumah'}
                          </span>
                          {isKavling && (
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                              Area Kavling
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-ink text-xs">{u.fullName}</div>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                          {u.phone ? (
                            <a
                              href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                              title="Kirim pesan WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{u.phone}</span>
                            </a>
                          ) : (
                            <span>{u.email}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-zinc-900">
                          {u.username}
                        </div>
                        <div className="mt-1">
                          {getRoleBadge(u.role)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink-muted tracking-widest bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                            ••••••••
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Aktif
                          </span>
                        </div>
                        <span className="text-[10px] text-ink-muted mt-0.5 block">
                          Login via No. Rumah / WA didukung
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-800 border border-primary-300 hover:bg-primary-600 hover:text-white transition-all active:scale-[0.98]"
                            title="Edit atau Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Edit Password</span>
                          </button>

                          {u.phone && (
                            <button
                              type="button"
                              onClick={() => handleCopyWa(u, u.passwordHash || 'warga123')}
                              className="inline-flex items-center gap-1 p-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all"
                              title="Salin Pesan Format WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Global Policy Settings Banner */}
        <div className="p-4 bg-canvas rounded-2xl border border-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-ink">
                Kebijakan Akses Masuk Multi-Identitas
              </h4>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Warga dapat login menggunakan Nomor Rumah (cth: <code className="text-primary-700 font-bold">Kav A</code>, <code className="text-primary-700 font-bold">KVa</code>), Username, ataupun Nomor WhatsApp aktif.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              ✓ Multi-Identitas Aktif
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              ✓ Neon PostgreSQL Synced
            </span>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: EDIT / RESET PASSWORD ================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-canvas border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    Ubah Password Akun Pengguna
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {selectedUser.fullName} ({selectedUser.propertyCode || selectedUser.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUpdatePassword} className="p-6 space-y-4">
              {/* User Details Readonly Card */}
              <div className="p-3.5 bg-canvas rounded-2xl border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase font-mono font-bold block">Target Akun</span>
                  <p className="font-bold text-ink mt-0.5">{selectedUser.fullName}</p>
                  <p className="text-ink-muted font-mono text-[11px] mt-0.5">Username: {selectedUser.username}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted uppercase font-mono font-bold block">No. Unit</span>
                  <span className="font-bold text-primary-700 font-mono text-sm">{selectedUser.propertyCode || '-'}</span>
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span>Password Baru / PIN Akses</span>
                  <span className="text-[10px] text-ink-muted font-normal">Minimal {policyMinLength} karakter</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Masukkan password baru..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Generator Helpers */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Acak Password Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPassword('warga123')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200 transition-all"
                  >
                    Gunakan Default (warga123)
                  </button>
                </div>
              </div>

              {/* WhatsApp Notification Preview Card */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Format Notifikasi WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">WA: {selectedUser.phone || 'Nomor belum ada'}</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 text-[11px] font-mono text-zinc-700 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                  {getWaNotificationText(selectedUser, newPassword)}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyWa(selectedUser, newPassword)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5"
                  >
                    {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{copiedWa ? 'Tersalin!' : 'Salin Pesan WA'}</span>
                  </button>

                  <a
                    href={getWaLink(selectedUser, newPassword)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim via WA</span>
                  </a>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:bg-canvas transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-xs inline-flex items-center gap-2 active:scale-[0.98]"
                >
                  {savingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: BUAT AKUN & PASSWORD BARU ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-canvas border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    Daftarkan Akun & Password Baru
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Buat akun login untuk warga komplek, satpam, atau teknisi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCreateUser} className="p-6 space-y-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Peran / Kategori Akun</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="HOUSEHOLD_HEAD">Warga Komplek / Kepala Keluarga (Dihuni Pemilik)</option>
                  <option value="RESIDENT">Warga Komplek / Penyewa (Disewakan)</option>
                  <option value="HOUSE_OWNER">Pemilik Rumah (Pemilik Kosong)</option>
                  <option value="SECURITY">Petugas Keamanan (Satpam Pos 1 & 2)</option>
                  <option value="MAINTENANCE">Teknisi & Kebersihan (Armada TPS / Fasum)</option>
                  <option value="TREASURER">Bendahara Komplek</option>
                  <option value="SECRETARY">Sekretaris Komplek</option>
                  <option value="CHAIRMAN">Ketua Komplek</option>
                </select>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Verial"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    placeholder="082316485044"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Property Code & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">No. Rumah / Kavling</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kav A atau KVa"
                    value={createPropCode}
                    onChange={(e) => handlePropCodeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: kav_a"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center justify-between">
                  <span>Password Awal</span>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateRandomPassword())}
                    className="text-[10px] text-purple-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Acak Password
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showCreatePasswordText ? 'text' : 'password'}
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePasswordText(!showCreatePasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    {showCreatePasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:bg-canvas transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNewUser}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-xs inline-flex items-center gap-2 active:scale-[0.98]"
                >
                  {savingNewUser ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Daftarkan Akun & Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: BULK RESET PASSWORD ================= */}
      {showBulkResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    Reset Password Massal
                  </h3>
                  <p className="text-xs text-amber-800">
                    Setel ulang password kelompok akun sekaligus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkResetModal(false)}
                className="p-2 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-canvas rounded-2xl border border-border text-xs text-ink-muted">
                Pilih kelompok akun yang ingin direset kata sandinya ke default baru. Seluruh data identitas warga tidak akan terpengaruh.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Cakupan Akun yang Direset</label>
                <select
                  value={bulkScope}
                  onChange={(e) => setBulkScope(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="KAVLING_ONLY">Hanya Seluruh Warga Kavling (Kav A s/d Kav M)</option>
                  <option value="ALL_RESIDENTS">Seluruh Warga Komplek & Penghuni</option>
                  <option value="ALL_STAFF">Seluruh Petugas Keamanan (Satpam) & Teknisi</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Password Baru yang Ditetapkan</label>
                <input
                  type="text"
                  required
                  value={bulkPassword}
                  onChange={(e) => setBulkPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBulkResetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink-muted hover:bg-canvas transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitBulkReset}
                  disabled={bulkResetting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-xs inline-flex items-center gap-2"
                >
                  {bulkResetting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mereset...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Konfirmasi Reset Massal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
