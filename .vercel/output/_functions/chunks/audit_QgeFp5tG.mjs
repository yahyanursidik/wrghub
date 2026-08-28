import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as User } from "./global_DI05LtBp.mjs";
import { a as Search, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { t as Eye } from "./eye_BwnvIS94.mjs";
import { t as getAuditLogs } from "./audit.service_D4o7GGen.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/AuditManager.tsx
var AuditManager = ({ initialLogs }) => {
	const [logs, setLogs] = useState(initialLogs);
	const [search, setSearch] = useState("");
	const [selectedAction, setSelectedAction] = useState("ALL");
	const [activeLog, setActiveLog] = useState(null);
	const filteredLogs = logs.filter((log) => {
		const matchesSearch = log.actorName?.toLowerCase().includes(search.toLowerCase()) || log.action?.toLowerCase().includes(search.toLowerCase()) || log.entityType?.toLowerCase().includes(search.toLowerCase()) || log.entityId?.toLowerCase().includes(search.toLowerCase());
		const matchesAction = selectedAction === "ALL" || log.action.includes(selectedAction.toLowerCase());
		return matchesSearch && matchesAction;
	});
	const getActionBadge = (action) => {
		if (action.includes("verify") || action.includes("approve")) return /* @__PURE__ */ jsx("span", {
			className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200",
			children: "VERIFIKASI"
		});
		if (action.includes("submit") || action.includes("create") || action.includes("generate")) return /* @__PURE__ */ jsx("span", {
			className: "px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200",
			children: "BUAT DATA"
		});
		if (action.includes("reject") || action.includes("reverse")) return /* @__PURE__ */ jsx("span", {
			className: "px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold border border-red-200",
			children: "PENOLAKAN"
		});
		return /* @__PURE__ */ jsx("span", {
			className: "px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-[11px] font-semibold border border-border",
			children: action
		});
	};
	const exportJSON = () => {
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
		const downloadAnchor = document.createElement("a");
		downloadAnchor.setAttribute("href", dataStr);
		downloadAnchor.setAttribute("download", `audit-trail-wargahub-${(/* @__PURE__ */ new Date()).toISOString().substring(0, 10)}.json`);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Jejak Audit & Log Keamanan"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Rekam jejak seluruh perubahan data, verifikasi transaksi kas, dan aktivitas sistem."
				})] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: exportJSON,
					className: "inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-semibold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-ink-muted" }), "Ekspor Log (JSON)"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "w-full sm:w-80 relative",
					children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-3" }), /* @__PURE__ */ jsx("input", {
						type: "text",
						placeholder: "Cari aktivitas, pelaku, atau id entitas...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-2 w-full sm:w-auto",
					children: /* @__PURE__ */ jsxs("select", {
						value: selectedAction,
						onChange: (e) => setSelectedAction(e.target.value),
						className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "ALL",
								children: "Semua Aksi"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "PAYMENT",
								children: "Pembayaran & Verifikasi"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "BILLING",
								children: "Tagihan & Billing"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "PROPERTY",
								children: "Data Rumah & Warga"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "EXPENSE",
								children: "Pencatatan Biaya"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "VEHICLE",
								children: "Kendaraan"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "FACILITY",
								children: "Fasilitas"
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
				children: /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto max-h-[550px]",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-xs text-left",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "sticky top-0 bg-canvas border-b border-border text-ink-muted font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Waktu (WIB)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Pelaku (Actor)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Aksi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Entitas & ID"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Detail Nilai"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-border/60",
							children: filteredLogs.map((log) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/50 text-ink",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono text-ink-muted whitespace-nowrap",
										children: log.createdAt || "Baru saja"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-semibold text-ink",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-primary-600 shrink-0" }), /* @__PURE__ */ jsx("span", { children: log.actorName })]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 whitespace-nowrap",
										children: getActionBadge(log.action)
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-mono text-[11px] text-ink-muted block",
											children: log.entityType
										}), /* @__PURE__ */ jsx("span", {
											className: "font-mono font-bold text-ink text-[11px]",
											children: log.entityId
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right",
										children: /* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setActiveLog(log),
											className: "p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium inline-flex items-center gap-1 text-[11px]",
											children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), " Lihat JSON"]
										})
									})
								]
							}, log.id))
						})]
					})
				})
			}),
			activeLog && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Detail Audit Log"
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-[11px] font-mono text-ink-muted",
								children: [
									activeLog.id,
									" • ",
									activeLog.createdAt
								]
							})] }), /* @__PURE__ */ jsx("button", {
								onClick: () => setActiveLog(null),
								className: "text-ink-muted hover:text-ink",
								children: "✕"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2.5",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2 p-3 bg-canvas rounded-xl border border-border",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted block",
									children: "Pelaku:"
								}), /* @__PURE__ */ jsx("strong", {
									className: "text-ink",
									children: activeLog.actorName
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted block",
									children: "Aksi:"
								}), /* @__PURE__ */ jsx("strong", {
									className: "text-ink",
									children: activeLog.action
								})] })]
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold text-ink block mb-1",
								children: "Perubahan Nilai Baru (New Value):"
							}), /* @__PURE__ */ jsx("pre", {
								className: "p-3 bg-ink text-surface rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-48",
								children: activeLog.newValueJson ? JSON.stringify(JSON.parse(activeLog.newValueJson), null, 2) : "Tidak ada payload"
							})] })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-3 border-t border-border flex justify-end",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveLog(null),
								className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl",
								children: "Tutup"
							})
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/admin/audit.astro
var audit_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Audit,
	file: () => $$file,
	url: () => $$url
});
var $$Audit = createComponent(async ($$result, $$props, $$slots) => {
	const logs = await getAuditLogs(100);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Jejak Audit & Keamanan - WargaHub",
		"currentPath": "/admin/audit"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AuditManager", AuditManager, {
		"initialLogs": logs,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/AuditManager.tsx",
		"client:component-export": "AuditManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/audit.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/audit.astro";
var $$url = "/admin/audit";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/audit@_@astro
var page = () => audit_exports;
//#endregion
export { page };
