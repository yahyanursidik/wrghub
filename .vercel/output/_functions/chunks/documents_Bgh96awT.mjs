import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Search, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { t as Plus } from "./plus_BFr6lPwe.mjs";
import { t as Upload } from "./upload_C-tYLZmu.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/DocumentsManager.tsx
var DocumentsManager = () => {
	const [docs, setDocs] = useState([
		{
			id: "doc-1",
			title: "Tata Tertib & Anggaran Dasar Warga 2026",
			category: "TATA_TERTIB",
			fileSize: "1.2 MB",
			visibility: "PUBLIC",
			date: "2026-01-10",
			fileUrl: "/documents/tata-tertib.pdf"
		},
		{
			id: "doc-2",
			title: "Laporan Pertanggungjawaban Keuangan Semester 1 2026 (Audited)",
			category: "LAPORAN_KEUANGAN",
			fileSize: "3.4 MB",
			visibility: "RESIDENT",
			date: "2026-07-15",
			fileUrl: "/documents/lpj-keuangan-sem1.pdf"
		},
		{
			id: "doc-3",
			title: "Surat Edaran Jadwal Ronda & Kerja Bakti HUT RI Ke-81",
			category: "SURAT_EDARAN",
			fileSize: "450 KB",
			visibility: "RESIDENT",
			date: "2026-08-20",
			fileUrl: "/documents/surat-edaran-ronda.pdf"
		},
		{
			id: "doc-4",
			title: "Formulir Permohonan Izin Renovasi & Pembangunan Rumah",
			category: "FORMULIR",
			fileSize: "620 KB",
			visibility: "RESIDENT",
			date: "2026-06-01",
			fileUrl: "/documents/form-renovasi.pdf"
		},
		{
			id: "doc-5",
			title: "SK Susunan Pengurus RT 02 / RW 05 Masa Bakti 2025-2028",
			category: "SK_PENGURUS",
			fileSize: "1.8 MB",
			visibility: "PUBLIC",
			date: "2025-12-15",
			fileUrl: "/documents/sk-pengurus.pdf"
		}
	]);
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [search, setSearch] = useState("");
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [uploadTitle, setUploadTitle] = useState("");
	const [uploadCategory, setUploadCategory] = useState("SURAT_EDARAN");
	const [uploadVisibility, setUploadVisibility] = useState("RESIDENT");
	const [saving, setSaving] = useState(false);
	const filteredDocs = docs.filter((d) => {
		const matchesCategory = categoryFilter === "ALL" || d.category === categoryFilter;
		const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
		return matchesCategory && matchesSearch;
	});
	const handleUpload = async (e) => {
		e.preventDefault();
		if (!uploadTitle) return;
		setSaving(true);
		try {
			if ((await fetch("/api/documents/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: uploadTitle,
					category: uploadCategory,
					visibility: uploadVisibility,
					fileSize: "1.5 MB",
					fileUrl: `/documents/${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`
				})
			})).ok) {
				setDocs([{
					id: `doc-${Date.now()}`,
					title: uploadTitle,
					category: uploadCategory,
					visibility: uploadVisibility,
					fileSize: "1.5 MB",
					date: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10)
				}, ...docs]);
				setShowUploadModal(false);
				setUploadTitle("");
			}
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};
	const handleDownload = (doc) => {
		alert(`Mengunduh berkas: ${doc.title} (${doc.fileSize}). Berkas resmi telah diverifikasi.`);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Arsip & Dokumen Resmi Komplek"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Pusat repositori dokumen legal, SK kepengurusan, surat edaran, dan formulir perizinan warga."
				})] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setShowUploadModal(true),
					className: "inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Publikasikan Dokumen Baru"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						"ALL",
						"TATA_TERTIB",
						"SURAT_EDARAN",
						"LAPORAN_KEUANGAN",
						"FORMULIR",
						"SK_PENGURUS"
					].map((cat) => /* @__PURE__ */ jsx("button", {
						onClick: () => setCategoryFilter(cat),
						className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${categoryFilter === cat ? "bg-primary-600 text-surface" : "bg-canvas text-ink-muted hover:text-ink border border-border"}`,
						children: cat === "ALL" ? "Semua Kategori" : cat.replace("_", " ")
					}, cat))
				}), /* @__PURE__ */ jsxs("div", {
					className: "w-full sm:w-64 relative",
					children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-2.5" }), /* @__PURE__ */ jsx("input", {
						type: "text",
						placeholder: "Cari judul dokumen...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "w-full pl-9 pr-3 py-1.5 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4",
				children: filteredDocs.map((doc) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card flex flex-col justify-between space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded",
									children: doc.category.replace("_", " ")
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-mono text-ink-muted",
									children: doc.fileSize
								})]
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-ink leading-snug",
								children: doc.title
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-ink-muted",
								children: ["Diupload pada: ", doc.date]
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "pt-3 border-t border-border flex items-center gap-2",
						children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => handleDownload(doc),
							className: "flex-1 py-2 px-3 bg-canvas hover:bg-primary-50 hover:text-primary-700 border border-border text-ink text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors",
							children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-ink-muted" }), "Unduh PDF"]
						})
					})]
				}, doc.id))
			}),
			showUploadModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Publikasikan Dokumen Baru"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowUploadModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleUpload,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Judul Dokumen"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Surat Edaran Ronda Malam September 2026",
								value: uploadTitle,
								onChange: (e) => setUploadTitle(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Kategori Dokumen"
							}), /* @__PURE__ */ jsxs("select", {
								value: uploadCategory,
								onChange: (e) => setUploadCategory(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "SURAT_EDARAN",
										children: "Surat Edaran"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "TATA_TERTIB",
										children: "Tata Tertib & Anggaran Dasar"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "LAPORAN_KEUANGAN",
										children: "Laporan Keuangan & LPJ"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "FORMULIR",
										children: "Formulir Perizinan / Renovasi"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "SK_PENGURUS",
										children: "SK Kepengurusan RT/RW"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Hak Akses Visibilitas"
							}), /* @__PURE__ */ jsxs("select", {
								value: uploadVisibility,
								onChange: (e) => setUploadVisibility(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "RESIDENT",
										children: "Seluruh Warga (Internal Komplek)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "PUBLIC",
										children: "Publik (Terbuka Umum)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "ADMIN",
										children: "Khusus Pengurus & Admin"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Pilih Berkas PDF"
							}), /* @__PURE__ */ jsxs("div", {
								className: "p-4 border-2 border-dashed border-border hover:border-primary-500 rounded-xl text-center cursor-pointer bg-canvas/40",
								children: [/* @__PURE__ */ jsx(Upload, { className: "w-5 h-5 text-ink-muted mx-auto mb-1" }), /* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted",
									children: "Klik untuk upload berkas dokumen (.pdf, maks 10MB)"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-3 border-t border-border flex justify-end gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowUploadModal(false),
									className: "px-4 py-2 border border-border text-ink font-semibold rounded-xl",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: saving,
									className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl shadow-xs",
									children: saving ? "Mengupload..." : "Simpan & Terbitkan"
								})]
							})
						]
					})]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/admin/documents.astro
var documents_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Documents,
	file: () => $$file,
	url: () => $$url
});
var $$Documents = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Arsip Dokumen - WargaHub",
		"currentPath": "/admin/documents"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "DocumentsManager", DocumentsManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/DocumentsManager.tsx",
		"client:component-export": "DocumentsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/documents.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/documents.astro";
var $$url = "/admin/documents";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/documents@_@astro
var page = () => documents_exports;
//#endregion
export { page };
