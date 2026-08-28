import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as CirclePlus } from "./circle-plus_D9s3wy0y.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { n as getExpenses } from "./finance.service__UcNKyki.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/ExpensesManager.tsx
var ExpensesManager = ({ initialExpenses }) => {
	const [expenses, setExpenses] = useState(initialExpenses);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newAmount, setNewAmount] = useState("");
	const [newCategory, setNewCategory] = useState("Keamanan");
	const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
	const handleAddExpense = async (e) => {
		e.preventDefault();
		if (!newTitle || !newAmount) return;
		const numAmount = parseInt(newAmount.replace(/\D/g, ""), 10) || 0;
		try {
			await fetch("/api/expenses/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newTitle,
					amount: numAmount,
					categoryId: newCategory === "Keamanan" ? "cat-keamanan" : newCategory === "Kebersihan" ? "cat-kebersihan" : newCategory === "Listrik Fasum" ? "cat-listrik" : "cat-pemeliharaan"
				})
			});
			const newExp = {
				id: `exp-${Date.now()}`,
				title: newTitle,
				description: "Dicatat oleh Bendahara",
				amount: numAmount,
				expenseDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
				categoryName: newCategory,
				status: "APPROVED"
			};
			setExpenses([newExp, ...expenses]);
			setNewTitle("");
			setNewAmount("");
			setShowAddModal(false);
		} catch (err) {
			console.error(err);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Pengeluaran & Kas Operasional"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Catat dan pantau pengeluaran dana operasional komplek."
				})] }), /* @__PURE__ */ jsxs("button", {
					onClick: () => setShowAddModal(true),
					className: "inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-sm font-semibold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(CirclePlus, { className: "w-4 h-4" }), "Catat Pengeluaran Baru"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-6 bg-surface rounded-2xl border border-border shadow-card flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-ink-muted",
					children: "Total Pengeluaran Bulan Ini"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-2xl sm:text-3xl font-bold text-ink mt-1 tabular-nums",
					children: formatRupiah(totalExpense)
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "text-right",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs text-ink-muted",
						children: "Status Buku Kas"
					}), /* @__PURE__ */ jsx("span", {
						className: "block mt-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200",
						children: "Arus Kas Seimbang"
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
				children: /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-xs text-left",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-border bg-canvas/40 text-ink-muted font-semibold",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tanggal"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kategori"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Uraian Pengeluaran"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Nominal"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border/60",
							children: expenses.map((exp) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/60 text-ink transition-colors",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono text-ink-muted",
										children: exp.expenseDate
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-canvas border border-border font-semibold text-[11px]",
											children: exp.categoryName
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-medium text-ink",
										children: exp.title
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-bold text-red-600 tabular-nums",
										children: ["- ", formatRupiah(exp.amount)]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right",
										children: /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]",
											children: exp.status
										})
									})
								]
							}, exp.id))
						})]
					})
				})
			}),
			showAddModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Catat Pengeluaran Baru"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowAddModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleAddExpense,
						className: "space-y-3.5 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Kategori"
							}), /* @__PURE__ */ jsxs("select", {
								value: newCategory,
								onChange: (e) => setNewCategory(e.target.value),
								className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Keamanan",
										children: "Keamanan"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Kebersihan",
										children: "Kebersihan"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Listrik Fasum",
										children: "Listrik Fasum"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Pemeliharaan",
										children: "Pemeliharaan"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Uraian / Judul Pengeluaran"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Penggantian 5 unit lampu jalan LED",
								value: newTitle,
								onChange: (e) => setNewTitle(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Jumlah (Rp)"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: 1500000",
								value: newAmount,
								onChange: (e) => setNewAmount(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-bold tabular-nums"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowAddModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Simpan Transaksi"
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
//#region src/pages/admin/expenses.astro
var expenses_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Expenses,
	file: () => $$file,
	url: () => $$url
});
var $$Expenses = createComponent(async ($$result, $$props, $$slots) => {
	const expenses = await getExpenses();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pengeluaran & Kas - WargaHub",
		"currentPath": "/admin/expenses"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "ExpensesManager", ExpensesManager, {
		"initialExpenses": expenses,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/ExpensesManager.tsx",
		"client:component-export": "ExpensesManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/expenses.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/expenses.astro";
var $$url = "/admin/expenses";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/expenses@_@astro
var page = () => expenses_exports;
//#endregion
export { page };
