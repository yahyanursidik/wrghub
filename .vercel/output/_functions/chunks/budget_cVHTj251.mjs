import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/BudgetManager.tsx
var BudgetManager = () => {
	const [period, setPeriod] = useState("Agustus 2026");
	const budgetItems = [
		{
			category: "Operasional Keamanan & Satpam",
			budgetAmount: 18e6,
			actualAmount: 176e5,
			percentage: 97.7,
			status: "WARNING",
			variance: 4e5
		},
		{
			category: "Kebersihan & Pengangkutan Sampah",
			budgetAmount: 105e5,
			actualAmount: 9787500,
			percentage: 93.2,
			status: "WARNING",
			variance: 712500
		},
		{
			category: "Listrik & Penerangan Jalan (PJU)",
			budgetAmount: 85e5,
			actualAmount: 783e4,
			percentage: 92.1,
			status: "WARNING",
			variance: 67e4
		},
		{
			category: "Perawatan Sarana & Taman",
			budgetAmount: 5e6,
			actualAmount: 3932500,
			percentage: 78.6,
			status: "SAFE",
			variance: 1067500
		},
		{
			category: "Kegiatan Warga & HUT RI",
			budgetAmount: 4e6,
			actualAmount: 0,
			percentage: 0,
			status: "SAFE",
			variance: 4e6
		}
	];
	const totalBudget = budgetItems.reduce((acc, i) => acc + i.budgetAmount, 0);
	const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
	const totalVariance = totalBudget - totalActual;
	const overallPercentage = totalActual / totalBudget * 100;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Anggaran & Realisasi Keuangan"
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-sm text-ink-muted mt-1",
					children: [
						"Monitoring serapan dana iuran terhadap pagu anggaran periode ",
						/* @__PURE__ */ jsx("strong", { children: period }),
						"."
					]
				})] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Pagu Anggaran Bulanan"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-ink mt-1 tabular-nums",
								children: formatRupiah(totalBudget)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-ink-muted mt-1 block",
								children: "5 Pos Anggaran Disetujui"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Total Realisasi Belanja"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-primary-700 mt-1 tabular-nums",
								children: formatRupiah(totalActual)
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-emerald-700 font-semibold mt-1 block",
								children: [
									"Serapan: ",
									overallPercentage.toFixed(1),
									"% dari Pagu"
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-ink-muted",
								children: "Sisa Anggaran (Surplus)"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-2xl font-bold text-emerald-600 mt-1 tabular-nums",
								children: formatRupiah(totalVariance)
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-emerald-700 font-semibold mt-1 block",
								children: "Efisiensi Belanja Terjaga"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-border bg-canvas/30",
					children: /* @__PURE__ */ jsx("h3", {
						className: "font-bold text-sm text-ink",
						children: "Evaluasi Realisasi per Pos Anggaran"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-xs text-left",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-canvas border-b border-border text-ink-muted font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Pos Anggaran"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Pagu Target"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Realisasi Aktual"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Serapan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Sisa / Selisih"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border/60",
							children: budgetItems.map((item) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/50 text-ink",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-ink",
										children: item.category
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-medium tabular-nums",
										children: formatRupiah(item.budgetAmount)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-bold text-primary-800 tabular-nums",
										children: formatRupiah(item.actualAmount)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 min-w-[140px]",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex-1 bg-canvas rounded-full h-2 overflow-hidden border border-border/50",
												children: /* @__PURE__ */ jsx("div", {
													className: `h-full rounded-full ${item.percentage > 90 ? "bg-amber-500" : "bg-primary-600"}`,
													style: { width: `${Math.min(item.percentage, 100)}%` }
												})
											}), /* @__PURE__ */ jsxs("span", {
												className: "font-bold tabular-nums text-[11px]",
												children: [item.percentage.toFixed(1), "%"]
											})]
										})
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums",
										children: ["+ ", formatRupiah(item.variance)]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: item.percentage > 90 ? /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200",
											children: "Mendekati Pagu"
										}) : /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200",
											children: "Aman (Hemat)"
										})
									})
								]
							}, item.category))
						})]
					})
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/budget.astro
var budget_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Budget,
	file: () => $$file,
	url: () => $$url
});
var $$Budget = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Anggaran & Realisasi - WargaHub",
		"currentPath": "/admin/budget"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "BudgetManager", BudgetManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/BudgetManager.tsx",
		"client:component-export": "BudgetManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/budget.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/budget.astro";
var $$url = "/admin/budget";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/budget@_@astro
var page = () => budget_exports;
//#endregion
export { page };
