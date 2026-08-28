import React, { useState } from 'react';
import { Home, Users, UserCheck, Car, Search, Filter, Plus, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import type { PropertyListItem } from '../../services/property.service';

interface PropertiesManagerProps {
  initialProperties: PropertyListItem[];
  initialTab?: string;
}

export const PropertiesManager: React.FC<PropertiesManagerProps> = ({
  initialProperties,
  initialTab = 'properties'
}) => {
  const [properties, setProperties] = useState<PropertyListItem[]>(initialProperties);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeProperty, setActiveProperty] = useState<PropertyListItem | null>(null);

  // Property Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newBlock, setNewBlock] = useState('block-a');
  const [newAddress, setNewAddress] = useState('');
  const [newOccupancy, setNewOccupancy] = useState<'OWNER_OCCUPIED' | 'RENTED' | 'VACANT'>('OWNER_OCCUPIED');
  const [newOwner, setNewOwner] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/properties/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          number: newNumber || newCode.replace(/[^0-9]/g, ''),
          blockId: newBlock,
          address: newAddress || `Jl. Flamboyan Blok ${newCode.split('-')[0]} No. ${newNumber}`,
          occupancyStatus: newOccupancy,
          ownerName: newOwner || undefined,
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setProperties([
          {
            id: `prop-${newCode.toLowerCase()}`,
            code: newCode,
            number: newNumber,
            blockCode: newCode.split('-')[0],
            address: newAddress || `Jl. Flamboyan Blok ${newCode.split('-')[0]} No. ${newNumber}`,
            occupancyStatus: newOccupancy,
            ownerName: newOwner || '-',
            residentCount: newOccupancy === 'VACANT' ? 0 : 3,
            vehicleCount: newOccupancy === 'VACANT' ? 0 : 1,
            isActive: true,
          },
          ...properties
        ]);
        setNewCode('');
        setNewNumber('');
        setNewOwner('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = properties.filter((p) => {
    const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) || (p.ownerName && p.ownerName.toLowerCase().includes(search.toLowerCase()));
    const matchBlock = selectedBlock === 'ALL' || p.blockCode === selectedBlock;
    const matchStatus = selectedStatus === 'ALL' || p.occupancyStatus === selectedStatus;
    return matchSearch && matchBlock && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OWNER_OCCUPIED':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">Dihuni Pemilik</span>;
      case 'RENTED':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">Disewa</span>;
      case 'VACANT':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">Kosong</span>;
      case 'RENOVATION':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">Renovasi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Data Rumah & Warga</h1>
          <p className="text-sm text-ink-muted mt-1">Master unit 120 rumah Komplek Taman Sejahtera.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah / Update Unit Rumah
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari kode rumah (cth: A-17) atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-sm text-ink placeholder:text-ink-muted focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-sm font-medium text-ink"
          >
            <option value="ALL">Semua Blok</option>
            <option value="A">Blok A</option>
            <option value="B">Blok B</option>
            <option value="C">Blok C</option>
            <option value="D">Blok D</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-sm font-medium text-ink"
          >
            <option value="ALL">Semua Status</option>
            <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
            <option value="RENTED">Disewa</option>
            <option value="VACANT">Kosong</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-canvas/40 text-ink-muted font-semibold">
                <th className="py-3 px-4">Kode Rumah</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4">Status Hunian</th>
                <th className="py-3 px-4">Nama Penghuni / Pemilik</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((prop) => (
                <tr key={prop.id} className="hover:bg-canvas/60 text-ink transition-colors">
                  <td className="py-3 px-4 font-bold text-sm text-primary-700 flex items-center gap-2">
                    <Home className="w-4 h-4 text-ink-muted" />
                    {prop.code}
                  </td>
                  <td className="py-3 px-4 text-ink-muted font-medium">{prop.address}</td>
                  <td className="py-3 px-4">{getStatusBadge(prop.occupancyStatus)}</td>
                  <td className="py-3 px-4 font-medium text-ink">{prop.ownerName || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveProperty(prop)}
                      className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border bg-canvas/40 text-xs text-ink-muted flex items-center justify-between">
          <span>Menampilkan {filtered.length} dari {properties.length} unit rumah</span>
          <span>Komplek Taman Sejahtera</span>
        </div>
      </div>

      {/* Property Details Modal */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-base text-ink">Detail Rumah {activeProperty.code}</h3>
              </div>
              <button onClick={() => setActiveProperty(null)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-canvas rounded-xl space-y-1">
                <span className="text-ink-muted">Alamat Lengkap</span>
                <p className="font-semibold text-ink">{activeProperty.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-canvas rounded-xl space-y-1">
                  <span className="text-ink-muted">Status Hunian</span>
                  <div>{getStatusBadge(activeProperty.occupancyStatus)}</div>
                </div>
                <div className="p-3 bg-canvas rounded-xl space-y-1">
                  <span className="text-ink-muted">Blok</span>
                  <p className="font-bold text-ink">{activeProperty.blockName}</p>
                </div>
              </div>

              <div className="p-3 bg-canvas rounded-xl space-y-1">
                <span className="text-ink-muted">Kepala Keluarga / Pemilik</span>
                <p className="font-bold text-ink text-sm">{activeProperty.ownerName || '-'}</p>
              </div>

              {activeProperty.code === 'A-17' && (
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl space-y-1.5 text-primary-900">
                  <p className="font-bold text-xs">Anggota Keluarga Terdaftar (4 orang):</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-primary-800">
                    <li>Budi Santoso (Kepala Keluarga)</li>
                    <li>Siti Lestari (Istri)</li>
                    <li>Alya Santoso (Anak)</li>
                    <li>Daffa Santoso (Anak)</li>
                  </ul>
                  <p className="font-bold text-xs mt-2">Kendaraan Terdaftar:</p>
                  <p className="text-[11px] font-mono">B 1234 ABC (Mobil) • B 5678 DEF (Motor)</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setActiveProperty(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-ink">Tambah / Update Data Unit Rumah</h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Kode Rumah</label>
                  <input
                    type="text"
                    placeholder="Contoh: A-21"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold uppercase text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Unit</label>
                  <input
                    type="text"
                    placeholder="21"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Blok Lokasi</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
                >
                  <option value="block-a">Blok A (Jalan Flamboyan)</option>
                  <option value="block-b">Blok B (Jalan Anggrek)</option>
                  <option value="block-c">Blok C (Jalan Cempaka)</option>
                  <option value="block-d">Blok D (Jalan Melati)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Status Hunian</label>
                <select
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(e.target.value as any)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
                >
                  <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
                  <option value="RENTED">Disewa</option>
                  <option value="VACANT">Kosong (Belum Dihuni)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Pemilik / Kepala Keluarga</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Warga..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Jl. Flamboyan No. 21, RT 02 / RW 05"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border text-ink font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Data Rumah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
