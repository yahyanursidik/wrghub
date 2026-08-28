import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import "./neon_DiYtP58s.mjs";
import { z } from "zod";
//#region src/pages/api/ai/chat.ts
var chat_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var chatSchema = z.object({
	message: z.string().min(1),
	userRole: z.string().default("RESIDENT"),
	propertyCode: z.string().default("A-17")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const { message, propertyCode } = chatSchema.parse(body);
		const q = message.toLowerCase();
		let reply = "";
		let actionType = "TEXT";
		let suggestedActions = [];
		if (q.includes("rekening") || q.includes("transfer") || q.includes("bayar") || q.includes("bca")) {
			reply = `Halo Bapak/Ibu! Untuk pembayaran iuran bulanan (IPL) Komplek Taman Sejahtera sebesar **Rp 750.000 / bulan**, silakan transfer ke rekening resmi pengurus:\n\n🏦 **Bank BCA (Bank Central Asia)**\n💳 **No. Rekening:** \`8830-1928-33\`\n👤 **Atas Nama:** PENGURUS KOMPLEK TAMAN SEJAHTERA\n\nSetelah transfer, jangan lupa unggah bukti pembayaran di menu *Bayar Iuran* untuk mendapatkan kuitansi berstempel digital resmi ya!`;
			actionType = "PAYMENT_INFO";
			suggestedActions = ["Lihat Status Tagihan Saya", "Cara Cetak Kuitansi"];
		} else if (q.includes("tagihan") || q.includes("status") || q.includes("lunas") || q.includes("iuran")) {
			reply = `Tagihan iuran bulanan untuk unit **Rumah ${propertyCode}** periode **Agustus 2026** tercatat: **LUNAS (TERVERIFIKASI)** sejumlah **Rp 750.000** pada tanggal 20 Agustus 2026.\n\nKuitansi digital resmi ber-QR Code siap diunduh di tab *Iuran*.`;
			actionType = "INVOICE_STATUS";
			suggestedActions = ["Cetak Kuitansi Resmi", "Cek Rekening BCA"];
		} else if (q.includes("satpam") || q.includes("darurat") || q.includes("pos") || q.includes("keamanan") || q.includes("nomor")) {
			reply = `Berikut kontak penting & darurat Komplek Taman Sejahtera yang dapat dihubungi 24 jam:\n\n🚨 **Pos Satpam Utama (24 Jam):** \`0811-9988-7766\`\n👤 **Ketua RW 05 (Bpk. Bambang):** \`0812-3456-7890\`\n🔧 **Petugas Sarana & Pompa Air:** \`0813-8888-9999\`\n\nPetugas satpam siap membantu pengawalan, pengaduan gangguan, maupun kendala palang gerbang otomatis.`;
			actionType = "EMERGENCY_CONTACTS";
			suggestedActions = ["Laporkan Aduan", "Pesan Balai Warga"];
		} else if (q.includes("pesan") || q.includes("fasilitas") || q.includes("balai") || q.includes("lapangan") || q.includes("sewa")) {
			reply = `Untuk memesan / meminjam sarana umum warga (Balai Warga Serbaguna, Lapangan Olahraga, atau Taman Bermain):\n\n1. Masuk ke **Tab Info** di aplikasi.\n2. Klik tombol **"Pesan Sarana"** di bagian atas.\n3. Pilih sarana, tentukan tanggal, jam mulai & jam selesai, serta keperluan acara.\n4. Klik **Ajukan Sewa**.\n\nPengurus komplek akan segera memverifikasi ketersediaan jadwal dalam waktu maksimal 1x24 jam.`;
			actionType = "FACILITY_GUIDE";
			suggestedActions = ["Pesan Balai Warga Sekarang", "Kontak Petugas Sarana"];
		} else if (q.includes("aduan") || q.includes("lapor") || q.includes("rusak") || q.includes("mati") || q.includes("sampah")) {
			reply = `Jika Anda menemukan kendala lingkungan (seperti lampu PJU mati, saluran air tersumbat, atau pohon menghalangi kabel), Anda dapat mengajukan laporan melalui tombol **"Aduan"** di Tab Info.\n\nSetiap laporan akan langsung didisposisikan ke petugas keamanan (Satpam) dan teknisi lingkungan komplek dengan status yang terpantau secara real-time.`;
			actionType = "COMPLAINT_GUIDE";
			suggestedActions = ["Buat Aduan Baru", "Lihat Kontak Satpam"];
		} else if (q.includes("kas") || q.includes("transparansi") || q.includes("saldo") || q.includes("keuangan")) {
			reply = `Ringkasan Laporan Kas & Transparansi Keuangan Komplek Taman Sejahtera periode **Agustus 2026**:\n\n💰 **Saldo Kas Tersedia:** Rp 128.450.000 (di Bank BCA)\n📈 **Total Pemasukan Iuran:** Rp 64.500.000\n📉 **Realisasi Belanja:** Rp 39.150.000\n📊 **Tingkat Kepatuhan Warga:** 94.2% (111 dari 120 rumah Lunas)\n\nLaporan terperinci beserta foto nota kuitansi per pos biaya dapat diakses di portal **/transparency**.`;
			actionType = "TRANSPARENCY_INFO";
			suggestedActions = ["Buka Laporan Transparansi", "Cek Rekening BCA"];
		} else if (q.includes("tata tertib") || q.includes("renovasi") || q.includes("jam malam") || q.includes("aturan")) {
			reply = `Ketentuan & Tata Tertib Utama Komplek Taman Sejahtera 2026:\n\n1. **Jam Tenang & Keamanan:** Pukul 22:00 – 06:00 WIB. Tamu wajib lapor pos satpam.\n2. **Renovasi Rumah:** Pengerjaan renovasi hanya diizinkan Senin – Sabtu pukul 08:00 – 17:00 WIB (Minggu libur).\n3. **Pengangkutan Sampah:** Setiap hari Senin, Rabu, dan Jumat pagi.\n4. **Iuran Bulanan (IPL):** Jatuh tempo tanggal 10 setiap bulan sebesar Rp 750.000.\n\nBerkas lengkap Tata Tertib dapat diunduh di menu *Arsip & Dokumen*.`;
			actionType = "RULES_INFO";
			suggestedActions = ["Unduh Tata Tertib PDF", "Cek Rekening BCA"];
		} else {
			reply = `Halo! Saya adalah **Warga AI**, asisten pintar Komplek Taman Sejahtera. Saya dapat membantu Anda seputar:\n\n- Informasi nomor rekening resmi & status tagihan iuran\n- Prosedur pemesanan Balai Warga & Lapangan\n- Layanan pengajuan keluhan (aduan lingkungan)\n- Kontak darurat pos satpam 24 jam\n- Ringkasan transparansi kas keuangan warga\n\nAda yang bisa saya bantu untuk keperluan hunian Anda?`;
			suggestedActions = [
				"Cek Rekening BCA",
				"Status Tagihan Saya",
				"Kontak Darurat Satpam",
				"Cara Pesan Balai Warga"
			];
		}
		return new Response(JSON.stringify({
			data: {
				reply,
				actionType,
				suggestedActions,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			},
			meta: {},
			error: null
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "AI_CHAT_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/ai/chat@_@ts
var page = () => chat_exports;
//#endregion
export { page };
