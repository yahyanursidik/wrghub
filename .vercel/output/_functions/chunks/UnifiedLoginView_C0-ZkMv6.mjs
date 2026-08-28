import { a as Building2, i as House, n as Sparkles, o as createLucideIcon, r as ShieldCheck, t as User } from "./global_DI05LtBp.mjs";
import { t as ArrowRight } from "./arrow-right_mlyUmvNp.mjs";
import { t as ChartColumn } from "./chart-column_D5HVfMS4.mjs";
import { t as CircleAlert } from "./circle-alert_DLi1bgsv.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as Eye } from "./eye_BwnvIS94.mjs";
import { n as PORTAL_ACCOUNTS } from "./auth_lweSP3HF.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var EyeOff = createLucideIcon("EyeOff", [
	["path", {
		d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
		key: "ct8e1f"
	}],
	["path", {
		d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
		key: "151rxh"
	}],
	["path", {
		d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
		key: "13bj9a"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Lock = createLucideIcon("Lock", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 10 0v4",
	key: "fwvmzm"
}]]);
//#endregion
//#region src/components/auth/UnifiedLoginView.tsx
var UnifiedLoginView = ({ initialPortal = "resident" }) => {
	const [activePortal, setActivePortal] = useState(initialPortal);
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [successMsg, setSuccessMsg] = useState("");
	const handleLogin = async (e) => {
		e.preventDefault();
		if (!identifier || !password) {
			setErrorMsg("Harap isi username/no. rumah dan password.");
			return;
		}
		setLoading(true);
		setErrorMsg("");
		setSuccessMsg("");
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					identifier,
					password,
					portal: activePortal
				})
			});
			const data = await res.json();
			if (!res.ok || data.error) {
				setErrorMsg(data.error?.message || "Login gagal. Periksa kembali data Anda.");
				setLoading(false);
				return;
			}
			setSuccessMsg(data.data?.message || "Berhasil masuk!");
			setTimeout(() => {
				window.location.href = data.data?.redirectUrl || (activePortal === "admin" ? "/admin" : "/");
			}, 500);
		} catch (err) {
			setErrorMsg("Gagal terhubung ke server autentikasi.");
			setLoading(false);
		}
	};
	const handleQuickLogin = async (acc) => {
		setIdentifier(acc.username);
		setPassword(acc.defaultPassword);
		setActivePortal(acc.targetPortal);
		setLoading(true);
		setErrorMsg("");
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					identifier: acc.username,
					password: acc.defaultPassword,
					portal: acc.targetPortal
				})
			});
			const data = await res.json();
			if (res.ok && data.data?.redirectUrl) window.location.href = data.data.redirectUrl;
			else {
				setErrorMsg(data.error?.message || "Gagal masuk.");
				setLoading(false);
			}
		} catch (e) {
			setErrorMsg("Koneksi gagal.");
			setLoading(false);
		}
	};
	const accountsList = Object.values(PORTAL_ACCOUNTS);
	const residentAccounts = accountsList.filter((a) => a.targetPortal === "resident");
	const adminAccounts = accountsList.filter((a) => a.targetPortal === "admin");
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "sm:mx-auto sm:w-full sm:max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-surface shadow-md mb-4",
					children: /* @__PURE__ */ jsx(Building2, { className: "w-8 h-8" })
				}),
				/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-ink",
					children: ["Warga", /* @__PURE__ */ jsx("span", {
						className: "text-primary-600",
						children: "Hub"
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-ink-muted",
					children: "Sistem Tata Kelola & Transparansi Komplek Taman Sejahtera"
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-6 sm:mx-auto sm:w-full sm:max-w-xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 p-1.5 bg-surface border border-border rounded-2xl shadow-xs mb-6",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setActivePortal("resident");
						setErrorMsg("");
						setIdentifier("warga_a17");
						setPassword("warga123");
					},
					className: `flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${activePortal === "resident" ? "bg-primary-600 text-surface shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
					children: [/* @__PURE__ */ jsx(House, { className: "w-4 h-4" }), "Portal Warga"]
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setActivePortal("admin");
						setErrorMsg("");
						setIdentifier("ketua");
						setPassword("admin123");
					},
					className: `flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${activePortal === "admin" ? "bg-primary-600 text-surface shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" }), "Portal Pengurus & Admin"]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "bg-surface py-8 px-6 sm:px-10 border border-border rounded-3xl shadow-card space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "border-b border-border pb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md",
								children: activePortal === "resident" ? "Akses Warga Mandiri" : "Akses Backoffice Pengurus"
							}), /* @__PURE__ */ jsx("h2", {
								className: "text-xl font-bold text-ink mt-1.5",
								children: activePortal === "resident" ? "Masuk ke Portal Warga" : "Masuk Dashboard Pengurus"
							})] }), /* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-xl bg-canvas flex items-center justify-center text-primary-700",
								children: activePortal === "resident" ? /* @__PURE__ */ jsx(House, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5" })
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-ink-muted mt-1",
							children: activePortal === "resident" ? "Gunakan nomor rumah (misal: A-17) atau username warga Anda." : "Khusus Ketua Komplek, Bendahara, Sekretaris, dan Petugas."
						})]
					}),
					errorMsg && /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in",
						children: [/* @__PURE__ */ jsx(CircleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }), /* @__PURE__ */ jsx("span", { children: errorMsg })]
					}),
					successMsg && /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2.5 animate-in fade-in",
						children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: successMsg })]
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: handleLogin,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-bold text-ink mb-1.5",
								children: activePortal === "resident" ? "Nomor Rumah / Username" : "Username / Email Pengurus"
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx("div", {
									className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted",
									children: /* @__PURE__ */ jsx(User, { className: "w-4 h-4" })
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: activePortal === "resident" ? "Contoh: A-17 atau warga_a17" : "Contoh: ketua atau bendahara",
									value: identifier,
									onChange: (e) => setIdentifier(e.target.value),
									required: true,
									className: "w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-bold text-ink mb-1.5",
								children: "Password / PIN"
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted",
										children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("input", {
										type: showPassword ? "text" : "password",
										placeholder: "Masukkan password atau PIN",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										required: true,
										className: "w-full pl-10 pr-10 py-2.5 bg-canvas border border-border rounded-xl text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setShowPassword(!showPassword),
										className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink",
										children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
									})
								]
							})] }),
							/* @__PURE__ */ jsx("button", {
								type: "submit",
								disabled: loading,
								className: "w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2",
								children: loading ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", { children: "Masuk Sekarang" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })] })
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "pt-4 border-t border-border space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs font-bold text-ink flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-amber-600" }), "Akun Demo Cepat (1-Klik Masuk):"]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-ink-muted",
								children: "Klik untuk langsung masuk"
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
							children: (activePortal === "resident" ? residentAccounts : adminAccounts).map((acc) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => handleQuickLogin(acc),
								className: "p-3 bg-canvas hover:bg-primary-50 border border-border hover:border-primary-300 rounded-xl text-left transition-all flex items-center justify-between group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ jsx("img", {
										src: acc.avatarUrl,
										alt: acc.name,
										className: "w-8 h-8 rounded-lg object-cover ring-1 ring-border"
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-ink group-hover:text-primary-700 leading-tight",
										children: acc.name
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-ink-muted",
										children: acc.roleTitle
									})] })]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-ink-muted group-hover:bg-primary-600 group-hover:text-surface group-hover:border-primary-600 transition-colors",
									children: acc.badge
								})]
							}, acc.id))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-primary-50/60 rounded-xl border border-primary-100 flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 text-xs text-primary-900 font-medium",
							children: [/* @__PURE__ */ jsx(ChartColumn, { className: "w-4 h-4 text-primary-700" }), /* @__PURE__ */ jsx("span", { children: "Ingin melihat Laporan Keuangan Publik?" })]
						}), /* @__PURE__ */ jsxs("a", {
							href: "/transparency",
							className: "text-xs font-bold text-primary-700 hover:text-primary-900 hover:underline flex items-center gap-1",
							children: ["Buka Publik ", /* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3" })]
						})]
					})
				]
			})]
		})]
	});
};
//#endregion
export { UnifiedLoginView as t };
