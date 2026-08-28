import { f as renderHead, i as renderComponent, s as renderSlot, u as renderTemplate, x as createAstro } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Building2, i as House, o as createLucideIcon, r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { c as FileText, d as Car, i as Users, l as ExternalLink, o as Receipt, p as Bell, r as Wallet, s as Megaphone, t as WargaAIChatWidget, u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { t as DEMO_USERS } from "./auth_lweSP3HF.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Calendar = createLucideIcon("Calendar", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronDown = createLucideIcon("ChevronDown", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleUserRound = createLucideIcon("CircleUserRound", [
	["path", {
		d: "M18 20a6 6 0 0 0-12 0",
		key: "1qehca"
	}],
	["circle", {
		cx: "12",
		cy: "10",
		r: "4",
		key: "1h16sb"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Clock = createLucideIcon("Clock", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["polyline", {
	points: "12 6 12 12 16 14",
	key: "68esgv"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CreditCard = createLucideIcon("CreditCard", [["rect", {
	width: "20",
	height: "14",
	x: "2",
	y: "5",
	rx: "2",
	key: "ynyp8z"
}], ["line", {
	x1: "2",
	x2: "22",
	y1: "10",
	y2: "10",
	key: "1b3vmo"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileMinus = createLucideIcon("FileMinus", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M9 15h6",
		key: "cctwl0"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FolderOpen = createLucideIcon("FolderOpen", [["path", {
	d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
	key: "usdka0"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LayoutDashboard = createLucideIcon("LayoutDashboard", [
	["rect", {
		width: "7",
		height: "9",
		x: "3",
		y: "3",
		rx: "1",
		key: "10lvy0"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "14",
		y: "3",
		rx: "1",
		key: "16une8"
	}],
	["rect", {
		width: "7",
		height: "9",
		x: "14",
		y: "12",
		rx: "1",
		key: "1hutg5"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "3",
		y: "16",
		rx: "1",
		key: "ldoo1y"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MessageCircle = createLucideIcon("MessageCircle", [["path", {
	d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
	key: "vv11sd"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Search = createLucideIcon("Search", [["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}], ["path", {
	d: "m21 21-4.3-4.3",
	key: "1qie3q"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Settings = createLucideIcon("Settings", [["path", {
	d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
	key: "1qme2f"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Smartphone = createLucideIcon("Smartphone", [["rect", {
	width: "14",
	height: "20",
	x: "5",
	y: "2",
	rx: "2",
	ry: "2",
	key: "1yt0o3"
}], ["path", {
	d: "M12 18h.01",
	key: "mhygvu"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sprout = createLucideIcon("Sprout", [
	["path", {
		d: "M7 20h10",
		key: "e6iznv"
	}],
	["path", {
		d: "M10 20c5.5-2.5.8-6.4 3-10",
		key: "161w41"
	}],
	["path", {
		d: "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",
		key: "9gtqwd"
	}],
	["path", {
		d: "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",
		key: "bkxnd2"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var UserCheck = createLucideIcon("UserCheck", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}],
	["polyline", {
		points: "16 11 18 13 22 9",
		key: "1pwet4"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Wrench = createLucideIcon("Wrench", [["path", {
	d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
	key: "cbrjhi"
}]]);
//#endregion
//#region src/components/layout/AdminSidebar.tsx
var AdminSidebar = ({ currentPath = "/admin" }) => {
	const isPathActive = (path) => {
		if (path === "/admin" && (currentPath === "/admin" || currentPath === "/admin/")) return true;
		if (path !== "/admin" && currentPath.startsWith(path)) return true;
		return false;
	};
	const navGroups = [
		{
			label: "WARGA",
			items: [
				{
					name: "Rumah",
					href: "/admin/properties",
					icon: House
				},
				{
					name: "Penghuni",
					href: "/admin/properties?tab=occupants",
					icon: Users
				},
				{
					name: "Pemilik",
					href: "/admin/properties?tab=owners",
					icon: UserCheck
				},
				{
					name: "Kendaraan",
					href: "/admin/properties?tab=vehicles",
					icon: Car
				}
			]
		},
		{
			label: "KEUANGAN",
			items: [
				{
					name: "Iuran",
					href: "/admin/billing",
					icon: Receipt
				},
				{
					name: "Pembayaran",
					href: "/admin/payments",
					icon: CreditCard,
					badge: 3
				},
				{
					name: "Pengeluaran",
					href: "/admin/expenses",
					icon: FileMinus
				},
				{
					name: "Kas",
					href: "/admin/ledger",
					icon: Wallet
				},
				{
					name: "Anggaran",
					href: "/admin/budget",
					icon: Clock
				},
				{
					name: "Analitik & Tren",
					href: "/admin/analytics",
					icon: Clock
				},
				{
					name: "Laporan",
					href: "/transparency",
					icon: FileText
				}
			]
		},
		{
			label: "OPERASIONAL",
			items: [
				{
					name: "Pos Satpam",
					href: "/admin/security-gate",
					icon: ShieldCheck
				},
				{
					name: "Aduan",
					href: "/admin/complaints",
					icon: MessageCircle,
					badge: 4
				},
				{
					name: "Sarana",
					href: "/admin/facilities",
					icon: Building2
				},
				{
					name: "Maintenance",
					href: "/admin/facilities?tab=maintenance",
					icon: Wrench,
					badge: 2
				},
				{
					name: "Petugas",
					href: "/admin/facilities?tab=staff",
					icon: ShieldCheck
				}
			]
		},
		{
			label: "KOMUNIKASI",
			items: [
				{
					name: "Pengumuman",
					href: "/admin/announcements",
					icon: Megaphone
				},
				{
					name: "E-Voting & Polling",
					href: "/admin/voting",
					icon: Calendar
				},
				{
					name: "Bot WhatsApp",
					href: "/admin/whatsapp-bot",
					icon: MessageCircle
				},
				{
					name: "Agenda",
					href: "/admin/announcements?tab=agenda",
					icon: Calendar
				},
				{
					name: "Notifikasi",
					href: "/admin/notifications",
					icon: Bell
				}
			]
		}
	];
	return /* @__PURE__ */ jsxs("aside", {
		className: "w-64 bg-surface border-r border-border min-h-screen flex flex-col shrink-0 select-none",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "h-16 px-6 flex items-center gap-3 border-b border-border",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-500 shadow-sm",
					children: /* @__PURE__ */ jsx(Sprout, { className: "w-5 h-5 text-primary-600" })
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-col",
					children: /* @__PURE__ */ jsxs("span", {
						className: "font-bold text-xl tracking-tight text-ink flex items-center gap-1",
						children: ["Warga", /* @__PURE__ */ jsx("span", {
							className: "text-primary-600 font-extrabold",
							children: "Hub"
						})]
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 overflow-y-auto px-4 py-4 space-y-6",
				children: [
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("a", {
						href: "/admin",
						className: `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isPathActive("/admin") ? "bg-primary-50 text-primary-700 font-semibold shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [/* @__PURE__ */ jsx(LayoutDashboard, { className: `w-4 h-4 ${isPathActive("/admin") ? "text-primary-600" : "text-ink-muted"}` }), /* @__PURE__ */ jsx("span", { children: "Ringkasan" })]
					}) }),
					navGroups.map((group) => /* @__PURE__ */ jsxs("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "px-3 text-[11px] font-semibold text-ink-muted/70 tracking-wider uppercase",
							children: group.label
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-0.5 pt-1",
							children: group.items.map((item) => {
								const Icon = item.icon;
								const active = isPathActive(item.href);
								return /* @__PURE__ */ jsxs("a", {
									href: item.href,
									className: `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary-50 text-primary-700 font-semibold" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${active ? "text-primary-600" : "text-ink-muted"}` }), /* @__PURE__ */ jsx("span", { children: item.name })]
									}), item.badge ? /* @__PURE__ */ jsx("span", {
										className: "px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800",
										children: item.badge
									}) : null]
								}, item.name);
							})
						})]
					}, group.label)),
					/* @__PURE__ */ jsxs("div", {
						className: "pt-2 border-t border-border/60 space-y-0.5",
						children: [
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/documents",
								className: `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isPathActive("/admin/documents") ? "bg-primary-50 text-primary-700 font-semibold" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
								children: [/* @__PURE__ */ jsx(FolderOpen, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsx("span", { children: "Dokumen" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/audit",
								className: `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isPathActive("/admin/audit") ? "bg-primary-50 text-primary-700 font-semibold" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
								children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsx("span", { children: "Jejak Audit" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/backup",
								className: `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isPathActive("/admin/backup") ? "bg-primary-50 text-primary-700 font-semibold" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
								children: [/* @__PURE__ */ jsx(FolderOpen, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsx("span", { children: "Pencadangan & Backup" })]
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin/settings",
								className: `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isPathActive("/admin/settings") ? "bg-primary-50 text-primary-700 font-semibold" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
								children: [/* @__PURE__ */ jsx(Settings, { className: "w-4 h-4 text-ink-muted" }), /* @__PURE__ */ jsx("span", { children: "Pengaturan" })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-3 border-t border-border bg-canvas/40 space-y-1.5",
				children: [/* @__PURE__ */ jsxs("a", {
					href: "/",
					className: "flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50/80 hover:bg-primary-100 rounded-lg transition-colors",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Smartphone, { className: "w-3.5 h-3.5" }), "Portal Warga (Mobile)"]
					}), /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 opacity-60" })]
				}), /* @__PURE__ */ jsxs("a", {
					href: "/transparency",
					className: "flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface rounded-lg transition-colors border border-border",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5 text-primary-600" }), "Transparansi Publik"]
					}), /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 opacity-60" })]
				})]
			})
		]
	});
};
//#endregion
//#region src/components/layout/AdminHeader.tsx
var AdminHeader = ({ currentUser = DEMO_USERS.ketua, searchPlaceholder = "Cari rumah, warga, invoice...", onSearchClick }) => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [activeUser, setActiveUser] = useState(currentUser);
	return /* @__PURE__ */ jsxs("header", {
		className: "h-16 px-8 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-30",
		children: [/* @__PURE__ */ jsx("div", {
			className: "w-96 max-w-md",
			children: /* @__PURE__ */ jsxs("button", {
				onClick: onSearchClick,
				type: "button",
				className: "w-full flex items-center gap-2.5 px-3.5 py-2 bg-canvas/70 hover:bg-canvas border border-border rounded-xl text-sm text-ink-muted transition-colors text-left group",
				children: [
					/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted group-hover:text-primary-600 transition-colors" }),
					/* @__PURE__ */ jsx("span", {
						className: "flex-1 truncate",
						children: searchPlaceholder
					}),
					/* @__PURE__ */ jsx("kbd", {
						className: "hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted bg-surface border border-border rounded",
						children: "⌘K"
					})
				]
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-4",
			children: [
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "relative p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors",
					title: "Notifikasi",
					children: [/* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-green ring-2 ring-surface" })]
				}),
				/* @__PURE__ */ jsx("div", { className: "h-6 w-px bg-border" }),
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setDropdownOpen(!dropdownOpen),
						className: "flex items-center gap-3 p-1.5 pl-2 hover:bg-canvas rounded-xl transition-colors",
						children: [
							/* @__PURE__ */ jsx("img", {
								src: activeUser.avatarUrl,
								alt: activeUser.fullName,
								className: "w-9 h-9 rounded-full object-cover border border-border shadow-xs"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "text-left hidden sm:block",
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-sm font-semibold text-ink leading-tight flex items-center gap-1",
									children: activeUser.fullName
								}), /* @__PURE__ */ jsx("div", {
									className: "text-xs text-ink-muted",
									children: activeUser.role === "CHAIRMAN" ? "Ketua Komplek" : activeUser.role === "TREASURER" ? "Bendahara" : "Penghuni A-17"
								})]
							}),
							/* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-ink-muted ml-1" })
						]
					}), dropdownOpen && /* @__PURE__ */ jsxs("div", {
						className: "absolute right-0 mt-2 w-64 bg-surface rounded-2xl shadow-modal border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "px-4 py-2 border-b border-border",
								children: /* @__PURE__ */ jsx("p", {
									className: "text-xs font-semibold text-ink-muted uppercase tracking-wider",
									children: "Ganti Peran (Demo Switcher)"
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "py-1",
								children: Object.entries(DEMO_USERS).map(([key, user]) => {
									const isSelected = activeUser.username === user.username;
									return /* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveUser(user);
											setDropdownOpen(false);
										},
										className: `w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${isSelected ? "bg-primary-50 text-primary-700 font-medium" : "text-ink hover:bg-canvas"}`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsx("img", {
												src: user.avatarUrl,
												alt: user.fullName,
												className: "w-7 h-7 rounded-full object-cover"
											}), /* @__PURE__ */ jsxs("div", {
												className: "text-left",
												children: [/* @__PURE__ */ jsx("p", {
													className: "font-semibold text-xs text-ink",
													children: user.fullName
												}), /* @__PURE__ */ jsx("p", {
													className: "text-[11px] text-ink-muted",
													children: user.role === "CHAIRMAN" ? "Ketua Komplek" : user.role === "TREASURER" ? "Bendahara" : `Warga (${user.propertyCode})`
												})]
											})]
										}), isSelected && /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary-600" })]
									}, key);
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "border-t border-border mt-1 pt-1 space-y-0.5",
								children: [/* @__PURE__ */ jsxs("a", {
									href: "/",
									className: "flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors",
									children: [/* @__PURE__ */ jsx(CircleUserRound, { className: "w-4 h-4" }), "Buka Tampilan Portal Warga"]
								}), /* @__PURE__ */ jsxs("a", {
									href: "/login",
									onClick: async (e) => {
										e.preventDefault();
										await fetch("/api/auth/logout", { method: "POST" });
										window.location.href = "/login";
									},
									className: "flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors",
									children: [/* @__PURE__ */ jsx("span", {
										className: "w-4 h-4 flex items-center justify-center font-bold",
										children: "↳"
									}), "Keluar (Logout Akun)"]
								})]
							})
						]
					})]
				})
			]
		})]
	});
};
//#endregion
//#region src/layouts/AdminLayout.astro
createAstro("https://astro.build");
var $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminLayout;
	const { title = "WargaHub - Tata Kelola Komplek", currentPath = Astro.url.pathname } = Astro.props;
	return renderTemplate`<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#059669"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    <\/script>${renderHead($$result)}</head><body class="bg-canvas text-ink font-sans min-h-screen flex antialiased selection:bg-primary-100 selection:text-primary-900 relative">${renderComponent($$result, "AdminSidebar", AdminSidebar, {
		"currentPath": currentPath,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/layout/AdminSidebar.tsx",
		"client:component-export": "AdminSidebar"
	})}<div class="flex-1 flex flex-col min-w-0">${renderComponent($$result, "AdminHeader", AdminHeader, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/layout/AdminHeader.tsx",
		"client:component-export": "AdminHeader"
	})}<main class="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto pb-20">${renderSlot($$result, $$slots["default"])}</main></div>${renderComponent($$result, "WargaAIChatWidget", WargaAIChatWidget, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/shared/WargaAIChatWidget.tsx",
		"client:component-export": "WargaAIChatWidget"
	})}</body></html>`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/layouts/AdminLayout.astro", void 0);
//#endregion
export { Search as a, Clock as c, Settings as i, ChevronDown as l, Wrench as n, MessageCircle as o, UserCheck as r, CreditCard as s, $$AdminLayout as t, Calendar as u };
