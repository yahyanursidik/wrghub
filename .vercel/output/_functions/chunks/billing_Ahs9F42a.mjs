import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { n as Sparkles, o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { n as ChevronsLeft, r as ArrowUpDown, t as ChevronsRight } from "./chevrons-right_DZhI7ZvX.mjs";
import { a as Send, l as ExternalLink, o as Receipt, u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { a as Search, c as Clock, s as CreditCard, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { n as ChevronLeft, t as TriangleAlert } from "./triangle-alert_B5tHnjPA.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as CirclePlus } from "./circle-plus_D9s3wy0y.mjs";
import { n as Copy, t as Share2 } from "./share-2_DSWVcV1l.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { t as Eye } from "./eye_BwnvIS94.mjs";
import { n as PenLine, t as Trash2 } from "./trash-2_DsHxZaM2.mjs";
import { t as Printer } from "./printer_DTnpkCgr.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { t as ReceiptModal } from "./ReceiptModal_W_huGHJK.mjs";
import { n as getCurrentBillingPeriod, r as getInvoices, t as getBillingProgress } from "./billing.service_BI_aX0Qs.mjs";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var DollarSign = createLucideIcon("DollarSign", [["line", {
	x1: "12",
	x2: "12",
	y1: "2",
	y2: "22",
	key: "7eqyqh"
}], ["path", {
	d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
	key: "1b0p4s"
}]]);
//#endregion
//#region src/components/admin/BillingManager.tsx
var BillingManager = ({ initialPeriodName, initialInvoices, initialProgress }) => {
	const [activeSubTab, setActiveSubTab] = useState("invoices");
	const [invoices, setInvoices] = useState(initialInvoices);
	const [progress, setProgress] = useState(initialProgress);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [areaFilter, setAreaFilter] = useState("ALL");
	const [sortBy, setSortBy] = useState("code");
	const [sortOrder, setSortOrder] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [showGenerateModal, setShowGenerateModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showPublicModal, setShowPublicModal] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [generateMsg, setGenerateMsg] = useState("");
	const [selectedReceipt, setSelectedReceipt] = useState(null);
	const [invoiceToDelete, setInvoiceToDelete] = useState(null);
	const [deleteReason, setDeleteReason] = useState("Kesalahan Input / Keringanan Pengurus");
	const [toastMessage, setToastMessage] = useState(null);
	const [copiedLink, setCopiedLink] = useState(false);
	const [genYear, setGenYear] = useState(2026);
	const [genMonth, setGenMonth] = useState(9);
	const [genDueDate, setGenDueDate] = useState("2026-09-10");
	const [genFee, setGenFee] = useState(75e4);
	const [formHouseCode, setFormHouseCode] = useState("A-17");
	const [formAreaLabel, setFormAreaLabel] = useState("Blok A");
	const [formOwnerName, setFormOwnerName] = useState("Budi Santoso");
	const [formPeriodName, setFormPeriodName] = useState(initialPeriodName);
	const [formSecurityFee, setFormSecurityFee] = useState(45e4);
	const [formCleaningFee, setFormCleaningFee] = useState(15e4);
	const [formSinkingFund, setFormSinkingFund] = useState(15e4);
	const [formAdditionalFee, setFormAdditionalFee] = useState(0);
	const [formDueDate, setFormDueDate] = useState("2026-08-10");
	const [formStatus, setFormStatus] = useState("UNPAID");
	const [formNotes, setFormNotes] = useState("");
	const [editingInvoiceId, setEditingInvoiceId] = useState(null);
	const [savingInvoice, setSavingInvoice] = useState(false);
	const showToast = (msg) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 3500);
	};
	const handleGenerateBatch = async (e) => {
		e.preventDefault();
		setGenerating(true);
		setGenerateMsg("");
		const periodName = `${[
			"",
			"Januari",
			"Februari",
			"Maret",
			"April",
			"Mei",
			"Juni",
			"Juli",
			"Agustus",
			"September",
			"Oktober",
			"November",
			"Desember"
		][genMonth]} ${genYear}`;
		try {
			const res = await fetch("/api/billing/generate-batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					year: genYear,
					month: genMonth,
					name: periodName,
					dueDate: genDueDate,
					feeAmount: genFee
				})
			});
			const data = await res.json();
			if (res.ok) {
				setGenerateMsg(`Sukses! ${data.data?.message}`);
				showToast(`Tagihan massal periode ${periodName} berhasil dibuat.`);
				setTimeout(() => {
					setShowGenerateModal(false);
					setGenerateMsg("");
				}, 1500);
			} else setGenerateMsg(data.error?.message || "Gagal membuat tagihan.");
		} catch (err) {
			setGenerateMsg("Gagal terhubung ke server.");
		} finally {
			setGenerating(false);
		}
	};
	const handleOpenAddInvoice = () => {
		setEditingInvoiceId(null);
		setFormHouseCode("A-17");
		setFormAreaLabel("Blok A");
		setFormOwnerName("Budi Santoso");
		setFormPeriodName(initialPeriodName);
		setFormSecurityFee(45e4);
		setFormCleaningFee(15e4);
		setFormSinkingFund(15e4);
		setFormAdditionalFee(0);
		setFormDueDate("2026-08-10");
		setFormStatus("UNPAID");
		setFormNotes("");
		setShowCreateModal(true);
	};
	const handleOpenEditInvoice = (inv) => {
		setEditingInvoiceId(inv.id);
		setFormHouseCode(inv.propertyCode);
		setFormAreaLabel(inv.areaLabel || (inv.propertyCode.startsWith("KAV") ? "Kavling" : inv.propertyCode.startsWith("SW") ? "Jl. Sariwangi" : "Blok A"));
		setFormOwnerName(inv.ownerName || `Warga Rumah ${inv.propertyCode}`);
		setFormPeriodName(inv.billingPeriodName || initialPeriodName);
		setFormSecurityFee(inv.securityFee || 45e4);
		setFormCleaningFee(inv.cleaningFee || 15e4);
		setFormSinkingFund(inv.sinkingFund || 15e4);
		setFormAdditionalFee(inv.additionalFee || 0);
		setFormDueDate(inv.dueDate || "2026-08-10");
		setFormStatus(inv.status);
		setFormNotes(inv.notes || "");
		setShowCreateModal(true);
	};
	const handleSaveInvoice = async (e) => {
		e.preventDefault();
		setSavingInvoice(true);
		try {
			const calculatedTotal = Number(formSecurityFee) + Number(formCleaningFee) + Number(formSinkingFund) + Number(formAdditionalFee);
			const payload = {
				propertyCode: formHouseCode.toUpperCase(),
				houseCode: formHouseCode.toUpperCase(),
				areaLabel: formAreaLabel,
				ownerName: formOwnerName,
				periodName: formPeriodName,
				securityFee: Number(formSecurityFee),
				cleaningFee: Number(formCleaningFee),
				sinkingFund: Number(formSinkingFund),
				additionalFee: Number(formAdditionalFee),
				total: calculatedTotal,
				dueDate: formDueDate,
				status: formStatus,
				notes: formNotes || void 0
			};
			if (editingInvoiceId) {
				if ((await fetch("/api/billing/invoices/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						invoiceId: editingInvoiceId,
						propertyCode: formHouseCode.toUpperCase(),
						status: formStatus,
						total: calculatedTotal,
						dueDate: formDueDate,
						paidAt: formStatus === "PAID" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null,
						notes: formNotes
					})
				})).ok) {
					setInvoices(invoices.map((inv) => inv.id === editingInvoiceId ? {
						...inv,
						...payload,
						paidAmount: formStatus === "PAID" ? calculatedTotal : 0,
						paidAt: formStatus === "PAID" ? inv.paidAt || "2026-08-28" : null
					} : inv));
					showToast(`Invoice ${formHouseCode} berhasil diperbarui.`);
					setShowCreateModal(false);
				}
			} else if ((await fetch("/api/billing/invoices/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			})).ok) {
				const cleanHouse = formHouseCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
				const newInv = {
					id: `inv-${Date.now()}`,
					invoiceNumber: `INV-202608-${cleanHouse}`,
					propertyId: `prop-${formHouseCode.toLowerCase()}`,
					propertyCode: formHouseCode.toUpperCase(),
					areaLabel: formAreaLabel,
					ownerName: formOwnerName,
					billingPeriodName: formPeriodName,
					securityFee: Number(formSecurityFee),
					cleaningFee: Number(formCleaningFee),
					sinkingFund: Number(formSinkingFund),
					additionalFee: Number(formAdditionalFee),
					total: calculatedTotal,
					paidAmount: formStatus === "PAID" ? calculatedTotal : 0,
					dueDate: formDueDate,
					issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
					paidAt: formStatus === "PAID" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null,
					status: formStatus,
					notes: formNotes
				};
				setInvoices([newInv, ...invoices]);
				showToast(`Tagihan baru untuk ${formHouseCode} berhasil dibuat.`);
				setShowCreateModal(false);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menyimpan invoice tagihan.");
		} finally {
			setSavingInvoice(false);
		}
	};
	const handleTogglePaymentStatus = async (inv) => {
		const newStatus = inv.status === "PAID" ? "UNPAID" : "PAID";
		const newPaidAt = newStatus === "PAID" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null;
		try {
			await fetch("/api/billing/invoices/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					invoiceId: inv.id,
					invoiceNumber: inv.invoiceNumber,
					propertyCode: inv.propertyCode,
					status: newStatus,
					paidAmount: newStatus === "PAID" ? inv.total : 0,
					paidAt: newPaidAt
				})
			});
			setInvoices(invoices.map((item) => item.id === inv.id ? {
				...item,
				status: newStatus,
				paidAmount: newStatus === "PAID" ? item.total : 0,
				paidAt: newPaidAt
			} : item));
			showToast(`Status tagihan ${inv.propertyCode} diubah menjadi: ${newStatus === "PAID" ? "LUNAS" : "BELUM BAYAR"}`);
		} catch (err) {
			console.error(err);
			showToast("Gagal mengubah status pembayaran.");
		}
	};
	const handleConfirmDeleteInvoice = async () => {
		if (!invoiceToDelete) return;
		try {
			if ((await fetch("/api/billing/invoices/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					invoiceId: invoiceToDelete.id,
					invoiceNumber: invoiceToDelete.invoiceNumber,
					propertyCode: invoiceToDelete.propertyCode,
					reason: deleteReason
				})
			})).ok) {
				setInvoices(invoices.filter((inv) => inv.id !== invoiceToDelete.id));
				showToast(`Invoice ${invoiceToDelete.invoiceNumber} berhasil dibatalkan/dihapus.`);
				setInvoiceToDelete(null);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menghapus invoice.");
		}
	};
	const filteredAndSortedInvoices = useMemo(() => {
		const list = invoices.filter((inv) => {
			const matchSearch = inv.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || inv.ownerName && inv.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
			let matchStatus = true;
			if (statusFilter === "PAID") matchStatus = inv.status === "PAID";
			else if (statusFilter === "UNPAID") matchStatus = inv.status === "UNPAID";
			else if (statusFilter === "PENDING") matchStatus = inv.status === "PENDING_VERIFICATION";
			let matchArea = true;
			if (areaFilter !== "ALL") {
				if (areaFilter === "KAV") matchArea = inv.propertyCode.toLowerCase().startsWith("kav");
				else if (areaFilter === "SARIWANGI_1") matchArea = inv.propertyCode.toLowerCase().startsWith("sw1");
				else if (areaFilter === "SARIWANGI_2") matchArea = inv.propertyCode.toLowerCase().startsWith("sw2");
				else matchArea = inv.propertyCode.startsWith(areaFilter);
			}
			return matchSearch && matchStatus && matchArea;
		});
		list.sort((a, b) => {
			let comparison = 0;
			if (sortBy === "code") comparison = a.propertyCode.localeCompare(b.propertyCode, void 0, { numeric: true });
			else if (sortBy === "invoice") comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
			else if (sortBy === "total") comparison = a.total - b.total;
			else if (sortBy === "status") comparison = a.status.localeCompare(b.status);
			else if (sortBy === "due") comparison = a.dueDate.localeCompare(b.dueDate);
			else if (sortBy === "paidAt") comparison = (a.paidAt || "").localeCompare(b.paidAt || "");
			return sortOrder === "asc" ? comparison : -comparison;
		});
		return list;
	}, [
		invoices,
		searchTerm,
		statusFilter,
		areaFilter,
		sortBy,
		sortOrder
	]);
	const totalInvoices = filteredAndSortedInvoices.length;
	const totalPages = Math.max(1, Math.ceil(totalInvoices / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const startIndex = (safeCurrentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalInvoices);
	const paginatedInvoices = filteredAndSortedInvoices.slice(startIndex, endIndex);
	const paidInvoicesList = useMemo(() => invoices.filter((inv) => inv.status === "PAID"), [invoices]);
	const unpaidInvoicesList = useMemo(() => invoices.filter((inv) => inv.status === "UNPAID" || inv.status === "PENDING_VERIFICATION"), [invoices]);
	const publicTransparencyUrl = "http://localhost:4321/transparency";
	const handleCopyPublicLink = () => {
		navigator.clipboard.writeText(publicTransparencyUrl);
		setCopiedLink(true);
		showToast("Tautan publik transparansi iuran berhasil disalin!");
		setTimeout(() => setCopiedLink(false), 3e3);
	};
	const getWaReminderUrl = (inv) => {
		return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Halo Bapak/Ibu Warga ${inv.propertyCode} 🌿\n\nKami mengingatkan tagihan *Iuran Pengelolaan Lingkungan (IPL) ${initialPeriodName}*:\n\n🏡 *Unit:* ${inv.propertyCode}\n💵 *Nominal:* Rp ${inv.total?.toLocaleString("id-ID")}\n🗓️ *Jatuh Tempo:* ${inv.dueDate}\n🏦 *Rekening BCA:* 8830-1928-33 a.n PENGURUS KOMPLEK TAMAN SEJAHTERA\n\n📲 *Konfirmasi & Cek Transparansi:*\n${publicTransparencyUrl}\n\nTerima kasih atas partisipasinya menjaga kenyamanan lingkungan kita bersama. 🙏`)}`;
	};
	const handleExportBillingCSV = () => {
		const headers = [
			"No Invoice",
			"Kode Unit",
			"Periode",
			"IPL Keamanan",
			"Kebersihan",
			"Kas Komplek",
			"Biaya Lain",
			"Total Tagihan (Rp)",
			"Status",
			"Jatuh Tempo",
			"Waktu Lunas"
		];
		const rows = invoices.map((inv) => [
			inv.invoiceNumber,
			inv.propertyCode,
			`"${inv.billingPeriodName || initialPeriodName}"`,
			inv.securityFee || 45e4,
			inv.cleaningFee || 15e4,
			inv.sinkingFund || 15e4,
			inv.additionalFee || 0,
			inv.total,
			inv.status,
			inv.dueDate,
			inv.paidAt || "-"
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `REKAPITULASI_TAGIHAN_IURAN_${initialPeriodName.replace(/ /g, "_")}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Rekapitulasi tagihan iuran berhasil diekspor ke CSV.");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			toastMessage && /* @__PURE__ */ jsxs("div", {
				className: "fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3",
				children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4 text-emerald-200" }), /* @__PURE__ */ jsx("span", { children: toastMessage })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsxs("h1", {
						className: "text-2xl font-black tracking-tight text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(CreditCard, { className: "w-6 h-6 text-primary-600" }), "Pengelolaan Iuran Warga & Tagihan (Billing)"]
					}), /* @__PURE__ */ jsxs("span", {
						className: "px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200",
						children: ["Periode: ", initialPeriodName]
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-ink-muted mt-1",
					children: "Manajemen tagihan iuran IPL, kuitansi digital ber-QR code, pembuatan tagihan massal, dan transparansi publik status pembayaran warga."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: handleExportBillingCSV,
							className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors",
							children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-ink-muted" }), "Ekspor Tagihan (CSV)"]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: handleOpenAddInvoice,
							className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors",
							children: [/* @__PURE__ */ jsx(CirclePlus, { className: "w-4 h-4 text-primary-600" }), "Tambah Tagihan Satuan"]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setShowGenerateModal(true),
							className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
							children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }), "Generate Tagihan Massal"]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs",
						children: /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
						className: "font-bold text-emerald-950 text-sm",
						children: "Tautan Publik Rekapitulasi Iuran Warga (Bulan Aktif)"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-emerald-800 text-[11px] mt-0.5",
						children: "Bagikan tautan ini ke grup WhatsApp warga agar warga dapat melihat secara mandiri daftar rumah yang sudah lunas dan yang belum bayar secara terbuka."
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 w-full sm:w-auto justify-end",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleCopyPublicLink,
						className: "px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 shadow-2xs inline-flex items-center gap-1.5 transition-colors",
						children: [copiedLink ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-emerald-700" }), "Salin Link Publik"]
					}), /* @__PURE__ */ jsxs("a", {
						href: publicTransparencyUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-colors",
						children: [/* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }), "Buka Halaman Publik"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar",
				children: [
					{
						id: "invoices",
						label: "Daftar Tagihan & Invoice Bulanan",
						icon: Receipt,
						count: invoices.length
					},
					{
						id: "public_ledger",
						label: "Rekapitulasi Iuran Publik (Lunas vs Belum)",
						icon: Eye,
						count: `${paidInvoicesList.length}/${invoices.length}`
					},
					{
						id: "tariffs",
						label: "Struktur Tarif Iuran Komplek",
						icon: DollarSign
					},
					{
						id: "batch",
						label: "Generator Tagihan Massal",
						icon: Sparkles
					}
				].map((tab) => {
					const Icon = tab.icon;
					const isActive = activeSubTab === tab.id;
					return /* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveSubTab(tab.id),
						className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-primary-600 text-white shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
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
			activeSubTab === "invoices" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-semibold text-ink-muted",
										children: "Total Tagihan Periode Ini"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-ink mt-1 tabular-nums",
										children: formatRupiah(progress.totalAmount)
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-ink-muted mt-0.5 block",
										children: [invoices.length, " Rumah @ Rp750.000"]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-semibold text-ink-muted",
										children: "Telah Terkumpul (Lunas)"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-emerald-700 mt-1 tabular-nums",
										children: formatRupiah(progress.paidAmount)
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-emerald-700 font-bold mt-0.5 block",
										children: [
											paidInvoicesList.length,
											" Unit (",
											Math.round(paidInvoicesList.length / Math.max(1, invoices.length) * 100),
											"%)"
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-semibold text-ink-muted",
										children: "Tunggakan / Belum Lunas"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-rose-700 mt-1 tabular-nums",
										children: formatRupiah(progress.unpaidAmount)
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-rose-700 font-bold mt-0.5 block",
										children: [unpaidInvoicesList.length, " Unit Rumah"]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-semibold text-ink-muted",
										children: "Efisiensi Kolektibilitas"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-primary-700 mt-1 tabular-nums",
										children: "96.8%"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-600 font-bold mt-0.5 block",
										children: "Bank BCA Auto-Reconciled"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "w-full sm:w-72 relative",
							children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-2.5" }), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Cari unit (cth: A-17, Kav 5, Sariwangi), invoice...",
								value: searchTerm,
								onChange: (e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								},
								className: "w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end",
							children: [
								/* @__PURE__ */ jsxs("select", {
									value: areaFilter,
									onChange: (e) => {
										setAreaFilter(e.target.value);
										setCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Wilayah"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "A",
											children: "Blok A"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "B",
											children: "Blok B"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "C",
											children: "Blok C"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "D",
											children: "Blok D"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "KAV",
											children: "Area Kavling"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SARIWANGI_1",
											children: "Jl. Sariwangi Indah 1"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SARIWANGI_2",
											children: "Jl. Sariwangi Indah 2"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: statusFilter,
									onChange: (e) => {
										setStatusFilter(e.target.value);
										setCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Status Bayar"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "PAID",
											children: "Lunas (Paid)"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "UNPAID",
											children: "Belum Bayar (Unpaid)"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "PENDING",
											children: "Menunggu Verifikasi"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: sortBy,
									onChange: (e) => setSortBy(e.target.value),
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "code",
											children: "Urut Kode Rumah"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "invoice",
											children: "Urut No Invoice"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "total",
											children: "Urut Nominal"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "status",
											children: "Urut Status"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "due",
											children: "Urut Jatuh Tempo"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "paidAt",
											children: "Urut Waktu Pelunasan"
										})
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setSortOrder(sortOrder === "asc" ? "desc" : "asc"),
									className: "p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink",
									title: `Urutan: ${sortOrder === "asc" ? "Menaik" : "Menurun"}`,
									children: /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3.5 h-3.5" })
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
						children: [/* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-xs text-left",
								children: [/* @__PURE__ */ jsx("thead", {
									className: "bg-canvas border-b border-border text-ink-muted font-bold",
									children: /* @__PURE__ */ jsxs("tr", { children: [
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "No. Invoice & Periode"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Kode Unit / Wilayah"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-right",
											children: "Rincian & Total Tagihan"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Status Pembayaran"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Jatuh Tempo"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-right",
											children: "Aksi & Kuitansi"
										})
									] })
								}), /* @__PURE__ */ jsx("tbody", {
									className: "divide-y divide-border/60",
									children: paginatedInvoices.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
										colSpan: 6,
										className: "py-8 text-center text-ink-muted font-medium",
										children: "Tidak ada invoice yang cocok dengan filter."
									}) }) : paginatedInvoices.map((inv) => {
										const isPaid = inv.status === "PAID";
										return /* @__PURE__ */ jsxs("tr", {
											className: "hover:bg-canvas/50 text-ink transition-colors",
											children: [
												/* @__PURE__ */ jsxs("td", {
													className: "py-3.5 px-4",
													children: [/* @__PURE__ */ jsx("span", {
														className: "font-mono font-bold text-ink block",
														children: inv.invoiceNumber
													}), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: inv.billingPeriodName || initialPeriodName
													})]
												}),
												/* @__PURE__ */ jsxs("td", {
													className: "py-3.5 px-4 font-bold text-primary-700",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "block text-sm font-black",
														children: ["Unit ", inv.propertyCode]
													}), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted font-medium",
														children: inv.areaLabel || "Taman Sejahtera"
													})]
												}),
												/* @__PURE__ */ jsxs("td", {
													className: "py-3.5 px-4 text-right",
													children: [/* @__PURE__ */ jsx("p", {
														className: "font-bold tabular-nums text-sm text-ink",
														children: formatRupiah(inv.total)
													}), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: "IPL Keamanan + Sampah + Kas"
													})]
												}),
												/* @__PURE__ */ jsxs("td", {
													className: "py-3.5 px-4 text-center",
													children: [/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => handleTogglePaymentStatus(inv),
														className: `px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-xs ${isPaid ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-800" : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-emerald-50 hover:text-emerald-800"}`,
														title: "Klik untuk mengubah status lunas/belum lunas secara cepat",
														children: isPaid ? "✓ LUNAS" : "⏳ BELUM BAYAR"
													}), inv.paidAt && /* @__PURE__ */ jsx("span", {
														className: "text-[9px] text-ink-muted font-mono block mt-0.5",
														children: inv.paidAt
													})]
												}),
												/* @__PURE__ */ jsx("td", {
													className: "py-3.5 px-4 text-center font-mono text-ink-muted font-medium",
													children: inv.dueDate
												}),
												/* @__PURE__ */ jsx("td", {
													className: "py-3.5 px-4 text-right",
													children: /* @__PURE__ */ jsxs("div", {
														className: "inline-flex items-center gap-1",
														children: [
															isPaid ? /* @__PURE__ */ jsxs("button", {
																type: "button",
																onClick: () => setSelectedReceipt({
																	invoiceNumber: inv.invoiceNumber,
																	periodName: inv.billingPeriodName || initialPeriodName,
																	propertyCode: inv.propertyCode,
																	residentName: inv.ownerName || `Warga Rumah ${inv.propertyCode}`,
																	amount: inv.total,
																	paidAt: inv.paidAt || "15 Agustus 2026",
																	paymentMethod: "Transfer Bank BCA (Otomatis)",
																	referenceNumber: `TRX-${inv.propertyCode}-BCA`
																}),
																className: "px-2 py-1 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]",
																title: "Lihat / Cetak Kuitansi Resmi",
																children: [/* @__PURE__ */ jsx(Printer, { className: "w-3.5 h-3.5" }), " Kuitansi"]
															}) : /* @__PURE__ */ jsxs("a", {
																href: getWaReminderUrl(inv),
																target: "_blank",
																rel: "noopener noreferrer",
																className: "px-2 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]",
																title: "Kirim Pesan WhatsApp Pengingat",
																children: [/* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" }), " Ingatkan WA"]
															}),
															/* @__PURE__ */ jsx("button", {
																type: "button",
																onClick: () => handleOpenEditInvoice(inv),
																className: "p-1 text-amber-700 hover:bg-amber-50 rounded-lg",
																title: "Edit Tagihan",
																children: /* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" })
															}),
															/* @__PURE__ */ jsx("button", {
																type: "button",
																onClick: () => setInvoiceToDelete(inv),
																className: "p-1 text-red-600 hover:bg-red-50 rounded-lg",
																title: "Hapus / Batalkan Invoice",
																children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
															})
														]
													})
												})
											]
										}, inv.id);
									})
								})]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-ink-muted",
									children: [
										"Menampilkan ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: totalInvoices === 0 ? 0 : startIndex + 1
										}),
										" - ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: endIndex
										}),
										" dari ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: totalInvoices
										}),
										" tagihan"
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted",
										children: "Tampilkan:"
									}), /* @__PURE__ */ jsxs("select", {
										value: pageSize,
										onChange: (e) => {
											setPageSize(Number(e.target.value));
											setCurrentPage(1);
										},
										className: "px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink",
										children: [
											/* @__PURE__ */ jsx("option", {
												value: 10,
												children: "10"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 25,
												children: "25"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 50,
												children: "50"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 100,
												children: "100"
											})
										]
									})]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(1),
										disabled: safeCurrentPage === 1,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										title: "Halaman Pertama",
										children: /* @__PURE__ */ jsx(ChevronsLeft, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(safeCurrentPage - 1),
										disabled: safeCurrentPage === 1,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										title: "Halaman Sebelumnya",
										children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex items-center gap-1 px-2",
										children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											let pageNum = safeCurrentPage - 2 + i;
											if (pageNum < 1) pageNum = i + 1;
											if (pageNum > totalPages) return null;
											return /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setCurrentPage(pageNum),
												className: `w-7 h-7 rounded-lg text-xs font-bold transition-colors ${safeCurrentPage === pageNum ? "bg-primary-600 text-white shadow-xs" : "bg-surface border border-border text-ink hover:bg-canvas"}`,
												children: pageNum
											}, pageNum);
										})
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(safeCurrentPage + 1),
										disabled: safeCurrentPage === totalPages,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										title: "Halaman Berikutnya",
										children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(totalPages),
										disabled: safeCurrentPage === totalPages,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										title: "Halaman Terakhir",
										children: /* @__PURE__ */ jsx(ChevronsRight, { className: "w-4 h-4" })
									})
								]
							})]
						})]
					})
				]
			}),
			activeSubTab === "public_ledger" && /* @__PURE__ */ jsx("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
							className: "font-black text-base text-ink flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx(Eye, { className: "w-5 h-5 text-emerald-600" }),
								"Rekapitulasi Iuran Transparansi Warga (",
								initialPeriodName,
								")"
							]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-ink-muted mt-0.5",
							children: "Tampilan status pembayaran terbuka yang disinkronisasi ke portal warga [transparency](http://localhost:4321/transparency)."
						})] }), /* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: handleCopyPublicLink,
								className: "px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx(Copy, { className: "w-3.5 h-3.5" }), "Salin Tautan Rekapitulasi"]
							})
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("h4", {
									className: "font-extrabold text-emerald-900 text-xs flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4 text-emerald-600" }),
										"Daftar Unit Sudah Lunas (",
										paidInvoicesList.length,
										" Unit)"
									]
								}), /* @__PURE__ */ jsx("span", {
									className: "px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black",
									children: "TERVERIFIKASI"
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "max-h-96 overflow-y-auto space-y-1.5 pr-1 text-xs",
								children: paidInvoicesList.map((inv) => /* @__PURE__ */ jsxs("div", {
									className: "p-2.5 bg-white rounded-xl border border-emerald-200/80 flex items-center justify-between shadow-2xs",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
										className: "font-black text-ink",
										children: ["Unit ", inv.propertyCode]
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted block",
										children: inv.ownerName || "Warga Terdaftar"
									})] }), /* @__PURE__ */ jsxs("div", {
										className: "text-right",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-emerald-700 font-black text-xs block",
											children: formatRupiah(inv.total)
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-[9px] font-mono text-emerald-600",
											children: ["Lunas ", inv.paidAt || "15-08-2026"]
										})]
									})]
								}, inv.id))
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("h4", {
									className: "font-extrabold text-rose-900 text-xs flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-rose-600" }),
										"Daftar Unit Belum Lunas (",
										unpaidInvoicesList.length,
										" Unit)"
									]
								}), /* @__PURE__ */ jsx("span", {
									className: "px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black",
									children: "MENUNGGU BAYAR"
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "max-h-96 overflow-y-auto space-y-1.5 pr-1 text-xs",
								children: unpaidInvoicesList.map((inv) => /* @__PURE__ */ jsxs("div", {
									className: "p-2.5 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between shadow-2xs",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
										className: "font-black text-ink",
										children: ["Unit ", inv.propertyCode]
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-ink-muted block",
										children: ["Jatuh Tempo: ", inv.dueDate]
									})] }), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-rose-700 font-black text-xs",
											children: formatRupiah(inv.total)
										}), /* @__PURE__ */ jsxs("a", {
											href: getWaReminderUrl(inv),
											target: "_blank",
											rel: "noopener noreferrer",
											className: "px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs",
											children: [/* @__PURE__ */ jsx(Send, { className: "w-3 h-3" }), " WA"]
										})]
									})]
								}, inv.id))
							})]
						})]
					})]
				})
			}),
			activeSubTab === "tariffs" && /* @__PURE__ */ jsx("div", {
				className: "space-y-4 max-w-3xl animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("h3", {
							className: "font-black text-base text-ink flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5 text-primary-600" }), "Matriks Struktur Komponen Iuran Pengelolaan Lingkungan (IPL)"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-ink-muted",
							children: [
								"Tarif iuran standar disepakati bersama dalam Musyawarah Warga RT 05 / RW 05 sebesar ",
								/* @__PURE__ */ jsx("strong", { children: "Rp 750.000 / unit rumah per bulan" }),
								"."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2.5",
							children: [[
								{
									name: "1. Iuran Pengamanan Pos Satpam 24 Jam",
									fee: 45e4,
									desc: "Gaji 6 personil satpam, operasional barrier gate RFID, HT, dan CCTV cloud"
								},
								{
									name: "2. Iuran Pengangkutan Sampah & Kebersihan",
									fee: 15e4,
									desc: "Armada angkut sampah dinas LH 3x seminggu, pemotongan rumput taman komplek"
								},
								{
									name: "3. Dana Kas Operasional & Perawatan Komplek",
									fee: 15e4,
									desc: "Penerangan jalan PJU, perbaikan aspal, genset darurat, dan sarana balai warga"
								}
							].map((item, idx) => /* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-canvas rounded-2xl border border-border flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "font-bold text-ink text-xs",
									children: item.name
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-ink-muted mt-0.5",
									children: item.desc
								})] }), /* @__PURE__ */ jsx("span", {
									className: "font-mono font-black text-primary-700 text-sm",
									children: formatRupiah(item.fee)
								})]
							}, idx)), /* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-primary-50 rounded-2xl border border-primary-200 flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "font-black text-primary-900 text-xs",
									children: "Total Iuran Standar Per Unit"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-primary-800",
									children: "Diterbitkan otomatis setiap tanggal 1 awal bulan"
								})] }), /* @__PURE__ */ jsx("span", {
									className: "font-mono font-black text-primary-900 text-base",
									children: "Rp 750.000 / bln"
								})]
							})]
						})
					]
				})
			}),
			activeSubTab === "batch" && /* @__PURE__ */ jsx("div", {
				className: "space-y-4 max-w-xl animate-in fade-in duration-150",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("h3", {
							className: "font-black text-base text-ink flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-600" }), "Generate Tagihan Masal Periode Baru"]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-ink-muted",
							children: "Fitur ini akan secara otomatis menerbitkan invoice tagihan ke seluruh 120 unit rumah terdaftar di Blok A, B, C, D, Kavling, dan Jalan Sariwangi."
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleGenerateBatch,
							className: "space-y-3.5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-bold text-ink block mb-1",
										children: "Bulan Tagihan"
									}), /* @__PURE__ */ jsxs("select", {
										value: genMonth,
										onChange: (e) => setGenMonth(parseInt(e.target.value, 10)),
										className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink",
										children: [
											/* @__PURE__ */ jsx("option", {
												value: 9,
												children: "September"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 10,
												children: "Oktober"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 11,
												children: "November"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 12,
												children: "Desember"
											})
										]
									})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-bold text-ink block mb-1",
										children: "Tahun"
									}), /* @__PURE__ */ jsx("input", {
										type: "number",
										value: genYear,
										onChange: (e) => setGenYear(parseInt(e.target.value, 10)),
										className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
									})] })]
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Tanggal Jatuh Tempo"
								}), /* @__PURE__ */ jsx("input", {
									type: "date",
									value: genDueDate,
									onChange: (e) => setGenDueDate(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-medium text-ink"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Tarif Iuran per Unit (Rp)"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									value: genFee,
									onChange: (e) => setGenFee(parseInt(e.target.value, 10)),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
								})] }),
								/* @__PURE__ */ jsxs("button", {
									type: "submit",
									disabled: generating,
									className: "w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2",
									children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }), generating ? "Menerbitkan 120 Tagihan..." : "Terbitkan Tagihan Masal Sekarang"]
								})
							]
						})
					]
				})
			}),
			showCreateModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto text-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Receipt, { className: "w-5 h-5 text-primary-600" }), /* @__PURE__ */ jsx("h3", {
								className: "font-black text-sm text-ink",
								children: editingInvoiceId ? `Edit Invoice Tagihan` : `Tambah Tagihan Iuran Satuan`
							})]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowCreateModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSaveInvoice,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Nomor / Kode Unit *"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "A-17 / KAV-12 / SW1-05",
									value: formHouseCode,
									onChange: (e) => setFormHouseCode(e.target.value),
									required: true,
									className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Nama Pemilik / Penghuni"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Budi Santoso",
									value: formOwnerName,
									onChange: (e) => setFormOwnerName(e.target.value),
									className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Periode Tagihan *"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Agustus 2026",
									value: formPeriodName,
									onChange: (e) => setFormPeriodName(e.target.value),
									required: true,
									className: "w-full p-2 bg-canvas border border-border rounded-xl text-ink font-medium"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Tanggal Jatuh Tempo *"
								}), /* @__PURE__ */ jsx("input", {
									type: "date",
									value: formDueDate,
									onChange: (e) => setFormDueDate(e.target.value),
									required: true,
									className: "w-full p-2 bg-canvas border border-border rounded-xl text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-canvas rounded-2xl border border-border space-y-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-bold text-ink block text-[11px]",
										children: "Rincian Komponen Iuran:"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "text-ink-muted block text-[10px]",
												children: "IPL Keamanan (Rp)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: formSecurityFee,
												onChange: (e) => setFormSecurityFee(Number(e.target.value)),
												className: "w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "text-ink-muted block text-[10px]",
												children: "Kebersihan Sampah (Rp)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: formCleaningFee,
												onChange: (e) => setFormCleaningFee(Number(e.target.value)),
												className: "w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "text-ink-muted block text-[10px]",
												children: "Kas Komplek (Rp)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: formSinkingFund,
												onChange: (e) => setFormSinkingFund(Number(e.target.value)),
												className: "w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "text-ink-muted block text-[10px]",
												children: "Biaya Tambahan (Rp)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: formAdditionalFee,
												onChange: (e) => setFormAdditionalFee(Number(e.target.value)),
												className: "w-full p-1.5 bg-surface border border-border rounded-lg font-mono text-ink font-bold"
											})] })
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "pt-2 border-t border-border flex justify-between font-black text-ink",
										children: [/* @__PURE__ */ jsx("span", { children: "Total Tagihan:" }), /* @__PURE__ */ jsx("span", {
											className: "font-mono text-primary-700",
											children: formatRupiah(Number(formSecurityFee) + Number(formCleaningFee) + Number(formSinkingFund) + Number(formAdditionalFee))
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Status Pembayaran"
							}), /* @__PURE__ */ jsxs("select", {
								value: formStatus,
								onChange: (e) => setFormStatus(e.target.value),
								className: "w-full p-2 bg-canvas border border-border rounded-xl font-bold text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "UNPAID",
										children: "Belum Bayar (Unpaid)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "PAID",
										children: "Lunas (Paid)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "PENDING_VERIFICATION",
										children: "Menunggu Verifikasi"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowCreateModal(false),
									className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: savingInvoice,
									className: "flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50",
									children: savingInvoice ? "Menyimpan..." : editingInvoiceId ? "Perbarui Tagihan" : "Terbitkan Tagihan"
								})]
							})
						]
					})]
				})
			}),
			invoiceToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-base text-ink",
								children: [
									"Batalkan Invoice ",
									invoiceToDelete.invoiceNumber,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-ink-muted",
								children: [
									"Tagihan untuk ",
									/* @__PURE__ */ jsxs("strong", { children: ["Unit ", invoiceToDelete.propertyCode] }),
									" sebesar ",
									/* @__PURE__ */ jsx("strong", { children: formatRupiah(invoiceToDelete.total) }),
									" akan dibatalkan/dihapus dari buku kas. Tindakan ini tercatat di Jejak Audit."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block mb-1",
							children: "Alasan Pembatalan:"
						}), /* @__PURE__ */ jsxs("select", {
							value: deleteReason,
							onChange: (e) => setDeleteReason(e.target.value),
							className: "w-full p-2 bg-canvas border border-border rounded-xl text-ink font-semibold",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "Kesalahan Input / Keringanan Pengurus",
									children: "Kesalahan Input / Keringanan Pengurus"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "Tagihan Duplikat",
									children: "Tagihan Duplikat"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "Rumah Kosong / Nonaktif",
									children: "Rumah Kosong / Nonaktif"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "Lainnya",
									children: "Lainnya"
								})
							]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setInvoiceToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeleteInvoice,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Batalkan Tagihan"
							})]
						})
					]
				})
			}),
			selectedReceipt && /* @__PURE__ */ jsx(ReceiptModal, {
				isOpen: Boolean(selectedReceipt),
				onClose: () => setSelectedReceipt(null),
				data: selectedReceipt
			})
		]
	});
};
//#endregion
//#region src/pages/admin/billing.astro
var billing_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Billing,
	file: () => $$file,
	url: () => $$url
});
var $$Billing = createComponent(async ($$result, $$props, $$slots) => {
	const currentPeriod = await getCurrentBillingPeriod();
	const invoices = currentPeriod ? await getInvoices(currentPeriod.id) : [];
	const progress = currentPeriod ? await getBillingProgress(currentPeriod.id) : {
		total: 120,
		paidCount: 86,
		unpaidCount: 34,
		percentage: 72,
		totalAmount: 9e7,
		paidAmount: 645e5,
		unpaidAmount: 255e5,
		monthlyRatePerHouse: 75e4
	};
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Iuran & Billing - WargaHub",
		"currentPath": "/admin/billing"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "BillingManager", BillingManager, {
		"initialPeriodName": currentPeriod?.name || "Agustus 2026",
		"initialInvoices": invoices,
		"initialProgress": progress,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/BillingManager.tsx",
		"client:component-export": "BillingManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/billing.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/billing.astro";
var $$url = "/admin/billing";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/billing@_@astro
var page = () => billing_exports;
//#endregion
export { page };
