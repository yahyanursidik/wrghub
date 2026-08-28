import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { d as Car } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { r as UserCheck, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as CircleAlert } from "./circle-alert_DLi1bgsv.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as QrCode } from "./qr-code_CWniIOgo.mjs";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/SecurityGateManager.tsx
var SecurityGateManager = () => {
	const [activeTab, setActiveTab] = useState("scan");
	const [qrInput, setQrInput] = useState("");
	const [scanResult, setScanResult] = useState(null);
	const [searchingPlate, setSearchingPlate] = useState("");
	const [plateResult, setPlateResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [visName, setVisName] = useState("");
	const [visPlate, setVisPlate] = useState("");
	const [visHouse, setVisHouse] = useState("A-17");
	const [visPurpose, setVisPurpose] = useState("Kunjungan Keluarga");
	const [visitors, setVisitors] = useState([
		{
			id: "vis-1",
			visitorName: "Agus Pratama (Kurir Paket)",
			vehiclePlate: "B 4432 ZZZ",
			destinationHouse: "Rumah A-17",
			purpose: "Pengantaran Paket Logistik",
			entryTime: "28 Agu 2026, 14:15 WIB",
			status: "EXITED"
		},
		{
			id: "vis-2",
			visitorName: "Keluarga Bapak Rahmat (Tamu)",
			vehiclePlate: "B 8899 KLL",
			destinationHouse: "Rumah B-07",
			purpose: "Kunjungan Silaturahmi",
			entryTime: "28 Agu 2026, 16:30 WIB",
			status: "INSIDE"
		},
		{
			id: "vis-3",
			visitorName: "Teknisi Internet & Fiber Optic",
			vehiclePlate: "B 1102 NOP",
			destinationHouse: "Rumah C-12",
			purpose: "Perbaikan Jaringan Wifi Warga",
			entryTime: "28 Agu 2026, 17:05 WIB",
			status: "INSIDE"
		}
	]);
	const handleScanVerify = async (e) => {
		e.preventDefault();
		if (!qrInput) return;
		setLoading(true);
		try {
			const json = await (await fetch("/api/security/verify-pass", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ qrPayload: qrInput })
			})).json();
			setScanResult(json.data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	const handlePlateSearch = (e) => {
		e.preventDefault();
		if (!searchingPlate) return;
		const plate = searchingPlate.toUpperCase().trim();
		if (plate.includes("1234") || plate.includes("ABC")) setPlateResult({
			found: true,
			plateNumber: plate,
			vehicle: "Toyota Avanza (Hitam Metalik)",
			owner: "Budi Santoso",
			house: "Rumah A-17 (Blok A)",
			status: "WARGA RESMI (IPL LUNAS)"
		});
		else if (plate.includes("5678") || plate.includes("DEF")) setPlateResult({
			found: true,
			plateNumber: plate,
			vehicle: "Honda Vario 160 (Putih Mutiara)",
			owner: "Budi Santoso",
			house: "Rumah A-17 (Blok A)",
			status: "WARGA RESMI (IPL LUNAS)"
		});
		else setPlateResult({
			found: false,
			plateNumber: plate,
			message: "Kendaraan tidak terdaftar dalam database warga komplek (Kategori: Kendaraan Tamu / Non-Warga)."
		});
	};
	const handleAddVisitor = (e) => {
		e.preventDefault();
		if (!visName || !visPlate) return;
		const newEntry = {
			id: `vis-${Date.now()}`,
			visitorName: visName,
			vehiclePlate: visPlate.toUpperCase(),
			destinationHouse: `Rumah ${visHouse}`,
			purpose: visPurpose,
			entryTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit"
			}) + " WIB",
			status: "INSIDE"
		};
		setVisitors([newEntry, ...visitors]);
		setVisName("");
		setVisPlate("");
	};
	const handleToggleExit = (id) => {
		setVisitors(visitors.map((v) => v.id === id ? {
			...v,
			status: "EXITED"
		} : v));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl font-bold tracking-tight text-ink flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6 text-primary-600" }), "Pos Satpam & Kontrol Gerbang Utama"]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-ink-muted mt-1",
					children: "Pemindaian QR code kuitansi/visitor pass, identifikasi plat kendaraan warga, dan buku tamu otomatis."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold",
					children: [/* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" }), "Gerbang Utama Pos 1: AKTIF (24 JAM)"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-b border-border pb-2",
				children: [
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("scan"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === "scan" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
						children: [/* @__PURE__ */ jsx(QrCode, { className: "w-4 h-4" }), "Verifikasi QR Pass & Kuitansi"]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("lookup"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === "lookup" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
						children: [/* @__PURE__ */ jsx(Car, { className: "w-4 h-4" }), "Cek Plat Kendaraan Warga"]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("log"),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === "log" ? "bg-primary-50 text-primary-700 border border-primary-200" : "text-ink-muted hover:text-ink"}`,
						children: [
							/* @__PURE__ */ jsx(UserCheck, { className: "w-4 h-4" }),
							"Buku Tamu Digital (",
							visitors.filter((v) => v.status === "INSIDE").length,
							" di dalam)"
						]
					})
				]
			}),
			activeTab === "scan" && /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4",
					children: [
						/* @__PURE__ */ jsxs("h3", {
							className: "font-bold text-sm text-ink flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(QrCode, { className: "w-4 h-4 text-primary-600" }), "Input / Scan QR Code"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-ink-muted leading-relaxed",
							children: [
								"Arahkan scanner ke QR Code pada Kuitansi Pembayaran Warga atau ketikkan kode referensi transaksi (contoh: ",
								/* @__PURE__ */ jsx("code", { children: "INV-202608-A17" }),
								" atau ",
								/* @__PURE__ */ jsx("code", { children: "GUEST-B07" }),
								")."
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleScanVerify,
							className: "space-y-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Ketik / Scan QR Code...",
									value: qrInput,
									onChange: (e) => setQrInput(e.target.value),
									className: "flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono text-xs font-bold text-ink"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: loading,
									className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs",
									children: loading ? "Memverifikasi..." : "Verifikasi"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2 pt-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => {
										setQrInput("INV-202608-A17");
									},
									className: "px-2.5 py-1 bg-canvas hover:bg-primary-50 text-[11px] font-semibold text-primary-700 rounded-lg border border-border",
									children: "Tes: Kuitansi Rumah A-17"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => {
										setQrInput("GUEST-B07-202608");
									},
									className: "px-2.5 py-1 bg-canvas hover:bg-primary-50 text-[11px] font-semibold text-primary-700 rounded-lg border border-border",
									children: "Tes: Visitor Pass Tamu B-07"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "p-6 bg-surface rounded-2xl border border-border shadow-card flex flex-col justify-center",
					children: scanResult ? /* @__PURE__ */ jsxs("div", {
						className: "space-y-4 animate-in fade-in",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl",
								children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-8 h-8 text-emerald-600 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-bold text-emerald-800 uppercase tracking-wide",
									children: scanResult.type
								}), /* @__PURE__ */ jsx("h4", {
									className: "text-base font-bold text-emerald-950",
									children: scanResult.title
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 bg-canvas rounded-xl space-y-2 text-xs",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Unit Rumah:"
										}), /* @__PURE__ */ jsxs("strong", {
											className: "text-ink font-bold",
											children: ["Rumah ", scanResult.propertyCode]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Nama Warga / Tamu:"
										}), /* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: scanResult.residentName
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Keterangan:"
										}), /* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: scanResult.periodName
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ink-muted",
											children: "Status Akses:"
										}), /* @__PURE__ */ jsx("span", {
											className: "px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded",
											children: scanResult.status
										})]
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "p-3 bg-primary-50 border border-primary-200 rounded-xl text-center",
								children: /* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold text-primary-900",
									children: "AKSES DIBERIKAN — PORTAL GERBANG DIBUKA"
								})
							})
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "text-center py-8 space-y-2",
						children: [
							/* @__PURE__ */ jsx(QrCode, { className: "w-10 h-10 text-ink-muted mx-auto" }),
							/* @__PURE__ */ jsx("p", {
								className: "font-bold text-xs text-ink",
								children: "Menunggu Pemindaian QR Code"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-ink-muted",
								children: "Hasil verifikasi keabsahan kuitansi atau pass tamu akan muncul di sini."
							})
						]
					})
				})]
			}),
			activeTab === "lookup" && /* @__PURE__ */ jsxs("div", {
				className: "p-6 bg-surface rounded-2xl border border-border shadow-card space-y-5",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-bold text-sm text-ink flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Car, { className: "w-4 h-4 text-primary-600" }), "Pencarian Cepat Plat Nomor Kendaraan"]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-ink-muted mt-1",
						children: "Ketikkan plat nomor kendaraan untuk memeriksa apakah kendaraan tersebut milik warga komplek terdaftar."
					})] }),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: handlePlateSearch,
						className: "flex gap-2 max-w-md",
						children: [/* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Contoh: B 1234 ABC",
							value: searchingPlate,
							onChange: (e) => setSearchingPlate(e.target.value),
							className: "flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono text-sm font-bold text-ink uppercase"
						}), /* @__PURE__ */ jsx("button", {
							type: "submit",
							className: "px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs",
							children: "Cari Plat"
						})]
					}),
					plateResult && /* @__PURE__ */ jsx("div", {
						className: `p-4 rounded-2xl border ${plateResult.found ? "bg-emerald-50/50 border-emerald-200" : "bg-amber-50 border-amber-200"} space-y-3 text-xs`,
						children: plateResult.found ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-mono text-base font-bold text-emerald-900",
									children: plateResult.plateNumber
								}), /* @__PURE__ */ jsx("span", {
									className: "px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md",
									children: plateResult.status
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted block text-[11px]",
										children: "Jenis Kendaraan"
									}), /* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: plateResult.vehicle
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted block text-[11px]",
										children: "Nama Pemilik"
									}), /* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: plateResult.owner
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted block text-[11px]",
										children: "Unit Hunian"
									}), /* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: plateResult.house
									})] })
								]
							})]
						}) : /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 text-amber-800",
							children: [/* @__PURE__ */ jsx(CircleAlert, { className: "w-5 h-5 shrink-0" }), /* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: plateResult.message
							})]
						})
					})
				]
			}),
			activeTab === "log" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ jsxs("form", {
					onSubmit: handleAddVisitor,
					className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 text-xs",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "font-bold text-sm text-ink",
						children: "Catat Tamu Masuk Baru"
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Nama Tamu / Kurir"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Bpk. Dani (Tamu)",
								value: visName,
								onChange: (e) => setVisName(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Plat Nomor"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "B 1234 XYZ",
								value: visPlate,
								onChange: (e) => setVisPlate(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Rumah Tujuan"
							}), /* @__PURE__ */ jsxs("select", {
								value: visHouse,
								onChange: (e) => setVisHouse(e.target.value),
								className: "w-full p-2.5 bg-surface border border-border rounded-xl font-semibold text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "A-17",
										children: "Rumah A-17 (Budi Santoso)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "B-07",
										children: "Rumah B-07 (Hendra Wijaya)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "C-12",
										children: "Rumah C-12 (Siti Rahma)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "D-05",
										children: "Rumah D-05 (Ahmad Fauzi)"
									})
								]
							})] }),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold rounded-xl shadow-xs",
									children: "+ Catat Masuk Gerbang"
								})
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "p-4 border-b border-border bg-canvas/40 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h4", {
							className: "font-bold text-ink",
							children: "Buku Tamu & Log Lalu Lintas Gerbang"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] text-ink-muted",
							children: "Otomatis sinkron dengan server"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left",
							children: [/* @__PURE__ */ jsx("thead", {
								className: "bg-canvas border-b border-border text-ink-muted font-semibold",
								children: /* @__PURE__ */ jsxs("tr", { children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Nama Tamu"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Plat Nomor"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Tujuan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Waktu Masuk"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4",
										children: "Status"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3 px-4 text-right",
										children: "Aksi"
									})
								] })
							}), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: visitors.map((v) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-canvas/50",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 font-bold text-ink",
											children: v.visitorName
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 font-mono font-semibold text-primary-700",
											children: v.vehiclePlate
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4",
											children: v.destinationHouse
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 text-ink-muted",
											children: v.entryTime
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4",
											children: v.status === "INSIDE" ? /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200",
												children: "Di Dalam Komplek"
											}) : /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-[10px] font-medium border border-border",
												children: "Sudah Keluar"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3 px-4 text-right",
											children: v.status === "INSIDE" && /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => handleToggleExit(v.id),
												className: "px-2.5 py-1 bg-canvas hover:bg-border text-ink text-[11px] font-semibold rounded-lg border border-border",
												children: "Tandai Keluar"
											})
										})
									]
								}, v.id))
							})]
						})
					})]
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/admin/security-gate.astro
var security_gate_exports = /* @__PURE__ */ __exportAll({
	default: () => $$SecurityGate,
	file: () => $$file,
	url: () => $$url
});
var $$SecurityGate = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pos Satpam & Kontrol Gerbang - WargaHub",
		"currentPath": "/admin/security-gate"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "SecurityGateManager", SecurityGateManager, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/SecurityGateManager.tsx",
		"client:component-export": "SecurityGateManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/security-gate.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/security-gate.astro";
var $$url = "/admin/security-gate";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/security-gate@_@astro
var page = () => security_gate_exports;
//#endregion
export { page };
