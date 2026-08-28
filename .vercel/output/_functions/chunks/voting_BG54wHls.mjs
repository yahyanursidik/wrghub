import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as ChartColumn } from "./chart-column_D5HVfMS4.mjs";
import { t as Vote } from "./vote_IhLHoAzn.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Award = createLucideIcon("Award", [["path", {
	d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
	key: "1yiouv"
}], ["circle", {
	cx: "12",
	cy: "8",
	r: "6",
	key: "1vp47v"
}]]);
//#endregion
//#region src/components/admin/VotingManager.tsx
var VotingManager = () => {
	const [activeTab, setActiveTab] = useState("election");
	const electionData = {
		title: "Pemilihan Ketua RW 05 / RT 02 Periode 2026 - 2029",
		description: "Musyawarah pemilihan ketua komplek baru untuk masa bakti 3 tahun ke depan.",
		period: "20 - 31 Agustus 2026",
		status: "SEDANG BERLANGSUNG",
		totalEligible: 120,
		totalVoted: 98,
		turnout: 81.7,
		candidates: [{
			number: "01",
			name: "Bpk. Ir. H. Bambang Sutrisno",
			tagline: "Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.",
			votes: 56,
			percentage: 57.1,
			color: "bg-emerald-600",
			textColor: "text-emerald-800",
			bgColor: "bg-emerald-50 border-emerald-200"
		}, {
			number: "02",
			name: "Ibu Dr. Ratna Kusuma Wardani",
			tagline: "Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.",
			votes: 42,
			percentage: 42.9,
			color: "bg-blue-600",
			textColor: "text-blue-800",
			bgColor: "bg-blue-50 border-blue-200"
		}]
	};
	const pollsData = [{
		id: "poll-1",
		title: "Pemasangan 16 Titik Kamera CCTV HD di Seluruh Gang Blok A - D",
		category: "KEAMANAN",
		budget: 185e5,
		totalVotes: 104,
		options: [
			{
				label: "Setuju Disetujui",
				count: 91,
				percentage: 87.5,
				color: "bg-emerald-500"
			},
			{
				label: "Tidak Setuju",
				count: 10,
				percentage: 9.6,
				color: "bg-rose-500"
			},
			{
				label: "Abstain",
				count: 3,
				percentage: 2.9,
				color: "bg-slate-400"
			}
		]
	}, {
		id: "poll-2",
		title: "Pengaspalan Ulang (Hotmix) Jalan Utama Boulevard Masuk Komplek",
		category: "INFRASTRUKTUR",
		budget: 45e6,
		totalVotes: 98,
		options: [
			{
				label: "Setuju Disetujui",
				count: 86,
				percentage: 87.8,
				color: "bg-emerald-500"
			},
			{
				label: "Tidak Setuju",
				count: 8,
				percentage: 8.2,
				color: "bg-rose-500"
			},
			{
				label: "Abstain",
				count: 4,
				percentage: 4,
				color: "bg-slate-400"
			}
		]
	}];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl font-bold tracking-tight text-ink flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Vote, { className: "w-6 h-6 text-primary-600" }), "E-Voting & Musyawarah Warga Digital"]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Monitoring perolehan suara pemilihan Ketua RT/RW dan polling persetujuan proyek fasilitas komplek secara real-time."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold",
					children: [/* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" }), "Sistem Pemilu Warga: AKTIF & TERENKRIPSI"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-b border-border pb-2",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setActiveTab("election"),
					className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === "election" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
					children: [/* @__PURE__ */ jsx(Award, { className: "w-4 h-4" }), "Pemilihan Ketua RT/RW 2026-2029"]
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setActiveTab("polls"),
					className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === "polls" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
					children: [
						/* @__PURE__ */ jsx(ChartColumn, { className: "w-4 h-4" }),
						"Polling Proyek & Anggaran Fasilitas (",
						pollsData.length,
						")"
					]
				})]
			}),
			activeTab === "election" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-ink-muted",
									children: "Tingkat Partisipasi Warga"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-2xl font-bold text-ink mt-1 tabular-nums",
									children: [electionData.turnout, "%"]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-emerald-700 font-semibold block mt-1",
									children: [
										electionData.totalVoted,
										" dari ",
										electionData.totalEligible,
										" Rumah Telah Memilih"
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-ink-muted",
									children: "Metode Pemungutan Suara"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xl font-bold text-primary-700 mt-1",
									children: "1 Rumah = 1 Suara"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-ink-muted block mt-1",
									children: "Verifikasi NIK & Nomor Rumah"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-ink-muted",
									children: "Status Periode Pemilu"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-base font-bold text-emerald-600 mt-1",
									children: "Berakhir 31 Agustus 2026"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-ink-muted block mt-1",
									children: "Penutupan pukul 23:59 WIB"
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-6",
					children: electionData.candidates.map((c) => /* @__PURE__ */ jsxs("div", {
						className: `p-6 rounded-3xl border shadow-card space-y-4 ${c.bgColor}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "px-3 py-1 bg-surface font-extrabold text-sm text-ink rounded-xl border border-border",
									children: ["KANDIDAT #", c.number]
								}), /* @__PURE__ */ jsxs("div", {
									className: "text-right",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-2xl font-extrabold text-ink tabular-nums",
										children: [c.percentage, "%"]
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-xs text-ink-muted block font-medium",
										children: [c.votes, " Suara"]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "font-bold text-lg text-ink",
									children: c.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-xs text-ink-muted leading-relaxed font-medium italic",
									children: [
										"\"",
										c.tagline,
										"\""
									]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "bg-surface rounded-full h-3 overflow-hidden border border-border/80 p-0.5",
								children: /* @__PURE__ */ jsx("div", {
									className: `h-full rounded-full ${c.color}`,
									style: { width: `${c.percentage}%` }
								})
							})
						]
					}, c.number))
				})]
			}),
			activeTab === "polls" && /* @__PURE__ */ jsx("div", {
				className: "space-y-6",
				children: pollsData.map((p) => /* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-3xl border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 mb-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold",
								children: p.category
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xs text-ink-muted font-medium",
								children: ["Estimasi Pagu: ", formatRupiah(p.budget)]
							})]
						}), /* @__PURE__ */ jsx("h3", {
							className: "font-bold text-base text-ink",
							children: p.title
						})] }), /* @__PURE__ */ jsxs("span", {
							className: "text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0",
							children: [p.totalVotes, " Rumah Telah Memberikan Suara"]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "space-y-3",
						children: p.options.map((opt) => /* @__PURE__ */ jsxs("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between text-xs font-semibold",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-ink",
									children: opt.label
								}), /* @__PURE__ */ jsxs("span", {
									className: "tabular-nums text-ink",
									children: [
										opt.percentage,
										"% (",
										opt.count,
										" Suara)"
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "bg-canvas rounded-full h-2.5 overflow-hidden border border-border/60",
								children: /* @__PURE__ */ jsx("div", {
									className: `h-full rounded-full ${opt.color}`,
									style: { width: `${opt.percentage}%` }
								})
							})]
						}, opt.label))
					})]
				}, p.id))
			})
		]
	});
};
//#endregion
//#region src/pages/admin/voting.astro
var voting_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Voting,
	file: () => $$file,
	url: () => $$url
});
var $$Voting = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "E-Voting & Musyawarah Warga - WargaHub",
		"currentPath": "/admin/voting"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "VotingManager", VotingManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/VotingManager.tsx",
		"client:component-export": "VotingManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/voting.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/voting.astro";
var $$url = "/admin/voting";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/voting@_@astro
var page = () => voting_exports;
//#endregion
export { page };
