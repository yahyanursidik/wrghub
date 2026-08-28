import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Search, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { r as getLedgerEntries, t as getAccounts } from "./finance.service__UcNKyki.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/LedgerManager.tsx
var LedgerManager = ({ accounts, entries }) => {
	const [accountFilter, setAccountFilter] = useState("ALL");
	const [directionFilter, setDirectionFilter] = useState("ALL");
	const [search, setSearch] = useState("");
	const filteredEntries = entries.filter((e) => {
		const matchesAccount = accountFilter === "ALL" || e.accountId === accountFilter;
		const matchesDirection = directionFilter === "ALL" || e.direction === directionFilter;
		const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.sourceType.toLowerCase().includes(search.toLowerCase());
		return matchesAccount && matchesDirection && matchesSearch;
	});
	const totalIn = filteredEntries.filter((e) => e.direction === "IN").reduce((sum, e) => sum + e.amount, 0);
	const totalOut = filteredEntries.filter((e) => e.direction === "OUT").reduce((sum, e) => sum + e.amount, 0);
	const exportCSV = () => {
		const headers = [
			"Tanggal",
			"Akun",
			"Tipe",
			"Uraian",
			"Pemasukan (Debit)",
			"Pengeluaran (Kredit)"
		];
		const rows = filteredEntries.map((e) => [
			e.entryDate,
			e.accountId || "Kas Utama",
			e.sourceType,
			`"${e.description.replace(/"/g, "\"\"")}"`,
			e.direction === "IN" ? e.amount : "",
			e.direction === "OUT" ? e.amount : ""
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `jurnal-kas-wargahub-${(/* @__PURE__ */ new Date()).toISOString().substring(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Buku Kas & Jurnal Transaksi"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Histori arus kas masuk dan keluar komplek yang tercatat sistematis."
				})] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: exportCSV,
					className: "inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-semibold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-ink-muted" }), "Ekspor Jurnal Kas (CSV)"]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
				children: accounts.map((acc) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-ink-muted",
							children: acc.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xl font-bold text-ink mt-1 tabular-nums",
							children: formatRupiah(acc.balance)
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-[11px] font-mono text-ink-muted",
							children: [
								acc.bankName,
								" - ",
								acc.accountNumber
							]
						})
					] }), /* @__PURE__ */ jsx("span", {
						className: "px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200",
						children: "Aktif"
					})]
				}, acc.id))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "p-4 border-b border-border bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("button", {
								onClick: () => setDirectionFilter("ALL"),
								className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${directionFilter === "ALL" ? "bg-primary-600 text-surface" : "bg-surface text-ink-muted hover:text-ink border border-border"}`,
								children: "Semua Arus"
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setDirectionFilter("IN"),
								className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${directionFilter === "IN" ? "bg-emerald-600 text-surface" : "bg-surface text-emerald-700 hover:bg-emerald-50 border border-border"}`,
								children: [
									"Pemasukan (+",
									formatRupiah(totalIn),
									")"
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setDirectionFilter("OUT"),
								className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${directionFilter === "OUT" ? "bg-red-600 text-surface" : "bg-surface text-red-700 hover:bg-red-50 border border-border"}`,
								children: [
									"Pengeluaran (-",
									formatRupiah(totalOut),
									")"
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative w-full sm:w-64",
						children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-2.5" }), /* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Cari transaksi / sumber...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink"
						})]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto max-h-[500px]",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-xs text-left",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "sticky top-0 bg-canvas border-b border-border text-ink-muted font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tanggal"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tipe"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Uraian / Deskripsi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Debit (Masuk)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Kredit (Keluar)"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border/60",
							children: filteredEntries.map((entry) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/50 text-ink",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono text-ink-muted",
										children: entry.entryDate
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-canvas border border-border font-semibold text-[10px]",
											children: entry.sourceType
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-medium text-ink",
										children: entry.description
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-bold tabular-nums text-emerald-600",
										children: entry.direction === "IN" ? `+ ${formatRupiah(entry.amount)}` : "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right font-bold tabular-nums text-red-600",
										children: entry.direction === "OUT" ? `- ${formatRupiah(entry.amount)}` : "-"
									})
								]
							}, entry.id))
						})]
					})
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/ledger.astro
var ledger_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Ledger,
	file: () => $$file,
	url: () => $$url
});
var $$Ledger = createComponent(async ($$result, $$props, $$slots) => {
	const entries = await getLedgerEntries(100);
	const accounts = await getAccounts();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Buku Kas & Ledger - WargaHub",
		"currentPath": "/admin/ledger"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "LedgerManager", LedgerManager, {
		"accounts": accounts,
		"entries": entries,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/LedgerManager.tsx",
		"client:component-export": "LedgerManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/ledger.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/ledger.astro";
var $$url = "/admin/ledger";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/ledger@_@astro
var page = () => ledger_exports;
//#endregion
export { page };
