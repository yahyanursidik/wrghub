import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as TrendingUp } from "./trending-up_CGf2hikw.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUpRight = createLucideIcon("ArrowUpRight", [["path", {
	d: "M7 7h10v10",
	key: "1tivn9"
}], ["path", {
	d: "M7 17 17 7",
	key: "1vkiza"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Layers = createLucideIcon("Layers", [
	["path", {
		d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
		key: "zw3jo"
	}],
	["path", {
		d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
		key: "1wduqc"
	}],
	["path", {
		d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
		key: "kqbvx6"
	}]
]);
//#endregion
//#region src/components/admin/AnalyticsManager.tsx
var AnalyticsManager = () => {
	const [selectedPeriod, setSelectedPeriod] = useState("6_MONTHS");
	const historicalTrends = [
		{
			month: "Maret 2026",
			income: 84e6,
			expense: 382e5,
			net: 458e5,
			rate: "93.3%"
		},
		{
			month: "April 2026",
			income: 8625e4,
			expense: 391e5,
			net: 4715e4,
			rate: "95.8%"
		},
		{
			month: "Mei 2026",
			income: 8775e4,
			expense: 412e5,
			net: 4655e4,
			rate: "97.5%"
		},
		{
			month: "Juni 2026",
			income: 855e5,
			expense: 389e5,
			net: 466e5,
			rate: "95.0%"
		},
		{
			month: "Juli 2026",
			income: 885e5,
			expense: 401e5,
			net: 484e5,
			rate: "98.3%"
		},
		{
			month: "Agustus 2026",
			income: 9e7,
			expense: 3915e4,
			net: 5085e4,
			rate: "94.2%"
		}
	];
	const blockCompliance = [
		{
			block: "Blok A",
			totalUnits: 30,
			paidUnits: 29,
			unpaidUnits: 1,
			rate: 96.7,
			color: "bg-emerald-500"
		},
		{
			block: "Blok B",
			totalUnits: 30,
			paidUnits: 27,
			unpaidUnits: 3,
			rate: 90,
			color: "bg-blue-500"
		},
		{
			block: "Blok C",
			totalUnits: 30,
			paidUnits: 28,
			unpaidUnits: 2,
			rate: 93.3,
			color: "bg-amber-500"
		},
		{
			block: "Blok D",
			totalUnits: 30,
			paidUnits: 29,
			unpaidUnits: 1,
			rate: 96.7,
			color: "bg-purple-500"
		}
	];
	const totalIncome = historicalTrends.reduce((acc, h) => acc + h.income, 0);
	const totalExpense = historicalTrends.reduce((acc, h) => acc + h.expense, 0);
	const totalNet = totalIncome - totalExpense;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl font-bold tracking-tight text-ink flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(TrendingUp, { className: "w-6 h-6 text-primary-600" }), "Analisis Tren Finansial & Kepatuhan Blok"]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Evaluasi performa arus kas, pertumbuhan saldo, dan perbandingan disiplin pembayaran antar blok hunian."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs text-ink-muted font-medium",
						children: "Rentang Data:"
					}), /* @__PURE__ */ jsxs("select", {
						value: selectedPeriod,
						onChange: (e) => setSelectedPeriod(e.target.value),
						className: "p-2 bg-surface border border-border rounded-xl text-xs font-bold text-ink",
						children: [/* @__PURE__ */ jsx("option", {
							value: "6_MONTHS",
							children: "6 Bulan Terakhir (Mar - Agu 2026)"
						}), /* @__PURE__ */ jsx("option", {
							value: "YEAR_TO_DATE",
							children: "Tahun Berjalan 2026 (YTD)"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Total Akumulasi Pemasukan (6 Bln)"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: formatRupiah(totalIncome)
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1",
								children: [/* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3.5 h-3.5" }), " Rata-rata Rp87.0M / bulan"]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Total Akumulasi Belanja (6 Bln)"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-primary-700 mt-1 tabular-nums",
								children: formatRupiah(totalExpense)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-ink-muted block mt-1",
								children: "Rasio Belanja: 45.4% dari Penerimaan"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Surplus Akumulatif (Kas Bertumbuh)"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-emerald-600 mt-1 tabular-nums",
								children: formatRupiah(totalNet)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-emerald-700 font-semibold block mt-1",
								children: "Keuangan Komplek Sangat Sehat"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-bold text-sm text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Layers, { className: "w-4 h-4 text-primary-600" }), "Perbandingan Tingkat Kepatuhan Pembayaran Antar Blok"]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-ink-muted mt-0.5",
						children: "Monitoring kedisiplinan 120 rumah di 4 wilayah blok hunian."
					})] }), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold text-primary-700",
						children: "Rata-rata Komplek: 94.2%"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4",
					children: blockCompliance.map((b) => /* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-canvas rounded-2xl border border-border/80 space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-bold text-sm text-ink",
									children: b.block
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-bold text-xs tabular-nums text-emerald-700",
									children: [b.rate.toFixed(1), "%"]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "bg-surface rounded-full h-2.5 overflow-hidden border border-border/60",
								children: /* @__PURE__ */ jsx("div", {
									className: `h-full rounded-full ${b.color}`,
									style: { width: `${b.rate}%` }
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-[11px] text-ink-muted",
								children: [/* @__PURE__ */ jsxs("span", { children: [b.paidUnits, " Lunas"] }), /* @__PURE__ */ jsxs("span", {
									className: "text-amber-700 font-semibold",
									children: [b.unpaidUnits, " Tertunda"]
								})]
							})
						]
					}, b.block))
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-border bg-canvas/30",
					children: /* @__PURE__ */ jsx("h3", {
						className: "font-bold text-sm text-ink",
						children: "Tabel Kinerja Finansial Multi-Periode Bulanan"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-canvas border-b border-border text-ink-muted font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Periode"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Pemasukan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Pengeluaran"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Surplus Bersih"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Tingkat Disiplin"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status Kas"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border/60",
							children: historicalTrends.map((h) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/50",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-ink",
										children: h.month
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-medium tabular-nums text-ink",
										children: formatRupiah(h.income)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-medium tabular-nums text-primary-700",
										children: formatRupiah(h.expense)
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-bold tabular-nums text-emerald-600",
										children: ["+", formatRupiah(h.net)]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center font-bold tabular-nums text-ink",
										children: h.rate
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200",
											children: "Surplus Stabil"
										})
									})
								]
							}, h.month))
						})]
					})
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/analytics.astro
var analytics_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Analytics,
	file: () => $$file,
	url: () => $$url
});
var $$Analytics = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Analitik & Tren Finansial - WargaHub",
		"currentPath": "/admin/analytics"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AnalyticsManager", AnalyticsManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/AnalyticsManager.tsx",
		"client:component-export": "AnalyticsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/analytics.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/analytics.astro";
var $$url = "/admin/analytics";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/analytics@_@astro
var page = () => analytics_exports;
//#endregion
export { page };
