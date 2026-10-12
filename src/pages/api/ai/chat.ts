import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { UserSession } from '../../../types/auth';
import { getCommunityProfile } from '../../../services/settings.service';
import { getResidentOverview } from '../../../services/resident-overview.service';
import { getMainAccountBalance } from '../../../services/finance.service';
import { formatRupiah } from '../../../lib/format';

const inputSchema = z.object({ message: z.string().min(1).max(2000) });
export const POST: APIRoute = async ({ request, session }) => {
  try {
    const user = await session?.get('wargahub_user') as UserSession | undefined;
    if (!user) return Response.json({ error: { message: 'Masuk untuk menggunakan bantuan warga.' } }, { status: 401 });
    const { message } = inputSchema.parse(await request.json());
    const query = message.toLowerCase();
    let reply: string;
    let actionType = 'TEXT';
    let suggestedActions: string[] = [];
    if (/tagihan|status|lunas|iuran/.test(query) && !/rekening|bank/.test(query)) {
      const overview = await getResidentOverview(user);
      const invoice = overview.invoices[0];
      reply = invoice ? `Tagihan ${invoice.name} untuk ${overview.property?.code}: ${invoice.status === 'paid' ? 'lunas' : 'belum lunas'}. Nominal ${formatRupiah(invoice.amount)}, sisa ${formatRupiah(invoice.remaining)}. Rincian tersedia di menu Iuran.` : 'Belum ada tagihan yang tercatat untuk rumah akun ini. Buka menu Iuran atau hubungi pengurus untuk memeriksa keterhubungan rumah.';
      actionType = 'INVOICE_STATUS'; suggestedActions = ['Cek rekening komunitas'];
    } else if (/rekening|transfer|bank|bayar/.test(query)) {
      const profile = await getCommunityProfile();
      reply = `Rekening komunitas: ${profile.bankName}, ${profile.bankAccount}, atas nama ${profile.accountHolder}. Setelah transfer, masukkan nomor referensi pada menu Iuran. Bendahara akan memeriksa konfirmasi tersebut; pembayaran tidak otomatis dianggap lunas.`;
      actionType = 'PAYMENT_INFO'; suggestedActions = ['Status tagihan saya'];
    } else if (/darurat|satpam|keamanan|kontak/.test(query)) {
      const profile = await getCommunityProfile();
      reply = `Kontak keamanan yang diatur pengurus: ${profile.securityPhone || 'belum diatur'}. Untuk kegawatdaruratan, hubungi layanan yang sesuai: polisi 110 atau medis 119. Kontak daerah lain perlu dikonfirmasi pengurus.`;
      actionType = 'EMERGENCY_CONTACTS';
    } else if (/kas|transparansi|saldo|keuangan/.test(query)) {
      reply = `Saldo kas yang tercatat: ${formatRupiah(await getMainAccountBalance())}. Buka /transparency untuk rincian pemasukan dan pengeluaran. Ini saldo pembukuan aplikasi, bukan konfirmasi saldo bank secara langsung.`;
      actionType = 'TRANSPARENCY_INFO';
    } else if (/fasilitas|balai|lapangan|pesan|sewa/.test(query)) {
      reply = 'Buka Info & layanan, pilih fasilitas yang tercatat, isi tanggal serta waktu, lalu ajukan reservasi. Pengurus meninjau permohonan; belum ada jaminan persetujuan otomatis.';
      actionType = 'FACILITY_GUIDE';
    } else if (/aduan|lapor|rusak|sampah/.test(query)) {
      reply = 'Gunakan Laporkan aduan di beranda atau menu Info. Masukkan kategori, lokasi, dan uraian kendala. Status ditampilkan berdasarkan catatan pengurus; pengiriman laporan tidak berarti masalah sudah ditangani.';
      actionType = 'COMPLAINT_GUIDE';
    } else if (/aturan|tata tertib|renovasi/.test(query)) {
      reply = 'Ketentuan lingkungan harus mengikuti dokumen resmi pengurus. Saya tidak menetapkan jam kerja atau aturan izin. Minta dokumen terbaru melalui pengurus sebelum melakukan renovasi.';
      actionType = 'RULES_INFO';
    } else {
      reply = 'Saya membantu membaca data dan menjelaskan menu WargaHub. Tanyakan tagihan, rekening komunitas, kontak keamanan, reservasi fasilitas, atau pelaporan aduan.';
      suggestedActions = ['Status tagihan saya', 'Cek rekening komunitas', 'Kontak keamanan'];
    }
    return Response.json({ data: { reply, actionType, suggestedActions, timestamp: new Date().toISOString() }, error: null });
  } catch { return Response.json({ error: { message: 'Bantuan belum bisa membaca data. Coba lagi.' } }, { status: 503 }); }
};
