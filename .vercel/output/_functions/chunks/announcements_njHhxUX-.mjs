import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { t as $$AdminLayout, u as Calendar } from "./AdminLayout_CzR5wuim.mjs";
import { t as CirclePlus } from "./circle-plus_D9s3wy0y.mjs";
import { n as getAnnouncements } from "./announcement.service_BsCLrcAc.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MapPin = createLucideIcon("MapPin", [["path", {
	d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
	key: "1r0f0z"
}], ["circle", {
	cx: "12",
	cy: "10",
	r: "3",
	key: "ilqhr7"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pin = createLucideIcon("Pin", [["path", {
	d: "M12 17v5",
	key: "bb1du9"
}], ["path", {
	d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
	key: "1nkz8b"
}]]);
//#endregion
//#region src/components/admin/AnnouncementsManager.tsx
var AnnouncementsManager = ({ initialAnnouncements }) => {
	const [announcements, setAnnouncements] = useState(initialAnnouncements);
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [category, setCategory] = useState("KEGIATAN");
	const [schedule, setSchedule] = useState("");
	const [location, setLocation] = useState("");
	const handleCreate = async (e) => {
		e.preventDefault();
		if (!title || !content) return;
		try {
			await fetch("/api/announcements/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					content,
					category,
					scheduledAt: schedule || void 0,
					location: location || void 0
				})
			});
			const newAnn = {
				id: `ann-${Date.now()}`,
				title,
				content,
				category,
				scheduledAt: schedule || null,
				location: location || null,
				isPinned: false,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			setAnnouncements([newAnn, ...announcements]);
			setTitle("");
			setContent("");
			setSchedule("");
			setLocation("");
			setShowModal(false);
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
					children: "Pengumuman & Agenda Warga"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Publikasikan informasi penting dan agenda kegiatan warga komplek."
				})] }), /* @__PURE__ */ jsxs("button", {
					onClick: () => setShowModal(true),
					className: "inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-sm font-semibold rounded-xl shadow-xs transition-colors",
					children: [/* @__PURE__ */ jsx(CirclePlus, { className: "w-4 h-4" }), "Buat Pengumuman Baru"]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "space-y-4",
				children: announcements.map((ann) => /* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "px-2.5 py-0.5 bg-primary-100 text-primary-800 text-[11px] font-bold rounded-md",
									children: ann.category
								}), ann.isPinned && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200",
									children: [/* @__PURE__ */ jsx(Pin, { className: "w-3 h-3" }), " Disematkan"]
								})]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-ink-muted",
								children: ann.createdAt?.substring(0, 10)
							})]
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-ink",
							children: ann.title
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-ink-muted leading-relaxed",
							children: ann.content
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap gap-4 font-semibold text-primary-700",
								children: [ann.scheduledAt && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }), ann.scheduledAt]
								}), ann.location && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }), ann.location]
								})]
							}), /* @__PURE__ */ jsx("a", {
								href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`📢 *PENGUMUMAN KOMPLEK TAMAN SEJAHTERA*\n\n*${ann.title}*\n\n${ann.content}\n\n${ann.scheduledAt ? "🗓️ Waktu: " + ann.scheduledAt + "\n" : ""}${ann.location ? "📍 Lokasi: " + ann.location + "\n" : ""}\n- Pengurus Komplek Taman Sejahtera`)}`,
								target: "_blank",
								rel: "noreferrer",
								className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors",
								children: /* @__PURE__ */ jsx("span", { children: "Broadcast ke WhatsApp" })
							})]
						})
					]
				}, ann.id))
			}),
			showModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-base text-ink",
							children: "Buat Pengumuman Baru"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleCreate,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Kategori"
							}), /* @__PURE__ */ jsxs("select", {
								value: category,
								onChange: (e) => setCategory(e.target.value),
								className: "w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "KEGIATAN",
										children: "Kegiatan & Kerja Bakti"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "MAINTENANCE",
										children: "Perbaikan & Maintenance"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "INFO",
										children: "Informasi Umum"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "DARURAT",
										children: "Darurat / Penting"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Judul Pengumuman"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Rapat Warga Bulanan",
								value: title,
								onChange: (e) => setTitle(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Isi Pesan Pengumuman"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 4,
								placeholder: "Tuliskan detail pengumuman yang jelas untuk warga...",
								value: content,
								onChange: (e) => setContent(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Jadwal / Waktu (Opsional)"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Contoh: Minggu, 30 Agu • 08:00 WIB",
									value: schedule,
									onChange: (e) => setSchedule(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Lokasi (Opsional)"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Contoh: Balai Warga",
									value: location,
									onChange: (e) => setLocation(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-3 border-t border-border flex justify-end gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowModal(false),
									className: "px-4 py-2 border border-border text-ink font-semibold rounded-xl",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface font-semibold rounded-xl shadow-xs",
									children: "Publikasikan"
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
//#region src/pages/admin/announcements.astro
var announcements_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Announcements,
	file: () => $$file,
	url: () => $$url
});
var $$Announcements = createComponent(async ($$result, $$props, $$slots) => {
	const announcements = await getAnnouncements();
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pengumuman & Agenda - WargaHub",
		"currentPath": "/admin/announcements"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AnnouncementsManager", AnnouncementsManager, {
		"initialAnnouncements": announcements,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/AnnouncementsManager.tsx",
		"client:component-export": "AnnouncementsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/announcements.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/announcements.astro";
var $$url = "/admin/announcements";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/announcements@_@astro
var page = () => announcements_exports;
//#endregion
export { page };
