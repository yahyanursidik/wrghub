import { i as House, n as Sparkles, o as createLucideIcon, r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { a as Send, n as X, r as Wallet, u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { c as Clock, l as ChevronDown, n as Wrench, u as Calendar } from "./AdminLayout_CzR5wuim.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { n as Copy, t as Share2 } from "./share-2_DSWVcV1l.mjs";
import { t as Hourglass } from "./hourglass_D_2VXHHX.mjs";
import { t as Info } from "./info_BOF9a9LP.mjs";
import { t as QrCode } from "./qr-code_CWniIOgo.mjs";
import { t as Zap } from "./zap_RtHdtdXj.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
import "./db_-Bx7JBvv.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import "drizzle-orm";
import QRCode from "qrcode";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleArrowDown = createLucideIcon("CircleArrowDown", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 8v8",
		key: "napkw2"
	}],
	["path", {
		d: "m8 12 4 4 4-4",
		key: "k98ssh"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleArrowUp = createLucideIcon("CircleArrowUp", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "m16 12-4-4-4 4",
		key: "177agl"
	}],
	["path", {
		d: "M12 16V8",
		key: "1sbj14"
	}]
]);
//#endregion
//#region src/components/shared/ExpenseDetailModal.tsx
var ExpenseDetailModal = ({ isOpen, onClose, categoryName, percentage, totalAmount }) => {
	if (!isOpen) return null;
	const getDetails = (cat) => {
		switch (cat.toLowerCase()) {
			case "keamanan": return [{
				id: "1",
				date: "25 Agu 2026",
				title: "Honorarium Petugas Satpam Regu A (2 Personil)",
				recipient: "Joko S. & Bambang",
				amount: 88e5,
				invoiceRef: "SLP-SEC-0801"
			}, {
				id: "2",
				date: "25 Agu 2026",
				title: "Honorarium Petugas Satpam Regu B (2 Personil)",
				recipient: "Agus W. & Rahmat",
				amount: 88e5,
				invoiceRef: "SLP-SEC-0802"
			}];
			case "kebersihan": return [{
				id: "3",
				date: "24 Agu 2026",
				title: "Honorarium 2 Petugas Pengangkut Sampah Komplek",
				recipient: "Pak Ujang & Tim",
				amount: 65e5,
				invoiceRef: "NOT-KBR-0824"
			}, {
				id: "4",
				date: "20 Agu 2026",
				title: "Retribusi Pembuangan Sampah TPA & Pembelian Sapu/Plastik",
				recipient: "Dinas LH / Toko Material",
				amount: 3287500,
				invoiceRef: "KWT-TPA-8812"
			}];
			case "listrik": return [{
				id: "5",
				date: "18 Agu 2026",
				title: "Tagihan Rekening PLN Penerangan Jalan Umum (PJU 4 Blok)",
				recipient: "PT PLN (Persero)",
				amount: 521e4,
				invoiceRef: "PLN-PJU-202608"
			}, {
				id: "6",
				date: "18 Agu 2026",
				title: "Tagihan Listrik Pompa Air Bersih Fasum & Balai Warga",
				recipient: "PT PLN (Persero)",
				amount: 262e4,
				invoiceRef: "PLN-PMP-202608"
			}];
			default: return [{
				id: "7",
				date: "22 Agu 2026",
				title: "Penggantian 6 Titik Lampu LED PJU Jalan Blok C",
				recipient: "Toko Listrik Terang Jaya",
				amount: 245e4,
				invoiceRef: "NT-LT-4491"
			}, {
				id: "8",
				date: "15 Agu 2026",
				title: "Perbaikan Engsel & Remote Gerbang Otomatis Timur",
				recipient: "Bengkel Las & Elektro Maju",
				amount: 1482500,
				invoiceRef: "NT-LAS-1204"
			}];
		}
	};
	const items = getDetails(categoryName);
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto space-y-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
						className: "text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md",
						children: [
							"Rincian Pengeluaran Riil (",
							percentage,
							"%)"
						]
					}), /* @__PURE__ */ jsxs("h3", {
						className: "text-lg font-bold text-ink mt-1",
						children: ["Pos Anggaran: ", categoryName]
					})] }), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-full",
						children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3.5 bg-canvas rounded-2xl border border-border flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold text-ink-muted",
						children: "Total Realisasi Dana:"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-base font-bold text-ink tabular-nums",
						children: formatRupiah(totalAmount)
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold text-ink block",
						children: "Daftar Kuitansi & Nota Pembayaran:"
					}), items.map((item) => /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-surface rounded-2xl border border-border space-y-1.5 shadow-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-[10px] font-mono text-ink-muted",
									children: [
										item.date,
										" • ",
										item.invoiceRef
									]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold text-ink tabular-nums",
									children: formatRupiah(item.amount)
								})]
							}),
							/* @__PURE__ */ jsx("h4", {
								className: "text-xs font-bold text-ink",
								children: item.title
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-ink-muted flex items-center gap-1",
								children: [/* @__PURE__ */ jsx("span", { children: "Penerima:" }), /* @__PURE__ */ jsx("strong", {
									className: "text-ink",
									children: item.recipient
								})]
							})
						]
					}, item.id))]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 text-emerald-700 font-semibold text-[11px]",
						children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-3.5 h-3.5" }), " Telah diverifikasi oleh Bendahara & Ketua RT"]
					}), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl text-xs",
						children: "Selesai"
					})]
				})
			]
		})
	});
};
//#endregion
//#region src/components/transparency/TransparencyView.tsx
var TransparencyView = ({ initialData }) => {
	const [data, setData] = useState(initialData);
	const [selectedMonth, setSelectedMonth] = useState("Agustus 2026");
	const [periodDropdown, setPeriodDropdown] = useState(false);
	const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(null);
	const [showShareModal, setShowShareModal] = useState(false);
	const [copied, setCopied] = useState(false);
	const getCategoryIcon = (name) => {
		if (name.includes("Keamanan")) return /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-700" });
		if (name.includes("Kebersihan")) return /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-emerald-700" });
		if (name.includes("Listrik")) return /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-amber-600" });
		return /* @__PURE__ */ jsx(Wrench, { className: "w-5 h-5 text-sky-600" });
	};
	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl sm:text-3xl font-bold tracking-tight text-ink",
					children: "Laporan Transparansi Warga"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Informasi keuangan komplek yang terbuka dan dapat diakses oleh seluruh warga."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setShowShareModal(true),
						className: "flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs sm:text-sm font-semibold text-ink shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Share2, { className: "w-4 h-4 text-primary-700" }), /* @__PURE__ */ jsx("span", { children: "Bagikan" })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative inline-block",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPeriodDropdown(!periodDropdown),
							className: "flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs sm:text-sm font-semibold text-ink shadow-xs transition-colors",
							children: [
								/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-ink-muted" }),
								/* @__PURE__ */ jsx("span", { children: selectedMonth }),
								/* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-ink-muted" })
							]
						}), periodDropdown && /* @__PURE__ */ jsx("div", {
							className: "absolute right-0 mt-2 w-48 bg-surface rounded-2xl shadow-modal border border-border py-1.5 z-40 animate-in fade-in",
							children: [
								{
									name: "Agustus 2026",
									year: 2026,
									month: 8
								},
								{
									name: "Juli 2026",
									year: 2026,
									month: 7
								},
								{
									name: "Juni 2026",
									year: 2026,
									month: 6
								},
								{
									name: "Mei 2026",
									year: 2026,
									month: 5
								}
							].map((p) => /* @__PURE__ */ jsxs("button", {
								onClick: () => {
									setSelectedMonth(p.name);
									setPeriodDropdown(false);
									if (p.month !== 8) window.location.href = `/transparency/${p.year}/${p.month.toString().padStart(2, "0")}`;
								},
								className: `w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${selectedMonth === p.name ? "bg-primary-50 text-primary-700" : "text-ink hover:bg-canvas"}`,
								children: [/* @__PURE__ */ jsx("span", { children: p.name }), selectedMonth === p.name && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-primary-600" })]
							}, p.name))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-2 bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-baseline gap-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-2xl sm:text-3xl font-bold text-ink tracking-tight tabular-nums",
							children: [
								data.paidProperties,
								" dari ",
								data.totalProperties,
								" rumah"
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-2xl sm:text-3xl font-bold text-primary-600 tracking-tight",
							children: "telah membayar"
						})]
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-xs sm:text-sm text-ink-muted mt-1.5",
						children: ["Tingkat partisipasi iuran warga pada ", data.periodName]
					})] }), /* @__PURE__ */ jsxs("div", {
						className: "mt-6 space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex-1 bg-canvas rounded-full h-3.5 overflow-hidden border border-border/50",
								children: /* @__PURE__ */ jsx("div", {
									className: "bg-primary-500 h-full rounded-full transition-all duration-500",
									style: { width: `${data.paidPercentage}%` }
								})
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-base font-bold text-ink tabular-nums",
								children: [data.paidPercentage.toFixed(1).replace(".", ","), "%"]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-6 text-xs text-ink-muted pt-1",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-primary-500" }), /* @__PURE__ */ jsxs("span", { children: ["Lunas: ", /* @__PURE__ */ jsxs("strong", {
									className: "text-ink font-semibold",
									children: [data.paidProperties, " rumah"]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-border-dark" }), /* @__PURE__ */ jsxs("span", { children: ["Belum: ", /* @__PURE__ */ jsxs("strong", {
									className: "text-ink font-semibold",
									children: [data.unpaidProperties, " rumah"]
								})] })]
							})]
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "bg-primary-50/70 border border-primary-200/80 rounded-2xl p-6 flex items-start gap-4 shadow-card",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-12 h-12 rounded-xl bg-surface border border-primary-200 flex items-center justify-center text-primary-600 shrink-0 shadow-xs",
						children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-sm font-semibold text-primary-900",
						children: "Transparansi untuk kita semua"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-primary-800/80 mt-1 leading-relaxed",
						children: "Setiap iuran yang Bapak/Ibu bayarkan dikelola dengan amanah dan digunakan untuk kebutuhan bersama."
					})] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(House, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Total Rumah"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: data.totalProperties
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Unit"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(CircleCheck, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Lunas"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: data.paidProperties
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-emerald-700 font-medium mt-0.5",
								children: [
									"Rumah • ",
									data.paidPercentage.toFixed(1).replace(".", ","),
									"%"
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(Hourglass, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Belum"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: data.unpaidProperties
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-amber-700 font-medium mt-0.5",
								children: [
									"Rumah • ",
									data.unpaidPercentage.toFixed(1).replace(".", ","),
									"%"
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(CircleArrowDown, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Pemasukan"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-ink mt-1 tabular-nums truncate w-full",
								children: formatRupiah(data.income)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Total"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(CircleArrowUp, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Pengeluaran"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-ink mt-1 tabular-nums truncate w-full",
								children: formatRupiah(data.expense)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Total"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4.5 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3",
								children: /* @__PURE__ */ jsx(Wallet, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Saldo Akhir"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-ink mt-1 tabular-nums truncate w-full",
								children: formatRupiah(data.closingBalance)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Saldo"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-ink",
								children: "Rumah Belum Iuran"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted mt-1",
								children: "Daftar rumah yang belum melakukan pembayaran iuran pada periode ini."
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5",
								children: data.unpaidHouses.slice(0, 6).map((house) => /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5 p-2.5 rounded-xl bg-canvas border border-border/80 text-sm font-semibold text-ink",
									children: [/* @__PURE__ */ jsx(House, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsx("span", { children: house })]
								}, house))
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "mt-6 p-3.5 bg-primary-50/60 border border-primary-200/70 rounded-xl flex items-start gap-2.5",
							children: [/* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-primary-700 shrink-0 mt-0.5" }), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-primary-800 leading-relaxed",
								children: "Mohon partisipasi Bapak/Ibu untuk menjaga kelancaran kegiatan bersama."
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-ink",
								children: "Penggunaan Dana"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted mt-1",
								children: [
									"Rincian penggunaan dana pada ",
									data.periodName,
									"."
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-5 space-y-4",
								children: data.expenseBreakdown.map((item) => /* @__PURE__ */ jsxs("div", {
									onClick: () => setSelectedExpenseCategory(item),
									className: "space-y-1.5 p-2 rounded-xl hover:bg-canvas/80 transition-colors cursor-pointer border border-transparent hover:border-border/60",
									title: "Klik untuk melihat rincian nota & kuitansi belanja",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between text-xs font-semibold text-ink",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-7 h-7 rounded-lg bg-canvas border border-border flex items-center justify-center",
												children: getCategoryIcon(item.name)
											}), /* @__PURE__ */ jsx("span", {
												className: "hover:text-primary-700",
												children: item.name
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2 tabular-nums",
											children: [/* @__PURE__ */ jsxs("span", {
												className: "text-ink-muted",
												children: [item.percentage, "%"]
											}), /* @__PURE__ */ jsx("span", {
												className: "text-primary-800 font-bold",
												children: formatRupiah(item.amount)
											})]
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "bg-canvas rounded-full h-2 overflow-hidden border border-border/40",
										children: /* @__PURE__ */ jsx("div", {
											className: "bg-primary-500 h-full rounded-full",
											style: { width: `${item.percentage}%` }
										})
									})]
								}, item.name))
							})
						] }), /* @__PURE__ */ jsx("div", {
							className: "mt-6",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setSelectedExpenseCategory(data.expenseBreakdown[0]),
								className: "w-full py-2.5 px-4 rounded-xl border border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold text-xs sm:text-sm transition-colors text-center",
								children: "Lihat Detail Pengeluaran Riil"
							})
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-6",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-ink",
								children: "Ringkasan Keuangan"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted mt-1",
								children: [
									"Ringkasan arus keuangan pada ",
									data.periodName,
									"."
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4 space-y-2.5 text-xs sm:text-sm",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between py-1 border-b border-border/60",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Saldo Awal"
										}), /* @__PURE__ */ jsx("span", {
											className: "font-semibold text-ink tabular-nums",
											children: formatRupiah(data.openingBalance)
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between py-1 border-b border-border/60",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Pemasukan"
										}), /* @__PURE__ */ jsxs("span", {
											className: "font-semibold text-emerald-600 tabular-nums",
											children: ["+ ", formatRupiah(data.income)]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between py-1 border-b border-border/60",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Pengeluaran"
										}), /* @__PURE__ */ jsxs("span", {
											className: "font-semibold text-red-600 tabular-nums",
											children: ["- ", formatRupiah(data.expense)]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between p-2.5 rounded-xl bg-primary-50 border border-primary-200/80",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-bold text-primary-900",
											children: "Saldo Akhir"
										}), /* @__PURE__ */ jsx("span", {
											className: "font-bold text-primary-900 text-base tabular-nums",
											children: formatRupiah(data.closingBalance)
										})]
									})
								]
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsx("h4", {
									className: "text-xs font-bold text-ink",
									children: "Pindai untuk Lihat Laporan"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-ink-muted leading-tight",
									children: "Pindai QR code untuk melihat laporan transparansi ini di perangkat mobile."
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "shrink-0 bg-surface p-1.5 rounded-xl border border-border shadow-xs",
								children: data.qrCodeDataUrl ? /* @__PURE__ */ jsx("img", {
									src: data.qrCodeDataUrl,
									alt: "QR Code Laporan",
									className: "w-16 h-16 rounded"
								}) : /* @__PURE__ */ jsx(QrCode, { className: "w-16 h-16 text-ink p-1" })
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsxs("span", { children: ["Terakhir diperbarui: ", data.lastUpdatedAt] })]
					}),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("span", { children: "© 2026 WargaHub. Semua informasi bersifat terbuka untuk seluruh warga." }) }),
					/* @__PURE__ */ jsx("div", {
						className: "font-medium text-ink",
						children: data.communityName
					})
				]
			}),
			selectedExpenseCategory && /* @__PURE__ */ jsx(ExpenseDetailModal, {
				isOpen: Boolean(selectedExpenseCategory),
				onClose: () => setSelectedExpenseCategory(null),
				categoryName: selectedExpenseCategory.name,
				percentage: selectedExpenseCategory.percentage,
				totalAmount: selectedExpenseCategory.amount
			}),
			showShareModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Bagikan Laporan Transparansi"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setShowShareModal(false),
								className: "text-ink-muted hover:text-ink",
								children: "✕"
							})]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-ink-muted",
							children: [
								"Bagikan ringkasan transparansi keuangan periode ",
								/* @__PURE__ */ jsx("strong", { children: selectedMonth }),
								" ke grup WhatsApp warga atau salin tautan publik."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("a", {
								href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`📢 Laporan Transparansi Iuran & Kas WargaHub — ${selectedMonth}\n\n• Tingkat Partisipasi: ${data.paidProperties} dari ${data.totalProperties} Rumah (${data.paidPercentage.toFixed(1)}%)\n• Total Saldo Kas: Rp${data.closingBalance.toLocaleString("id-ID")}\n• Pemasukan: Rp${data.income.toLocaleString("id-ID")}\n• Pengeluaran: Rp${data.expense.toLocaleString("id-ID")}\n\nLihat laporan detail & kuitansi terbuka di:\nhttp://localhost:4321/transparency`)}`,
								target: "_blank",
								rel: "noreferrer",
								className: "w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors",
								children: [/* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }), "Kirim ke WhatsApp Grup Warga"]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: handleCopyLink,
								className: "w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors",
								children: [copied ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-ink-muted" }), copied ? "Tautan Berhasil Disalin!" : "Salin Tautan Publik"]
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/services/transparency.service.ts
async function getPublicMonthlyReport(year = 2026, month = 8) {
	const defaultUnpaid = [
		"A-03",
		"A-11",
		"B-07",
		"C-02",
		"C-11",
		"D-05"
	];
	const defaultBreakdown = [
		{
			name: "Keamanan",
			percentage: 45,
			amount: 176e5,
			icon: "ShieldCheck"
		},
		{
			name: "Kebersihan",
			percentage: 25,
			amount: 9787500,
			icon: "Sparkles"
		},
		{
			name: "Listrik",
			percentage: 20,
			amount: 783e4,
			icon: "Zap"
		},
		{
			name: "Pemeliharaan",
			percentage: 10,
			amount: 3932500,
			icon: "Wrench"
		}
	];
	let totalProps = 68;
	let paidProps = 59;
	let unpaidProps = 9;
	let income = 645e5;
	let expense = 3915e4;
	let openingBalance = 18e6;
	let closingBalance = 2535e4;
	let unpaidHouses = defaultUnpaid;
	let expenseBreakdown = defaultBreakdown;
	if (process.env.DATABASE_URL) try {
		const snaps = await neonSql`SELECT * FROM monthly_snapshots WHERE billing_period_id = 'period-2026-08' LIMIT 1`;
		if (snaps.length) {
			const s = snaps[0];
			totalProps = Number(s.total_properties) || 68;
			paidProps = Number(s.paid_properties) || 59;
			unpaidProps = Number(s.unpaid_properties) || 9;
			income = Number(s.income) || 645e5;
			expense = Number(s.expense) || 3915e4;
			openingBalance = Number(s.opening_balance) || 18e6;
			closingBalance = Number(s.closing_balance) || 2535e4;
			if (s.unpaid_properties_list_json) unpaidHouses = JSON.parse(s.unpaid_properties_list_json);
			if (s.breakdown_json) expenseBreakdown = JSON.parse(s.breakdown_json);
		}
	} catch (e) {
		console.warn("Neon transparency snapshot error:", e);
	}
	let qrCodeDataUrl = "";
	try {
		qrCodeDataUrl = await QRCode.toDataURL(`https://wargahub.id/transparency/${year}/${month.toString().padStart(2, "0")}`, {
			margin: 1,
			width: 140,
			color: {
				dark: "#18201D",
				light: "#FFFFFF"
			}
		});
	} catch (e) {
		qrCodeDataUrl = "";
	}
	return {
		periodName: "Agustus 2026",
		year,
		month,
		totalProperties: totalProps,
		paidProperties: paidProps,
		unpaidProperties: unpaidProps,
		paidPercentage: Number((paidProps / totalProps * 100).toFixed(1)),
		unpaidPercentage: Number((unpaidProps / totalProps * 100).toFixed(1)),
		income,
		expense,
		openingBalance,
		closingBalance,
		unpaidHouses,
		expenseBreakdown,
		qrCodeDataUrl,
		lastUpdatedAt: "19 Agustus 2026, 17:30 WIB",
		communityName: "Komplek Taman Sejahtera"
	};
}
//#endregion
export { TransparencyView as n, getPublicMonthlyReport as t };
