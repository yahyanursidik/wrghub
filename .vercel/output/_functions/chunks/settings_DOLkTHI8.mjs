import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { s as CreditCard, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as PhoneCall } from "./phone-call_CwUKNKFT.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Building = createLucideIcon("Building", [
	["rect", {
		width: "16",
		height: "20",
		x: "4",
		y: "2",
		rx: "2",
		ry: "2",
		key: "76otgf"
	}],
	["path", {
		d: "M9 22v-4h6v4",
		key: "r93iot"
	}],
	["path", {
		d: "M8 6h.01",
		key: "1dz90k"
	}],
	["path", {
		d: "M16 6h.01",
		key: "1x0f13"
	}],
	["path", {
		d: "M12 6h.01",
		key: "1vi96p"
	}],
	["path", {
		d: "M12 10h.01",
		key: "1nrarc"
	}],
	["path", {
		d: "M12 14h.01",
		key: "1etili"
	}],
	["path", {
		d: "M16 10h.01",
		key: "1m94wz"
	}],
	["path", {
		d: "M16 14h.01",
		key: "1gbofw"
	}],
	["path", {
		d: "M8 10h.01",
		key: "19clt8"
	}],
	["path", {
		d: "M8 14h.01",
		key: "6423bh"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Save = createLucideIcon("Save", [
	["path", {
		d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
		key: "1c8476"
	}],
	["path", {
		d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
		key: "1ydtos"
	}],
	["path", {
		d: "M7 3v4a1 1 0 0 0 1 1h7",
		key: "t51u73"
	}]
]);
//#endregion
//#region src/components/admin/SettingsManager.tsx
var SettingsManager = () => {
	const [communityName, setCommunityName] = useState("Komplek Perumahan Taman Sejahtera");
	const [rtRw, setRtRw] = useState("RT 02 / RW 05");
	const [address, setAddress] = useState("Jl. Taman Sejahtera Utama No. 1, Jakarta Selatan");
	const [monthlyFee, setMonthlyFee] = useState("750000");
	const [dueDay, setDueDay] = useState("10");
	const [bankName, setBankName] = useState("BCA (Bank Central Asia)");
	const [bankAccount, setBankAccount] = useState("8830-1928-33");
	const [accountHolder, setAccountHolder] = useState("PENGURUS KOMPLEK TAMAN SEJAHTERA");
	const [securityPhone, setSecurityPhone] = useState("0811-9988-7766");
	const [rwHeadPhone, setRwHeadPhone] = useState("0812-3456-7890");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			if ((await fetch("/api/settings/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					communityName,
					rtRw,
					address,
					monthlyRate: Number(monthlyFee),
					bankName,
					bankAccount,
					accountHolder,
					securityPhone,
					rwHeadPhone
				})
			})).ok) {
				setSaved(true);
				setTimeout(() => setSaved(false), 3e3);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 max-w-3xl",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold tracking-tight text-ink",
			children: "Pengaturan & Profil Komplek"
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-ink-muted mt-1",
			children: "Konfigurasi identitas perumahan, rekening bank resmi iuran, dan kontak darurat satpam 24 jam."
		})] }), /* @__PURE__ */ jsxs("form", {
			onSubmit: handleSave,
			className: "space-y-5 text-xs",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 border-b border-border pb-3",
							children: [/* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-primary-600" }), /* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Identitas & Wilayah Lingkungan"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Nama Komplek / Perumahan"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: communityName,
								onChange: (e) => setCommunityName(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Rukun Tetangga / RW"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: rtRw,
								onChange: (e) => setRtRw(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block mb-1",
							children: "Alamat Lengkap"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							value: address,
							onChange: (e) => setAddress(e.target.value),
							required: true,
							className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
						})] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 border-b border-border pb-3",
							children: [/* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 text-primary-600" }), /* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-ink",
								children: "Tarif Iuran Bulanan & Rekening Penampung"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Nominal Iuran Bulanan (Rp)"
							}), /* @__PURE__ */ jsx("input", {
								type: "number",
								value: monthlyFee,
								onChange: (e) => setMonthlyFee(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Tanggal Jatuh Tempo Bulanan"
							}), /* @__PURE__ */ jsx("input", {
								type: "number",
								min: "1",
								max: "28",
								value: dueDay,
								onChange: (e) => setDueDay(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Nama Bank Resmi"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: bankName,
								onChange: (e) => setBankName(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-bold text-ink block mb-1",
								children: "Nomor Rekening"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: bankAccount,
								onChange: (e) => setBankAccount(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block mb-1",
							children: "Nama Pemilik Rekening (Atas Nama)"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							value: accountHolder,
							onChange: (e) => setAccountHolder(e.target.value),
							required: true,
							className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
						})] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx(PhoneCall, { className: "w-4 h-4 text-primary-600" }), /* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Hotline & Kontak Darurat 24 Jam"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block mb-1",
							children: "Hotline Pos Satpam Utama (24 Jam)"
						}), /* @__PURE__ */ jsx("input", {
							type: "tel",
							value: securityPhone,
							onChange: (e) => setSecurityPhone(e.target.value),
							required: true,
							className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block mb-1",
							children: "Kontak Hotline Ketua Pengurus"
						}), /* @__PURE__ */ jsx("input", {
							type: "tel",
							value: rwHeadPhone,
							onChange: (e) => setRwHeadPhone(e.target.value),
							required: true,
							className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
						})] })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between pt-2",
					children: [saved ? /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200",
						children: [/* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }), " Pengaturan berhasil disimpan ke Neon PostgreSQL!"]
					}) : /* @__PURE__ */ jsx("div", {}), /* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: saving,
						className: "px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), saving ? "Menyimpan..." : "Simpan Pengaturan"]
					})]
				})
			]
		})]
	});
};
//#endregion
//#region src/pages/admin/settings.astro
var settings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Settings,
	file: () => $$file,
	url: () => $$url
});
var $$Settings = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pengaturan Komplek - WargaHub",
		"currentPath": "/admin/settings"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "SettingsManager", SettingsManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/SettingsManager.tsx",
		"client:component-export": "SettingsManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/settings.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/settings.astro";
var $$url = "/admin/settings";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/settings@_@astro
var page = () => settings_exports;
//#endregion
export { page };
