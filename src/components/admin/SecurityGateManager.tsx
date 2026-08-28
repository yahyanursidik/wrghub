import React, { useState } from 'react';
import { ShieldCheck, QrCode, Search, Car, UserCheck, AlertCircle, CheckCircle2, Clock, MapPin, ArrowRight, Smartphone } from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface VisitorLog {
  id: string;
  visitorName: string;
  vehiclePlate: string;
  destinationHouse: string;
  purpose: string;
  entryTime: string;
  status: 'INSIDE' | 'EXITED';
}

export const SecurityGateManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'lookup' | 'log'>('scan');
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [searchingPlate, setSearchingPlate] = useState('');
  const [plateResult, setPlateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // New Visitor Form State
  const [visName, setVisName] = useState('');
  const [visPlate, setVisPlate] = useState('');
  const [visHouse, setVisHouse] = useState('A-17');
  const [visPurpose, setVisPurpose] = useState('Kunjungan Keluarga');
  const [visitors, setVisitors] = useState<VisitorLog[]>([
    {
      id: 'vis-1',
      visitorName: 'Agus Pratama (Kurir Paket)',
      vehiclePlate: 'B 4432 ZZZ',
      destinationHouse: 'Rumah A-17',
      purpose: 'Pengantaran Paket Logistik',
      entryTime: '28 Agu 2026, 14:15 WIB',
      status: 'EXITED',
    },
    {
      id: 'vis-2',
      visitorName: 'Keluarga Bapak Rahmat (Tamu)',
      vehiclePlate: 'B 8899 KLL',
      destinationHouse: 'Rumah B-07',
      purpose: 'Kunjungan Silaturahmi',
      entryTime: '28 Agu 2026, 16:30 WIB',
      status: 'INSIDE',
    },
    {
      id: 'vis-3',
      visitorName: 'Teknisi Internet & Fiber Optic',
      vehiclePlate: 'B 1102 NOP',
      destinationHouse: 'Rumah C-12',
      purpose: 'Perbaikan Jaringan Wifi Warga',
      entryTime: '28 Agu 2026, 17:05 WIB',
      status: 'INSIDE',
    },
  ]);

  const handleScanVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;
    setLoading(true);
    try {
      const res = await fetch('/api/security/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPayload: qrInput })
      });
      const json = await res.json();
      setScanResult(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchingPlate) return;
    const plate = searchingPlate.toUpperCase().trim();
    if (plate.includes('1234') || plate.includes('ABC')) {
      setPlateResult({
        found: true,
        plateNumber: plate,
        vehicle: 'Toyota Avanza (Hitam Metalik)',
        owner: 'Budi Santoso',
        house: 'Rumah A-17 (Blok A)',
        status: 'WARGA RESMI (IPL LUNAS)',
      });
    } else if (plate.includes('5678') || plate.includes('DEF')) {
      setPlateResult({
        found: true,
        plateNumber: plate,
        vehicle: 'Honda Vario 160 (Putih Mutiara)',
        owner: 'Budi Santoso',
        house: 'Rumah A-17 (Blok A)',
        status: 'WARGA RESMI (IPL LUNAS)',
      });
    } else {
      setPlateResult({
        found: false,
        plateNumber: plate,
        message: 'Kendaraan tidak terdaftar dalam database warga komplek (Kategori: Kendaraan Tamu / Non-Warga).',
      });
    }
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPlate) return;
    const newEntry: VisitorLog = {
      id: `vis-${Date.now()}`,
      visitorName: visName,
      vehiclePlate: visPlate.toUpperCase(),
      destinationHouse: `Rumah ${visHouse}`,
      purpose: visPurpose,
      entryTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'INSIDE',
    };
    setVisitors([newEntry, ...visitors]);
    setVisName('');
    setVisPlate('');
  };

  const handleToggleExit = (id: string) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'EXITED' } : v));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            Pos Satpam & Kontrol Gerbang Utama
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Pemindaian QR code kuitansi/visitor pass, identifikasi plat kendaraan warga, dan buku tamu otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Gerbang Utama Pos 1: AKTIF (24 JAM)
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'scan' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Verifikasi QR Pass & Kuitansi
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'lookup' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Car className="w-4 h-4" />
          Cek Plat Kendaraan Warga
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'log' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Buku Tamu Digital ({visitors.filter(v => v.status === 'INSIDE').length} di dalam)
        </button>
      </div>

      {/* TAB 1: QR CODE VERIFIER */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary-600" />
              Input / Scan QR Code
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Arahkan scanner ke QR Code pada Kuitansi Pembayaran Warga atau ketikkan kode referensi transaksi (contoh: <code>INV-202608-A17</code> atau <code>GUEST-B07</code>).
            </p>

            <form onSubmit={handleScanVerify} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik / Scan QR Code..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono text-xs font-bold text-ink"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs"
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setQrInput('INV-202608-A17'); }}
                  className="px-2.5 py-1 bg-canvas hover:bg-primary-50 text-[11px] font-semibold text-primary-700 rounded-lg border border-border"
                >
                  Tes: Kuitansi Rumah A-17
                </button>
                <button
                  type="button"
                  onClick={() => { setQrInput('GUEST-B07-202608'); }}
                  className="px-2.5 py-1 bg-canvas hover:bg-primary-50 text-[11px] font-semibold text-primary-700 rounded-lg border border-border"
                >
                  Tes: Visitor Pass Tamu B-07
                </button>
              </div>
            </form>
          </div>

          {/* Verification Card Result */}
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-card flex flex-col justify-center">
            {scanResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      {scanResult.type}
                    </span>
                    <h4 className="text-base font-bold text-emerald-950">{scanResult.title}</h4>
                  </div>
                </div>

                <div className="p-4 bg-canvas rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Unit Rumah:</span>
                    <strong className="text-ink font-bold">Rumah {scanResult.propertyCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Nama Warga / Tamu:</span>
                    <strong className="text-ink">{scanResult.residentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Keterangan:</span>
                    <strong className="text-ink">{scanResult.periodName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Status Akses:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                      {scanResult.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-primary-900">
                    AKSES DIBERIKAN — PORTAL GERBANG DIBUKA
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <QrCode className="w-10 h-10 text-ink-muted mx-auto" />
                <p className="font-bold text-xs text-ink">Menunggu Pemindaian QR Code</p>
                <p className="text-[11px] text-ink-muted">Hasil verifikasi keabsahan kuitansi atau pass tamu akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLE LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-5">
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Car className="w-4 h-4 text-primary-600" />
              Pencarian Cepat Plat Nomor Kendaraan
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Ketikkan plat nomor kendaraan untuk memeriksa apakah kendaraan tersebut milik warga komplek terdaftar.
            </p>
          </div>

          <form onSubmit={handlePlateSearch} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Contoh: B 1234 ABC"
              value={searchingPlate}
              onChange={(e) => setSearchingPlate(e.target.value)}
              className="flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono text-sm font-bold text-ink uppercase"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs"
            >
              Cari Plat
            </button>
          </form>

          {plateResult && (
            <div className={`p-4 rounded-2xl border ${plateResult.found ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50 border-amber-200'} space-y-3 text-xs`}>
              {plateResult.found ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-emerald-900">{plateResult.plateNumber}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      {plateResult.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60">
                    <div><span className="text-ink-muted block text-[11px]">Jenis Kendaraan</span><strong className="text-ink">{plateResult.vehicle}</strong></div>
                    <div><span className="text-ink-muted block text-[11px]">Nama Pemilik</span><strong className="text-ink">{plateResult.owner}</strong></div>
                    <div><span className="text-ink-muted block text-[11px]">Unit Hunian</span><strong className="text-ink">{plateResult.house}</strong></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium">{plateResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISITOR LOG */}
      {activeTab === 'log' && (
        <div className="space-y-5">
          {/* Add Visitor Form */}
          <form onSubmit={handleAddVisitor} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 text-xs">
            <h3 className="font-bold text-sm text-ink">Catat Tamu Masuk Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-ink block mb-1">Nama Tamu / Kurir</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Dani (Tamu)"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Plat Nomor</label>
                <input
                  type="text"
                  placeholder="B 1234 XYZ"
                  value={visPlate}
                  onChange={(e) => setVisPlate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase text-ink"
                />
              </div>
              <div>
                <label className="font-semibold text-ink block mb-1">Rumah Tujuan</label>
                <select
                  value={visHouse}
                  onChange={(e) => setVisHouse(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl font-semibold text-ink"
                >
                  <option value="A-17">Rumah A-17 (Budi Santoso)</option>
                  <option value="B-07">Rumah B-07 (Hendra Wijaya)</option>
                  <option value="C-12">Rumah C-12 (Siti Rahma)</option>
                  <option value="D-05">Rumah D-05 (Ahmad Fauzi)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold rounded-xl shadow-xs"
                >
                  + Catat Masuk Gerbang
                </button>
              </div>
            </div>
          </form>

          {/* Visitors Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
              <h4 className="font-bold text-ink">Buku Tamu & Log Lalu Lintas Gerbang</h4>
              <span className="text-[11px] text-ink-muted">Otomatis sinkron dengan server</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-canvas border-b border-border text-ink-muted font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Plat Nomor</th>
                    <th className="py-3 px-4">Tujuan</th>
                    <th className="py-3 px-4">Waktu Masuk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-canvas/50">
                      <td className="py-3 px-4 font-bold text-ink">{v.visitorName}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-primary-700">{v.vehiclePlate}</td>
                      <td className="py-3 px-4">{v.destinationHouse}</td>
                      <td className="py-3 px-4 text-ink-muted">{v.entryTime}</td>
                      <td className="py-3 px-4">
                        {v.status === 'INSIDE' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Di Dalam Komplek
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-[10px] font-medium border border-border">
                            Sudah Keluar
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {v.status === 'INSIDE' && (
                          <button
                            type="button"
                            onClick={() => handleToggleExit(v.id)}
                            className="px-2.5 py-1 bg-canvas hover:bg-border text-ink text-[11px] font-semibold rounded-lg border border-border"
                          >
                            Tandai Keluar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
