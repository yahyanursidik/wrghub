import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { i as House, o as createLucideIcon, r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { c as FileText, i as Users, r as Wallet, s as Megaphone } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { l as ChevronDown, n as Wrench, o as MessageCircle, s as CreditCard, t as $$AdminLayout, u as Calendar } from "./AdminLayout_CzR5wuim.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as Headphones } from "./headphones_Xp5mfevz.mjs";
import { t as Hourglass } from "./hourglass_D_2VXHHX.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { n as getCurrentBillingPeriod, t as getBillingProgress } from "./billing.service_BI_aX0Qs.mjs";
import { n as getOpenComplaintsCount } from "./complaint.service_CHdQ-3sY.mjs";
import { i as getMainAccountBalance } from "./finance.service__UcNKyki.mjs";
import { r as getNeedingRepairCount } from "./facility.service_Dem-JNqc.mjs";
import { n as getPropertyStats } from "./property.service_BWA2j2ar.mjs";
import { n as getPendingPaymentsCount } from "./payment.service_BDCZwn7c.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChartNoAxesColumn = createLucideIcon("ChartNoAxesColumn", [
	["line", {
		x1: "18",
		x2: "18",
		y1: "20",
		y2: "10",
		key: "1xfpm4"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "20",
		y2: "4",
		key: "be30l9"
	}],
	["line", {
		x1: "6",
		x2: "6",
		y1: "20",
		y2: "14",
		key: "1r4le6"
	}]
]);
//#endregion
//#region src/components/admin/AdminDashboardView.tsx
var AdminDashboardView = ({ stats }) => {
	const [selectedMonth, setSelectedMonth] = useState("Agustus 2026");
	const budgetData = [
		{
			keterangan: "Pemasukan (Iuran)",
			anggaran: 9e7,
			realisasi: 645e5,
			selisih: -255e5,
			isPositive: false
		},
		{
			keterangan: "Pengeluaran Operasional",
			anggaran: 45e6,
			realisasi: 2835e4,
			selisih: 1665e4,
			isPositive: true
		},
		{
			keterangan: "Pengeluaran Pemeliharaan",
			anggaran: 2e7,
			realisasi: 126e5,
			selisih: 74e5,
			isPositive: true
		},
		{
			keterangan: "Saldo Akhir",
			anggaran: 25e6,
			realisasi: 2355e4,
			selisih: -145e4,
			isPositive: false,
			isTotal: true
		}
	];
	const activities = [
		{
			id: "act-1",
			icon: CreditCard,
			iconBg: "bg-emerald-50 text-emerald-700",
			title: "Pembayaran iuran dari Rumah B-12",
			detail: "Rp750.000 melalui Transfer Bank",
			time: "Hari ini, 09:15"
		},
		{
			id: "act-2",
			icon: MessageCircle,
			iconBg: "bg-emerald-50 text-emerald-700",
			title: "Aduan baru: Lampu jalan mati di Blok C",
			detail: "Dilaporkan oleh Budi Santoso (C-07)",
			time: "Kemarin, 21:08"
		},
		{
			id: "act-3",
			icon: Wrench,
			iconBg: "bg-emerald-50 text-emerald-700",
			title: "Pengeluaran dicatat: Perbaikan pompa air",
			detail: "Rp2.350.000 oleh Petugas Sarana",
			time: "Kemarin, 16:40"
		},
		{
			id: "act-4",
			icon: Megaphone,
			iconBg: "bg-emerald-50 text-emerald-700",
			title: "Pengumuman baru dipublikasikan",
			detail: "Rapat warga bulanan – 25 Agustus 2026",
			time: "Kemarin, 10:22"
		},
		{
			id: "act-5",
			icon: ShieldCheck,
			iconBg: "bg-emerald-50 text-emerald-700",
			title: "3 pembayaran iuran diverifikasi",
			detail: "Total Rp2.250.000",
			time: "19 Agu 2026, 17:30"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl sm:text-3xl font-bold tracking-tight text-ink",
					children: "Dashboard Ketua Komplek"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Ringkasan informasi dan aktivitas penting Komplek Taman Sejahtera."
				})] }), /* @__PURE__ */ jsx("div", {
					className: "relative inline-block",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-sm font-medium text-ink shadow-xs transition-colors",
						children: [
							/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-ink-muted" }),
							/* @__PURE__ */ jsx("span", { children: selectedMonth }),
							/* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-ink-muted" })
						]
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(House, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Total Rumah"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: stats.totalProperties
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Unit"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Rumah Dihuni"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: stats.occupiedProperties
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: [stats.occupiedPercentage, "% dari total"]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(House, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Rumah Kosong"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: stats.vacantProperties
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: [stats.vacantPercentage, "% dari total"]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-700 font-bold text-xs mb-2.5",
								children: [stats.paidPercentage, "%"]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Iuran Bulan Ini"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-sm font-bold text-ink mt-1 tabular-nums",
								children: [
									stats.paidCount,
									" / ",
									stats.totalProperties,
									" rumah"
								]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-emerald-700 font-medium mt-0.5",
								children: "Sudah Lunas"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(Wallet, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Saldo Kas"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-base font-bold text-ink mt-1 tabular-nums truncate w-full",
								children: formatRupiah(stats.cashBalance)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted mt-0.5",
								children: "Per 20 Agu 2026"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(Hourglass, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Pembayaran Menunggu Verifikasi"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: stats.pendingPaymentsCount
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-amber-700 font-medium mt-0.5",
								children: "Transaksi"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2.5",
								children: /* @__PURE__ */ jsx(Headphones, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-ink-muted",
								children: "Aduan Terbuka"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: stats.openComplaintsCount
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-red-700 font-medium mt-0.5",
								children: "Aduan"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl p-6 border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "text-base font-bold text-ink",
						children: "Membutuhkan Perhatian"
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2.5",
						children: [
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/billing",
								className: "flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-red-50/40 border border-border transition-colors group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(House, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-semibold text-ink",
										children: "9 rumah belum iuran"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-ink-muted",
										children: "Batas akhir 5 Agustus 2026"
									})] })]
								}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/payments",
								className: "flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-amber-50/40 border border-border transition-colors group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(Hourglass, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-semibold text-ink",
										children: "3 pembayaran menunggu verifikasi"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-ink-muted",
										children: "Perlu dicek dan diverifikasi"
									})] })]
								}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/complaints",
								className: "flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-orange-50/40 border border-border transition-colors group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-semibold text-ink",
										children: "4 aduan belum selesai"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-ink-muted",
										children: "Perlu ditindaklanjuti"
									})] })]
								}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/facilities",
								className: "flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-sky-50/40 border border-border transition-colors group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(Wrench, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-semibold text-ink",
										children: "2 fasilitas perlu perbaikan"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-ink-muted",
										children: "Maintenance tertunda"
									})] })]
								}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" })]
							})
						]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between",
					children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-base font-bold text-ink",
							children: "Progress Iuran Bulanan"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-ink-muted",
							children: "Agustus 2026"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex-1 space-y-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline gap-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-2xl font-bold text-primary-600 tracking-tight",
									children: [stats.paidPercentage, "%"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-base font-bold text-ink",
									children: "rumah sudah lunas"
								})]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted mt-0.5",
								children: [
									stats.paidCount,
									" dari ",
									stats.totalProperties,
									" rumah"
								]
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("div", {
									className: "bg-canvas rounded-full h-3 overflow-hidden border border-border/60",
									children: /* @__PURE__ */ jsx("div", {
										className: "bg-primary-500 h-full rounded-full transition-all duration-500",
										style: { width: `${stats.paidPercentage}%` }
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-xs pt-1",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-primary-500" }),
											/* @__PURE__ */ jsx("span", {
												className: "text-ink-muted",
												children: "Lunas:"
											}),
											/* @__PURE__ */ jsxs("strong", {
												className: "text-ink font-semibold",
												children: [stats.paidCount, " rumah"]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "text-ink-muted",
												children: [
													"(",
													formatRupiah(stats.paidAmount),
													")"
												]
											})
										]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-border-dark" }),
											/* @__PURE__ */ jsx("span", {
												className: "text-ink-muted",
												children: "Belum Lunas:"
											}),
											/* @__PURE__ */ jsxs("strong", {
												className: "text-ink font-semibold",
												children: [stats.unpaidCount, " rumah"]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "text-ink-muted",
												children: [
													"(",
													formatRupiah(stats.unpaidAmount),
													")"
												]
											})
										]
									})]
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "w-full sm:w-48 bg-primary-50/60 border border-primary-200/80 rounded-2xl p-4 flex flex-col justify-between shrink-0 text-center space-y-3",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "w-10 h-10 rounded-xl bg-surface border border-primary-200 flex items-center justify-center text-primary-600 mx-auto shadow-xs",
									children: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5" })
								}),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-[11px] font-medium text-primary-800",
										children: "Nominal Iuran / Bulan"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-base font-bold text-primary-900 mt-0.5 tabular-nums",
										children: formatRupiah(stats.monthlyRate)
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-primary-700/80",
										children: "Per rumah"
									})
								] }),
								/* @__PURE__ */ jsx("a", {
									href: "/admin/billing",
									className: "py-1.5 px-3 bg-surface hover:bg-primary-100/80 border border-primary-300 text-primary-700 rounded-xl text-xs font-semibold transition-colors block",
									children: "Lihat Detail Iuran"
								})
							]
						})]
					})] })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-base font-bold text-ink",
						children: "Ringkasan Keuangan – Agustus 2026"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-4 overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-border text-ink-muted font-semibold",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "pb-2",
										children: "Keterangan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "pb-2 text-right",
										children: "Anggaran"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "pb-2 text-right",
										children: "Realisasi"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "pb-2 text-right",
										children: "Selisih"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: budgetData.map((row) => /* @__PURE__ */ jsxs("tr", {
									className: row.isTotal ? "bg-primary-50/80 font-bold text-primary-950" : "text-ink",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-2.5 pr-2 font-medium",
											children: row.keterangan
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-2.5 px-2 text-right tabular-nums text-ink-muted",
											children: formatRupiah(row.anggaran)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-2.5 px-2 text-right tabular-nums font-semibold",
											children: formatRupiah(row.realisasi)
										}),
										/* @__PURE__ */ jsx("td", {
											className: `py-2.5 pl-2 text-right tabular-nums font-semibold ${row.isPositive ? "text-emerald-600" : "text-red-600"}`,
											children: row.selisih > 0 ? `+${formatRupiah(row.selisih)}` : `-${formatRupiah(Math.abs(row.selisih))}`
										})
									]
								}, row.keterangan))
							})]
						})
					})] }), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("a", {
						href: "/admin/budget",
						className: "inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-canvas border border-border rounded-xl text-xs font-semibold text-primary-700 transition-colors shadow-xs",
						children: [/* @__PURE__ */ jsx(ChartNoAxesColumn, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Lihat Laporan Keuangan" })]
					}) })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between space-y-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-base font-bold text-ink",
						children: "Aktivitas Terbaru"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-4 space-y-3.5",
						children: activities.map((act) => {
							const Icon = act.icon;
							return /* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3 text-xs",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: `w-8 h-8 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`,
										children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-ink text-xs",
										children: act.title
									}), /* @__PURE__ */ jsx("p", {
										className: "text-ink-muted text-[11px] mt-0.5",
										children: act.detail
									})] })]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted shrink-0 tabular-nums whitespace-nowrap",
									children: act.time
								})]
							}, act.id);
						})
					})] }), /* @__PURE__ */ jsx("div", {
						className: "pt-2 border-t border-border/60 text-center",
						children: /* @__PURE__ */ jsx("a", {
							href: "/admin/notifications",
							className: "text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline",
							children: "Lihat Semua Aktivitas"
						})
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted",
				children: [/* @__PURE__ */ jsx("span", { children: "© 2026 WargaHub. All rights reserved." }), /* @__PURE__ */ jsx("span", {
					className: "font-medium text-ink",
					children: "Komplek Taman Sejahtera"
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const propStats = await getPropertyStats();
	const currentPeriod = await getCurrentBillingPeriod();
	const billingProgress = currentPeriod ? await getBillingProgress(currentPeriod.id) : {
		total: 120,
		paidCount: 86,
		unpaidCount: 34,
		percentage: 72,
		totalAmount: 9e7,
		paidAmount: 645e5,
		unpaidAmount: 255e5,
		monthlyRatePerHouse: 75e4
	};
	const cashBalance = await getMainAccountBalance();
	const pendingPayments = await getPendingPaymentsCount();
	const openComplaints = await getOpenComplaintsCount();
	const needingRepair = await getNeedingRepairCount();
	const stats = {
		totalProperties: propStats.total || 120,
		occupiedProperties: propStats.occupied || 98,
		vacantProperties: propStats.vacant || 22,
		occupiedPercentage: propStats.occupiedPercentage || "81.7",
		vacantPercentage: propStats.vacantPercentage || "18.3",
		paidCount: billingProgress.paidCount || 86,
		unpaidCount: billingProgress.unpaidCount || 34,
		paidPercentage: billingProgress.percentage || 72,
		paidAmount: billingProgress.paidAmount || 645e5,
		unpaidAmount: billingProgress.unpaidAmount || 255e5,
		monthlyRate: 75e4,
		cashBalance: cashBalance || 12845e4,
		pendingPaymentsCount: pendingPayments || 3,
		openComplaintsCount: openComplaints || 4,
		needingRepairCount: needingRepair || 2
	};
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Dashboard Ketua Komplek - WargaHub",
		"currentPath": "/admin"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AdminDashboardView", AdminDashboardView, {
		"stats": stats,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/AdminDashboardView.tsx",
		"client:component-export": "AdminDashboardView"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/index.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/index.astro";
var $$url = "/admin";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };
