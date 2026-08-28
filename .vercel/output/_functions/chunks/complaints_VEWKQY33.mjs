import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as getComplaints } from "./complaint.service_CHdQ-3sY.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/ComplaintsManager.tsx
var ComplaintsManager = ({ initialComplaints }) => {
	const [complaints, setComplaints] = useState(initialComplaints);
	const [selectedComplaint, setSelectedComplaint] = useState(null);
	const [resolutionNotes, setResolutionNotes] = useState("");
	const [updatingId, setUpdatingId] = useState(null);
	const [statusFilter, setStatusFilter] = useState("ALL");
	const handleUpdateStatus = async (id, newStatus, notes) => {
		setUpdatingId(id);
		try {
			await fetch("/api/complaints/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					complaintId: id,
					status: newStatus,
					userId: "user-ketua",
					message: notes || `Status diubah menjadi ${newStatus}`
				})
			});
			setComplaints((prev) => prev.map((c) => c.id === id ? {
				...c,
				status: newStatus
			} : c));
			if (selectedComplaint?.id === id) setSelectedComplaint((prev) => prev ? {
				...prev,
				status: newStatus
			} : null);
			setResolutionNotes("");
		} catch (err) {
			console.error(err);
		} finally {
			setUpdatingId(null);
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "REPORTED": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200",
				children: "Dilaporkan"
			});
			case "ACKNOWLEDGED": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200",
				children: "Diterima Satpam"
			});
			case "IN_PROGRESS": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200",
				children: "Sedang Ditangani"
			});
			case "RESOLVED": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200",
				children: "Tuntas (Selesai)"
			});
			default: return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-xs font-semibold",
				children: status
			});
		}
	};
	const filteredComplaints = complaints.filter((c) => {
		if (statusFilter === "ALL") return true;
		return c.status === statusFilter;
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Aduan & Tanggap Cepat Keamanan"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Alur disposisi satpam, teknisi perbaikan lingkungan, dan resolusi keluhan warga komplek."
				})] })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 overflow-x-auto pb-1",
				children: [
					{
						key: "ALL",
						label: `Semua Aduan (${complaints.length})`
					},
					{
						key: "REPORTED",
						label: "Perlu Respon"
					},
					{
						key: "IN_PROGRESS",
						label: "Dalam Pengerjaan"
					},
					{
						key: "RESOLVED",
						label: "Tuntas"
					}
				].map((tab) => /* @__PURE__ */ jsx("button", {
					onClick: () => setStatusFilter(tab.key),
					className: `px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === tab.key ? "bg-primary-600 text-surface" : "bg-surface text-ink-muted hover:text-ink border border-border"}`,
					children: tab.label
				}, tab.key))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: filteredComplaints.map((comp) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 flex flex-col justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2.5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
									className: "text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded",
									children: ["Rumah ", comp.propertyCode || "Warga"]
								}), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-ink mt-1.5",
									children: comp.title
								})] }), getStatusBadge(comp.status)]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted leading-relaxed",
								children: comp.description
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-ink-muted",
								children: [/* @__PURE__ */ jsxs("span", { children: ["Lokasi: ", /* @__PURE__ */ jsx("strong", {
									className: "text-ink font-semibold",
									children: comp.location || "Area Komplek"
								})] }), /* @__PURE__ */ jsxs("span", { children: ["Pelapor: ", /* @__PURE__ */ jsx("strong", {
									className: "text-ink font-semibold",
									children: comp.submittedByName || "Warga"
								})] })]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "pt-3 border-t border-border flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [comp.status === "REPORTED" && /* @__PURE__ */ jsxs("button", {
								type: "button",
								disabled: updatingId === comp.id,
								onClick: () => handleUpdateStatus(comp.id, "IN_PROGRESS", "Diterima & ditugaskan ke Satpam / Teknisi"),
								className: "px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs",
								children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), "Tugaskan Petugas"]
							}), comp.status === "IN_PROGRESS" && /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setSelectedComplaint(comp),
								className: "px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs",
								children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }), "Selesaikan Aduan"]
							})]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setSelectedComplaint(comp),
							className: "text-xs text-primary-700 font-semibold flex items-center gap-1 hover:underline ml-auto",
							children: ["Detail & Catatan ", /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" })]
						})]
					})]
				}, comp.id))
			}),
			selectedComplaint && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Disposisi & Resolusi Aduan"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setSelectedComplaint(null),
								className: "text-ink-muted hover:text-ink",
								children: "✕"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "p-3 bg-canvas rounded-xl space-y-1",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted text-[11px]",
											children: "Informasi Pelapor"
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "font-bold text-ink text-sm",
											children: [
												selectedComplaint.submittedByName || "Warga",
												" (Rumah ",
												selectedComplaint.propertyCode,
												")"
											]
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "text-[11px] text-ink-muted",
											children: ["Lokasi: ", selectedComplaint.location]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-3 bg-canvas rounded-xl space-y-1",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted text-[11px]",
										children: "Uraian Masalah"
									}), /* @__PURE__ */ jsx("p", {
										className: "font-medium text-ink leading-relaxed",
										children: selectedComplaint.description
									})]
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-bold text-ink block mb-1",
									children: "Catatan Solusi / Tindak Lanjut Petugas"
								}), /* @__PURE__ */ jsx("textarea", {
									rows: 3,
									placeholder: "Tuliskan tindakan yang telah dilakukan (contoh: Kabel telah dirapikan oleh petugas PLN)...",
									value: resolutionNotes,
									onChange: (e) => setResolutionNotes(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "p-3 bg-canvas rounded-xl space-y-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted font-semibold block text-[11px]",
										children: "Pilih Tindakan Disposisi"
									}), /* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => handleUpdateStatus(selectedComplaint.id, "IN_PROGRESS", resolutionNotes),
											className: "py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-xl border border-blue-200 transition-colors",
											children: "Tugaskan / Proses"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => handleUpdateStatus(selectedComplaint.id, "RESOLVED", resolutionNotes || "Masalah telah diselesaikan oleh petugas komplek."),
											className: "py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl shadow-xs transition-colors",
											children: "Tandai Selesai (Tuntas)"
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-2 flex justify-end",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setSelectedComplaint(null),
								className: "px-4 py-2 border border-border rounded-xl text-ink font-semibold",
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
//#region src/pages/admin/complaints.astro
var complaints_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Complaints,
	file: () => $$file,
	url: () => $$url
});
var $$Complaints = createComponent(async ($$result, $$props, $$slots) => {
	const complaints = await getComplaints();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Aduan Warga - WargaHub",
		"currentPath": "/admin/complaints"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "ComplaintsManager", ComplaintsManager, {
		"initialComplaints": complaints,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/ComplaintsManager.tsx",
		"client:component-export": "ComplaintsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/complaints.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/complaints.astro";
var $$url = "/admin/complaints";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/complaints@_@astro
var page = () => complaints_exports;
//#endregion
export { page };
