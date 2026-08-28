import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Building2 } from "./global_DI05LtBp.mjs";
import { n as Wrench, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { n as getMaintenanceRequests, t as getFacilities } from "./facility.service_Dem-JNqc.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/FacilitiesManager.tsx
var FacilitiesManager = ({ facilities, maintenanceRequests }) => {
	const [activeTab, setActiveTab] = useState("facilities");
	const [requests, setRequests] = useState(maintenanceRequests);
	const [updatingId, setUpdatingId] = useState(null);
	const handleUpdateStatus = async (id, newStatus) => {
		setUpdatingId(id);
		try {
			if ((await fetch("/api/facilities/update-status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					requestId: id,
					status: newStatus
				})
			})).ok) setRequests(requests.map((r) => r.id === id ? {
				...r,
				status: newStatus
			} : r));
		} catch (err) {
			console.error(err);
		} finally {
			setUpdatingId(null);
		}
	};
	const getConditionBadge = (cond) => {
		switch (cond) {
			case "GOOD": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200",
				children: "Kondisi Baik"
			});
			case "NEEDS_REPAIR": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200",
				children: "Perlu Perbaikan"
			});
			case "UNDER_MAINTENANCE": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200",
				children: "Dalam Perawatan"
			});
			case "DAMAGED": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200",
				children: "Rusak"
			});
			default: return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-xs font-semibold",
				children: cond
			});
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold tracking-tight text-ink",
				children: "Sarana & Pemeliharaan Fasilitas"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-ink-muted mt-1",
				children: "Inventaris aset sarana umum dan pemeliharaan berkala komplek."
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-b border-border pb-2",
				children: [/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("facilities"),
					className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "facilities" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
					children: [
						/* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
						"Inventaris Fasilitas (",
						facilities.length,
						")"
					]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("maintenance"),
					className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "maintenance" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
					children: [
						/* @__PURE__ */ jsx(Wrench, { className: "w-4 h-4" }),
						"Jadwal Pemeliharaan & Booking (",
						requests.length,
						")"
					]
				})]
			}),
			activeTab === "facilities" ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: facilities.map((f) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-mono font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded",
								children: f.code
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-ink mt-1",
								children: f.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: f.location
							})
						] }), getConditionBadge(f.condition)]
					}), f.notes && /* @__PURE__ */ jsx("p", {
						className: "text-xs text-ink-muted p-2.5 bg-canvas rounded-xl border border-border/60",
						children: f.notes
					})]
				}, f.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "space-y-4",
				children: requests.map((m) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5 flex-1",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: `px-2 py-0.5 text-[10px] font-bold rounded ${m.status === "RESOLVED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : m.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-800 border border-blue-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`,
									children: m.status
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold text-ink",
									children: m.title
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted leading-relaxed",
								children: m.description
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-primary-700 font-semibold",
								children: ["Pelaksana: ", m.performedBy || "Petugas Sarana & Pengurus"]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:items-end gap-2 shrink-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[10px] text-ink-muted block",
								children: "Estimasi Biaya"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-ink tabular-nums",
								children: formatRupiah(m.actualCost || m.costEstimate)
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [
								m.status === "SUBMITTED" && /* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: updatingId === m.id,
									onClick: () => handleUpdateStatus(m.id, "IN_PROGRESS"),
									className: "px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface text-[11px] font-semibold rounded-lg shadow-xs",
									children: "Setujui (Proses)"
								}),
								m.status === "IN_PROGRESS" && /* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: updatingId === m.id,
									onClick: () => handleUpdateStatus(m.id, "RESOLVED"),
									className: "px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-surface text-[11px] font-semibold rounded-lg shadow-xs",
									children: "Tandai Selesai"
								}),
								m.status !== "RESOLVED" && /* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: updatingId === m.id,
									onClick: () => handleUpdateStatus(m.id, "REJECTED"),
									className: "px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold rounded-lg border border-red-200",
									children: "Tolak"
								})
							]
						})]
					})]
				}, m.id))
			})
		]
	});
};
//#endregion
//#region src/pages/admin/facilities.astro
var facilities_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Facilities,
	file: () => $$file,
	url: () => $$url
});
var $$Facilities = createComponent(async ($$result, $$props, $$slots) => {
	const facilities = await getFacilities();
	const maintenanceRequests = await getMaintenanceRequests();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Sarana & Maintenance - WargaHub",
		"currentPath": "/admin/facilities"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "FacilitiesManager", FacilitiesManager, {
		"facilities": facilities,
		"maintenanceRequests": maintenanceRequests,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/FacilitiesManager.tsx",
		"client:component-export": "FacilitiesManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/facilities.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/facilities.astro";
var $$url = "/admin/facilities";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/facilities@_@astro
var page = () => facilities_exports;
//#endregion
export { page };
