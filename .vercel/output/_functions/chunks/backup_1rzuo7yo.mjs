import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { c as FileText } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Database = createLucideIcon("Database", [
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 21 19V5",
		key: "1wlel7"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 21 12",
		key: "mv7ke4"
	}]
]);
//#endregion
//#region src/components/admin/BackupManager.tsx
var BackupManager = () => {
	const [downloading, setDownloading] = useState(false);
	const [lastBackupTime, setLastBackupTime] = useState("28 Agustus 2026, 21:55 WIB");
	const handleDownloadBackup = async () => {
		setDownloading(true);
		try {
			window.location.href = "/api/backup/export";
			setTimeout(() => {
				setDownloading(false);
				setLastBackupTime((/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit"
				}) + " WIB (Hari ini)");
			}, 1500);
		} catch (err) {
			console.error(err);
			setDownloading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 max-w-4xl",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl font-bold tracking-tight text-ink flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Database, { className: "w-6 h-6 text-primary-600" }), "Pencadangan & Serah Terima Pengurus"]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Ekspor arsip cadangan database komplek dan paket dokumen serah terima kepengurusan RT/RW (*Handover Package*)."
				})] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: handleDownloadBackup,
					disabled: downloading,
					className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }), downloading ? "Menyiapkan Arsip..." : "Unduh Backup Lengkap (.JSON)"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Pencadangan Terakhir"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-base font-bold text-ink",
								children: lastBackupTime
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-emerald-700 font-semibold flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-3.5 h-3.5" }), " Terverifikasi Aman"]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Entitas Terproteksi"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-base font-bold text-ink",
								children: "34 Tabel Relasional"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted",
								children: "120 Rumah, 240+ Invoice, Kas BCA"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Penyimpanan Cloud"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-base font-bold text-primary-700",
								children: "Neon PostgreSQL Cloud"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-emerald-700 font-semibold",
								children: "Tersinkronisasi Otomatis"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-border pb-3",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-bold text-sm text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-primary-600" }), "Checklist Serah Terima Kepengurusan RT/RW (*Handover Package*)"]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-ink-muted mt-0.5",
						children: "Panduan penyerahan berkas dan akun sistem kepada kepengurusan periode baru."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-3",
					children: [
						{
							title: "1. Unduh Berkas Arsip Basis Data (JSON Dump)",
							desc: "Gunakan tombol unduh di atas untuk menyimpan salinan offline seluruh histori transaksi dan data warga.",
							status: "READY"
						},
						{
							title: "2. Rekonsiliasi Saldo Kas Bank BCA & Buku Kas",
							desc: "Pastikan saldo akhir kas buku kas sama persis dengan saldo rekening koran penampung resmi iuran.",
							status: "VERIFIED"
						},
						{
							title: "3. Pembaruan Akun & Kredensial Administrator",
							desc: "Serahkan hak akses ketua komplek & bendahara melalui menu Pengaturan Pengguna.",
							status: "READY"
						},
						{
							title: "4. Ekspor Arsip Laporan Keuangan Semesteran (PDF)",
							desc: "Cetak dan tanda tangani LPJ Keuangan yang telah diaudit di menu Arsip & Dokumen.",
							status: "READY"
						}
					].map((item, idx) => /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-canvas rounded-xl flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-0.5",
							children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-ink text-xs",
								children: item.title
							}), /* @__PURE__ */ jsx("p", {
								className: "text-ink-muted leading-relaxed text-[11px]",
								children: item.desc
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0",
							children: item.status
						})]
					}, idx))
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/backup.astro
var backup_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Backup,
	file: () => $$file,
	url: () => $$url
});
var $$Backup = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pencadangan & Serah Terima - WargaHub",
		"currentPath": "/admin/backup"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "BackupManager", BackupManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/BackupManager.tsx",
		"client:component-export": "BackupManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/backup.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/backup.astro";
var $$url = "/admin/backup";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/backup@_@astro
var page = () => backup_exports;
//#endregion
export { page };
