import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { a as Search, s as CreditCard, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as Eye } from "./eye_BwnvIS94.mjs";
import { t as Hourglass } from "./hourglass_D_2VXHHX.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { t as getPayments } from "./payment.service_BDCZwn7c.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleX = createLucideIcon("CircleX", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "m15 9-6 6",
		key: "1uzhvr"
	}],
	["path", {
		d: "m9 9 6 6",
		key: "z0biqf"
	}]
]);
//#endregion
//#region src/components/admin/PaymentsManager.tsx
var PaymentsManager = ({ initialPayments }) => {
	const [payments, setPayments] = useState(initialPayments);
	const [activeTab, setActiveTab] = useState("PENDING");
	const [search, setSearch] = useState("");
	const [viewingProof, setViewingProof] = useState(null);
	const filtered = payments.filter((p) => {
		const matchStatus = p.status === activeTab;
		const matchSearch = p.propertyCode.toLowerCase().includes(search.toLowerCase()) || p.reference && p.reference.toLowerCase().includes(search.toLowerCase());
		return matchStatus && matchSearch;
	});
	const pendingCount = payments.filter((p) => p.status === "PENDING").length;
	const verifiedCount = payments.filter((p) => p.status === "VERIFIED").length;
	const rejectedCount = payments.filter((p) => p.status === "REJECTED").length;
	const handleVerify = async (paymentId) => {
		try {
			await fetch("/api/payments/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					paymentId,
					verifierUserId: "user-bendahara",
					verifierName: "Hendra Wijaya"
				})
			});
			setPayments((prev) => prev.map((p) => {
				if (p.id === paymentId) return {
					...p,
					status: "VERIFIED",
					verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				return p;
			}));
			setViewingProof(null);
		} catch (err) {
			console.error(err);
		}
	};
	const handleReject = async (paymentId) => {
		try {
			await fetch("/api/payments/reject", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					paymentId,
					reason: "Bukti transfer tidak sesuai nominal"
				})
			});
			setPayments((prev) => prev.map((p) => {
				if (p.id === paymentId) return {
					...p,
					status: "REJECTED",
					rejectionReason: "Bukti transfer tidak sesuai nominal"
				};
				return p;
			}));
			setViewingProof(null);
		} catch (err) {
			console.error(err);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-ink",
					children: "Pembayaran & Verifikasi Iuran"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Kelola dan verifikasi konfirmasi pembayaran iuran warga."
				})] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-b border-border pb-2",
				children: [
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("PENDING"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "PENDING" ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [
							/* @__PURE__ */ jsx(Hourglass, { className: "w-4 h-4" }),
							"Menunggu Verifikasi (",
							pendingCount,
							")"
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("VERIFIED"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "VERIFIED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [
							/* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4" }),
							"Terverifikasi (",
							verifiedCount,
							")"
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("REJECTED"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "REJECTED" ? "bg-red-50 text-red-800 border border-red-200 shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [
							/* @__PURE__ */ jsx(CircleX, { className: "w-4 h-4" }),
							"Ditolak (",
							rejectedCount,
							")"
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "w-full sm:w-80 relative",
				children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-3" }), /* @__PURE__ */ jsx("input", {
					type: "text",
					placeholder: "Cari rumah (cth: B-14) atau nomor ref...",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-muted focus:outline-hidden"
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
									children: "Rumah / Unit"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jumlah"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Metode"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Referensi Transfer"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Waktu Pembayaran"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							]
						}) }), /* @__PURE__ */ jsxs("tbody", {
							className: "divide-y divide-border/60",
							children: [filtered.map((pay) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-canvas/60 text-ink transition-colors",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 font-bold text-sm text-primary-700",
										children: ["Rumah ", pay.propertyCode]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-ink tabular-nums",
										children: formatRupiah(pay.amount)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-medium text-ink-muted",
										children: pay.method
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono text-ink-muted",
										children: pay.reference || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-ink-muted tabular-nums",
										children: pay.paidAt
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right space-x-1.5",
										children: [/* @__PURE__ */ jsxs("button", {
											onClick: () => setViewingProof(pay),
											className: "px-2.5 py-1 bg-surface hover:bg-canvas border border-border rounded-lg text-xs font-semibold text-ink inline-flex items-center gap-1",
											children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), "Bukti"]
										}), pay.status === "PENDING" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
											onClick: () => handleVerify(pay.id),
											className: "px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-xs",
											children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }), "Verifikasi"]
										}), /* @__PURE__ */ jsx("button", {
											onClick: () => handleReject(pay.id),
											className: "px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1",
											children: "Tolak"
										})] })]
									})
								]
							}, pay.id)), filtered.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: 6,
								className: "py-12 text-center text-sm text-ink-muted",
								children: "Tidak ada pembayaran dalam kategori ini."
							}) })]
						})]
					})
				})
			}),
			viewingProof && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-bold text-sm text-ink",
								children: ["Bukti Pembayaran Rumah ", viewingProof.propertyCode]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setViewingProof(null),
								className: "text-ink-muted hover:text-ink",
								children: "✕"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 bg-canvas rounded-2xl border border-border text-center space-y-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs",
								children: /* @__PURE__ */ jsx(CreditCard, { className: "w-8 h-8" })
							}), /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-ink-muted",
									children: "Nominal Transfer"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xl font-bold text-ink tabular-nums",
									children: formatRupiah(viewingProof.amount)
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs font-mono text-ink-muted mt-1",
									children: viewingProof.reference
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-ink-muted",
									children: viewingProof.paidAt
								})
							] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => setViewingProof(null),
								className: "flex-1 py-2 border border-border text-ink font-semibold rounded-xl text-xs",
								children: "Tutup"
							}), viewingProof.status === "PENDING" && /* @__PURE__ */ jsxs("button", {
								onClick: () => handleVerify(viewingProof.id),
								className: "flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1",
								children: [/* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }), "Verifikasi Sekarang"]
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/admin/payments.astro
var payments_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Payments,
	file: () => $$file,
	url: () => $$url
});
var $$Payments = createComponent(async ($$result, $$props, $$slots) => {
	const payments = await getPayments();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pembayaran & Verifikasi - WargaHub",
		"currentPath": "/admin/payments"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "PaymentsManager", PaymentsManager, {
		"initialPayments": payments,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/PaymentsManager.tsx",
		"client:component-export": "PaymentsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/payments.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/payments.astro";
var $$url = "/admin/payments";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/payments@_@astro
var page = () => payments_exports;
//#endregion
export { page };
