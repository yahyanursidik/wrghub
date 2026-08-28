import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { f as renderHead, i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Building2, i as House, n as Sparkles, o as createLucideIcon, r as ShieldCheck, t as User } from "./global_DI05LtBp.mjs";
import { c as FileText, d as Car, i as Users, l as ExternalLink, n as X, o as Receipt, p as Bell, r as Wallet, s as Megaphone, t as WargaAIChatWidget, u as Check } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { n as Droplets, t as Hammer } from "./hammer_CRunK_DL.mjs";
import { t as Headphones } from "./headphones_Xp5mfevz.mjs";
import { t as Hourglass } from "./hourglass_D_2VXHHX.mjs";
import { t as Info } from "./info_BOF9a9LP.mjs";
import { n as PenLine, t as Trash2 } from "./trash-2_DsHxZaM2.mjs";
import { t as PhoneCall } from "./phone-call_CwUKNKFT.mjs";
import { t as Plus } from "./plus_BFr6lPwe.mjs";
import { t as Printer } from "./printer_DTnpkCgr.mjs";
import { t as QrCode } from "./qr-code_CWniIOgo.mjs";
import { t as Upload } from "./upload_C-tYLZmu.mjs";
import { t as Vote } from "./vote_IhLHoAzn.mjs";
import { t as Zap } from "./zap_RtHdtdXj.mjs";
import { t as DEMO_USERS } from "./auth_lweSP3HF.mjs";
import { t as ReceiptModal } from "./ReceiptModal_W_huGHJK.mjs";
import "./auth.service_CycQzLZv.mjs";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("ArrowLeft", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BadgeCheck = createLucideIcon("BadgeCheck", [["path", {
	d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
	key: "3c2336"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bike = createLucideIcon("Bike", [
	["circle", {
		cx: "18.5",
		cy: "17.5",
		r: "3.5",
		key: "15x4ox"
	}],
	["circle", {
		cx: "5.5",
		cy: "17.5",
		r: "3.5",
		key: "1noe27"
	}],
	["circle", {
		cx: "15",
		cy: "5",
		r: "1",
		key: "19l28e"
	}],
	["path", {
		d: "M12 17.5V14l-3-3 4-3 2 3h2",
		key: "1npguv"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MessageSquarePlus = createLucideIcon("MessageSquarePlus", [
	["path", {
		d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
		key: "1lielz"
	}],
	["path", {
		d: "M12 7v6",
		key: "lw1j43"
	}],
	["path", {
		d: "M9 10h6",
		key: "9gxzsh"
	}]
]);
//#endregion
//#region src/components/portal/VotingSectionModal.tsx
var VotingSectionModal = ({ isOpen, onClose, propertyCode, residentName }) => {
	const [selectedCandidate, setSelectedCandidate] = useState(null);
	const [hasVoted, setHasVoted] = useState(false);
	const [loading, setLoading] = useState(false);
	if (!isOpen) return null;
	const candidates = [{
		id: "cand-1",
		number: "01",
		name: "Bpk. Ir. H. Bambang Sutrisno",
		tagline: "Mewujudkan Komplek Aman, Asri, dan Transparan Berbasis Digital.",
		vision: "Pemasangan smart barrier gate gerbang pos satpam, transparansi kas real-time, dan revitalisasi taman bermain anak.",
		color: "border-emerald-500 bg-emerald-50/50"
	}, {
		id: "cand-2",
		number: "02",
		name: "Ibu Dr. Ratna Kusuma Wardani",
		tagline: "Guyub Rukun, Peduli Lansia, dan Pengelolaan Sampah Mandiri Ramah Lingkungan.",
		vision: "Bank sampah bernilai ekonomis, posyandu lansia terpadu, dan penambahan CCTV 4K di seluruh gang komplek.",
		color: "border-blue-500 bg-blue-50/50"
	}];
	const handleCastVote = async () => {
		if (!selectedCandidate) return;
		setLoading(true);
		try {
			if ((await (await fetch("/api/voting/cast-vote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					targetType: "ELECTION",
					targetId: "elect-2026",
					choiceId: selectedCandidate,
					propertyCode,
					voterName: residentName
				})
			})).json()).data) setHasVoted(true);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "p-4 sm:p-5 bg-primary-600 text-surface flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-surface",
						children: /* @__PURE__ */ jsx(Vote, { className: "w-4 h-4" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "font-bold text-sm leading-tight",
						children: "Bilik Suara Digital (E-Voting)"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-surface/80",
						children: "Pemilihan Ketua RW 05 / RT 02 (2026-2029)"
					})] })]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "p-1.5 hover:bg-white/20 rounded-xl transition-colors text-surface",
					children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "p-5 overflow-y-auto space-y-4 text-xs",
				children: hasVoted ? /* @__PURE__ */ jsxs("div", {
					className: "text-center py-6 space-y-3",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(CircleCheck, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsx("h4", {
							className: "font-bold text-base text-ink",
							children: "Suara Anda Berhasil Dicatat!"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-ink-muted leading-relaxed text-[11px] max-w-xs mx-auto",
							children: [
								"Terima kasih atas partisipasi aktif Bapak/Ibu dari ",
								/* @__PURE__ */ jsxs("strong", { children: ["Rumah ", propertyCode] }),
								" dalam musyawarah pemilihan ketua komplek."
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-2",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: onClose,
								className: "px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface font-bold rounded-xl shadow-xs",
								children: "Tutup Bilik Suara"
							})
						})
					]
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "text-ink-muted block text-[10px]",
							children: "Pemilih Terverifikasi"
						}), /* @__PURE__ */ jsxs("strong", {
							className: "text-ink",
							children: [
								residentName,
								" (Rumah ",
								propertyCode,
								")"
							]
						})] }), /* @__PURE__ */ jsx("span", {
							className: "px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200",
							children: "Hak Suara: 1 Suara"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsx("label", {
							className: "font-bold text-ink block",
							children: "Pilih Calon Ketua Komplek:"
						}), candidates.map((cand) => /* @__PURE__ */ jsxs("div", {
							onClick: () => setSelectedCandidate(cand.id),
							className: `p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${selectedCandidate === cand.id ? cand.color : "border-border bg-surface hover:bg-canvas"}`,
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-surface border border-border text-ink",
										children: ["NO. URUT ", cand.number]
									}), selectedCandidate === cand.id && /* @__PURE__ */ jsx(CircleCheck, { className: "w-5 h-5 text-primary-600" })]
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "font-bold text-sm text-ink",
									children: cand.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[11px] text-ink-muted italic font-medium mt-0.5",
									children: [
										"\"",
										cand.tagline,
										"\""
									]
								})] }),
								/* @__PURE__ */ jsxs("p", {
									className: "text-[11px] text-ink leading-relaxed pt-1 border-t border-border/50",
									children: [
										/* @__PURE__ */ jsx("strong", { children: "Program Kerja:" }),
										" ",
										cand.vision
									]
								})
							]
						}, cand.id))]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pt-2",
						children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: handleCastVote,
							disabled: !selectedCandidate || loading,
							className: "w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface font-bold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2",
							children: [/* @__PURE__ */ jsx(Vote, { className: "w-4 h-4" }), loading ? "Menyimpan Suara..." : "Kirim Pilihan Suara Saya"]
						})
					})
				] })
			})]
		})
	});
};
//#endregion
//#region src/components/portal/ResidentPortalView.tsx
var ResidentPortalView = ({ initialUser = DEMO_USERS.warga }) => {
	const [activeTab, setActiveTab] = useState("beranda");
	const [rumahSubTab, setRumahSubTab] = useState("specs");
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState("Agu");
	const [currentUser, setCurrentUser] = useState(initialUser);
	const [selectedReceipt, setSelectedReceipt] = useState(null);
	const [showVotingModal, setShowVotingModal] = useState(false);
	const [buildingType, setBuildingType] = useState("Tipe 72/120");
	const [landArea, setLandArea] = useState(120);
	const [buildingArea, setBuildingArea] = useState(72);
	const [plnCapacity, setPlnCapacity] = useState("3.500 VA");
	const [pamMeterNo, setPamMeterNo] = useState("PAM-88301");
	const [occupancyStatus, setOccupancyStatus] = useState("Dihuni Pemilik");
	const [showEditSpecsModal, setShowEditSpecsModal] = useState(false);
	const [occupants, setOccupants] = useState([
		{
			id: "occ-1",
			fullName: "Budi Santoso",
			relation: "Kepala Keluarga",
			idCardNumber: "3171091203850001",
			phone: "0812-3456-7890",
			isEmergencyContact: true,
			birthDate: "12 Mar 1985"
		},
		{
			id: "occ-2",
			fullName: "Siti Lestari",
			relation: "Istri",
			idCardNumber: "3171092507870002",
			phone: "0813-9876-5432",
			isEmergencyContact: true,
			birthDate: "25 Jul 1987"
		},
		{
			id: "occ-3",
			fullName: "Alya Santoso",
			relation: "Anak",
			idCardNumber: "3171091405130003",
			phone: "-",
			isEmergencyContact: false,
			birthDate: "14 Mei 2013"
		},
		{
			id: "occ-4",
			fullName: "Daffa Santoso",
			relation: "Anak",
			idCardNumber: "3171090309170004",
			phone: "-",
			isEmergencyContact: false,
			birthDate: "03 Sep 2017"
		}
	]);
	const [showAddOccupantModal, setShowAddOccupantModal] = useState(false);
	const [newOccName, setNewOccName] = useState("");
	const [newOccRelation, setNewOccRelation] = useState("ANAK");
	const [newOccIdCard, setNewOccIdCard] = useState("");
	const [newOccPhone, setNewOccPhone] = useState("");
	const [newOccEmergency, setNewOccEmergency] = useState(false);
	const [permits, setPermits] = useState([{
		id: "PERMIT-101",
		workType: "Pengecatan & Kanopi",
		contractorName: "Bpk. Sugeng (Mandor CV Berkah)",
		workersCount: 3,
		startDate: "2026-08-25",
		endDate: "2026-09-05",
		status: "APPROVED",
		description: "Pengecatan fasad luar dan perbaikan talang air kanopi garasi."
	}]);
	const [showAddPermitModal, setShowAddPermitModal] = useState(false);
	const [permitWorkType, setPermitWorkType] = useState("Pengecatan & Kanopi");
	const [permitContractor, setPermitContractor] = useState("");
	const [permitWorkers, setPermitWorkers] = useState(2);
	const [permitStart, setPermitStart] = useState("2026-09-01");
	const [permitEnd, setPermitEnd] = useState("2026-09-10");
	const [permitDesc, setPermitDesc] = useState("");
	const [permitSuccess, setPermitSuccess] = useState(false);
	const [showComplaintModal, setShowComplaintModal] = useState(false);
	const [compTitle, setCompTitle] = useState("");
	const [compDesc, setCompDesc] = useState("");
	const [compCategory, setCompCategory] = useState("FASILITAS");
	const [compLocation, setCompLocation] = useState("");
	const [compSuccess, setCompSuccess] = useState(false);
	const [showVehicleModal, setShowVehicleModal] = useState(false);
	const [vehPlate, setVehPlate] = useState("");
	const [vehType, setVehType] = useState("Mobil");
	const [vehBrand, setVehBrand] = useState("");
	const [vehModel, setVehModel] = useState("");
	const [vehColor, setVehColor] = useState("");
	const [vehicles, setVehicles] = useState([{
		id: "1",
		plateNumber: "B 1234 ABC",
		type: "Mobil",
		brand: "Toyota",
		model: "Avanza Veloz",
		color: "Hitam Metalik",
		year: "2022",
		rfidStatus: "AKTIF"
	}, {
		id: "2",
		plateNumber: "B 5678 DEF",
		type: "Motor",
		brand: "Honda",
		model: "Vario 160",
		color: "Putih Mutiara",
		year: "2023",
		rfidStatus: "AKTIF"
	}]);
	const [showFacilityModal, setShowFacilityModal] = useState(false);
	const [facId, setFacId] = useState("fac-balai");
	const [facName, setFacName] = useState("Balai Warga Serbaguna");
	const [facDate, setFacDate] = useState("2026-08-30");
	const [facStart, setFacStart] = useState("09:00");
	const [facEnd, setFacEnd] = useState("12:00");
	const [facPurpose, setFacPurpose] = useState("");
	const [facPhone, setFacPhone] = useState("0812-3456-7890");
	const [facSuccess, setFacSuccess] = useState(false);
	const handleBookFacility = async (e) => {
		e.preventDefault();
		if (!facPurpose) return;
		try {
			await fetch("/api/facilities/book", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					facilityId: facId,
					facilityName: facName,
					propertyId: currentUser.propertyId || "prop-a-17",
					residentName: currentUser.fullName,
					date: facDate,
					startTime: facStart,
					endTime: facEnd,
					purpose: facPurpose,
					contactPhone: facPhone
				})
			});
			setFacSuccess(true);
			setTimeout(() => {
				setFacSuccess(false);
				setShowFacilityModal(false);
				setFacPurpose("");
			}, 1500);
		} catch (err) {
			console.error(err);
		}
	};
	const months = [
		{
			code: "Jan",
			name: "Januari",
			status: "paid"
		},
		{
			code: "Feb",
			name: "Februari",
			status: "paid"
		},
		{
			code: "Mar",
			name: "Maret",
			status: "paid"
		},
		{
			code: "Apr",
			name: "April",
			status: "paid"
		},
		{
			code: "Mei",
			name: "Mei",
			status: "paid"
		},
		{
			code: "Jun",
			name: "Juni",
			status: "paid"
		},
		{
			code: "Jul",
			name: "Juli",
			status: "paid"
		},
		{
			code: "Agu",
			name: "Agustus",
			status: currentUser.username === "warga_b07" ? "unpaid" : "paid"
		},
		{
			code: "Sep",
			name: "September",
			status: "pending"
		},
		{
			code: "Okt",
			name: "Oktober",
			status: "pending"
		},
		{
			code: "Nov",
			name: "November",
			status: "pending"
		},
		{
			code: "Des",
			name: "Desember",
			status: "pending"
		}
	];
	const handleConfirmPayment = async (e) => {
		e.preventDefault();
		try {
			await fetch("/api/payments/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyId: currentUser.propertyId || "prop-a-17",
					billingPeriodId: "period-2026-08",
					amount: 75e4,
					method: "TRANSFER",
					reference: `TRX-${Date.now().toString().slice(-6)}`,
					notes: "Konfirmasi pembayaran via Portal Warga Mobile"
				})
			});
			setPaymentSuccess(true);
			setTimeout(() => {
				setPaymentSuccess(false);
				setShowPaymentModal(false);
			}, 1500);
		} catch (err) {
			console.error(err);
		}
	};
	const handleCreateComplaint = async (e) => {
		e.preventDefault();
		if (!compTitle || !compDesc) return;
		try {
			await fetch("/api/complaints/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyId: currentUser.propertyId || "prop-a-17",
					title: compTitle,
					description: compDesc,
					category: compCategory,
					location: compLocation || "Sekitar Rumah",
					priority: "MEDIUM"
				})
			});
			setCompSuccess(true);
			setTimeout(() => {
				setCompSuccess(false);
				setShowComplaintModal(false);
				setCompTitle("");
				setCompDesc("");
				setCompLocation("");
			}, 1500);
		} catch (err) {
			console.error(err);
		}
	};
	const handleCreateVehicle = async (e) => {
		e.preventDefault();
		if (!vehPlate || !vehBrand || !vehModel) return;
		try {
			await fetch("/api/vehicles/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyId: currentUser.propertyId || "prop-a-17",
					plateNumber: vehPlate,
					type: vehType,
					brand: vehBrand,
					model: vehModel,
					color: vehColor || "Hitam"
				})
			});
			setVehicles([...vehicles, {
				id: `veh-${Date.now()}`,
				plateNumber: vehPlate.toUpperCase(),
				type: vehType,
				brand: vehBrand,
				model: vehModel,
				color: vehColor || "Hitam",
				year: "2023",
				rfidStatus: "AKTIF"
			}]);
			setShowVehicleModal(false);
			setVehPlate("");
			setVehBrand("");
			setVehModel("");
			setVehColor("");
		} catch (err) {
			console.error(err);
		}
	};
	const handleAddOccupant = async (e) => {
		e.preventDefault();
		if (!newOccName) return;
		try {
			await fetch("/api/properties/occupants/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyId: currentUser.propertyId || "prop-a-17",
					fullName: newOccName,
					relation: newOccRelation,
					idCardNumber: newOccIdCard,
					phone: newOccPhone,
					isEmergencyContact: newOccEmergency
				})
			});
			setOccupants([...occupants, {
				id: `occ-${Date.now()}`,
				fullName: newOccName,
				relation: newOccRelation === "KEPALA_KELUARGA" ? "Kepala Keluarga" : newOccRelation === "ISTRI" ? "Istri" : newOccRelation === "ANAK" ? "Anak" : newOccRelation === "ART_SUPIR" ? "ART / Supir" : "Anggota Keluarga",
				idCardNumber: newOccIdCard || "3171xxxxxxxx0005",
				phone: newOccPhone || "-",
				isEmergencyContact: newOccEmergency,
				birthDate: "01 Jan 2000"
			}]);
			setShowAddOccupantModal(false);
			setNewOccName("");
			setNewOccIdCard("");
			setNewOccPhone("");
			setNewOccEmergency(false);
		} catch (err) {
			console.error(err);
		}
	};
	const handleDeleteOccupant = (id) => {
		setOccupants(occupants.filter((o) => o.id !== id));
	};
	const handleAddPermit = async (e) => {
		e.preventDefault();
		if (!permitContractor || !permitDesc) return;
		try {
			await fetch("/api/properties/permits/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyCode: currentUser.propertyCode || "A-17",
					workType: permitWorkType,
					contractorName: permitContractor,
					workersCount: Number(permitWorkers),
					startDate: permitStart,
					endDate: permitEnd,
					description: permitDesc
				})
			});
			setPermits([{
				id: `PERMIT-${Date.now().toString().slice(-4)}`,
				workType: permitWorkType,
				contractorName: permitContractor,
				workersCount: Number(permitWorkers),
				startDate: permitStart,
				endDate: permitEnd,
				status: "APPROVED",
				description: permitDesc
			}, ...permits]);
			setPermitSuccess(true);
			setTimeout(() => {
				setPermitSuccess(false);
				setShowAddPermitModal(false);
				setPermitContractor("");
				setPermitDesc("");
			}, 1500);
		} catch (err) {
			console.error(err);
		}
	};
	const handleUpdateSpecs = async (e) => {
		e.preventDefault();
		try {
			await fetch("/api/properties/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					propertyCode: currentUser.propertyCode || "A-17",
					buildingType,
					landArea: Number(landArea),
					buildingArea: Number(buildingArea),
					plnCapacity,
					pamMeterNo,
					occupancyStatus
				})
			});
			setShowEditSpecsModal(false);
		} catch (err) {
			console.error(err);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-canvas flex flex-col items-center justify-start antialiased",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "w-full bg-surface border-b border-border sticky top-0 z-30 shadow-xs backdrop-blur-md bg-surface/90",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-2xl mx-auto px-4 h-14 flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-xs",
							children: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary-600" })
						}), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", {
							className: "font-extrabold text-base tracking-tight text-ink flex items-center gap-1.5",
							children: [
								"Warga",
								/* @__PURE__ */ jsx("span", {
									className: "text-primary-600",
									children: "Hub"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 uppercase",
									children: "Portal Warga"
								})
							]
						}) })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("a", {
								href: "/transparency",
								className: "text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-canvas transition-colors hidden sm:inline-flex items-center gap-1",
								children: "Transparansi Kas"
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/admin",
								className: "text-xs font-bold text-primary-700 hover:text-primary-800 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors flex items-center gap-1 border border-primary-200",
								children: ["Admin Dashboard", /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })]
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setActiveTab("akun"),
								className: "w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 hover:ring-2 hover:ring-primary-500 transition-all ml-1",
								children: /* @__PURE__ */ jsx("img", {
									src: currentUser.avatarUrl,
									alt: currentUser.fullName,
									className: "w-full h-full object-cover"
								})
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "w-full max-w-2xl mx-auto bg-surface sm:border-x border-border shadow-xs pb-24 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [
						activeTab === "beranda" && /* @__PURE__ */ jsxs("div", {
							className: "p-5 sm:p-6 space-y-5 animate-in fade-in duration-150",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
									className: "text-2xl font-bold tracking-tight text-ink",
									children: [
										"Halo, ",
										currentUser.fullName,
										" 👋"
									]
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-ink-muted mt-1",
									children: "Selamat datang di Portal Warga Komplek Taman Sejahtera"
								})] }),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => setActiveTab("rumah"),
									className: "w-full flex items-center justify-between p-3.5 rounded-2xl bg-canvas border border-border hover:bg-primary-50/40 transition-colors text-left",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-primary-600 shadow-xs",
											children: /* @__PURE__ */ jsx(House, { className: "w-5 h-5" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-medium text-ink-muted",
											children: "Rumah Saya"
										}), /* @__PURE__ */ jsxs("p", {
											className: "text-sm font-bold text-ink",
											children: ["Rumah ", currentUser.propertyCode || "A-17"]
										})] })]
									}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted" })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-4 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-3.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5",
										children: /* @__PURE__ */ jsx(CircleCheck, { className: "w-5 h-5" })
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-xs font-semibold text-ink-muted",
												children: "Iuran Agustus 2026"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-sm font-bold text-emerald-700",
												children: "Lunas"
											})] }), /* @__PURE__ */ jsx("span", {
												className: "text-sm font-bold text-ink tabular-nums",
												children: "Rp750.000"
											})]
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-ink-muted mt-1.5",
											children: "Dibayarkan pada 20 Agu 2026, 10:21 WIB"
										})]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2.5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("h3", {
											className: "text-xs font-bold text-ink",
											children: "Ringkasan Komplek"
										}), /* @__PURE__ */ jsx("a", {
											href: "/transparency",
											className: "text-[11px] font-semibold text-primary-600 hover:underline",
											children: "Lihat Semua"
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-4 gap-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: "Saldo Kas"
													}),
													/* @__PURE__ */ jsx(Wallet, { className: "w-4 h-4 text-primary-600 my-1" }),
													/* @__PURE__ */ jsx("span", {
														className: "text-[11px] font-bold text-ink tabular-nums",
														children: "Rp128,45 jt"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[9px] text-ink-muted",
														children: "Per 20 Agu"
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: "Iuran Lunas"
													}),
													/* @__PURE__ */ jsx("div", {
														className: "w-5 h-5 rounded-full border-2 border-primary-500 text-[10px] font-bold text-primary-600 flex items-center justify-center my-0.5",
														children: "72%"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] font-bold text-ink",
														children: "86/120"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[9px] text-ink-muted",
														children: "rumah"
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: "Transaksi"
													}),
													/* @__PURE__ */ jsx(Hourglass, { className: "w-4 h-4 text-amber-600 my-1" }),
													/* @__PURE__ */ jsx("span", {
														className: "text-[11px] font-bold text-ink",
														children: "3"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[9px] text-amber-700 font-medium",
														children: "Agu 2026"
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "p-2.5 rounded-xl bg-canvas border border-border text-center flex flex-col items-center justify-between",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-ink-muted",
														children: "Aduan"
													}),
													/* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4 text-red-500 my-1" }),
													/* @__PURE__ */ jsx("span", {
														className: "text-[11px] font-bold text-ink",
														children: "4"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[9px] text-red-700 font-medium",
														children: "Menunggu"
													})
												]
											})
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2.5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("h3", {
											className: "text-xs font-bold text-ink",
											children: "Pengumuman Terbaru"
										}), /* @__PURE__ */ jsx("button", {
											onClick: () => setActiveTab("info"),
											className: "text-[11px] font-semibold text-primary-600 hover:underline",
											children: "Lihat Semua"
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ jsx("div", {
														className: "w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0",
														children: /* @__PURE__ */ jsx(Megaphone, { className: "w-4 h-4" })
													}), /* @__PURE__ */ jsxs("div", { children: [
														/* @__PURE__ */ jsx("p", {
															className: "text-xs font-bold text-ink leading-tight",
															children: "Kerja Bakti Lingkungan"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-ink-muted mt-0.5",
															children: "Minggu, 24 Agustus 2026 • 07:00 WIB"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-primary-700",
															children: "Lapangan Blok A"
														})
													] })]
												}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted shrink-0" })]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ jsx("div", {
														className: "w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0",
														children: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" })
													}), /* @__PURE__ */ jsxs("div", { children: [
														/* @__PURE__ */ jsx("p", {
															className: "text-xs font-bold text-ink leading-tight",
															children: "Perbaikan Pompa Air"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-ink-muted mt-0.5",
															children: "Rabu, 27 Agustus 2026 • 09:00 WIB"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-primary-700",
															children: "Area Rumah Pompa"
														})
													] })]
												}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted shrink-0" })]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ jsx("div", {
														className: "w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0",
														children: /* @__PURE__ */ jsx(Info, { className: "w-4 h-4" })
													}), /* @__PURE__ */ jsxs("div", { children: [
														/* @__PURE__ */ jsx("p", {
															className: "text-xs font-bold text-ink leading-tight",
															children: "Pembagian Tempat Sampah Baru"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-ink-muted mt-0.5",
															children: "Mulai 1 September 2026"
														}),
														/* @__PURE__ */ jsx("p", {
															className: "text-[10px] text-primary-700",
															children: "Setiap RT"
														})
													] })]
												}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted shrink-0" })]
											})
										]
									})]
								})
							]
						}),
						activeTab === "iuran" && /* @__PURE__ */ jsxs("div", {
							className: "p-5 space-y-5 flex-1 animate-in fade-in duration-150",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between pt-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("button", {
											onClick: () => setActiveTab("beranda"),
											className: "p-1 -ml-1 text-ink hover:bg-canvas rounded-full",
											children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
										}), /* @__PURE__ */ jsx("h2", {
											className: "font-bold text-base text-ink",
											children: "Iuran Saya"
										})]
									}), /* @__PURE__ */ jsx("button", {
										className: "p-2 text-ink hover:bg-canvas rounded-full",
										children: /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" })
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("h3", {
											className: "text-xs font-bold text-ink",
											children: "Status Iuran 2026"
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5 text-[10px] text-ink-muted",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500" }), " Lunas"]
												}),
												/* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-border-dark" }), " Belum"]
												}),
												/* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-500" }), " Terlambat"]
												})
											]
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-6 gap-2",
										children: months.map((m) => {
											const isCurrent = m.code === selectedMonth;
											const isPaid = m.status === "paid";
											return /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setSelectedMonth(m.code),
												className: `p-2 rounded-xl text-center flex flex-col items-center justify-between border transition-all ${isCurrent ? "bg-surface border-primary-500 ring-2 ring-primary-500/20 shadow-xs" : "bg-canvas border-border/70 hover:bg-surface"}`,
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[11px] font-semibold text-ink",
													children: m.code
												}), isPaid ? /* @__PURE__ */ jsx("div", {
													className: "w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-1",
													children: /* @__PURE__ */ jsx(Check, { className: "w-2.5 h-2.5 stroke-[3]" })
												}) : /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded-full bg-border/60 mt-1" })]
											}, m.code);
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-4 rounded-2xl bg-surface border border-border shadow-card space-y-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-sm font-bold text-ink",
												children: "Iuran Agustus 2026"
											}), /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200",
												children: "Lunas"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-4 pt-1",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-[11px] text-ink-muted",
												children: "Nominal"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-base font-bold text-ink tabular-nums",
												children: "Rp750.000"
											})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-[11px] text-ink-muted",
												children: "Jatuh Tempo"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-xs font-semibold text-ink mt-0.5",
												children: "10 Agu 2026"
											})] })]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-ink-muted",
											children: "Dibayarkan pada 20 Agu 2026, 10:21 WIB"
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setShowPaymentModal(true),
											className: "w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-surface font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2",
											children: [/* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }), "Konfirmasi Pembayaran"]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("h3", {
												className: "text-xs font-bold text-ink",
												children: "Riwayat Pembayaran"
											}), /* @__PURE__ */ jsx("button", {
												className: "text-[11px] font-semibold text-primary-600 hover:underline",
												children: "Lihat Semua"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between",
													children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
														className: "text-xs font-bold text-ink",
														children: "Juli 2026"
													}), /* @__PURE__ */ jsx("p", {
														className: "text-[10px] text-ink-muted",
														children: "18 Jul 2026, 09:14 WIB"
													})] }), /* @__PURE__ */ jsxs("div", {
														className: "text-right flex items-center gap-2",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-semibold text-ink tabular-nums",
															children: "Rp750.000"
														}), /* @__PURE__ */ jsx("span", {
															className: "px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded",
															children: "Lunas"
														})]
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between",
													children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
														className: "text-xs font-bold text-ink",
														children: "Juni 2026"
													}), /* @__PURE__ */ jsx("p", {
														className: "text-[10px] text-ink-muted",
														children: "20 Jun 2026, 10:02 WIB"
													})] }), /* @__PURE__ */ jsxs("div", {
														className: "text-right flex items-center gap-2",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-semibold text-ink tabular-nums",
															children: "Rp750.000"
														}), /* @__PURE__ */ jsx("span", {
															className: "px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded",
															children: "Lunas"
														})]
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-2xl bg-canvas border border-border flex items-center justify-between",
													children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
														className: "text-xs font-bold text-ink",
														children: "Mei 2026"
													}), /* @__PURE__ */ jsx("p", {
														className: "text-[10px] text-ink-muted",
														children: "20 Mei 2026, 09:47 WIB"
													})] }), /* @__PURE__ */ jsxs("div", {
														className: "text-right flex items-center gap-2",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-semibold text-ink tabular-nums",
															children: "Rp750.000"
														}), /* @__PURE__ */ jsx("span", {
															className: "px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded",
															children: "Lunas"
														})]
													})]
												})
											]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setSelectedReceipt({
												invoiceNumber: "INV-202608-A17",
												periodName: "Agustus 2026",
												propertyCode: currentUser.propertyCode || "A-17",
												residentName: currentUser.fullName,
												amount: 75e4,
												paidAt: "20 Agustus 2026, 10:21 WIB",
												paymentMethod: "Transfer Bank BCA",
												referenceNumber: "TRX-BCA-A17"
											}),
											className: "w-full py-2.5 border border-border hover:bg-canvas text-ink text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2",
											children: [/* @__PURE__ */ jsx(Printer, { className: "w-4 h-4 text-primary-600" }), "Lihat / Cetak Kuitansi Resmi"]
										})
									]
								})
							]
						}),
						activeTab === "info" && /* @__PURE__ */ jsxs("div", {
							className: "p-5 space-y-5 flex-1 animate-in fade-in duration-150",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between pt-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => setActiveTab("beranda"),
										className: "p-1 -ml-1 text-ink hover:bg-canvas rounded-full",
										children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
									}), /* @__PURE__ */ jsx("h2", {
										className: "font-bold text-base text-ink",
										children: "Info & Agenda Warga"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsxs("button", {
										onClick: () => setShowFacilityModal(true),
										className: "px-2 py-1 bg-surface hover:bg-canvas border border-border text-ink text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs",
										children: [/* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5 text-primary-700" }), "Pesan Sarana"]
									}), /* @__PURE__ */ jsxs("button", {
										onClick: () => setShowComplaintModal(true),
										className: "px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-surface text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs",
										children: [/* @__PURE__ */ jsx(MessageSquarePlus, { className: "w-3.5 h-3.5" }), "Aduan"]
									})]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded-md",
													children: "KEGIATAN"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-ink-muted",
													children: "20 Agustus 2026"
												})]
											}),
											/* @__PURE__ */ jsx("h4", {
												className: "text-sm font-bold text-ink",
												children: "Kerja Bakti Lingkungan"
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-ink-muted leading-relaxed",
												children: "Mengundang seluruh warga untuk hadir dalam kegiatan kerja bakti pembersihan saluran air dan taman bersama. Diharapkan membawa peralatan masing-masing."
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "pt-2 border-t border-border/60 flex items-center justify-between text-xs text-primary-700 font-medium",
												children: [/* @__PURE__ */ jsx("span", { children: "Minggu, 24 Agu 2026 • 07:00 WIB" }), /* @__PURE__ */ jsx("span", { children: "Lapangan Blok A" })]
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md",
													children: "MAINTENANCE"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-ink-muted",
													children: "22 Agustus 2026"
												})]
											}),
											/* @__PURE__ */ jsx("h4", {
												className: "text-sm font-bold text-ink",
												children: "Perbaikan Pompa Air"
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-ink-muted leading-relaxed",
												children: "Akan dilakukan perbaikan dan pengurasan tandon pompa air utama komplek. Pasokan air fasum akan dimatikan sementara."
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "pt-2 border-t border-border/60 flex items-center justify-between text-xs text-primary-700 font-medium",
												children: [/* @__PURE__ */ jsx("span", { children: "Rabu, 27 Agu 2026 • 09:00 WIB" }), /* @__PURE__ */ jsx("span", { children: "Area Rumah Pompa" })]
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-surface shadow-card space-y-2.5",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ jsx("span", {
													className: "px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider",
													children: "Musyawarah Digital"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-emerald-200",
													children: "1 Rumah = 1 Suara"
												})]
											}),
											/* @__PURE__ */ jsx("h4", {
												className: "font-bold text-sm",
												children: "Pemilihan Ketua RW 05 / RT 02 (2026-2029)"
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-surface/80 leading-relaxed",
												children: "Bilik suara digital telah dibuka. Gunakan hak suara keluarga Anda untuk menentukan kemajuan komplek perumahan."
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setShowVotingModal(true),
												className: "w-full py-2 bg-surface text-primary-700 hover:bg-canvas font-bold text-xs rounded-xl shadow-xs transition-colors",
												children: "Buka Bilik Suara & Berikan Pilihan ➔"
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3",
										children: [/* @__PURE__ */ jsxs("h4", {
											className: "text-xs font-bold text-ink flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("span", { children: "Arsip & Dokumen Resmi" }), /* @__PURE__ */ jsx("span", {
												className: "text-[10px] text-primary-600 font-normal",
												children: "3 Berkas Tersedia"
											})]
										}), /* @__PURE__ */ jsx("div", {
											className: "space-y-2",
											children: [
												{
													title: "Tata Tertib Warga 2026",
													size: "1.2 MB",
													cat: "TATA TERTIB"
												},
												{
													title: "Surat Edaran Kerja Bakti & Ronda",
													size: "450 KB",
													cat: "SURAT EDARAN"
												},
												{
													title: "Laporan Keuangan Semester 1 2026",
													size: "3.4 MB",
													cat: "LAPORAN"
												}
											].map((doc, idx) => /* @__PURE__ */ jsxs("div", {
												className: "p-2.5 bg-canvas rounded-xl flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs font-bold text-ink",
													children: doc.title
												}), /* @__PURE__ */ jsxs("span", {
													className: "text-[10px] text-ink-muted",
													children: [
														doc.cat,
														" • ",
														doc.size
													]
												})] }), /* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => alert(`Mengunduh berkas resmi: ${doc.title}`),
													className: "p-1.5 bg-surface hover:bg-primary-50 text-primary-700 rounded-lg border border-border",
													children: /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" })
												})]
											}, idx))
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3",
										children: [/* @__PURE__ */ jsxs("h4", {
											className: "text-xs font-bold text-emerald-900 flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(PhoneCall, { className: "w-4 h-4 text-emerald-700" }), "Kontak Darurat & Keamanan"]
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5 text-xs text-emerald-800",
											children: [
												/* @__PURE__ */ jsxs("p", {
													className: "flex justify-between",
													children: [
														/* @__PURE__ */ jsx("span", { children: "Pos Satpam Utama (24 Jam):" }),
														" ",
														/* @__PURE__ */ jsx("strong", {
															className: "font-mono",
															children: "0812-1111-2222"
														})
													]
												}),
												/* @__PURE__ */ jsxs("p", {
													className: "flex justify-between",
													children: [
														/* @__PURE__ */ jsx("span", { children: "Ketua RW 05:" }),
														" ",
														/* @__PURE__ */ jsx("strong", {
															className: "font-mono",
															children: "0812-3456-7890"
														})
													]
												}),
												/* @__PURE__ */ jsxs("p", {
													className: "flex justify-between",
													children: [
														/* @__PURE__ */ jsx("span", { children: "Petugas Sarana:" }),
														" ",
														/* @__PURE__ */ jsx("strong", {
															className: "font-mono",
															children: "0813-8888-9999"
														})
													]
												})
											]
										})]
									})
								]
							})]
						}),
						activeTab === "rumah" && /* @__PURE__ */ jsxs("div", {
							className: "p-5 sm:p-6 space-y-5 flex-1 animate-in fade-in duration-150",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("button", {
											onClick: () => setActiveTab("beranda"),
											className: "p-1 -ml-1 text-ink hover:bg-canvas rounded-full",
											children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
											className: "font-extrabold text-lg text-ink",
											children: "Manajemen Rumah"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-ink-muted",
											children: "Kelola data hunian, penghuni, kendaraan & izin renovasi"
										})] })]
									}), /* @__PURE__ */ jsxs("span", {
										className: "px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1",
										children: [/* @__PURE__ */ jsx(BadgeCheck, { className: "w-3.5 h-3.5 text-emerald-600" }), "Terverifikasi"]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-4 rounded-2xl bg-gradient-to-br from-primary-900 to-slate-900 text-white shadow-md relative overflow-hidden",
									children: [/* @__PURE__ */ jsx("div", {
										className: "absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4",
										children: /* @__PURE__ */ jsx(Building2, { className: "w-36 h-36" })
									}), /* @__PURE__ */ jsxs("div", {
										className: "relative z-10 space-y-3",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wide uppercase",
													children: [currentUser.propertyCode?.toUpperCase().startsWith("KAV") ? "Area Kavling" : currentUser.propertyCode?.toUpperCase().startsWith("SW") ? "Jl. Sariwangi Indah" : `Blok ${currentUser.propertyCode?.split("-")[0] || "A"}`, " • RT 02 / RW 05"]
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[11px] text-primary-200 font-medium",
													children: "Komplek Taman Sejahtera"
												})]
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-primary-200",
												children: "Nomor Unit Hunian:"
											}), /* @__PURE__ */ jsxs("h3", {
												className: "text-2xl font-black tracking-tight",
												children: ["Rumah ", currentUser.propertyCode || "A-17"]
											})] }),
											/* @__PURE__ */ jsxs("div", {
												className: "grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs",
												children: [
													/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-primary-200",
														children: "Tipe:"
													}), /* @__PURE__ */ jsx("p", {
														className: "font-bold",
														children: buildingType
													})] }),
													/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-primary-200",
														children: "Penghuni:"
													}), /* @__PURE__ */ jsxs("p", {
														className: "font-bold",
														children: [occupants.length, " Jiwa"]
													})] }),
													/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-primary-200",
														children: "Kendaraan:"
													}), /* @__PURE__ */ jsxs("p", {
														className: "font-bold",
														children: [vehicles.length, " Unit"]
													})] })
												]
											})
										]
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex items-center gap-1.5 p-1 bg-canvas rounded-2xl border border-border overflow-x-auto no-scrollbar",
									children: [
										{
											id: "specs",
											label: "Spesifikasi",
											icon: House
										},
										{
											id: "occupants",
											label: "Penghuni",
											icon: Users
										},
										{
											id: "vehicles",
											label: "Kendaraan",
											icon: Car
										},
										{
											id: "permits",
											label: "Izin Renovasi",
											icon: Hammer
										},
										{
											id: "pass",
											label: "Pas Digital",
											icon: QrCode
										}
									].map((st) => {
										const Icon = st.icon;
										const isActive = rumahSubTab === st.id;
										return /* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setRumahSubTab(st.id),
											className: `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive ? "bg-surface text-primary-700 shadow-xs border border-border" : "text-ink-muted hover:text-ink hover:bg-surface/50"}`,
											children: [/* @__PURE__ */ jsx(Icon, { className: "w-3.5 h-3.5" }), st.label]
										}, st.id);
									})
								}),
								rumahSubTab === "specs" && /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 animate-in fade-in duration-100",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("h4", {
												className: "text-xs font-bold text-ink flex items-center gap-1.5",
												children: [/* @__PURE__ */ jsx(House, { className: "w-4 h-4 text-primary-600" }), "Data Teknis & Utilitas Rumah"]
											}), /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setShowEditSpecsModal(true),
												className: "text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1",
												children: [/* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" }), "Edit Data"]
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-3 pt-1 text-xs",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-xl bg-canvas border border-border/70 space-y-1",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "text-[10px] text-ink-muted flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Building2, { className: "w-3 h-3 text-primary-600" }), " Luas Tanah & Bangunan"]
													}), /* @__PURE__ */ jsxs("p", {
														className: "font-bold text-ink",
														children: [
															landArea,
															" m² / ",
															buildingArea,
															" m²"
														]
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-xl bg-canvas border border-border/70 space-y-1",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "text-[10px] text-ink-muted flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Zap, { className: "w-3 h-3 text-amber-600" }), " Daya Listrik PLN"]
													}), /* @__PURE__ */ jsx("p", {
														className: "font-bold text-ink",
														children: plnCapacity
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-xl bg-canvas border border-border/70 space-y-1",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "text-[10px] text-ink-muted flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Droplets, { className: "w-3 h-3 text-sky-600" }), " No. Meter Air PAM"]
													}), /* @__PURE__ */ jsx("p", {
														className: "font-bold text-ink font-mono",
														children: pamMeterNo
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 rounded-xl bg-canvas border border-border/70 space-y-1",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "text-[10px] text-ink-muted flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(BadgeCheck, { className: "w-3 h-3 text-emerald-600" }), " Status Kepemilikan"]
													}), /* @__PURE__ */ jsx("p", {
														className: "font-bold text-emerald-700",
														children: occupancyStatus
													})]
												})
											]
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-2",
										children: [/* @__PURE__ */ jsx("h4", {
											className: "text-xs font-bold text-ink",
											children: "Kepala Rumah Tangga"
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between p-3 rounded-xl bg-canvas border border-border/70",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ jsx("div", {
													className: "w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-extrabold flex items-center justify-center text-sm",
													children: currentUser.fullName.split(" ").map((n) => n[0]).join("")
												}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs font-bold text-ink",
													children: currentUser.fullName
												}), /* @__PURE__ */ jsx("p", {
													className: "text-[10px] text-ink-muted font-mono",
													children: "NIK: 3171091203850001 • HP: 0812-3456-7890"
												})] })]
											}), /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold rounded-md",
												children: "Penanggung Jawab"
											})]
										})]
									})]
								}),
								rumahSubTab === "occupants" && /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 animate-in fade-in duration-100",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h4", {
											className: "text-xs font-bold text-ink",
											children: [
												"Daftar Penghuni & Keluarga (",
												occupants.length,
												" Jiwa)"
											]
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[10px] text-ink-muted",
											children: "Terdaftar di database RT 02 / RW 05"
										})] }), /* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setShowAddOccupantModal(true),
											className: "px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors",
											children: [/* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), "Tambah Anggota"]
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "space-y-2.5",
										children: occupants.map((occ) => /* @__PURE__ */ jsxs("div", {
											className: "p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ jsx("div", {
													className: "w-9 h-9 rounded-full bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center border border-primary-200",
													children: occ.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)
												}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-1.5",
													children: [/* @__PURE__ */ jsx("p", {
														className: "text-xs font-bold text-ink",
														children: occ.fullName
													}), occ.isEmergencyContact && /* @__PURE__ */ jsx("span", {
														className: "px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-md border border-rose-200",
														children: "Kontak Darurat"
													})]
												}), /* @__PURE__ */ jsxs("p", {
													className: "text-[10px] text-ink-muted",
													children: [
														occ.relation,
														" • ",
														occ.phone
													]
												})] })]
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] font-mono text-ink-muted hidden sm:inline",
													children: occ.idCardNumber
												}), occ.relation !== "Kepala Keluarga" && /* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => handleDeleteOccupant(occ.id),
													className: "p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
													title: "Hapus Anggota",
													children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
												})]
											})]
										}, occ.id))
									})]
								}),
								rumahSubTab === "vehicles" && /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 animate-in fade-in duration-100",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h4", {
												className: "text-xs font-bold text-ink",
												children: [
													"Kendaraan Terdaftar (",
													vehicles.length,
													" Unit)"
												]
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[10px] text-ink-muted",
												children: "Akses palang otomatis RFID & CCTV Pos Satpam"
											})] }), /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setShowVehicleModal(true),
												className: "px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors",
												children: [/* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), "Tambah Kendaraan"]
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "space-y-2.5",
											children: vehicles.map((v) => /* @__PURE__ */ jsx("div", {
												className: "p-3.5 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-between",
												children: /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ jsx("div", {
														className: "w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600",
														children: v.type === "Mobil" ? /* @__PURE__ */ jsx(Car, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Bike, { className: "w-5 h-5" })
													}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ jsx("p", {
															className: "font-mono text-sm font-black text-ink",
															children: v.plateNumber
														}), /* @__PURE__ */ jsx("span", {
															className: "px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200",
															children: "RFID AKTIF"
														})]
													}), /* @__PURE__ */ jsxs("p", {
														className: "text-[11px] text-ink-muted",
														children: [
															v.type,
															" • ",
															v.brand,
															" ",
															v.model,
															" • ",
															v.color
														]
													})] })]
												})
											}, v.id))
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1",
											children: [/* @__PURE__ */ jsxs("p", {
												className: "font-bold flex items-center gap-1.5",
												children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-amber-700" }), "Ketentuan Parkir & Stiker RFID"]
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-amber-800",
												children: "Maksimal 2 mobil dan 3 motor per hunian. Kendaraan terdaftar otomatis membuka barrier gate pos 1 tanpa perlu berhenti membuka kaca."
											})]
										})
									]
								}),
								rumahSubTab === "permits" && /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 animate-in fade-in duration-100",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
												className: "text-xs font-bold text-ink",
												children: "Izin Renovasi & Pekerja Bangunan"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[10px] text-ink-muted",
												children: "Wajib diajukan sebelum memulai aktivitas tukang"
											})] }), /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setShowAddPermitModal(true),
												className: "px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors",
												children: [/* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), "Ajukan Izin"]
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "space-y-3",
											children: permits.map((p) => /* @__PURE__ */ jsxs("div", {
												className: "p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-2.5",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center justify-between",
														children: [/* @__PURE__ */ jsx("span", {
															className: "font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200",
															children: p.id
														}), /* @__PURE__ */ jsx("span", {
															className: "px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200",
															children: "DISETUJUI / AKTIF"
														})]
													}),
													/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h5", {
														className: "text-sm font-bold text-ink",
														children: p.workType
													}), /* @__PURE__ */ jsx("p", {
														className: "text-xs text-ink-muted mt-0.5",
														children: p.description
													})] }),
													/* @__PURE__ */ jsxs("div", {
														className: "grid grid-cols-2 gap-2 pt-2 border-t border-border text-[11px]",
														children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
															className: "text-ink-muted",
															children: "Mandor / Pelaksana:"
														}), /* @__PURE__ */ jsx("p", {
															className: "font-semibold text-ink",
															children: p.contractorName
														})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
															className: "text-ink-muted",
															children: "Masa Pengerjaan:"
														}), /* @__PURE__ */ jsxs("p", {
															className: "font-semibold text-ink",
															children: [
																p.startDate,
																" s/d ",
																p.endDate,
																" (",
																p.workersCount,
																" Tukang)"
															]
														})] })]
													})
												]
											}, p.id))
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1",
											children: [/* @__PURE__ */ jsxs("p", {
												className: "font-bold flex items-center gap-1.5 text-slate-900",
												children: [/* @__PURE__ */ jsx(Hammer, { className: "w-4 h-4 text-slate-700" }), "Aturan Jam Kerja Renovasi"]
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-slate-600",
												children: "Senin – Sabtu: 08:00 – 17:00 WIB. Hari Minggu dan Libur Nasional dilarang melakukan pekerjaan yang menimbulkan kebisingan."
											})]
										})
									]
								}),
								rumahSubTab === "pass" && /* @__PURE__ */ jsx("div", {
									className: "space-y-4 animate-in fade-in duration-100",
									children: /* @__PURE__ */ jsxs("div", {
										className: "p-6 rounded-3xl bg-surface border border-border shadow-card text-center space-y-4",
										children: [
											/* @__PURE__ */ jsx("div", {
												className: "inline-block p-3 rounded-2xl bg-primary-50 border border-primary-200 text-primary-700",
												children: /* @__PURE__ */ jsx(QrCode, { className: "w-32 h-32 mx-auto" })
											}),
											/* @__PURE__ */ jsxs("div", { children: [
												/* @__PURE__ */ jsx("span", {
													className: "px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md border border-emerald-200",
													children: "STATUS: TERVERIFIKASI"
												}),
												/* @__PURE__ */ jsxs("h3", {
													className: "text-xl font-black text-ink mt-2",
													children: ["Rumah ", currentUser.propertyCode || "A-17"]
												}),
												/* @__PURE__ */ jsx("p", {
													className: "text-xs text-ink-muted",
													children: "Komplek Taman Sejahtera • RT 02 / RW 05"
												}),
												/* @__PURE__ */ jsx("p", {
													className: "text-[11px] font-mono text-ink-muted mt-1",
													children: "ID: PROP-A17-2026-BCA88"
												})
											] }),
											/* @__PURE__ */ jsxs("div", {
												className: "p-3 rounded-xl bg-canvas border border-border text-xs text-left space-y-1.5",
												children: [
													/* @__PURE__ */ jsx("p", {
														className: "font-bold text-ink",
														children: "Kegunaan Pas Digital:"
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-[11px] text-ink-muted",
														children: "1. Tunjukkan ke satpam pos gerbang saat verifikasi tamu keluarga."
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-[11px] text-ink-muted",
														children: "2. Konfirmasi penerimaan paket kiriman logistik/kurir."
													})
												]
											})
										]
									})
								})
							]
						}),
						activeTab === "akun" && /* @__PURE__ */ jsxs("div", {
							className: "p-5 space-y-5 flex-1 animate-in fade-in duration-150",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between pt-2",
									children: [/* @__PURE__ */ jsx("h2", {
										className: "font-bold text-base text-ink",
										children: "Akun Saya"
									}), /* @__PURE__ */ jsx("button", {
										className: "p-2 text-ink hover:bg-canvas rounded-full",
										children: /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" })
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center gap-4",
									children: [/* @__PURE__ */ jsx("img", {
										src: currentUser.avatarUrl,
										alt: currentUser.fullName,
										className: "w-14 h-14 rounded-full object-cover border-2 border-primary-200"
									}), /* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("h3", {
											className: "font-bold text-base text-ink",
											children: currentUser.fullName
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-ink-muted",
											children: currentUser.email
										}),
										/* @__PURE__ */ jsx("span", {
											className: "inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] font-bold rounded",
											children: currentUser.role
										})
									] })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-4 rounded-2xl bg-canvas border border-border space-y-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-xs font-bold text-ink",
										children: "Simulasi Peran Pengguna"
									}), /* @__PURE__ */ jsx("div", {
										className: "space-y-1.5",
										children: Object.entries(DEMO_USERS).map(([key, user]) => /* @__PURE__ */ jsxs("button", {
											onClick: () => setCurrentUser(user),
											className: `w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${currentUser.username === user.username ? "bg-primary-600 text-surface" : "bg-surface hover:bg-primary-50 text-ink border border-border"}`,
											children: [/* @__PURE__ */ jsxs("span", { children: [
												user.fullName,
												" (",
												user.role === "CHAIRMAN" ? "Ketua" : user.role === "TREASURER" ? "Bendahara" : `Warga ${user.propertyCode}`,
												")"
											] }), currentUser.username === user.username && /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" })]
										}, key))
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ jsxs("a", {
											href: "/admin",
											className: "w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors",
											children: [/* @__PURE__ */ jsx("span", { children: "Buka Dashboard Pengurus Komplek" }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted" })]
										}),
										/* @__PURE__ */ jsxs("a", {
											href: "/transparency",
											className: "w-full py-2.5 px-4 bg-surface hover:bg-canvas border border-border text-ink font-semibold text-xs rounded-xl flex items-center justify-between transition-colors",
											children: [/* @__PURE__ */ jsx("span", { children: "Buka Laporan Transparansi Warga" }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-ink-muted" })]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: async () => {
												await fetch("/api/auth/logout", { method: "POST" });
												window.location.href = "/login";
											},
											className: "w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs rounded-xl flex items-center justify-between transition-colors mt-2",
											children: [/* @__PURE__ */ jsx("span", { children: "Keluar dari Akun (Logout)" }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-red-500" })]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg",
							children: /* @__PURE__ */ jsxs("div", {
								className: "max-w-2xl mx-auto h-16 flex items-center justify-around px-2 select-none",
								children: [
									/* @__PURE__ */ jsxs("button", {
										onClick: () => setActiveTab("beranda"),
										className: `flex flex-col items-center gap-1 transition-colors ${activeTab === "beranda" ? "text-primary-600 font-bold" : "text-ink-muted hover:text-ink"}`,
										children: [/* @__PURE__ */ jsx(House, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
											className: "text-[10px]",
											children: "Beranda"
										})]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => setActiveTab("iuran"),
										className: `flex flex-col items-center gap-1 transition-colors ${activeTab === "iuran" ? "text-primary-600 font-bold" : "text-ink-muted hover:text-ink"}`,
										children: [/* @__PURE__ */ jsx(Receipt, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
											className: "text-[10px]",
											children: "Iuran"
										})]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => setActiveTab("info"),
										className: `flex flex-col items-center gap-1 transition-colors ${activeTab === "info" ? "text-primary-600 font-bold" : "text-ink-muted hover:text-ink"}`,
										children: [/* @__PURE__ */ jsx(Megaphone, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
											className: "text-[10px]",
											children: "Info"
										})]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => setActiveTab("rumah"),
										className: `flex flex-col items-center gap-1 transition-colors ${activeTab === "rumah" ? "text-primary-600 font-bold" : "text-ink-muted hover:text-ink"}`,
										children: [/* @__PURE__ */ jsx(House, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
											className: "text-[10px]",
											children: "Rumah"
										})]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => setActiveTab("akun"),
										className: `flex flex-col items-center gap-1 transition-colors ${activeTab === "akun" ? "text-primary-600 font-bold" : "text-ink-muted hover:text-ink"}`,
										children: [/* @__PURE__ */ jsx(User, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
											className: "text-[10px]",
											children: "Akun"
										})]
									})
								]
							})
						})
					]
				})
			}),
			showPaymentModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Konfirmasi Pembayaran Iuran"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowPaymentModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), paymentSuccess ? /* @__PURE__ */ jsxs("div", {
						className: "py-6 text-center space-y-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto",
								children: /* @__PURE__ */ jsx(Check, { className: "w-6 h-6 stroke-[3]" })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-bold text-sm text-ink",
								children: "Bukti Pembayaran Terkirim!"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: "Bendahara akan segera memverifikasi transaksi Anda."
							})
						]
					}) : /* @__PURE__ */ jsxs("form", {
						onSubmit: handleConfirmPayment,
						className: "space-y-3.5 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Rumah / Unit"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								disabled: true,
								value: `Rumah ${currentUser.propertyCode || "A-17"}`,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Jumlah Pembayaran"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								disabled: true,
								value: "Rp 750.000",
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Metode Transfer"
							}), /* @__PURE__ */ jsxs("select", {
								className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
								children: [
									/* @__PURE__ */ jsx("option", { children: "BCA Virtual Account / Transfer" }),
									/* @__PURE__ */ jsx("option", { children: "Mandiri Transfer" }),
									/* @__PURE__ */ jsx("option", { children: "QRIS WargaHub" })
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Unggah Bukti Transfer"
							}), /* @__PURE__ */ jsxs("div", {
								className: "p-4 border-2 border-dashed border-border hover:border-primary-500 rounded-xl text-center cursor-pointer bg-canvas/40",
								children: [/* @__PURE__ */ jsx(Upload, { className: "w-5 h-5 text-ink-muted mx-auto mb-1" }), /* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted",
									children: "Klik untuk pilih gambar bukti transfer"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowPaymentModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Kirim Bukti"
								})]
							})
						]
					})]
				})
			}),
			showComplaintModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Laporkan Aduan / Masalah Warga"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowComplaintModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), compSuccess ? /* @__PURE__ */ jsxs("div", {
						className: "py-6 text-center space-y-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto",
								children: /* @__PURE__ */ jsx(Check, { className: "w-6 h-6 stroke-[3]" })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-bold text-sm text-ink",
								children: "Laporan Berhasil Diajukan!"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: "Pengurus komplek & satpam akan segera menindaklanjuti."
							})
						]
					}) : /* @__PURE__ */ jsxs("form", {
						onSubmit: handleCreateComplaint,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Kategori Masalah"
							}), /* @__PURE__ */ jsxs("select", {
								value: compCategory,
								onChange: (e) => setCompCategory(e.target.value),
								className: "w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "FASILITAS",
										children: "Fasilitas Umum & PJU"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "KEBERSIHAN",
										children: "Kebersihan & Sampah"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "KETERTIBAN",
										children: "Ketertiban & Kebisingan"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "KEAMANAN",
										children: "Keamanan & Parkir Liar"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Judul Laporan"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Lampu jalan di depan rumah mati",
								value: compTitle,
								onChange: (e) => setCompTitle(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Lokasi Kejadian"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Depan Rumah A-17",
								value: compLocation,
								onChange: (e) => setCompLocation(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Deskripsi Detail"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 3,
								placeholder: "Jelaskan kendala yang dialami secara singkat...",
								value: compDesc,
								onChange: (e) => setCompDesc(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowComplaintModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Kirim Aduan"
								})]
							})
						]
					})]
				})
			}),
			showVehicleModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Daftarkan Kendaraan Baru"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowVehicleModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleCreateVehicle,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Jenis"
								}), /* @__PURE__ */ jsxs("select", {
									value: vehType,
									onChange: (e) => setVehType(e.target.value),
									className: "w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink",
									children: [/* @__PURE__ */ jsx("option", {
										value: "Mobil",
										children: "Mobil"
									}), /* @__PURE__ */ jsx("option", {
										value: "Motor",
										children: "Motor"
									})]
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Nomor Polisi (Plat)"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "B 1234 XYZ",
									value: vehPlate,
									onChange: (e) => setVehPlate(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Merk"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Toyota / Honda",
									value: vehBrand,
									onChange: (e) => setVehBrand(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Model / Tipe"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Innova / PCX",
									value: vehModel,
									onChange: (e) => setVehModel(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Warna Kendaraan"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Hitam Metalik / Putih",
								value: vehColor,
								onChange: (e) => setVehColor(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowVehicleModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Simpan Kendaraan"
								})]
							})
						]
					})]
				})
			}),
			showFacilityModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Pesan / Sewa Fasilitas Warga"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowFacilityModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), facSuccess ? /* @__PURE__ */ jsxs("div", {
						className: "py-6 text-center space-y-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto",
								children: /* @__PURE__ */ jsx(Check, { className: "w-6 h-6 stroke-[3]" })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-bold text-sm text-ink",
								children: "Permohonan Terkirim!"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: "Pengurus komplek akan segera memverifikasi ketersediaan jadwal sarana."
							})
						]
					}) : /* @__PURE__ */ jsxs("form", {
						onSubmit: handleBookFacility,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Pilih Sarana / Fasilitas"
							}), /* @__PURE__ */ jsxs("select", {
								value: facId,
								onChange: (e) => {
									setFacId(e.target.value);
									setFacName(e.target.options[e.target.selectedIndex].text);
								},
								className: "w-full p-2.5 bg-surface border border-border rounded-xl font-medium text-ink",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "fac-balai",
										children: "Balai Warga Serbaguna"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "fac-lapangan",
										children: "Lapangan Olahraga & Futsal"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "fac-taman",
										children: "Taman & Area Bermain Blok A"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Tanggal Pemakaian"
							}), /* @__PURE__ */ jsx("input", {
								type: "date",
								value: facDate,
								onChange: (e) => setFacDate(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Jam Mulai"
								}), /* @__PURE__ */ jsx("input", {
									type: "time",
									value: facStart,
									onChange: (e) => setFacStart(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Jam Selesai"
								}), /* @__PURE__ */ jsx("input", {
									type: "time",
									value: facEnd,
									onChange: (e) => setFacEnd(e.target.value),
									required: true,
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Keperluan / Nama Acara"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 2,
								placeholder: "Contoh: Arisan warga RT 02 / Latihan bulutangkis keluarga...",
								value: facPurpose,
								onChange: (e) => setFacPurpose(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "No. WhatsApp Pemohon"
							}), /* @__PURE__ */ jsx("input", {
								type: "tel",
								value: facPhone,
								onChange: (e) => setFacPhone(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowFacilityModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Ajukan Sewa"
								})]
							})
						]
					})]
				})
			}),
			showAddOccupantModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Tambah Anggota Keluarga / Penghuni"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowAddOccupantModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleAddOccupant,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Nama Lengkap Sesuai KTP"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Rian Santoso",
								value: newOccName,
								onChange: (e) => setNewOccName(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Hubungan Keluarga"
								}), /* @__PURE__ */ jsxs("select", {
									value: newOccRelation,
									onChange: (e) => setNewOccRelation(e.target.value),
									className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ANAK",
											children: "Anak"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "ISTRI",
											children: "Istri"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "ORANG_TUA",
											children: "Orang Tua / Mertua"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "ART_SUPIR",
											children: "ART / Supir"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "FAMILY",
											children: "Keluarga Lain"
										})
									]
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Nomor WhatsApp / HP"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "0812-xxxx-xxxx",
									value: newOccPhone,
									onChange: (e) => setNewOccPhone(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Nomor Induk Kependudukan (NIK)"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "16 Digit NIK",
								value: newOccIdCard,
								onChange: (e) => setNewOccIdCard(e.target.value),
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 pt-1",
								children: [/* @__PURE__ */ jsx("input", {
									type: "checkbox",
									id: "occEmergency",
									checked: newOccEmergency,
									onChange: (e) => setNewOccEmergency(e.target.checked),
									className: "rounded border-border text-primary-600 focus:ring-primary-500"
								}), /* @__PURE__ */ jsx("label", {
									htmlFor: "occEmergency",
									className: "text-xs text-ink font-medium cursor-pointer",
									children: "Jadikan Kontak Darurat Sekunder Rumah"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowAddOccupantModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Simpan Penghuni"
								})]
							})
						]
					})]
				})
			}),
			showAddPermitModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Pengajuan Izin Renovasi / Pekerja"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowAddPermitModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), permitSuccess ? /* @__PURE__ */ jsxs("div", {
						className: "py-6 text-center space-y-2",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto",
								children: /* @__PURE__ */ jsx(Check, { className: "w-6 h-6 stroke-[3]" })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-bold text-sm text-ink",
								children: "Izin Berhasil Diterbitkan!"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-ink-muted",
								children: "Petugas Pos Satpam Utama telah menerima notifikasi pekerja resmi."
							})
						]
					}) : /* @__PURE__ */ jsxs("form", {
						onSubmit: handleAddPermit,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Jenis Pekerjaan"
							}), /* @__PURE__ */ jsxs("select", {
								value: permitWorkType,
								onChange: (e) => setPermitWorkType(e.target.value),
								className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Pengecatan & Kanopi",
										children: "Pengecatan & Kanopi"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Renovasi Interior",
										children: "Renovasi Interior / Plafon"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Perbaikan Atap / Genteng",
										children: "Perbaikan Atap & Talang Air"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Instalasi Listrik / AC",
										children: "Instalasi Listrik & Pipa AC"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Pekerjaan Taman",
										children: "Pekerjaan Taman / Lansekap"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Nama Mandor / Penanggung Jawab"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Contoh: Bpk. Sugeng (CV Berkah)",
								value: permitContractor,
								onChange: (e) => setPermitContractor(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-3 gap-2",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-semibold text-ink block mb-1",
										children: "Jml Tukang"
									}), /* @__PURE__ */ jsx("input", {
										type: "number",
										min: "1",
										max: "10",
										value: permitWorkers,
										onChange: (e) => setPermitWorkers(Number(e.target.value)),
										className: "w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-semibold text-ink block mb-1",
										children: "Mulai"
									}), /* @__PURE__ */ jsx("input", {
										type: "date",
										value: permitStart,
										onChange: (e) => setPermitStart(e.target.value),
										className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-semibold text-ink block mb-1",
										children: "Selesai"
									}), /* @__PURE__ */ jsx("input", {
										type: "date",
										value: permitEnd,
										onChange: (e) => setPermitEnd(e.target.value),
										className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
									})] })
								]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "font-semibold text-ink block mb-1",
								children: "Deskripsi Ringkas Pekerjaan"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 2,
								placeholder: "Rincian bagian yang direnovasi...",
								value: permitDesc,
								onChange: (e) => setPermitDesc(e.target.value),
								required: true,
								className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowAddPermitModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Terbitkan Izin"
								})]
							})
						]
					})]
				})
			}),
			showEditSpecsModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-2xl max-w-sm w-full p-6 border border-border shadow-modal space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-ink",
							children: "Perbarui Data Teknis Rumah"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowEditSpecsModal(false),
							className: "text-ink-muted hover:text-ink",
							children: "✕"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleUpdateSpecs,
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Tipe Bangunan"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: buildingType,
									onChange: (e) => setBuildingType(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Status Hunian"
								}), /* @__PURE__ */ jsxs("select", {
									value: occupancyStatus,
									onChange: (e) => setOccupancyStatus(e.target.value),
									className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "Dihuni Pemilik",
											children: "Dihuni Pemilik"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "Disewa / Kontrak",
											children: "Disewa / Kontrak"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "Kosong / Renovasi",
											children: "Kosong / Renovasi"
										})
									]
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Luas Tanah (m²)"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									value: landArea,
									onChange: (e) => setLandArea(Number(e.target.value)),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Luas Bangunan (m²)"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									value: buildingArea,
									onChange: (e) => setBuildingArea(Number(e.target.value)),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "Daya Listrik PLN"
								}), /* @__PURE__ */ jsxs("select", {
									value: plnCapacity,
									onChange: (e) => setPlnCapacity(e.target.value),
									className: "w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-medium",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "1.300 VA",
											children: "1.300 VA"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "2.200 VA",
											children: "2.200 VA"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "3.500 VA",
											children: "3.500 VA"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "4.400 VA",
											children: "4.400 VA"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "5.500 VA",
											children: "5.500 VA"
										})
									]
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "font-semibold text-ink block mb-1",
									children: "No. Meteran PAM"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: pamMeterNo,
									onChange: (e) => setPamMeterNo(e.target.value),
									className: "w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowEditSpecsModal(false),
									className: "flex-1 py-2 rounded-xl border border-border text-ink font-semibold",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-surface font-semibold shadow-xs",
									children: "Simpan Perubahan"
								})]
							})
						]
					})]
				})
			}),
			selectedReceipt && /* @__PURE__ */ jsx(ReceiptModal, {
				isOpen: Boolean(selectedReceipt),
				onClose: () => setSelectedReceipt(null),
				data: selectedReceipt
			}),
			/* @__PURE__ */ jsx(VotingSectionModal, {
				isOpen: showVotingModal,
				onClose: () => setShowVotingModal(false),
				propertyCode: currentUser.propertyCode || "A-17",
				residentName: currentUser.fullName
			}),
			/* @__PURE__ */ jsx(WargaAIChatWidget, { currentPropertyCode: currentUser.propertyCode || "A-17" })
		]
	});
};
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>WargaHub - Portal Warga Taman Sejahtera</title><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#059669"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    <\/script>${renderHead($$result)}</head><body class="bg-canvas text-ink font-sans min-h-screen antialiased selection:bg-primary-100 selection:text-primary-900">${renderComponent($$result, "ResidentPortalView", ResidentPortalView, {
		"initialUser": DEMO_USERS.warga,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/portal/ResidentPortalView.tsx",
		"client:component-export": "ResidentPortalView"
	})}</body></html>`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/index.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
