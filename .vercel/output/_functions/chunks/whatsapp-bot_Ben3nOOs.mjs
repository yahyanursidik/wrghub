import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { t as ArrowRight } from "./arrow-right_mlyUmvNp.mjs";
import { a as Send, f as Bot, l as ExternalLink, u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { a as Search, c as Clock, i as Settings, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { n as ChevronLeft, t as TriangleAlert } from "./triangle-alert_B5tHnjPA.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as CircleCheckBig } from "./circle-check-big_CC1sim4d.mjs";
import { n as Copy, t as Share2 } from "./share-2_DSWVcV1l.mjs";
import { n as PenLine, t as Trash2 } from "./trash-2_DsHxZaM2.mjs";
import { t as Plus } from "./plus_BFr6lPwe.mjs";
import { useMemo, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CheckCheck = createLucideIcon("CheckCheck", [["path", {
	d: "M18 6 7 17l-5-5",
	key: "116fxf"
}], ["path", {
	d: "m22 10-7.5 7.5L13 16",
	key: "ke71qq"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MessageSquare = createLucideIcon("MessageSquare", [["path", {
	d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
	key: "1lielz"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RefreshCw = createLucideIcon("RefreshCw", [
	["path", {
		d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
		key: "v9h5vc"
	}],
	["path", {
		d: "M21 3v5h-5",
		key: "1q7to0"
	}],
	["path", {
		d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
		key: "3uifl3"
	}],
	["path", {
		d: "M8 16H3v5",
		key: "1cv678"
	}]
]);
//#endregion
//#region src/components/admin/WhatsAppBotSimulator.tsx
var WhatsAppBotSimulator = () => {
	const [activeTab, setActiveTab] = useState("templates");
	const [selectedCategory, setSelectedCategory] = useState("ALL");
	const [templateSearch, setTemplateSearch] = useState("");
	const [selectedTemplateId, setSelectedTemplateId] = useState("tpl-ipl-reminder");
	const [copiedId, setCopiedId] = useState(null);
	const [toastMessage, setToastMessage] = useState(null);
	const [templatePage, setTemplatePage] = useState(1);
	const templatePageSize = 6;
	const [varRecipientPhone, setVarRecipientPhone] = useState("081234567890");
	const [varResidentName, setVarResidentName] = useState("Bpk. Budi Santoso");
	const [varHouseUnit, setVarHouseUnit] = useState("Rumah A-17 (Blok A)");
	const [varMonthPeriod, setVarMonthPeriod] = useState("Agustus 2026");
	const [varAmount, setVarAmount] = useState("750.000");
	const [varBankAccount, setVarBankAccount] = useState("BCA 8830-1928-33 (PENGURUS KOMPLEK)");
	const [varDueDate, setVarDueDate] = useState("10 Agustus 2026");
	const [varPortalLink, setVarPortalLink] = useState("http://localhost:4321/");
	const [varEventName, setVarEventName] = useState("Musyawarah Warga Pemilihan RT/RW");
	const [varEventTime, setVarEventTime] = useState("Sabtu, 30 Agustus 2026 • Pukul 19:30 WIB");
	const [varEventLocation, setVarEventLocation] = useState("Balai Warga Taman Sejahtera");
	const [varGuestName, setVarGuestName] = useState("Kurir Paket / Teknisi");
	const [varCustomNotes, setVarCustomNotes] = useState("Harap konfirmasi jika sudah melakukan transfer.");
	const [showTemplateModal, setShowTemplateModal] = useState(false);
	const [editingTemplateId, setEditingTemplateId] = useState(null);
	const [formTplTitle, setFormTplTitle] = useState("");
	const [formTplCategory, setFormTplCategory] = useState("KEUANGAN");
	const [formTplTarget, setFormTplTarget] = useState("WARGA_INDIVIDU");
	const [formTplDesc, setFormTplDesc] = useState("");
	const [formTplText, setFormTplText] = useState("");
	const [tplSaving, setTplSaving] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState(null);
	const [templates, setTemplates] = useState([
		{
			id: "tpl-ipl-reminder",
			title: "Pengingat Tagihan Iuran Bulanan (IPL)",
			category: "KEUANGAN",
			targetType: "WARGA_INDIVIDU",
			description: "Pesan pengingat pembayaran iuran keamanan, kebersihan & IPL bulanan sebelum jatuh tempo.",
			tags: [
				"IPL",
				"Iuran",
				"Tagihan",
				"Bulanan"
			],
			templateText: `Halo Bapak/Ibu {nama_warga} ({nomor_unit}) 🌿\n\nKami dari *Pengurus Paguyuban Warga* ingin menginformasikan tagihan *Iuran Pengelolaan Lingkungan (IPL)* untuk periode *{bulan}*:\n\n💵 *Nominal:* Rp {nominal}\n🗓️ *Jatuh Tempo:* {tgl_tempo}\n🏦 *Pembayaran Transfer:*\n*{no_rekening}*\n\n📲 *Konfirmasi & Kuitansi Digital:*\n{link_portal}\n\n{catatan_tambahan}\n\nTerima kasih atas partisipasi dan kerjasamanya menjaga kenyamanan komplek kita bersama. 🙏`
		},
		{
			id: "tpl-payment-receipt",
			title: "Kuitansi & Konfirmasi Pembayaran Lunas",
			category: "KEUANGAN",
			targetType: "WARGA_INDIVIDU",
			description: "Pemberitahuan resmi bahwa iuran bulanan telah diterima dan diverifikasi bendahara.",
			tags: [
				"Kuitansi",
				"Lunas",
				"Verifikasi",
				"BCA"
			],
			templateText: `✅ *KONFIRMASI PEMBAYARAN IURAN LUNAS*\n\nKepada Yth: *{nama_warga}*\nUnit: *{nomor_unit}*\nPeriode: *{bulan}*\nJumlah Diterima: *Rp {nominal}*\nStatus: *LUNAS (TERVERIFIKASI BENDAHARA)*\n\nKuitansi digital ber-QR Code resmi dan hak akses palang gerbang RFID Anda telah otomatis diperpanjang.\n\nUnduh kuitansi resmi: {link_portal}\n\nSalam hangat,\n*Pengurus Komplek Taman Sejahtera*`
		},
		{
			id: "tpl-overdue-warning",
			title: "Surat Peringatan / Teguran Tunggakan Iuran",
			category: "KEUANGAN",
			targetType: "WARGA_INDIVIDU",
			description: "Pemberitahuan persuasif untuk unit yang memiliki tunggakan iuran lebih dari 1 bulan.",
			tags: [
				"Tunggakan",
				"SP",
				"Peringatan",
				"Bendahara"
			],
			templateText: `Yth. Bapak/Ibu {nama_warga}\nPemilik/Penghuni *{nomor_unit}*\n\nBerdasarkan rekapitulasi buku kas pengurus, tercatat terdapat *tunggakan iuran IPL* untuk unit Anda sebesar *Rp {nominal}* (Periode: {bulan}).\n\nDemi kelancaran operasional pos satpam 24 jam dan kebersihan lingkungan, kami mohon bantuan Bapak/Ibu untuk menyelesaikan kewajiban tersebut melalui rekening:\n*{no_rekening}*\n\nApabila memerlukan klarifikasi atau penyesuaian jadwal, silakan hubungi Bendahara di nomor ini.\n\nTerima kasih atas perhatian dan kerjasamanya. 🙏`
		},
		{
			id: "tpl-kas-transparency",
			title: "Laporan Kas & Transparansi Keuangan Warga",
			category: "KEUANGAN",
			targetType: "GRUP_WARGA",
			description: "Broadcast laporan kas masuk, kas keluar, dan saldo bank untuk transparansi seluruh warga.",
			tags: [
				"Transparansi",
				"Kas",
				"Laporan",
				"Grup WA"
			],
			templateText: `📢 *LAPORAN TRANSPARANSI KAS WARGA BULAN {bulan}* 📊\n\nBapak/Ibu warga yang kami hormati, berikut ringkasan laporan keuangan komplek per bulan ini:\n\n💰 *Total Saldo Kas Bank:* Rp 128.450.000\n📈 *Pemasukan Iuran:* Rp 64.500.000\n📉 *Pengeluaran Operasional:* Rp 39.150.000\n\n🔍 Rincian seluruh nota belanja, slip gaji satpam, dan bukti transaksi dapat diakses secara transparan dan terbuka di portal warga:\n👉 {link_portal}transparency\n\n*Pengurus Paguyuban Warga Bersama*`
		},
		{
			id: "tpl-security-guest",
			title: "Pemberitahuan Tamu / Kurir di Pos Satpam",
			category: "KEAMANAN",
			targetType: "WARGA_INDIVIDU",
			description: "Notifikasi satpam kepada warga saat ada kurir paket atau tamu datang berkunjung.",
			tags: [
				"Satpam",
				"Tamu",
				"Kurir",
				"Gerbang"
			],
			templateText: `👮 *POS SATPAM GERBANG UTAMA* 🛡️\n\nSelamat siang Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nKami menginformasikan bahwa saat ini ada *{nama_tamu}* di Pos Gerbang Utama yang bermaksud mengantarkan kiriman / berkunjung ke rumah Anda.\n\nMohon konfirmasinya apakah diizinkan masuk ke area perumahan?\n\nTerima kasih,\n*Petugas Jaga Pos Satpam 24 Jam*`
		},
		{
			id: "tpl-security-panic",
			title: "Peringatan Darurat Keamanan (Panic Alert)",
			category: "KEAMANAN",
			targetType: "GRUP_WARGA",
			description: "Broadcast peringatan darurat keamanan, kebakaran, atau evakuasi darurat komplek.",
			tags: [
				"Darurat",
				"Panic Button",
				"Satpam",
				"Waspada"
			],
			templateText: `🚨 *PERINGATAN DARURAT KEAMANAN KOMPLEK* 🚨\n\nPerhatian seluruh warga Komplek Taman Sejahtera!\nTelah dilaporkan insiden darurat di area sekitar *{nomor_unit}*.\n\nPetugas satpam dan tim tanggap darurat saat ini sedang menuju ke lokasi.\n\nHarap warga tetap tenang, pastikan pintu & pagar rumah terkunci, dan hubungi pos keamanan jika melihat aktivitas mencurigakan:\n📞 *Hotline Satpam:* 0811-9988-7766\n\n*Komando Keamanan Lingkungan*`
		},
		{
			id: "tpl-rfid-blocked",
			title: "Notifikasi Pembatasan Akses Palang Gerbang RFID",
			category: "KEAMANAN",
			targetType: "WARGA_INDIVIDU",
			description: "Pemberitahuan pembatasan akses barrier gate otomatis akibat kendala teknis/tunggakan.",
			tags: [
				"RFID",
				"Barrier Gate",
				"Akses",
				"Satpam"
			],
			templateText: `Pemberitahuan Sistem Barrier Gate RFID 🚗\n\nYth. Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nHak akses palang otomatis untuk kendaraan Anda saat ini berstatus *TIDAK AKTIF / TERBATAS*.\n\nUntuk mengaktifkan kembali stiker RFID dan pembukaan palang otomatis gerbang 1 & 2, mohon hubungi pengurus atau selesaikan administrasi di portal:\n👉 {link_portal}\n\nTerima kasih,\n*Sistem Manajemen Akses Gerbang Komplek*`
		},
		{
			id: "tpl-renovation-permit",
			title: "Surat Izin Masuk Tukang & Pekerja Bangunan",
			category: "LINGKUNGAN",
			targetType: "WARGA_INDIVIDU",
			description: "Konfirmasi terbitnya izin kerja renovasi rumah dan nomor ID pass pekerja bangunan.",
			tags: [
				"Renovasi",
				"Tukang",
				"Izin",
				"Jam Kerja"
			],
			templateText: `🔨 *SURAT IZIN KERJA RENOVASI RUMAH* 🏗️\n\nKepada Yth. {nama_warga} ({nomor_unit}),\n\nPermohonan izin pekerjaan renovasi rumah Anda telah *DISETUJUI PENGURUS* dengan rincian:\n\n👷 *Penanggung Jawab:* Mandor Sugeng\n🗓️ *Masa Berlaku:* {tgl_tempo}\n⏰ *Jam Kerja Diizinkan:* 08:00 - 17:00 WIB (Senin s/d Sabtu)\n\n*Tata Tertib:* Pekerja wajib mengenakan rompi ID Pass tukang dan dilarang menumpuk material pasir di badan jalan aspal warga.\n\nDokumen izin: {link_portal}\n*Pengurus Lingkungan RT/RW*`
		},
		{
			id: "tpl-noise-warning",
			title: "Teguran Kebisingan / Material Pasir Menutup Jalan",
			category: "LINGKUNGAN",
			targetType: "WARGA_INDIVIDU",
			description: "Teguran sopan terkait pekerjaan bising di luar jam kerja atau tumpukan material.",
			tags: [
				"Teguran",
				"Ketertiban",
				"Material",
				"Jalan"
			],
			templateText: `Selamat siang Bapak/Ibu {nama_warga} ({nomor_unit}),\n\nKami menerima masukan dari tetangga sekitar terkait aktivitas pengerjaan / penumpukan material yang berada di depan rumah Anda.\n\nSesuai tata tertib perumahan, mohon bantuan untuk:\n1. Memindahkan material pasir/batu agar tidak mempersempit jalan papasan mobil warga.\n2. Menghentikan suara bising mesin di atas jam 17:00 WIB dan di hari Minggu.\n\nTerima kasih banyak atas pengertian dan toleransi antar tetangga. 🙏`
		},
		{
			id: "tpl-fogging-schedule",
			title: "Jadwal Fogging Nyamuk DBD & Kerja Bakti",
			category: "LINGKUNGAN",
			targetType: "GRUP_WARGA",
			description: "Pengumuman agenda pengasapan nyamuk demam berdarah dan kerja bakti lingkungan.",
			tags: [
				"Fogging",
				"Kerja Bakti",
				"DBD",
				"Kesehatan"
			],
			templateText: `🌿 *PEMBERITAHUAN JADWAL FOGGING NYAMUK DBD* 🦟\n\nYth. Seluruh Warga Komplek Taman Sejahtera,\n\nGuna mengantisipasi penyebaran jentik nyamuk DBD di musim penghujan, pengurus akan melaksanakan kegiatan *Fogging & Kerja Bakti Saluran Air* pada:\n\n🗓️ *Hari/Tanggal:* {tgl_acara}\n📍 *Lokasi:* Seluruh Blok A, B, C, D dan Area Kavling\n\n*Himbauan Warga:*\n- Tutup makanan/minuman dan wadah air bersih.\n- Buka jendela dan pintu pagar saat petugas melintas.\n- Amankan hewan peliharaan di tempat yang aman.\n\n*Seksi Kebersihan & Kesehatan Lingkungan*`
		},
		{
			id: "tpl-utility-outage",
			title: "Pemberitahuan Pemadaman Listrik / Gangguan Air PAM",
			category: "LINGKUNGAN",
			targetType: "GRUP_WARGA",
			description: "Informasi awal pemeliharaan gardu listrik PLN atau perbaikan pipa air bersih PAM.",
			tags: [
				"PLN",
				"Air PAM",
				"Pemadaman",
				"Info Darurat"
			],
			templateText: `⚠️ *INFORMASI PEMELIHARAAN LISTRIK / AIR PAM* 💧\n\nBapak/Ibu warga komplek,\nBerdasarkan surat edaran dari pihak instansi terkait, akan diadakan pekerjaan pemeliharaan jaringan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n⚡ *Dampak:* Pemadaman aliran listrik / penurunan tekanan air PAM sementara\n\nMohon warga dapat melakukan persiapan cadangan air bersih dan pengisian daya perangkat sebelumnya.\n\n*Pengurus Lingkungan & Sarana*`
		},
		{
			id: "tpl-meeting-invitation",
			title: "Undangan Rapat Warga / Musyawarah RT/RW",
			category: "MUSYAWARAH",
			targetType: "GRUP_WARGA",
			description: "Undangan resmi pertemuan tatap muka musyawarah pengurus dan seluruh kepala keluarga.",
			tags: [
				"Undangan",
				"Musyawarah",
				"Rapat",
				"RT/RW"
			],
			templateText: `📜 *UNDANGAN MUSYAWARAH WARGA PAGUYUBAN* 🤝\n\nKepada Yth.\nBapak/Ibu Warga Komplek Taman Sejahtera,\n\nDengan hormat, kami mengundang kehadiran Bapak/Ibu pada agenda *{nama_acara}* yang akan diselenggarakan pada:\n\n🗓️ *Waktu:* {tgl_acara}\n📍 *Tempat:* {lokasi_acara}\n📋 *Agenda Utama:* Evaluasi keamanan lingkungan, laporan keuangan, dan rencana perbaikan aspal jalan.\n\nKehadiran dan sumbang saran Bapak/Ibu sangat berarti bagi kemajuan perumahan kita tercinta.\n\n*Ketua Paguyuban & Jajaran Pengurus*`
		},
		{
			id: "tpl-voting-broadcast",
			title: "Ajakan Partisipasi E-Voting Pemilihan Pengurus",
			category: "MUSYAWARAH",
			targetType: "GRUP_WARGA",
			description: "Broadcast ajakan menggunakan hak suara dalam pemilihan ketua komplek / musyawarah digital.",
			tags: [
				"Voting",
				"E-Voting",
				"Pemilihan",
				"Demokrasi"
			],
			templateText: `🗳️ *PEMILIHAN KETUA PAGUYUBAN WARGA 2026-2029* 🇮🇩\n\nSetiap 1 unit rumah berhak memberikan 1 suara sah secara transparan dan rahasia melalui sistem *E-Voting WargaHub*.\n\nBatas waktu pemilihan akan ditutup pada: *{tgl_tempo}*.\n\nSilakan klik tautan berikut untuk melihat visi-misi calon dan berikan suara Anda sekarang:\n👉 {link_portal}admin/voting\n\n*Panitia Pemilihan Warga Mandiri*`
		},
		{
			id: "tpl-welcome-neighbor",
			title: "Sambutan Penghuni / Warga Baru",
			category: "SOSIAL",
			targetType: "GRUP_WARGA",
			description: "Pesan penyambutan hangat bagi keluarga baru yang baru pindah ke lingkungan komplek.",
			tags: [
				"Warga Baru",
				"Sambutan",
				"Sosial",
				"Guyub"
			],
			templateText: `🎉 *SELAMAT DATANG DI KOMPLEK TAMAN SEJAHTERA!* 🏡\n\nMari kita sambut hangat bergabungnya keluarga *{nama_warga}* yang menempati *{nomor_unit}*.\n\nSelamat datang di lingkungan yang aman, asri, dan guyub rukun. Semoga senantiasa betah, nyaman, dan penuh berkah tinggal bersama kita semua.\n\nBagi warga yang berpapasan, jangan sungkan untuk saling bertegur sapa ya! 😊\n\n*Keluarga Besar Paguyuban Warga*`
		},
		{
			id: "tpl-condolence",
			title: "Berita Duka Cita & Lelayu Warga",
			category: "SOSIAL",
			targetType: "GRUP_WARGA",
			description: "Informasi lelayu/duka cita dan informasi takziyah serta pemakaman almarhum/ah.",
			tags: [
				"Duka Cita",
				"Lelayu",
				"Takziyah",
				"Kemanusiaan"
			],
			templateText: `Inna lillahi wa inna ilaihi raji'un 🕯️\n\nTelah berpulang ke rahmatullah salah satu keluarga/warga kita tercinta:\n*Almarhum/Almarhumah dari keluarga {nama_warga} ({nomor_unit})*.\n\nRumah Duka: *{nomor_unit}*\nRencana Pemakaman: *{tgl_acara}*\n\nSegenap warga Komplek Taman Sejahtera turut berbelasungkawa yang sedalam-dalamnya. Semoga almarhum/ah husnul khatimah dan keluarga yang ditinggalkan diberikan ketabahan dan keikhlasan. Aamiin ya rabbal 'alamin. 🙏`
		}
	]);
	const activeTemplate = useMemo(() => {
		return templates.find((t) => t.id === selectedTemplateId) || templates[0];
	}, [templates, selectedTemplateId]);
	const generatedMessageText = useMemo(() => {
		if (!activeTemplate) return "";
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
		varCustomNotes
	]);
	const cleanPhoneNumber = useMemo(() => {
		let num = varRecipientPhone.replace(/[^0-9]/g, "");
		if (num.startsWith("0")) num = "62" + num.slice(1);
		return num || "6281234567890";
	}, [varRecipientPhone]);
	const finalWaMeLink = useMemo(() => {
		return `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(generatedMessageText)}`;
	}, [cleanPhoneNumber, generatedMessageText]);
	const showToast = (msg) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 3500);
	};
	const handleCopyMessage = () => {
		navigator.clipboard.writeText(generatedMessageText);
		setCopiedId("msg");
		showToast("Teks pesan WhatsApp berhasil disalin!");
		setTimeout(() => setCopiedId(null), 2500);
	};
	const handleCopyLink = () => {
		navigator.clipboard.writeText(finalWaMeLink);
		setCopiedId("link");
		showToast("Tautan wa.me berhasil disalin ke clipboard!");
		setTimeout(() => setCopiedId(null), 2500);
	};
	const handleOpenWhatsApp = () => {
		window.open(finalWaMeLink, "_blank", "noopener,noreferrer");
	};
	const filteredTemplates = useMemo(() => {
		return templates.filter((t) => {
			const matchCat = selectedCategory === "ALL" || t.category === selectedCategory;
			const matchSearch = t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase()) || t.tags.some((tag) => tag.toLowerCase().includes(templateSearch.toLowerCase()));
			return matchCat && matchSearch;
		});
	}, [
		templates,
		selectedCategory,
		templateSearch
	]);
	const totalFilteredTemplates = filteredTemplates.length;
	const totalTemplatePages = Math.max(1, Math.ceil(totalFilteredTemplates / templatePageSize));
	const safeTplPage = Math.min(templatePage, totalTemplatePages);
	const tplStartIndex = (safeTplPage - 1) * templatePageSize;
	const tplEndIndex = Math.min(tplStartIndex + templatePageSize, totalFilteredTemplates);
	const paginatedTemplates = filteredTemplates.slice(tplStartIndex, tplEndIndex);
	const handleSaveTemplate = async (e) => {
		e.preventDefault();
		setTplSaving(true);
		try {
			const payload = {
				title: formTplTitle,
				category: formTplCategory,
				targetType: formTplTarget,
				description: formTplDesc,
				templateText: formTplText,
				tags: ["Custom", formTplCategory]
			};
			if ((await fetch("/api/whatsapp/templates/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			})).ok) {
				if (editingTemplateId) {
					setTemplates(templates.map((t) => t.id === editingTemplateId ? {
						...t,
						...payload,
						id: editingTemplateId
					} : t));
					showToast(`Template "${formTplTitle}" berhasil diperbarui.`);
				} else {
					const newTpl = {
						id: `tpl-${Date.now()}`,
						...payload,
						isCustom: true
					};
					setTemplates([newTpl, ...templates]);
					setSelectedTemplateId(newTpl.id);
					showToast(`Template baru "${formTplTitle}" berhasil dibuat.`);
				}
				setShowTemplateModal(false);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menyimpan template WhatsApp.");
		} finally {
			setTplSaving(false);
		}
	};
	const handleConfirmDeleteTemplate = async () => {
		if (!templateToDelete) return;
		try {
			if ((await fetch("/api/whatsapp/templates/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					templateId: templateToDelete.id,
					title: templateToDelete.title
				})
			})).ok) {
				setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
				showToast(`Template "${templateToDelete.title}" berhasil dihapus.`);
				if (selectedTemplateId === templateToDelete.id) setSelectedTemplateId(templates[0]?.id || "");
				setTemplateToDelete(null);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menghapus template.");
		}
	};
	const handleOpenEdit = (t) => {
		setEditingTemplateId(t.id);
		setFormTplTitle(t.title);
		setFormTplCategory(t.category);
		setFormTplTarget(t.targetType);
		setFormTplDesc(t.description);
		setFormTplText(t.templateText);
		setShowTemplateModal(true);
	};
	const handleOpenCreate = () => {
		setEditingTemplateId(null);
		setFormTplTitle("");
		setFormTplCategory("KEUANGAN");
		setFormTplTarget("WARGA_INDIVIDU");
		setFormTplDesc("");
		setFormTplText(`Halo Bapak/Ibu {nama_warga} ({nomor_unit}) 🌿\n\nKami menginformasikan...\n\nSalam,\n*Pengurus Komplek*`);
		setShowTemplateModal(true);
	};
	const [messages, setMessages] = useState([{
		id: "wa-1",
		sender: "bot",
		text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
		time: "14:20"
	}]);
	const [inputText, setInputText] = useState("");
	const [phoneSim, setPhoneSim] = useState("0812-3456-7890 (Rumah A-17)");
	const handleSendBot = (text) => {
		if (!text.trim()) return;
		const userMsg = {
			id: `usr-${Date.now()}`,
			sender: "user",
			text,
			time: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit"
			})
		};
		let reply = "";
		const clean = text.trim();
		if (clean === "1" || clean.toLowerCase().includes("tagihan") || clean.toLowerCase().includes("iuran")) reply = `📋 *STATUS TAGIHAN IURAN WARGA*\n\n🏡 *Unit:* Rumah A-17 (Bpk. Budi Santoso)\n🗓️ *Periode:* Agustus 2026\n💵 *Nominal:* Rp 750.000\n✅ *Status:* *LUNAS (VERIFIED)*\n\nKuitansi digital ber-QR code dapat diunduh di portal warga: http://localhost:4321/`;
		else if (clean === "2" || clean.toLowerCase().includes("rekening") || clean.toLowerCase().includes("bca")) reply = `🏦 *REKENING RESMI IURAN KOMPLEK*\n\nBank: *Bank BCA (Bank Central Asia)*\nNo. Rekening: *8830-1928-33*\nAtas Nama: *PENGURUS KOMPLEK TAMAN SEJAHTERA*\nTarif Iuran: *Rp 750.000 / bulan*\n\nHarap simpan bukti transfer untuk konfirmasi di aplikasi.`;
		else if (clean === "3" || clean.toLowerCase().includes("satpam") || clean.toLowerCase().includes("darurat")) reply = `🚨 *KONTAK DARURAT 24 JAM*\n\n👮 *Pos Satpam Utama:* 0811-9988-7766\n👤 *Ketua RW 05:* 0812-3456-7890\n🔧 *Petugas Sarana:* 0813-8888-9999\n\nPetugas satpam siap membantu 24 jam non-stop.`;
		else if (clean === "4" || clean.toLowerCase().includes("booking") || clean.toLowerCase().includes("balai")) reply = `🏟️ *PEMESANAN FASILITAS UMUM*\n\nUntuk meminjam Balai Warga atau Lapangan Olahraga, silakan isi formulir tanggal & jam pemakaian di menu *Pesan Sarana* pada aplikasi WargaHub.`;
		else if (clean === "5" || clean.toLowerCase().includes("kas") || clean.toLowerCase().includes("transparansi")) reply = `📊 *RINGKASAN KAS BULAN AGUSTUS 2026*\n\n💰 *Total Kas BCA:* Rp 128.450.000\n📈 *Pemasukan:* Rp 64.500.000\n📉 *Pengeluaran:* Rp 39.150.000\n\nRincian nota belanja lengkap: http://localhost:4321/transparency`;
		else reply = `Maaf, pesan tidak dikenali. Ketik angka *1*, *2*, *3*, *4*, atau *5* untuk memilih menu layanan warga.`;
		const botMsg = {
			id: `bot-${Date.now() + 1}`,
			sender: "bot",
			text: reply,
			time: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit"
			})
		};
		setMessages((prev) => [
			...prev,
			userMsg,
			botMsg
		]);
		setInputText("");
	};
	const handleResetBot = () => {
		setMessages([{
			id: "wa-1",
			sender: "bot",
			text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
			time: "14:20"
		}]);
	};
	const getCategoryBadge = (cat) => {
		switch (cat) {
			case "KEUANGAN": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200",
				children: "💰 KEUANGAN & IURAN"
			});
			case "KEAMANAN": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-black border border-rose-200",
				children: "🚨 KEAMANAN & GATE"
			});
			case "LINGKUNGAN": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200",
				children: "🔨 LINGKUNGAN & RENOVASI"
			});
			case "MUSYAWARAH": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-black border border-indigo-200",
				children: "🗳️ MUSYAWARAH & VOTING"
			});
			case "SOSIAL": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-black border border-sky-200",
				children: "🎉 SOSIAL & WARGA"
			});
			default: return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-canvas text-ink text-[10px] font-bold",
				children: cat
			});
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			toastMessage && /* @__PURE__ */ jsxs("div", {
				className: "fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3",
				children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-4 h-4 text-emerald-200" }), /* @__PURE__ */ jsx("span", { children: toastMessage })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsxs("h1", {
						className: "text-2xl font-black tracking-tight text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-6 h-6 text-emerald-600" }), "Pusat Komunikasi WhatsApp & Template wa.me"]
					}), /* @__PURE__ */ jsxs("span", {
						className: "px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200",
						children: [templates.length, " Template Siap Pakai"]
					})]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-xs text-ink-muted mt-1",
					children: [
						"Koleksi template pesan resmi WhatsApp untuk segala keperluan komplek (Iuran, Kuitansi, SP Tunggakan, Satpam, Renovasi, Undangan Rapat, hingga Berita Duka). Siap kirim 1-klik via tautan ",
						/* @__PURE__ */ jsx("strong", { children: "wa.me" }),
						"."
					]
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [activeTab === "templates" && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenCreate,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Buat Template Baru"]
					}), activeTab === "simulator" && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleResetBot,
						className: "inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 text-ink-muted" }), "Reset Percakapan"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar",
				children: [
					{
						id: "templates",
						label: "Direktori & Generator Template wa.me",
						icon: MessageSquare,
						count: templates.length
					},
					{
						id: "simulator",
						label: "Simulator Bot Otomatis 24 Jam",
						icon: Bot
					},
					{
						id: "history",
						label: "Riwayat Broadcast & Log Pengiriman",
						icon: Clock,
						count: 24
					},
					{
						id: "settings",
						label: "Pengaturan Gateway & No. Pengirim",
						icon: Settings
					}
				].map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					return /* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab(tab.id),
						className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-emerald-600 text-white shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [
							/* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
							/* @__PURE__ */ jsx("span", { children: tab.label }),
							tab.count !== void 0 && /* @__PURE__ */ jsx("span", {
								className: `px-1.5 py-0.2 rounded-md text-[10px] font-black ${isActive ? "bg-white/20 text-white" : "bg-canvas text-ink-muted border border-border"}`,
								children: tab.count
							})
						]
					}, tab.id);
				})
			}),
			activeTab === "templates" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-6 animate-in fade-in duration-150",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "w-full sm:w-80 relative",
						children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-3" }), /* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Cari template (cth: iuran, kuitansi, satpam, rapat, duka)...",
							value: templateSearch,
							onChange: (e) => {
								setTemplateSearch(e.target.value);
								setTemplatePage(1);
							},
							className: "w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap items-center gap-2 w-full sm:w-auto",
						children: [
							{
								id: "ALL",
								label: "Semua Kategori"
							},
							{
								id: "KEUANGAN",
								label: "💰 Keuangan & Iuran"
							},
							{
								id: "KEAMANAN",
								label: "🚨 Keamanan & Gate"
							},
							{
								id: "LINGKUNGAN",
								label: "🔨 Lingkungan & Renovasi"
							},
							{
								id: "MUSYAWARAH",
								label: "🗳️ Musyawarah & Rapat"
							},
							{
								id: "SOSIAL",
								label: "🎉 Sosial & Warga"
							}
						].map((c) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => {
								setSelectedCategory(c.id);
								setTemplatePage(1);
							},
							className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedCategory === c.id ? "bg-emerald-600 text-white shadow-xs" : "bg-canvas border border-border text-ink hover:bg-surface"}`,
							children: c.label
						}, c.id))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-5 space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-xs text-ink-muted px-1",
								children: [/* @__PURE__ */ jsx("span", { children: "Pilih Template Pesan:" }), /* @__PURE__ */ jsxs("span", { children: [filteredTemplates.length, " Template Ditemukan"] })]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "space-y-2.5",
								children: paginatedTemplates.length === 0 ? /* @__PURE__ */ jsxs("div", {
									className: "p-8 text-center bg-surface rounded-2xl border border-border text-ink-muted text-xs",
									children: [
										"Tidak ada template yang cocok dengan pencarian \"",
										templateSearch,
										"\"."
									]
								}) : paginatedTemplates.map((tpl) => {
									const isSelected = selectedTemplateId === tpl.id;
									return /* @__PURE__ */ jsxs("div", {
										onClick: () => setSelectedTemplateId(tpl.id),
										className: `p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${isSelected ? "bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/30" : "bg-surface border-border hover:border-emerald-300 hover:shadow-xs"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between",
												children: [getCategoryBadge(tpl.category), /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-1",
													children: [tpl.isCustom && /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: (e) => {
															e.stopPropagation();
															handleOpenEdit(tpl);
														},
														className: "p-1 text-ink-muted hover:text-amber-700 rounded-md",
														title: "Edit Template",
														children: /* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" })
													}), tpl.isCustom && /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: (e) => {
															e.stopPropagation();
															setTemplateToDelete(tpl);
														},
														className: "p-1 text-ink-muted hover:text-red-600 rounded-md",
														title: "Hapus Template",
														children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
													})]
												})]
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
												className: "font-black text-sm text-ink",
												children: tpl.title
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-ink-muted line-clamp-2 mt-0.5",
												children: tpl.description
											})] }),
											/* @__PURE__ */ jsx("div", {
												className: "flex flex-wrap gap-1 pt-1",
												children: tpl.tags.map((tag, idx) => /* @__PURE__ */ jsxs("span", {
													className: "px-1.5 py-0.2 bg-canvas text-ink-muted rounded text-[9px] font-mono border border-border",
													children: ["#", tag]
												}, idx))
											})
										]
									}, tpl.id);
								})
							}),
							totalTemplatePages > 1 && /* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-ink-muted",
									children: [
										"Hal ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: safeTplPage
										}),
										" dari ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: totalTemplatePages
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex gap-1",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										disabled: safeTplPage === 1,
										onClick: () => setTemplatePage(safeTplPage - 1),
										className: "p-1 rounded-lg border border-border bg-canvas text-ink disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										disabled: safeTplPage === totalTemplatePages,
										onClick: () => setTemplatePage(safeTplPage + 1),
										className: "p-1 rounded-lg border border-border bg-canvas text-ink disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
									})]
								})]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-7 space-y-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between border-b border-border pb-3",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-black text-emerald-700 tracking-wider uppercase block",
										children: "Generator Tautan wa.me"
									}), /* @__PURE__ */ jsx("h3", {
										className: "font-black text-base text-ink",
										children: activeTemplate.title
									})] }), getCategoryBadge(activeTemplate.category)]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Nomor WhatsApp Penerima *"
											}),
											/* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "081234567890",
												value: varRecipientPhone,
												onChange: (e) => setVarRecipientPhone(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-[10px] text-ink-muted",
												children: "Format: 08xx / 628xx (Tujuan link wa.me)"
											})
										] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Nama Warga / Penerima *"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "Bpk. Budi Santoso",
											value: varResidentName,
											onChange: (e) => setVarResidentName(e.target.value),
											className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Nomor / Kode Unit Hunian *"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "Rumah A-17 (Blok A)",
											value: varHouseUnit,
											onChange: (e) => setVarHouseUnit(e.target.value),
											className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Periode Bulan / Waktu *"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "Agustus 2026",
											value: varMonthPeriod,
											onChange: (e) => setVarMonthPeriod(e.target.value),
											className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
										})] }),
										activeTemplate.category === "KEUANGAN" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Nominal Iuran / Tagihan (Rp)"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "750.000",
												value: varAmount,
												onChange: (e) => setVarAmount(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Batas Jatuh Tempo"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "10 Agustus 2026",
												value: varDueDate,
												onChange: (e) => setVarDueDate(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
											})] }),
											/* @__PURE__ */ jsxs("div", {
												className: "sm:col-span-2",
												children: [/* @__PURE__ */ jsx("label", {
													className: "font-bold text-ink block mb-1",
													children: "Rekening Resmi Pengurus"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													placeholder: "BCA 8830-1928-33 (PENGURUS KOMPLEK)",
													value: varBankAccount,
													onChange: (e) => setVarBankAccount(e.target.value),
													className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
												})]
											})
										] }),
										activeTemplate.category === "MUSYAWARAH" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
											/* @__PURE__ */ jsxs("div", {
												className: "sm:col-span-2",
												children: [/* @__PURE__ */ jsx("label", {
													className: "font-bold text-ink block mb-1",
													children: "Nama Acara / Agenda Rapat"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													placeholder: "Musyawarah Warga Pemilihan RT/RW",
													value: varEventName,
													onChange: (e) => setVarEventName(e.target.value),
													className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
												})]
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Waktu / Jadwal Acara"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "Sabtu, 30 Agustus 2026 • 19:30 WIB",
												value: varEventTime,
												onChange: (e) => setVarEventTime(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Lokasi Acara"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "Balai Warga Taman Sejahtera",
												value: varEventLocation,
												onChange: (e) => setVarEventLocation(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
											})] })
										] }),
										activeTemplate.category === "KEAMANAN" && /* @__PURE__ */ jsxs("div", {
											className: "sm:col-span-2",
											children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Nama Tamu / Kurir / Keterangan"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "Kurir Paket J&T / Teknisi AC",
												value: varGuestName,
												onChange: (e) => setVarGuestName(e.target.value),
												className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
											})]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2 border-t border-border space-y-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "p-3 bg-canvas rounded-2xl border border-border space-y-1",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-ink-muted font-bold block",
											children: "Tautan Langsung wa.me:"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs font-mono text-emerald-700 truncate font-semibold select-all",
											children: finalWaMeLink
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: handleOpenWhatsApp,
												className: "py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]",
												children: [/* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }), "Buka di WhatsApp"]
											}),
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: handleCopyMessage,
												className: "py-3 px-4 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors",
												children: [copiedId === "msg" ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-ink-muted" }), "Salin Pesan WA"]
											}),
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: handleCopyLink,
												className: "py-3 px-4 rounded-xl bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors",
												children: [copiedId === "link" ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 text-ink-muted" }), "Salin Link wa.me"]
											})
										]
									})]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl overflow-hidden",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-[#075e54] text-white flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs",
										children: "WH"
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "font-bold text-xs leading-none",
										children: "Pengurus Paguyuban Warga"
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-[9px] text-emerald-200 mt-0.5",
										children: [
											"Tujuan: ",
											varResidentName,
											" (",
											cleanPhoneNumber,
											")"
										]
									})] })]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-200 font-mono",
									children: "Live Preview"
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "p-4 space-y-2",
								children: /* @__PURE__ */ jsx("div", {
									className: "flex justify-end",
									children: /* @__PURE__ */ jsxs("div", {
										className: "bg-[#d9fdd3] dark:bg-emerald-950 text-ink p-3.5 rounded-2xl rounded-tr-xs max-w-[90%] shadow-xs text-xs whitespace-pre-wrap leading-relaxed",
										children: [generatedMessageText, /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-end gap-1 mt-1.5 text-[9px] text-ink-muted",
											children: [/* @__PURE__ */ jsx("span", { children: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", {
												hour: "2-digit",
												minute: "2-digit"
											}) }), /* @__PURE__ */ jsx(CheckCheck, { className: "w-3.5 h-3.5 text-blue-500" })]
										})]
									})
								})
							})]
						})]
					})]
				})]
			}),
			activeTab === "simulator" && /* @__PURE__ */ jsx("div", {
				className: "space-y-6 max-w-4xl animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 md:grid-cols-3 gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Simulasi Perintah Cepat"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-ink-muted text-[11px]",
								children: "Klik salah satu tombol di bawah untuk menguji respon bot WhatsApp:"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2 pt-1",
								children: [
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => handleSendBot("1"),
										className: "w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", { children: "1️⃣ Cek Status Iuran" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-ink-muted" })]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => handleSendBot("2"),
										className: "w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", { children: "2️⃣ Rekening BCA Iuran" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-ink-muted" })]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => handleSendBot("3"),
										className: "w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", { children: "3️⃣ Kontak Satpam Darurat" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-ink-muted" })]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => handleSendBot("4"),
										className: "w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", { children: "4️⃣ Booking Balai Warga" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-ink-muted" })]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => handleSendBot("5"),
										className: "w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", { children: "5️⃣ Info Kas & Transparansi" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 text-ink-muted" })]
									})
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "md:col-span-2 bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl flex flex-col h-[520px] overflow-hidden",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-[#075e54] text-surface flex items-center justify-between shrink-0 shadow-md",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs",
										children: "WH"
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h4", {
										className: "font-bold text-xs leading-tight flex items-center gap-1 text-white",
										children: ["WargaHub Bot Official", /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" })]
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-emerald-200",
										children: "Online • Layanan Warga 24 Jam"
									})] })]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-200 font-mono",
									children: phoneSim
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex-1 p-4 overflow-y-auto space-y-3 text-xs",
								children: messages.map((m) => /* @__PURE__ */ jsx("div", {
									className: `flex ${m.sender === "user" ? "justify-end" : "justify-start"}`,
									children: /* @__PURE__ */ jsxs("div", {
										className: `p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${m.sender === "user" ? "bg-[#d9fdd3] dark:bg-emerald-900 text-ink rounded-tr-xs font-medium" : "bg-surface text-ink rounded-tl-xs border border-border/40"}`,
										children: [m.text, /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-end gap-1 mt-1 text-[9px] text-ink-muted",
											children: [/* @__PURE__ */ jsx("span", { children: m.time }), m.sender === "user" && /* @__PURE__ */ jsx(CheckCheck, { className: "w-3.5 h-3.5 text-blue-500" })]
										})]
									})
								}, m.id))
							}),
							/* @__PURE__ */ jsxs("form", {
								onSubmit: (e) => {
									e.preventDefault();
									handleSendBot(inputText);
								},
								className: "p-3 bg-surface border-t border-border flex items-center gap-2 shrink-0",
								children: [/* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Ketik angka (1-5) atau ketik pesan...",
									value: inputText,
									onChange: (e) => setInputText(e.target.value),
									className: "flex-1 px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "p-2 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-xl shadow-xs transition-colors",
									children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 text-white" })
								})]
							})
						]
					})]
				})
			}),
			activeTab === "history" && /* @__PURE__ */ jsx("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-black text-base text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-emerald-600" }), "Log Riwayat Broadcast Pesan WhatsApp"]
					}), /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Waktu Terkirim"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Kategori / Template"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Tujuan / Penerima"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Status Pengiriman"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: [
									{
										time: "29 Agustus 2026, 00:10 WIB",
										tpl: "Pengingat Tagihan Iuran Bulanan",
										recipient: "Bpk. Budi Santoso (A-17)",
										status: "TERKIRIM (DIBACA)"
									},
									{
										time: "28 Agustus 2026, 17:45 WIB",
										tpl: "Pemberitahuan Tamu di Pos Satpam",
										recipient: "Ibu Ratna (SW1-12)",
										status: "TERKIRIM (DIBACA)"
									},
									{
										time: "28 Agustus 2026, 14:20 WIB",
										tpl: "Surat Izin Kerja Renovasi Rumah",
										recipient: "Bpk. Hendra Gunawan (A-01)",
										status: "TERKIRIM (DIBACA)"
									},
									{
										time: "27 Agustus 2026, 09:00 WIB",
										tpl: "Laporan Transparansi Kas Warga",
										recipient: "Grup WhatsApp Seluruh Warga (120 Unit)",
										status: "TERSIAR (100% SUKSES)"
									}
								].map((row, idx) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-canvas/60 text-ink",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 font-mono",
											children: row.time
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 font-bold text-ink",
											children: row.tpl
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 font-semibold text-primary-700",
											children: row.recipient
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4",
											children: /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200",
												children: row.status
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 text-right",
											children: /* @__PURE__ */ jsx("button", {
												className: "text-emerald-700 font-bold hover:underline",
												children: "Detail Log"
											})
										})
									]
								}, idx))
							})]
						})
					})]
				})
			}),
			activeTab === "settings" && /* @__PURE__ */ jsx("div", {
				className: "space-y-4 max-w-2xl animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-black text-base text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Settings, { className: "w-5 h-5 text-primary-600" }), "Konfigurasi WhatsApp Gateway Resmi"]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Nomor WhatsApp Resmi Paguyuban Komplek"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								defaultValue: "0811-9988-7766 (Official WhatsApp Gateway)",
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Sender Name (Nama Pengirim)"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								defaultValue: "WARGAHUB OFFICIAL - KOMPLEK TAMAN SEJAHTERA",
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Webhook URL Otomatisasi Bot"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								defaultValue: "http://localhost:4321/api/whatsapp/webhook",
								readOnly: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink-muted select-all"
							})] }),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => showToast("Pengaturan gateway WhatsApp berhasil disimpan."),
								className: "py-2.5 px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs",
								children: "Simpan Konfigurasi"
							})
						]
					})]
				})
			}),
			showTemplateModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center",
								children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-black text-base text-ink",
								children: editingTemplateId ? "Edit Template WhatsApp" : "Buat Template Pesan Baru"
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-ink-muted",
								children: [
									"Mendukung placeholder dinamis: ",
									"{nama_warga}",
									", ",
									"{nomor_unit}",
									", ",
									"{bulan}",
									", dll."
								]
							})] })]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowTemplateModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSaveTemplate,
						className: "space-y-3.5 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Judul Template *"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Pengingat Iuran Bulanan / Surat Izin Tukang",
								value: formTplTitle,
								onChange: (e) => setFormTplTitle(e.target.value),
								required: true,
								className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Kategori *"
								}), /* @__PURE__ */ jsxs("select", {
									value: formTplCategory,
									onChange: (e) => setFormTplCategory(e.target.value),
									className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "KEUANGAN",
											children: "💰 Keuangan & Iuran"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "KEAMANAN",
											children: "🚨 Keamanan & Gate"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "LINGKUNGAN",
											children: "🔨 Lingkungan & Renovasi"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "MUSYAWARAH",
											children: "🗳️ Musyawarah & Rapat"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SOSIAL",
											children: "🎉 Sosial & Warga"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "LAINNYA",
											children: "Lainnya"
										})
									]
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Target Penerima"
								}), /* @__PURE__ */ jsxs("select", {
									value: formTplTarget,
									onChange: (e) => setFormTplTarget(e.target.value),
									className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "WARGA_INDIVIDU",
											children: "Warga Perorangan (Individu)"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "GRUP_WARGA",
											children: "Grup Broadcast Seluruh Warga"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "PENGURUS",
											children: "Internal Pengurus"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SATPAM",
											children: "Petugas Satpam"
										})
									]
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Deskripsi Singkat"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Penjelasan kapan template ini digunakan...",
								value: formTplDesc,
								onChange: (e) => setFormTplDesc(e.target.value),
								className: "w-full p-2 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Format Pesan WhatsApp *"
								}),
								/* @__PURE__ */ jsx("textarea", {
									rows: 6,
									placeholder: `Halo {nama_warga} ({nomor_unit}),\n\nIsi pesan WhatsApp resmi...\n\nSalam,\n*Pengurus*`,
									value: formTplText,
									onChange: (e) => setFormTplText(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs leading-relaxed"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-[10px] text-ink-muted mt-1",
									children: [
										"Tips Placeholder: ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{nama_warga}"
										}),
										", ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{nomor_unit}"
										}),
										", ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{bulan}"
										}),
										", ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{nominal}"
										}),
										", ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{no_rekening}"
										}),
										", ",
										/* @__PURE__ */ jsx("code", {
											className: "text-emerald-700",
											children: "{link_portal}"
										})
									]
								})
							] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowTemplateModal(false),
									className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: tplSaving,
									className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50",
									children: tplSaving ? "Menyimpan..." : editingTemplateId ? "Perbarui Template" : "Simpan Template"
								})]
							})
						]
					})]
				})
			}),
			templateToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Hapus Template ",
									templateToDelete.title,
									"?"
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: "Template pesan WhatsApp ini akan dihapus dari direktori template."
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setTemplateToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeleteTemplate,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Hapus Template"
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/admin/whatsapp-bot.astro
var whatsapp_bot_exports = /* @__PURE__ */ __exportAll({
	default: () => $$WhatsappBot,
	file: () => $$file,
	url: () => $$url
});
var $$WhatsappBot = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Simulator WhatsApp Bot - WargaHub",
		"currentPath": "/admin/whatsapp-bot"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "WhatsAppBotSimulator", WhatsAppBotSimulator, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/WhatsAppBotSimulator.tsx",
		"client:component-export": "WhatsAppBotSimulator"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/whatsapp-bot.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/whatsapp-bot.astro";
var $$url = "/admin/whatsapp-bot";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/whatsapp-bot@_@astro
var page = () => whatsapp_bot_exports;
//#endregion
export { page };
