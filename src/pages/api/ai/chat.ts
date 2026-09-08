import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';

const chatSchema = z.object({
  message: z.string().min(1),
  userRole: z.string().default('RESIDENT'),
  propertyCode: z.string().default('A-17'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, propertyCode } = chatSchema.parse(body);
    const q = message.toLowerCase();

    let reply = '';
    let actionType = 'TEXT';
    let suggestedActions: string[] = [];

    // Context Evaluation Engine for WargaHub
    if (q.includes('rekening') || q.includes('transfer') || q.includes('bayar') || q.includes('bank') || q.includes('bca') || q.includes('syariah') || q.includes('ewallet') || q.includes('gopay') || q.includes('dana')) {
      reply = `Halo Bapak/Ibu! Untuk pembayaran iuran bulanan (IPL) Komplek Grand Sariwangi sebesar **Rp 250.000 / bulan**, silakan transfer ke rekening resmi kas paguyuban (Bank Syariah / Bank Kas Utama):\n\n🌙 **Bank Kas Paguyuban (Bank Jago Syariah / BSI / Kas Utama)**\n💳 **No. Rekening:** \`505621101851\`\n👤 **Atas Nama:** PENGURUS KOMPLEK GRAND SARIWANGI\n📱 **QRIS:** Mendukung GoPay, DANA, OVO, ShopeePay, BSI Mobile, Livin', dll.\n\nSetelah transfer, jangan lupa unggah bukti pembayaran di menu *Bayar Iuran* untuk mendapatkan kuitansi berstempel digital resmi ya!`;
      actionType = 'PAYMENT_INFO';
      suggestedActions = ['Lihat Status Tagihan Saya', 'Cara Cetak Kuitansi'];
    } else if (q.includes('tagihan') || q.includes('status') || q.includes('lunas') || q.includes('iuran')) {
      reply = `Tagihan iuran bulanan untuk unit **Rumah ${propertyCode}** periode **September 2026** tercatat: **LUNAS (TERVERIFIKASI)** sejumlah **Rp 250.000**.\n\nKuitansi digital resmi ber-QR Code siap diunduh di tab *Iuran*.`;
      actionType = 'INVOICE_STATUS';
      suggestedActions = ['Cetak Kuitansi Resmi', 'Cek Rekening Kas Paguyuban'];
    } else if (q.includes('satpam') || q.includes('darurat') || q.includes('pos') || q.includes('keamanan') || q.includes('nomor')) {
      reply = `Berikut kontak penting & darurat Komplek Grand Sariwangi yang dapat dihubungi 24 jam:\n\n🚨 **Pos Satpam Utama (24 Jam):** \`0812-2008-2240\` (Pa Adri Harry)\n👤 **Ketua Lingkungan:** \`0812-3456-7890\`\n🔧 **Petugas Jaga/Fasum:** \`0813-8899-2241\` (Pak Slamet)\n\nPetugas satpam siap membantu pengawalan, pengaduan gangguan, maupun kendala palang gerbang otomatis.`;
      actionType = 'EMERGENCY_CONTACTS';
      suggestedActions = ['Laporkan Aduan', 'Pesan Balai Warga'];
    } else if (q.includes('pesan') || q.includes('fasilitas') || q.includes('balai') || q.includes('lapangan') || q.includes('sewa')) {
      reply = `Untuk memesan / meminjam sarana umum warga (Balai Warga Serbaguna, Lapangan Olahraga, atau Taman Bermain):\n\n1. Masuk ke **Tab Info** di aplikasi.\n2. Klik tombol **"Pesan Sarana"** di bagian atas.\n3. Pilih sarana, tentukan tanggal, jam mulai & jam selesai, serta keperluan acara.\n4. Klik **Ajukan Sewa**.\n\nPengurus komplek akan segera memverifikasi ketersediaan jadwal dalam waktu maksimal 1x24 jam.`;
      actionType = 'FACILITY_GUIDE';
      suggestedActions = ['Pesan Balai Warga Sekarang', 'Kontak Petugas Sarana'];
    } else if (q.includes('aduan') || q.includes('lapor') || q.includes('rusak') || q.includes('mati') || q.includes('sampah')) {
      reply = `Jika Anda menemukan kendala lingkungan (seperti lampu PJU mati, saluran air tersumbat, atau pohon menghalangi kabel), Anda dapat mengajukan laporan melalui tombol **"Aduan"** di Tab Info.\n\nSetiap laporan akan langsung didisposisikan ke petugas keamanan (Satpam) dan teknisi lingkungan komplek dengan status yang terpantau secara real-time.`;
      actionType = 'COMPLAINT_GUIDE';
      suggestedActions = ['Buat Aduan Baru', 'Lihat Kontak Satpam'];
    } else if (q.includes('kas') || q.includes('transparansi') || q.includes('saldo') || q.includes('keuangan')) {
      reply = `Ringkasan Laporan Kas & Transparansi Keuangan Komplek Grand Sariwangi periode **Agustus - September 2026**:\n\n💰 **Saldo Kas Tersedia:** Rp 125.000 (di Kas Paguyuban)\n📈 **Total Penerimaan Kas:** Rp 3.000.000\n📉 **Realisasi Belanja:** Rp 2.875.000\n📊 **Tingkat Kepatuhan Warga:** 100%\n\nLaporan terperinci beserta foto nota kuitansi per pos biaya dapat diakses di portal **/transparency**.`;
      actionType = 'TRANSPARENCY_INFO';
      suggestedActions = ['Buka Laporan Transparansi', 'Cek Rekening Kas Paguyuban'];
    } else if (q.includes('tata tertib') || q.includes('renovasi') || q.includes('jam malam') || q.includes('aturan')) {
      reply = `Ketentuan & Tata Tertib Utama Komplek Grand Sariwangi 2026:\n\n1. **Jam Tenang & Keamanan:** Pukul 23:00 – 06:00 WIB. Tamu wajib lapor pos satpam.\n2. **Renovasi Rumah:** Pengerjaan renovasi hanya diizinkan Senin – Sabtu pukul 08:00 – 17:00 WIB (Minggu libur).\n3. **Pengangkutan Sampah:** Setiap hari Senin, Rabu, dan Jumat pagi.\n4. **Iuran Bulanan (IPL):** Jatuh tempo tanggal 10 setiap bulan sebesar Rp 250.000.\n\nBerkas lengkap Tata Tertib dapat diunduh di menu *Arsip & Dokumen*.`;
      actionType = 'RULES_INFO';
      suggestedActions = ['Unduh Tata Tertib PDF', 'Cek Rekening Kas Paguyuban'];
    } else {
      reply = `Halo! Saya adalah **Warga AI**, asisten pintar Komplek Grand Sariwangi. Saya dapat membantu Anda seputar:\n\n- Informasi nomor rekening resmi & status tagihan iuran\n- Prosedur pemesanan Balai Warga & Lapangan\n- Layanan pengajuan keluhan (aduan lingkungan)\n- Kontak darurat pos satpam 24 jam\n- Ringkasan transparansi kas keuangan warga\n\nAda yang bisa saya bantu untuk keperluan hunian Anda?`;
      suggestedActions = ['Cek Rekening Kas Paguyuban', 'Status Tagihan Saya', 'Kontak Darurat Satpam', 'Cara Pesan Balai Warga'];
    }

    return new Response(
      JSON.stringify({
        data: {
          reply,
          actionType,
          suggestedActions,
          timestamp: new Date().toISOString(),
        },
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'AI_CHAT_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
