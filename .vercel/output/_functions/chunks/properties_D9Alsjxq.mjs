import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate, x as createAstro } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { a as Building2, i as House, o as createLucideIcon } from "./global_DI05LtBp.mjs";
import { n as ChevronsLeft, r as ArrowUpDown, t as ChevronsRight } from "./chevrons-right_DZhI7ZvX.mjs";
import { d as Car, i as Users, n as X } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { a as Search, t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { n as ChevronLeft, t as TriangleAlert } from "./triangle-alert_B5tHnjPA.mjs";
import { t as ChevronRight } from "./chevron-right_BmEilkN-.mjs";
import { t as CircleCheckBig } from "./circle-check-big_CC1sim4d.mjs";
import { t as Download } from "./download_CxQuw9Is.mjs";
import { n as Droplets, t as Hammer } from "./hammer_CRunK_DL.mjs";
import { t as Eye } from "./eye_BwnvIS94.mjs";
import { n as PenLine, t as Trash2 } from "./trash-2_DsHxZaM2.mjs";
import { t as Plus } from "./plus_BFr6lPwe.mjs";
import { t as Printer } from "./printer_DTnpkCgr.mjs";
import { t as QrCode } from "./qr-code_CWniIOgo.mjs";
import { t as TrendingUp } from "./trending-up_CGf2hikw.mjs";
import { t as Zap } from "./zap_RtHdtdXj.mjs";
import { t as getProperties } from "./property.service_BWA2j2ar.mjs";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Gauge = createLucideIcon("Gauge", [["path", {
	d: "m12 14 4-4",
	key: "9kzdfg"
}], ["path", {
	d: "M3.34 19a10 10 0 1 1 17.32 0",
	key: "19p75a"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LayoutGrid = createLucideIcon("LayoutGrid", [
	["rect", {
		width: "7",
		height: "7",
		x: "3",
		y: "3",
		rx: "1",
		key: "1g98yp"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "14",
		y: "3",
		rx: "1",
		key: "6d4xhi"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "14",
		y: "14",
		rx: "1",
		key: "nxv5o0"
	}],
	["rect", {
		width: "7",
		height: "7",
		x: "3",
		y: "14",
		rx: "1",
		key: "1bb6yr"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Leaf = createLucideIcon("Leaf", [["path", {
	d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
	key: "nnexq3"
}], ["path", {
	d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
	key: "mt58a7"
}]]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var List = createLucideIcon("List", [
	["path", {
		d: "M3 12h.01",
		key: "nlz23k"
	}],
	["path", {
		d: "M3 18h.01",
		key: "1tta3j"
	}],
	["path", {
		d: "M3 6h.01",
		key: "1rqtza"
	}],
	["path", {
		d: "M8 12h13",
		key: "1za7za"
	}],
	["path", {
		d: "M8 18h13",
		key: "1lx6n3"
	}],
	["path", {
		d: "M8 6h13",
		key: "ik3vkj"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sun = createLucideIcon("Sun", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "4",
		key: "4exip2"
	}],
	["path", {
		d: "M12 2v2",
		key: "tus03m"
	}],
	["path", {
		d: "M12 20v2",
		key: "1lh1kg"
	}],
	["path", {
		d: "m4.93 4.93 1.41 1.41",
		key: "149t6j"
	}],
	["path", {
		d: "m17.66 17.66 1.41 1.41",
		key: "ptbguv"
	}],
	["path", {
		d: "M2 12h2",
		key: "1t8f8n"
	}],
	["path", {
		d: "M20 12h2",
		key: "1q8mjw"
	}],
	["path", {
		d: "m6.34 17.66-1.41 1.41",
		key: "1m8zz5"
	}],
	["path", {
		d: "m19.07 4.93-1.41 1.41",
		key: "1shlcs"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash = createLucideIcon("Trash", [
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
		key: "4alrt4"
	}],
	["path", {
		d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
		key: "v07s0e"
	}]
]);
/**
* @license lucide-react v0.475.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var UserPlus = createLucideIcon("UserPlus", [
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
	["line", {
		x1: "19",
		x2: "19",
		y1: "8",
		y2: "14",
		key: "1bvyxn"
	}],
	["line", {
		x1: "22",
		x2: "16",
		y1: "11",
		y2: "11",
		key: "1shjgl"
	}]
]);
//#endregion
//#region src/components/admin/PropertiesManager.tsx
var PropertiesManager = ({ initialProperties, initialTab = "units" }) => {
	const [activeSubTab, setActiveSubTab] = useState("units");
	const [viewMode, setViewMode] = useState("table");
	const [properties, setProperties] = useState(initialProperties);
	const [search, setSearch] = useState("");
	const [selectedBlock, setSelectedBlock] = useState("ALL");
	const [selectedStatus, setSelectedStatus] = useState("ALL");
	const [sortBy, setSortBy] = useState("code");
	const [sortOrder, setSortOrder] = useState("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingPropertyId, setEditingPropertyId] = useState(null);
	const [activeProperty, setActiveProperty] = useState(null);
	const [namingType, setNamingType] = useState("BLOK");
	const [formAreaName, setFormAreaName] = useState("Blok A");
	const [formCode, setFormCode] = useState("");
	const [formNumber, setFormNumber] = useState("");
	const [formAddress, setFormAddress] = useState("");
	const [formOccupancy, setFormOccupancy] = useState("OWNER_OCCUPIED");
	const [formOwner, setFormOwner] = useState("");
	const [formOwnerPhone, setFormOwnerPhone] = useState("");
	const [formOwnerNik, setFormOwnerNik] = useState("");
	const [formBuildingType, setFormBuildingType] = useState("Tipe 72/120");
	const [formLandArea, setFormLandArea] = useState(120);
	const [formBuildingArea, setFormBuildingArea] = useState(72);
	const [formPlnCapacity, setFormPlnCapacity] = useState("3.500 VA");
	const [formPamMeterNo, setFormPamMeterNo] = useState("PAM-88301");
	const [formMonthlyRate, setFormMonthlyRate] = useState(75e4);
	const [formHandoverDate, setFormHandoverDate] = useState("2024-01-15");
	const [formNotes, setFormNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState(null);
	const [deleteReason, setDeleteReason] = useState("Renovasi Penggabungan Unit / Koreksi Data");
	const [deleting, setDeleting] = useState(false);
	const [toastMessage, setToastMessage] = useState(null);
	const [residentCategory, setResidentCategory] = useState("ALL");
	const [residentSearch, setResidentSearch] = useState("");
	const [residentSortBy, setResidentSortBy] = useState("houseCode");
	const [residentSortOrder, setResidentSortOrder] = useState("asc");
	const [residentCurrentPage, setResidentCurrentPage] = useState(1);
	const [residentPageSize, setResidentPageSize] = useState(10);
	const [residents, setResidents] = useState([
		{
			id: "res-1",
			houseCode: "A-17",
			areaLabel: "Blok A",
			fullName: "Budi Santoso",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Jakarta, 12-03-1985",
			religion: "ISLAM",
			occupation: "Wiraswasta / IT Consultant",
			phone: "0812-3456-7890",
			email: "budi.santoso@wargahub.id",
			idCard: "3171091203850001",
			familyCard: "3171091203850000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "O",
			isEmergency: true,
			status: "VERIFIED",
			notes: "Kepala Keluarga"
		},
		{
			id: "res-2",
			houseCode: "A-17",
			areaLabel: "Blok A",
			fullName: "Siti Lestari",
			relation: "ISTRI",
			gender: "PEREMPUAN",
			birthPlaceDate: "Bandung, 25-07-1987",
			religion: "ISLAM",
			occupation: "Dokter Umum RSUD",
			phone: "0813-9876-5432",
			email: "siti.lestari@wargahub.id",
			idCard: "3171092507870002",
			familyCard: "3171091203850000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "A",
			isEmergency: true,
			status: "VERIFIED",
			notes: "Tenaga Medis Warga"
		},
		{
			id: "res-3",
			houseCode: "A-17",
			areaLabel: "Blok A",
			fullName: "Alya Santoso",
			relation: "ANAK",
			gender: "PEREMPUAN",
			birthPlaceDate: "Jakarta, 14-05-2013",
			religion: "ISLAM",
			occupation: "Pelajar SMP",
			phone: "-",
			email: "alya.santoso@wargahub.id",
			idCard: "3171091405130003",
			familyCard: "3171091203850000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "O",
			isEmergency: false,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-4",
			houseCode: "A-17",
			areaLabel: "Blok A",
			fullName: "Daffa Santoso",
			relation: "ANAK",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Jakarta, 03-09-2017",
			religion: "ISLAM",
			occupation: "Pelajar SD",
			phone: "-",
			email: "daffa.santoso@wargahub.id",
			idCard: "3171090309170004",
			familyCard: "3171091203850000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "A",
			isEmergency: false,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-5",
			houseCode: "A-01",
			areaLabel: "Blok A",
			fullName: "Hendra Gunawan",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Semarang, 01-01-1980",
			religion: "KRISTEN",
			occupation: "Eksekutif Perbankan",
			phone: "0811-2233-4455",
			email: "hendra.gunawan@wargahub.id",
			idCard: "3171090101800001",
			familyCard: "3171090101800000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "B",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-6",
			houseCode: "A-01",
			areaLabel: "Blok A",
			fullName: "Maria Gunawan",
			relation: "ISTRI",
			gender: "PEREMPUAN",
			birthPlaceDate: "Surabaya, 01-01-1982",
			religion: "KRISTEN",
			occupation: "Dosen Universitas",
			phone: "0811-2233-4456",
			email: "maria.gunawan@wargahub.id",
			idCard: "3171090101820002",
			familyCard: "3171090101800000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "AB",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-7",
			houseCode: "B-07",
			areaLabel: "Blok B",
			fullName: "Agus Wijaya",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Yogyakarta, 07-07-1975",
			religion: "ISLAM",
			occupation: "Arsitek / Konsultan Properti",
			phone: "0818-7788-9900",
			email: "agus.wijaya@wargahub.id",
			idCard: "3171090707750001",
			familyCard: "3171090707750000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "O",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-8",
			houseCode: "B-07",
			areaLabel: "Blok B",
			fullName: "Rina Wijaya",
			relation: "ISTRI",
			gender: "PEREMPUAN",
			birthPlaceDate: "Solo, 07-07-1978",
			religion: "ISLAM",
			occupation: "Akuntan Publik",
			phone: "0818-7788-9901",
			email: "rina.wijaya@wargahub.id",
			idCard: "3171090707780002",
			familyCard: "3171090707750000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "O",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-9",
			houseCode: "KAV-12",
			areaLabel: "Kav. 12",
			fullName: "Bambang Sutrisno",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Malang, 12-12-1968",
			religion: "ISLAM",
			occupation: "Pensiunan BUMN",
			phone: "0812-9988-1122",
			email: "bambang.sutrisno@wargahub.id",
			idCard: "3171091212680001",
			familyCard: "3171091212680000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "A",
			isEmergency: true,
			status: "VERIFIED",
			notes: "Warga Lansia Prioritas"
		},
		{
			id: "res-10",
			houseCode: "SW1-05",
			areaLabel: "Jl. Sariwangi Indah 1",
			fullName: "Dr. Ratna Kusuma",
			relation: "KEPALA_KELUARGA",
			gender: "PEREMPUAN",
			birthPlaceDate: "Denpasar, 05-05-1979",
			religion: "HINDU",
			occupation: "Dokter Spesialis Anak",
			phone: "0813-4455-6677",
			email: "ratna.kusuma@wargahub.id",
			idCard: "3171090505790001",
			familyCard: "3171090505790000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "B",
			isEmergency: true,
			status: "VERIFIED",
			notes: "Dokter Jaga Kompleks"
		},
		{
			id: "res-11",
			houseCode: "SW2-14",
			areaLabel: "Jl. Sariwangi Indah 2",
			fullName: "Suryo Pranoto",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Cirebon, 14-04-1981",
			religion: "ISLAM",
			occupation: "Manajer Logistik",
			phone: "0815-6677-8899",
			email: "suryo.pranoto@wargahub.id",
			idCard: "3171091414810001",
			familyCard: "3171091414810000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "AB",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-12",
			houseCode: "C-22",
			areaLabel: "Blok C",
			fullName: "Joko Widodo",
			relation: "KEPALA_KELUARGA",
			gender: "LAKI_LAKI",
			birthPlaceDate: "Surakarta, 22-02-1983",
			religion: "ISLAM",
			occupation: "Pengusaha Mebel",
			phone: "0819-0011-2233",
			email: "joko.widodo@wargahub.id",
			idCard: "3171092222830001",
			familyCard: "3171092222830000",
			domicileStatus: "KTP_SETEMPAT",
			bloodType: "O",
			isEmergency: true,
			status: "VERIFIED",
			notes: "-"
		},
		{
			id: "res-13",
			houseCode: "A-17",
			areaLabel: "Blok A",
			fullName: "Mbok Darmi",
			relation: "ART",
			gender: "PEREMPUAN",
			birthPlaceDate: "Kebumen, 10-10-1990",
			religion: "ISLAM",
			occupation: "Asisten Rumah Tangga",
			phone: "0857-1122-3344",
			email: "-",
			idCard: "3305091010900005",
			familyCard: "-",
			domicileStatus: "KTP_LUAR",
			bloodType: "B",
			isEmergency: false,
			status: "VERIFIED",
			notes: "Tinggal Dalam"
		}
	]);
	const [showResidentModal, setShowResidentModal] = useState(false);
	const [editingResidentId, setEditingResidentId] = useState(null);
	const [activeResidentView, setActiveResidentView] = useState(null);
	const [residentToDelete, setResidentToDelete] = useState(null);
	const [residentDeleteReason, setResidentDeleteReason] = useState("Pindah Domisili Keluar Komplek");
	const [resHouseCode, setResHouseCode] = useState("A-17");
	const [resAreaLabel, setResAreaLabel] = useState("Blok A");
	const [resFullName, setResFullName] = useState("");
	const [resRelation, setResRelation] = useState("KEPALA_KELUARGA");
	const [resGender, setResGender] = useState("LAKI_LAKI");
	const [resBirthPlaceDate, setResBirthPlaceDate] = useState("Jakarta, 12-03-1985");
	const [resReligion, setResReligion] = useState("ISLAM");
	const [resOccupation, setResOccupation] = useState("Karyawan Swasta");
	const [resPhone, setResPhone] = useState("");
	const [resEmail, setResEmail] = useState("");
	const [resIdCard, setResIdCard] = useState("");
	const [resFamilyCard, setResFamilyCard] = useState("");
	const [resDomicileStatus, setResDomicileStatus] = useState("KTP_SETEMPAT");
	const [resBloodType, setResBloodType] = useState("O");
	const [resIsEmergency, setResIsEmergency] = useState(false);
	const [resNotes, setResNotes] = useState("");
	const [resSaving, setResSaving] = useState(false);
	const [vehicleSearch, setVehicleSearch] = useState("");
	const [vehicleTypeFilter, setVehicleTypeFilter] = useState("ALL");
	const [vehicleRfidFilter, setVehicleRfidFilter] = useState("ALL");
	const [vehicleSortBy, setVehicleSortBy] = useState("plateNumber");
	const [vehicleSortOrder, setVehicleSortOrder] = useState("asc");
	const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);
	const [vehiclePageSize, setVehiclePageSize] = useState(10);
	const [vehicles, setVehicles] = useState([
		{
			id: "veh-1",
			houseCode: "A-17",
			areaLabel: "Blok A",
			ownerName: "Budi Santoso",
			plateNumber: "B 1234 ABC",
			type: "Mobil",
			brand: "Toyota",
			model: "Avanza Veloz",
			year: 2023,
			color: "Hitam Metalik",
			rfidTag: "RFID-8830192",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Parkir dalam garasi unit"
		},
		{
			id: "veh-2",
			houseCode: "A-17",
			areaLabel: "Blok A",
			ownerName: "Siti Lestari",
			plateNumber: "B 5678 DEF",
			type: "Motor",
			brand: "Honda",
			model: "Vario 160",
			year: 2024,
			color: "Putih Mutiara",
			rfidTag: "RFID-8830193",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Motor operasional dokter"
		},
		{
			id: "veh-3",
			houseCode: "A-01",
			areaLabel: "Blok A",
			ownerName: "Hendra Gunawan",
			plateNumber: "B 9999 HG",
			type: "Mobil",
			brand: "Honda",
			model: "CR-V Turbo",
			year: 2024,
			color: "Abu-Abu",
			rfidTag: "RFID-7720194",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Mobil dinas perbankan"
		},
		{
			id: "veh-4",
			houseCode: "B-07",
			areaLabel: "Blok B",
			ownerName: "Agus Wijaya",
			plateNumber: "B 8888 AW",
			type: "Mobil",
			brand: "Mitsubishi",
			model: "Pajero Sport",
			year: 2022,
			color: "Putih",
			rfidTag: "RFID-6610195",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-5",
			houseCode: "B-07",
			areaLabel: "Blok B",
			ownerName: "Rina Wijaya",
			plateNumber: "B 7777 WZ",
			type: "Motor",
			brand: "Yamaha",
			model: "NMAX 155",
			year: 2023,
			color: "Hitam Doff",
			rfidTag: "RFID-6610196",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-6",
			houseCode: "KAV-12",
			areaLabel: "Kav. 12",
			ownerName: "Bambang Sutrisno",
			plateNumber: "B 1111 BS",
			type: "Mobil",
			brand: "Toyota",
			model: "Innova Zenix Hybrid",
			year: 2024,
			color: "Silver Metalik",
			rfidTag: "RFID-5540197",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Prioritas akses gate"
		},
		{
			id: "veh-7",
			houseCode: "SW1-05",
			areaLabel: "Jl. Sariwangi Indah 1",
			ownerName: "Dr. Ratna Kusuma",
			plateNumber: "B 2222 RK",
			type: "Mobil",
			brand: "Hyundai",
			model: "IONIQ 5 EV",
			year: 2024,
			color: "Gravity Gold",
			rfidTag: "RFID-4430198",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Kendaraan listrik ramah lingkungan"
		},
		{
			id: "veh-8",
			houseCode: "SW2-14",
			areaLabel: "Jl. Sariwangi Indah 2",
			ownerName: "Suryo Pranoto",
			plateNumber: "B 3333 SP",
			type: "Mobil",
			brand: "Wuling",
			model: "Air EV Long Range",
			year: 2023,
			color: "Peach Pink",
			rfidTag: "RFID-3320199",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-9",
			houseCode: "C-22",
			areaLabel: "Blok C",
			ownerName: "Joko Widodo",
			plateNumber: "B 4444 JW",
			type: "Mobil",
			brand: "Toyota",
			model: "Fortuner GR Sport",
			year: 2023,
			color: "Hitam",
			rfidTag: "RFID-2210200",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-10",
			houseCode: "D-03",
			areaLabel: "Blok D",
			ownerName: "Rahmat Hidayat",
			plateNumber: "B 6677 RH",
			type: "Motor",
			brand: "Honda",
			model: "PCX 160",
			year: 2024,
			color: "Merah Doff",
			rfidTag: "RFID-1100201",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-11",
			houseCode: "D-19",
			areaLabel: "Blok D",
			ownerName: "Fajar Nugraha",
			plateNumber: "B 9876 FJ",
			type: "Mobil",
			brand: "Daihatsu",
			model: "Rocky 1.0T",
			year: 2023,
			color: "Kuning Metalik",
			rfidTag: "RFID-9980202",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "-"
		},
		{
			id: "veh-12",
			houseCode: "A-05",
			areaLabel: "Blok A",
			ownerName: "Eko Prasetyo",
			plateNumber: "B 7890 EK",
			type: "Sepeda Listrik",
			brand: "Uwinfly",
			model: "T3 Pro E-Bike",
			year: 2024,
			color: "Biru Pastel",
			rfidTag: "RFID-8870203",
			gateAccess: "SEMUA_GERBANG",
			rfidStatus: "AKTIF",
			notes: "Lane khusus jalur sepeda"
		}
	]);
	const [showVehicleModal, setShowVehicleModal] = useState(false);
	const [editingVehicleId, setEditingVehicleId] = useState(null);
	const [activeVehicleView, setActiveVehicleView] = useState(null);
	const [vehicleToDelete, setVehicleToDelete] = useState(null);
	const [vehicleDeleteReason, setVehicleDeleteReason] = useState("Kendaraan Dijual / Diganti");
	const [vehHouseCode, setVehHouseCode] = useState("A-17");
	const [vehAreaLabel, setVehAreaLabel] = useState("Blok A");
	const [vehOwnerName, setVehOwnerName] = useState("Budi Santoso");
	const [vehPlateNumber, setVehPlateNumber] = useState("");
	const [vehType, setVehType] = useState("Mobil");
	const [vehBrand, setVehBrand] = useState("Toyota");
	const [vehModel, setVehModel] = useState("");
	const [vehYear, setVehYear] = useState(2024);
	const [vehColor, setVehColor] = useState("Hitam Metalik");
	const [vehRfidTag, setVehRfidTag] = useState("");
	const [vehGateAccess, setVehGateAccess] = useState("SEMUA_GERBANG");
	const [vehRfidStatus, setVehRfidStatus] = useState("AKTIF");
	const [vehNotes, setVehNotes] = useState("");
	const [vehSaving, setVehSaving] = useState(false);
	const [selectedPassVehicle, setSelectedPassVehicle] = useState(null);
	const [permitSearch, setPermitSearch] = useState("");
	const [permitStatusFilter, setPermitStatusFilter] = useState("ALL");
	const [permitTypeFilter, setPermitTypeFilter] = useState("ALL");
	const [permitSortBy, setPermitSortBy] = useState("startDate");
	const [permitSortOrder, setPermitSortOrder] = useState("desc");
	const [permitCurrentPage, setPermitCurrentPage] = useState(1);
	const [permitPageSize, setPermitPageSize] = useState(10);
	const [permits, setPermits] = useState([
		{
			id: "PERMIT-2026-001",
			houseCode: "A-17",
			areaLabel: "Blok A",
			ownerName: "Budi Santoso",
			workType: "Pengecatan & Kanopi",
			contractorName: "Bpk. Sugeng (CV Berkah)",
			contractorPhone: "0812-3344-5566",
			workersCount: 3,
			workersList: "1. Sugeng (Mandor), 2. Slamet (Tukang Cat), 3. Joko (Las Kanopi)",
			startDate: "2026-08-25",
			endDate: "2026-09-05",
			allowedHours: "08:00 - 17:00 WIB (Senin - Sabtu)",
			depositStatus: "SUDAH_SETOR",
			depositAmount: 2e6,
			status: "APPROVED",
			description: "Pengecatan fasad luar dan perbaikan talang air kanopi garasi."
		},
		{
			id: "PERMIT-2026-002",
			houseCode: "SW1-12",
			areaLabel: "Jl. Sariwangi Indah 1",
			ownerName: "Ibu Ratna",
			workType: "Renovasi Interior & Dapur",
			contractorName: "Bpk. Yanto (Mandor Sejahtera)",
			contractorPhone: "0813-8877-6655",
			workersCount: 4,
			workersList: "1. Yanto, 2. Agus, 3. Maman, 4. Dedi",
			startDate: "2026-08-20",
			endDate: "2026-09-15",
			allowedHours: "08:00 - 17:00 WIB (Senin - Sabtu)",
			depositStatus: "SUDAH_SETOR",
			depositAmount: 3e6,
			status: "APPROVED",
			description: "Pemasangan keramik dinding dapur dan penutupan dak jemuran belakang."
		},
		{
			id: "PERMIT-2026-003",
			houseCode: "KAV-05",
			areaLabel: "Kav. 05",
			ownerName: "Bpk. Hendra Gunawan",
			workType: "Perbaikan Atap & Dak Bocor",
			contractorName: "Bpk. Maman Jaya",
			contractorPhone: "0815-1122-3344",
			workersCount: 2,
			workersList: "1. Maman, 2. Ujang",
			startDate: "2026-08-28",
			endDate: "2026-09-02",
			allowedHours: "08:00 - 17:00 WIB (Senin - Sabtu)",
			depositStatus: "BELUM_SETOR",
			depositAmount: 1e6,
			status: "PENDING_REVIEW",
			description: "Pergantian 15 genteng pecah di atap lantai 2 dan waterproofing talang."
		},
		{
			id: "PERMIT-2026-004",
			houseCode: "D-19",
			areaLabel: "Blok D",
			ownerName: "Bpk. Suryo Pranoto",
			workType: "Pemasangan Solar Panel",
			contractorName: "PT Surya Nusantara Mandiri",
			contractorPhone: "0811-9988-7766",
			workersCount: 5,
			workersList: "1. Ir. Doni (Engineer), 2. Rudi, 3. Budi, 4. Tono, 5. Hendro",
			startDate: "2026-08-15",
			endDate: "2026-08-27",
			allowedHours: "08:00 - 17:00 WIB (Senin - Sabtu)",
			depositStatus: "DIKEMBALIKAN",
			depositAmount: 25e5,
			status: "COMPLETED",
			description: "Pemasangan 8 unit panel surya on-grid di atas dak genteng rumah."
		},
		{
			id: "PERMIT-2026-005",
			houseCode: "B-04",
			areaLabel: "Blok B",
			ownerName: "Bpk. Agus Wijaya",
			workType: "Pembangunan Tingkat / Ekstensi",
			contractorName: "CV Bangun Prima Mandiri",
			contractorPhone: "0818-4455-6677",
			workersCount: 6,
			workersList: "1. Mandor Joko, 2. Aris, 3. Bayu, 4. Wahyu, 5. Koko, 6. Dani",
			startDate: "2026-08-10",
			endDate: "2026-10-10",
			allowedHours: "08:00 - 17:00 WIB (Senin - Sabtu)",
			depositStatus: "SUDAH_SETOR",
			depositAmount: 5e6,
			status: "SUSPENDED",
			description: "Penambahan kamar tidur lantai 2. Dihentikan sementara karena material menutupi jalan warga."
		}
	]);
	const [showAddPermitModal, setShowAddPermitModal] = useState(false);
	const [editingPermitId, setEditingPermitId] = useState(null);
	const [activePermitView, setActivePermitView] = useState(null);
	const [selectedPrintPermit, setSelectedPrintPermit] = useState(null);
	const [permitToDelete, setPermitToDelete] = useState(null);
	const [permitDeleteReason, setPermitDeleteReason] = useState("Renovasi Batal Dilaksanakan");
	const [pCode, setPCode] = useState("A-17");
	const [pAreaLabel, setPAreaLabel] = useState("Blok A");
	const [pOwnerName, setPOwnerName] = useState("Budi Santoso");
	const [pType, setPType] = useState("Pengecatan & Kanopi");
	const [pContractor, setPContractor] = useState("");
	const [pContractorPhone, setPContractorPhone] = useState("0812-3344-5566");
	const [pWorkers, setPWorkers] = useState(3);
	const [pWorkersList, setPWorkersList] = useState("");
	const [pStart, setPStart] = useState("2026-09-01");
	const [pEnd, setPEnd] = useState("2026-09-10");
	const [pAllowedHours, setPAllowedHours] = useState("08:00 - 17:00 WIB (Senin - Sabtu)");
	const [pDepositStatus, setPDepositStatus] = useState("SUDAH_SETOR");
	const [pDepositAmount, setPDepositAmount] = useState(2e6);
	const [pStatus, setPStatus] = useState("APPROVED");
	const [pDesc, setPDesc] = useState("");
	const [permitSaving, setPermitSaving] = useState(false);
	const [utilitySearch, setUtilitySearch] = useState("");
	const [utilityPlnFilter, setUtilityPlnFilter] = useState("ALL");
	const [utilityPaymentFilter, setUtilityPaymentFilter] = useState("ALL");
	const [utilitySortBy, setUtilitySortBy] = useState("houseCode");
	const [utilitySortOrder, setUtilitySortOrder] = useState("asc");
	const [utilityCurrentPage, setUtilityCurrentPage] = useState(1);
	const [utilityPageSize, setUtilityPageSize] = useState(10);
	const [utilities, setUtilities] = useState([
		{
			id: "UTIL-A-17",
			houseCode: "A-17",
			areaLabel: "Blok A",
			ownerName: "Budi Santoso",
			plnCapacity: "3.500 VA",
			plnCustomerId: "PLN-5388123490",
			pamMeterNo: "PAM-88301",
			pamReadingLastMonth: 124,
			pamReadingThisMonth: 142,
			pamUsage: 18,
			monthlyIplFee: 75e4,
			wasteSchedule: "SENIN_RABU_JUMAT",
			hasBiopori: true,
			hasSolarPanel: false,
			paymentStatus: "LUNAS",
			notes: "Meter air baru dikalibrasi"
		},
		{
			id: "UTIL-A-01",
			houseCode: "A-01",
			areaLabel: "Blok A",
			ownerName: "Hendra Gunawan",
			plnCapacity: "5.500 VA",
			plnCustomerId: "PLN-5388123491",
			pamMeterNo: "PAM-88302",
			pamReadingLastMonth: 150,
			pamReadingThisMonth: 174,
			pamUsage: 24,
			monthlyIplFee: 85e4,
			wasteSchedule: "SENIN_RABU_JUMAT",
			hasBiopori: true,
			hasSolarPanel: true,
			paymentStatus: "LUNAS",
			notes: "Solar panel on-grid 3 kWp"
		},
		{
			id: "UTIL-B-07",
			houseCode: "B-07",
			areaLabel: "Blok B",
			ownerName: "Agus Wijaya",
			plnCapacity: "3.500 VA",
			plnCustomerId: "PLN-5388123492",
			pamMeterNo: "PAM-88303",
			pamReadingLastMonth: 98,
			pamReadingThisMonth: 114,
			pamUsage: 16,
			monthlyIplFee: 75e4,
			wasteSchedule: "SELASA_KAMIS_SABTU",
			hasBiopori: true,
			hasSolarPanel: false,
			paymentStatus: "LUNAS",
			notes: "-"
		},
		{
			id: "UTIL-KAV-12",
			houseCode: "KAV-12",
			areaLabel: "Kav. 12",
			ownerName: "Bambang Sutrisno",
			plnCapacity: "4.400 VA",
			plnCustomerId: "PLN-5388123493",
			pamMeterNo: "PAM-88304",
			pamReadingLastMonth: 110,
			pamReadingThisMonth: 125,
			pamUsage: 15,
			monthlyIplFee: 8e5,
			wasteSchedule: "SENIN_RABU_JUMAT",
			hasBiopori: true,
			hasSolarPanel: false,
			paymentStatus: "LUNAS",
			notes: "Rumah kavling sudut"
		},
		{
			id: "UTIL-SW1-05",
			houseCode: "SW1-05",
			areaLabel: "Jl. Sariwangi Indah 1",
			ownerName: "Dr. Ratna Kusuma",
			plnCapacity: "5.500 VA",
			plnCustomerId: "PLN-5388123494",
			pamMeterNo: "PAM-88305",
			pamReadingLastMonth: 135,
			pamReadingThisMonth: 156,
			pamUsage: 21,
			monthlyIplFee: 85e4,
			wasteSchedule: "SENIN_RABU_JUMAT",
			hasBiopori: true,
			hasSolarPanel: true,
			paymentStatus: "LUNAS",
			notes: "Dilengkapi wall charging EV"
		},
		{
			id: "UTIL-SW2-14",
			houseCode: "SW2-14",
			areaLabel: "Jl. Sariwangi Indah 2",
			ownerName: "Suryo Pranoto",
			plnCapacity: "2.200 VA",
			plnCustomerId: "PLN-5388123495",
			pamMeterNo: "PAM-88306",
			pamReadingLastMonth: 82,
			pamReadingThisMonth: 95,
			pamUsage: 13,
			monthlyIplFee: 7e5,
			wasteSchedule: "SELASA_KAMIS_SABTU",
			hasBiopori: false,
			hasSolarPanel: false,
			paymentStatus: "MENUNGGU_BAYAR",
			notes: "Tagihan bulan berjalan"
		},
		{
			id: "UTIL-C-22",
			houseCode: "C-22",
			areaLabel: "Blok C",
			ownerName: "Joko Widodo",
			plnCapacity: "3.500 VA",
			plnCustomerId: "PLN-5388123496",
			pamMeterNo: "PAM-88307",
			pamReadingLastMonth: 105,
			pamReadingThisMonth: 122,
			pamUsage: 17,
			monthlyIplFee: 75e4,
			wasteSchedule: "SELASA_KAMIS_SABTU",
			hasBiopori: true,
			hasSolarPanel: false,
			paymentStatus: "LUNAS",
			notes: "-"
		},
		{
			id: "UTIL-D-03",
			houseCode: "D-03",
			areaLabel: "Blok D",
			ownerName: "Rahmat Hidayat",
			plnCapacity: "2.200 VA",
			plnCustomerId: "PLN-5388123497",
			pamMeterNo: "PAM-88308",
			pamReadingLastMonth: 78,
			pamReadingThisMonth: 90,
			pamUsage: 12,
			monthlyIplFee: 7e5,
			wasteSchedule: "SETIAP_HARI",
			hasBiopori: true,
			hasSolarPanel: false,
			paymentStatus: "LUNAS",
			notes: "-"
		},
		{
			id: "UTIL-D-19",
			houseCode: "D-19",
			areaLabel: "Blok D",
			ownerName: "Fajar Nugraha",
			plnCapacity: "3.500 VA",
			plnCustomerId: "PLN-5388123498",
			pamMeterNo: "PAM-88309",
			pamReadingLastMonth: 140,
			pamReadingThisMonth: 168,
			pamUsage: 28,
			monthlyIplFee: 75e4,
			wasteSchedule: "SENIN_RABU_JUMAT",
			hasBiopori: true,
			hasSolarPanel: true,
			paymentStatus: "LUNAS",
			notes: "Baru pasang solar panel"
		},
		{
			id: "UTIL-B-04",
			houseCode: "B-04",
			areaLabel: "Blok B",
			ownerName: "Keluarga Wijaya",
			plnCapacity: "4.400 VA",
			plnCustomerId: "PLN-5388123499",
			pamMeterNo: "PAM-88310",
			pamReadingLastMonth: 160,
			pamReadingThisMonth: 195,
			pamUsage: 35,
			monthlyIplFee: 8e5,
			wasteSchedule: "SETIAP_HARI",
			hasBiopori: false,
			hasSolarPanel: false,
			paymentStatus: "MENUNGGAK",
			notes: "Sedang renovasi tingkat"
		}
	]);
	const [showUtilityModal, setShowUtilityModal] = useState(false);
	const [editingUtilityId, setEditingUtilityId] = useState(null);
	const [activeUtilityView, setActiveUtilityView] = useState(null);
	const [utilityToDelete, setUtilityToDelete] = useState(null);
	const [utilityDeleteReason, setUtilityDeleteReason] = useState("Meteran Diganti Baru / Dikalibrasi Ulang");
	const [uCode, setUCode] = useState("A-17");
	const [uAreaLabel, setUAreaLabel] = useState("Blok A");
	const [uOwnerName, setUOwnerName] = useState("Budi Santoso");
	const [uPlnCapacity, setUPlnCapacity] = useState("3.500 VA");
	const [uPlnCustomerId, setUPlnCustomerId] = useState("PLN-5388123490");
	const [uPamMeterNo, setUPamMeterNo] = useState("PAM-88301");
	const [uPamLastMonth, setUPamLastMonth] = useState(124);
	const [uPamThisMonth, setUPamThisMonth] = useState(142);
	const [uMonthlyIplFee, setUMonthlyIplFee] = useState(75e4);
	const [uWasteSchedule, setUWasteSchedule] = useState("SENIN_RABU_JUMAT");
	const [uHasBiopori, setUHasBiopori] = useState(true);
	const [uHasSolarPanel, setUHasSolarPanel] = useState(false);
	const [uPaymentStatus, setUPaymentStatus] = useState("LUNAS");
	const [uNotes, setUNotes] = useState("");
	const [utilitySaving, setUtilitySaving] = useState(false);
	const handleOpenAddUtility = () => {
		setEditingUtilityId(null);
		setUCode(properties[0]?.code || "A-17");
		setUAreaLabel("Blok A");
		setUOwnerName(properties[0]?.ownerName || "Budi Santoso");
		setUPlnCapacity("3.500 VA");
		setUPlnCustomerId(`PLN-5388${Math.floor(1e5 + Math.random() * 9e5)}`);
		setUPamMeterNo("PAM-88301");
		setUPamLastMonth(120);
		setUPamThisMonth(138);
		setUMonthlyIplFee(75e4);
		setUWasteSchedule("SENIN_RABU_JUMAT");
		setUHasBiopori(true);
		setUHasSolarPanel(false);
		setUPaymentStatus("LUNAS");
		setUNotes("");
		setShowUtilityModal(true);
	};
	const handleOpenEditUtility = (u) => {
		setEditingUtilityId(u.id);
		setUCode(u.houseCode);
		setUAreaLabel(u.areaLabel);
		setUOwnerName(u.ownerName);
		setUPlnCapacity(u.plnCapacity);
		setUPlnCustomerId(u.plnCustomerId);
		setUPamMeterNo(u.pamMeterNo);
		setUPamLastMonth(u.pamReadingLastMonth);
		setUPamThisMonth(u.pamReadingThisMonth);
		setUMonthlyIplFee(u.monthlyIplFee);
		setUWasteSchedule(u.wasteSchedule);
		setUHasBiopori(Boolean(u.hasBiopori));
		setUHasSolarPanel(Boolean(u.hasSolarPanel));
		setUPaymentStatus(u.paymentStatus);
		setUNotes(u.notes || "");
		setShowUtilityModal(true);
	};
	const handleSaveUtility = async (e) => {
		e.preventDefault();
		setUtilitySaving(true);
		try {
			const payload = {
				propertyId: `prop-${uCode.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
				houseCode: uCode.toUpperCase(),
				areaLabel: uAreaLabel,
				ownerName: uOwnerName,
				plnCapacity: uPlnCapacity,
				plnCustomerId: uPlnCustomerId,
				pamMeterNo: uPamMeterNo,
				pamReadingLastMonth: Number(uPamLastMonth),
				pamReadingThisMonth: Number(uPamThisMonth),
				monthlyIplFee: Number(uMonthlyIplFee),
				wasteSchedule: uWasteSchedule,
				hasBiopori: uHasBiopori,
				hasSolarPanel: uHasSolarPanel,
				paymentStatus: uPaymentStatus,
				notes: uNotes || void 0
			};
			if ((await fetch("/api/properties/utilities/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			})).ok) {
				const pamUsage = Math.max(0, Number(uPamThisMonth) - Number(uPamLastMonth));
				if (editingUtilityId) {
					setUtilities(utilities.map((item) => item.id === editingUtilityId ? {
						...item,
						...payload,
						pamUsage
					} : item));
					showToast(`Data utilitas ${uCode} berhasil diperbarui.`);
				} else {
					const newUtil = {
						id: `UTIL-${uCode.toUpperCase()}`,
						...payload,
						pamUsage
					};
					setUtilities([newUtil, ...utilities]);
					showToast(`Catatan utilitas ${uCode} berhasil ditambahkan.`);
				}
				setShowUtilityModal(false);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menyimpan catatan utilitas.");
		} finally {
			setUtilitySaving(false);
		}
	};
	const handleConfirmDeleteUtility = async () => {
		if (!utilityToDelete) return;
		try {
			if ((await fetch("/api/properties/utilities/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					utilityId: utilityToDelete.id,
					houseCode: utilityToDelete.houseCode,
					reason: utilityDeleteReason
				})
			})).ok) {
				setUtilities(utilities.filter((u) => u.id !== utilityToDelete.id));
				showToast(`Catatan utilitas ${utilityToDelete.houseCode} berhasil direset/dihapus.`);
				setUtilityToDelete(null);
				if (activeUtilityView?.id === utilityToDelete.id) setActiveUtilityView(null);
			}
		} catch (err) {
			console.error(err);
			showToast("Gagal menghapus data utilitas.");
		}
	};
	const filteredAndSortedUtilities = useMemo(() => {
		const list = utilities.filter((u) => {
			const matchSearch = u.houseCode.toLowerCase().includes(utilitySearch.toLowerCase()) || u.ownerName.toLowerCase().includes(utilitySearch.toLowerCase()) || u.pamMeterNo.toLowerCase().includes(utilitySearch.toLowerCase()) || u.plnCustomerId.toLowerCase().includes(utilitySearch.toLowerCase());
			const matchPln = utilityPlnFilter === "ALL" || u.plnCapacity === utilityPlnFilter;
			const matchPayment = utilityPaymentFilter === "ALL" || u.paymentStatus === utilityPaymentFilter;
			return matchSearch && matchPln && matchPayment;
		});
		list.sort((a, b) => {
			let comparison = 0;
			if (utilitySortBy === "houseCode") comparison = a.houseCode.localeCompare(b.houseCode, void 0, { numeric: true });
			else if (utilitySortBy === "plnCapacity") comparison = a.plnCapacity.localeCompare(b.plnCapacity);
			else if (utilitySortBy === "pamUsage") comparison = a.pamUsage - b.pamUsage;
			else if (utilitySortBy === "monthlyIplFee") comparison = a.monthlyIplFee - b.monthlyIplFee;
			else if (utilitySortBy === "paymentStatus") comparison = a.paymentStatus.localeCompare(b.paymentStatus);
			return utilitySortOrder === "asc" ? comparison : -comparison;
		});
		return list;
	}, [
		utilities,
		utilitySearch,
		utilityPlnFilter,
		utilityPaymentFilter,
		utilitySortBy,
		utilitySortOrder
	]);
	const totalUtilities = filteredAndSortedUtilities.length;
	const totalUtilityPages = Math.max(1, Math.ceil(totalUtilities / utilityPageSize));
	const safeUtilityPage = Math.min(utilityCurrentPage, totalUtilityPages);
	const utilStartIndex = (safeUtilityPage - 1) * utilityPageSize;
	const utilEndIndex = Math.min(utilStartIndex + utilityPageSize, totalUtilities);
	const paginatedUtilities = filteredAndSortedUtilities.slice(utilStartIndex, utilEndIndex);
	const handleExportUtilitiesCSV = () => {
		const headers = [
			"No Unit",
			"Wilayah",
			"Pemilik / Penghuni",
			"Daya PLN",
			"ID Pelanggan PLN",
			"No Meter PAM",
			"Meter Lalu (m³)",
			"Meter Ini (m³)",
			"Pemakaian Air (m³)",
			"Tarif IPL (Rp)",
			"Jadwal Sampah",
			"Biopori",
			"Solar Panel",
			"Status Bayar",
			"Catatan"
		];
		const rows = utilities.map((u) => [
			u.houseCode,
			`"${u.areaLabel}"`,
			`"${u.ownerName}"`,
			u.plnCapacity,
			u.plnCustomerId,
			u.pamMeterNo,
			u.pamReadingLastMonth,
			u.pamReadingThisMonth,
			u.pamUsage,
			u.monthlyIplFee,
			u.wasteSchedule,
			u.hasBiopori ? "ADA" : "TIDAK",
			u.hasSolarPanel ? "TERPASANG" : "TIDAK",
			u.paymentStatus,
			`"${u.notes || "-"}"`
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `LAPORAN_OKUPANSI_DAN_UTILITAS_WARGAHUB_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Laporan okupansi & meteran utilitas berhasil diekspor ke CSV.");
	};
	const handleExportPropertiesCSV = () => {
		const headers = [
			"Kode Unit",
			"Nomor",
			"Blok / Kav / Jalan",
			"Alamat Lengkap",
			"Status Hunian",
			"Nama Pemilik / Penghuni",
			"Jumlah Penghuni",
			"Jumlah Kendaraan"
		];
		const rows = properties.map((p) => [
			p.code,
			p.number,
			p.code.startsWith("KAV") ? "Kavling" : p.code.startsWith("SW") ? "Jl. Sariwangi Indah" : `Blok ${p.blockCode}`,
			`"${p.address}"`,
			p.occupancyStatus,
			`"${p.ownerName || "-"}"`,
			p.residentCount,
			p.vehicleCount
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `DATA_RUMAH_KAV_JALAN_WARGAHUB_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Data master rumah/kavling berhasil diekspor ke CSV.");
	};
	const handleExportResidentsCSV = () => {
		const headers = [
			"No Unit",
			"Wilayah / Jalan",
			"Nama Lengkap",
			"Hubungan Keluarga",
			"Gender",
			"TTL",
			"Agama",
			"Pekerjaan",
			"No KTP/NIK",
			"No KK",
			"No WhatsApp",
			"Email",
			"Gol Darah",
			"Status KTP",
			"Kontak Darurat"
		];
		const rows = residents.map((r) => [
			r.houseCode,
			`"${r.areaLabel}"`,
			`"${r.fullName}"`,
			r.relation,
			r.gender,
			`"${r.birthPlaceDate}"`,
			r.religion,
			`"${r.occupation}"`,
			`'${r.idCard}`,
			`'${r.familyCard}`,
			r.phone,
			r.email,
			r.bloodType,
			r.domicileStatus,
			r.isEmergency ? "YA" : "TIDAK"
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `DATABASE_SENSUS_KEPENDUDUKAN_WARGAHUB_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Database sensus kependudukan lengkap berhasil diekspor ke CSV.");
	};
	const handleExportVehiclesCSV = () => {
		const headers = [
			"No Plat",
			"No Unit",
			"Wilayah",
			"Pemilik / Pengemudi",
			"Jenis",
			"Merk",
			"Model / Tipe",
			"Tahun",
			"Warna",
			"Serial RFID",
			"Hak Akses Gerbang",
			"Status Akses RFID",
			"Catatan Parkir"
		];
		const rows = vehicles.map((v) => [
			v.plateNumber,
			v.houseCode,
			`"${v.areaLabel}"`,
			`"${v.ownerName}"`,
			v.type,
			v.brand,
			`"${v.model}"`,
			v.year,
			`"${v.color}"`,
			v.rfidTag,
			v.gateAccess,
			v.rfidStatus,
			`"${v.notes || "-"}"`
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `MASTER_KENDARAAN_DAN_RFID_WARGAHUB_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Master kendaraan & tag RFID berhasil diekspor ke CSV.");
	};
	const handleExportPermitsCSV = () => {
		const headers = [
			"ID Izin",
			"No Unit",
			"Wilayah",
			"Jenis Renovasi",
			"Mandor / Kontraktor",
			"No WA Mandor",
			"Jumlah Tukang",
			"Masa Mulai",
			"Masa Selesai",
			"Jam Kerja",
			"Status Jaminan Deposit",
			"Nominal Deposit (Rp)",
			"Status Izin",
			"Rincian Pekerjaan"
		];
		const rows = permits.map((p) => [
			p.id,
			p.houseCode,
			`"${p.areaLabel}"`,
			`"${p.workType}"`,
			`"${p.contractorName}"`,
			p.contractorPhone,
			p.workersCount,
			p.startDate,
			p.endDate,
			`"${p.allowedHours}"`,
			p.depositStatus,
			p.depositAmount,
			p.status,
			`"${p.description}"`
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `LAPORAN_IZIN_RENOVASI_WARGAHUB_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast("Laporan izin renovasi & pekerja bangunan berhasil diekspor ke CSV.");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			toastMessage && /* @__PURE__ */ jsxs("div", {
				className: "fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3",
				children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-4 h-4 text-emerald-200" }), /* @__PURE__ */ jsx("span", { children: toastMessage })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-2xl font-black tracking-tight text-ink",
						children: "Tata Kelola Rumah & Warga"
					}), /* @__PURE__ */ jsx("span", {
						className: "px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200",
						children: activeSubTab === "analytics" ? `${utilities.length} Unit Utilitas` : activeSubTab === "permits" ? `${permits.length} Izin Renovasi` : activeSubTab === "vehicles" ? `${vehicles.length} Kendaraan Terdaftar` : activeSubTab === "residents" ? `${residents.length} Jiwa Sensus` : `${properties.length} Unit Terdaftar`
					})]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-xs text-ink-muted mt-1",
					children: [
						"Master unit hunian komplek (Mendukung sistem ",
						/* @__PURE__ */ jsx("strong", { children: "Blok" }),
						", ",
						/* @__PURE__ */ jsx("strong", { children: "Kavling (Kav.)" }),
						", maupun ",
						/* @__PURE__ */ jsx("strong", { children: "Per Jalan / Cluster" }),
						" seperti Sariwangi Indah 1, 2, dst)."
					]
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: activeSubTab === "analytics" ? handleExportUtilitiesCSV : activeSubTab === "permits" ? handleExportPermitsCSV : activeSubTab === "vehicles" ? handleExportVehiclesCSV : activeSubTab === "residents" ? handleExportResidentsCSV : handleExportPropertiesCSV,
						className: "inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-ink-muted" }), activeSubTab === "analytics" ? "Ekspor Utilitas (CSV)" : activeSubTab === "permits" ? "Ekspor Izin (CSV)" : activeSubTab === "vehicles" ? "Ekspor Kendaraan (CSV)" : activeSubTab === "residents" ? "Ekspor Sensus (CSV)" : "Ekspor CSV"]
					}), activeSubTab === "analytics" ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenAddUtility,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Input Meteran Utilitas"]
					}) : activeSubTab === "permits" ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenAddPermit,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Terbitkan Izin Baru"]
					}) : activeSubTab === "vehicles" ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenAddVehicle,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Daftarkan Kendaraan & RFID"]
					}) : activeSubTab === "residents" ? /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenAddResident,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }), "Tambah Data Penghuni"]
					}) : /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleOpenAdd,
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), "Tambah Unit Rumah / Kavling"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar",
				children: [
					{
						id: "units",
						label: "Direktori Rumah & Kavling",
						icon: House,
						count: properties.length
					},
					{
						id: "residents",
						label: "Database Kependudukan & Penghuni",
						icon: Users,
						count: residents.length
					},
					{
						id: "vehicles",
						label: "Master Kendaraan & RFID",
						icon: Car,
						count: vehicles.length
					},
					{
						id: "permits",
						label: "Izin Renovasi & Tukang",
						icon: Hammer,
						count: permits.filter((p) => p.status === "APPROVED").length
					},
					{
						id: "analytics",
						label: "Okupansi & Utilitas",
						icon: TrendingUp,
						count: utilities.length
					}
				].map((tab) => {
					const Icon = tab.icon;
					const isActive = activeSubTab === tab.id;
					return /* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveSubTab(tab.id),
						className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-primary-600 text-white shadow-xs" : "text-ink-muted hover:text-ink hover:bg-canvas"}`,
						children: [
							/* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
							/* @__PURE__ */ jsx("span", { children: tab.label }),
							tab.count !== void 0 && /* @__PURE__ */ jsx("span", {
								className: `px-1.5 py-0.2 rounded-md text-[10px] font-black ${isActive ? "bg-white/20 text-white" : "bg-canvas text-ink-muted border border-border"}`,
								children: tab.count
							})
						]
					}, tab.id);
				})
			}),
			activeSubTab === "units" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Total Hunian & Kav"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-xl font-black text-ink mt-0.5",
										children: [properties.length, " Unit"]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-600 font-bold",
										children: "Blok / Kavling / Jalan"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Dihuni Pemilik"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-xl font-black text-emerald-700 mt-0.5",
										children: [properties.filter((p) => p.occupancyStatus === "OWNER_OCCUPIED").length, " Unit"]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-600 font-bold",
										children: "Okupansi Utama"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Disewa / Kontrak"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-xl font-black text-blue-700 mt-0.5",
										children: [properties.filter((p) => p.occupancyStatus === "RENTED").length, " Unit"]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-blue-600 font-bold",
										children: "Warga Sewa"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Kosong / Renovasi"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-xl font-black text-amber-700 mt-0.5",
										children: [properties.filter((p) => p.occupancyStatus === "VACANT" || p.occupancyStatus === "RENOVATION").length, " Unit"]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-amber-600 font-bold",
										children: "Belum Dihuni"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "w-full sm:w-72 relative",
							children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-3" }), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Cari kode/kav/jalan (cth: A-17, Kav 5, Sariwangi)...",
								value: search,
								onChange: (e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								},
								className: "w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end",
							children: [
								/* @__PURE__ */ jsxs("select", {
									value: selectedBlock,
									onChange: (e) => {
										setSelectedBlock(e.target.value);
										setCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Wilayah (Blok / Kav / Jalan)"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "A",
											children: "Blok A"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "B",
											children: "Blok B"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "C",
											children: "Blok C"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "D",
											children: "Blok D"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "KAV",
											children: "Kavling (Kav.)"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SARIWANGI_1",
											children: "Jl. Sariwangi Indah 1"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SARIWANGI_2",
											children: "Jl. Sariwangi Indah 2"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: selectedStatus,
									onChange: (e) => {
										setSelectedStatus(e.target.value);
										setCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Status"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "OWNER_OCCUPIED",
											children: "Dihuni Pemilik"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "RENTED",
											children: "Disewa"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "VACANT",
											children: "Kosong"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "RENOVATION",
											children: "Renovasi"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: sortBy,
									onChange: (e) => setSortBy(e.target.value),
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "code",
											children: "Urut Kode / Kav"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "owner",
											children: "Urut Nama Pemilik"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "status",
											children: "Urut Status Okupansi"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "residents",
											children: "Urut Jumlah Penghuni"
										})
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setSortOrder(sortOrder === "asc" ? "desc" : "asc"),
									className: "p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink",
									children: /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3.5 h-3.5" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center bg-canvas p-1 rounded-xl border border-border",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setViewMode("table"),
										className: `p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-surface text-primary-700 shadow-xs" : "text-ink-muted"}`,
										children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setViewMode("grid"),
										className: `p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-surface text-primary-700 shadow-xs" : "text-ink-muted"}`,
										children: /* @__PURE__ */ jsx(LayoutGrid, { className: "w-4 h-4" })
									})]
								})
							]
						})]
					}),
					viewMode === "table" && /* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
						children: [/* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-xs text-left",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Kode / Kavling"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Wilayah / Alamat Jalan"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Status Hunian"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Kepala Rumah / Pemilik"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Penghuni"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Kendaraan"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-right",
											children: "Aksi Manajemen"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", {
									className: "divide-y divide-border/60",
									children: paginatedProperties.map((prop) => /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-canvas/60 text-ink transition-colors",
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 font-bold text-sm text-primary-700 flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(House, { className: "w-4 h-4 text-primary-600" }), /* @__PURE__ */ jsxs("span", { children: ["Unit ", prop.code] })]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 text-ink-muted font-medium",
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-semibold text-ink block",
													children: prop.address
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-ink-muted",
													children: prop.blockCode ? `Blok ${prop.blockCode}` : "Wilayah Komplek"
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: getStatusBadge(prop.occupancyStatus)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 font-black text-ink",
												children: prop.ownerName || "-"
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 text-center font-bold text-ink",
												children: [prop.residentCount || 3, " Jiwa"]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 text-center font-bold text-ink",
												children: [prop.vehicleCount || 1, " Unit"]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-right",
												children: /* @__PURE__ */ jsxs("div", {
													className: "inline-flex items-center gap-1",
													children: [
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => setActiveProperty(prop),
															className: "p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs",
															children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), " Detail"]
														}),
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => handleOpenEdit(prop),
															className: "p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs",
															children: [/* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" }), " Edit"]
														}),
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => setPropertyToDelete(prop),
															className: "p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs",
															children: [/* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }), " Hapus"]
														})
													]
												})
											})
										]
									}, prop.id))
								})]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-ink-muted",
								children: [
									"Menampilkan ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: startIndex + 1
									}),
									" - ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: endIndex
									}),
									" dari ",
									/* @__PURE__ */ jsx("strong", {
										className: "text-ink",
										children: totalItems
									}),
									" unit"
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(Math.max(1, currentPage - 1)),
										disabled: currentPage === 1,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "px-3 font-bold text-ink",
										children: [
											"Hal ",
											currentPage,
											" / ",
											totalPages
										]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)),
										disabled: currentPage === totalPages,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
									})
								]
							})]
						})]
					}),
					viewMode === "grid" && /* @__PURE__ */ jsx("div", {
						className: "space-y-6",
						children: [
							"A",
							"B",
							"C",
							"D"
						].map((blk) => /* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-extrabold text-sm text-ink",
								children: ["Blok ", blk]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2",
								children: properties.filter((p) => p.blockCode === blk).map((p) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setActiveProperty(p),
									className: "p-2.5 rounded-xl text-center border bg-emerald-50 border-emerald-200 text-emerald-900 hover:scale-105 transition-all",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-mono text-xs font-black",
										children: p.code
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[9px] truncate font-bold",
										children: p.ownerName?.split(" ")[0] || "Pemilik"
									})]
								}, p.id))
							})]
						}, blk))
					})
				]
			}),
			activeSubTab === "residents" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Total Sensus Jiwa"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-ink mt-0.5",
									children: [residents.length, " Jiwa"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-600 font-bold",
									children: "100% Terverifikasi"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Kepala Keluarga"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-primary-700 mt-0.5",
									children: [residents.filter((r) => r.relation === "KEPALA_KELUARGA").length, " Orang"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted",
									children: "Penanggung Jawab"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Anak & Pelajar"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-sky-700 mt-0.5",
									children: [residents.filter((r) => r.relation === "ANAK").length, " Jiwa"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-sky-600 font-bold",
									children: "Usia 0-18 Tahun"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Kontak Darurat"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-rose-700 mt-0.5",
									children: [residents.filter((r) => r.isEmergency).length, " Kontak"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-rose-600 font-bold",
									children: "Prioritas Keamanan"
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
					children: /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "No Unit"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Nama Lengkap"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Hubungan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "NIK (KTP)"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Profesi"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "WhatsApp"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: paginatedResidents.map((r) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-canvas/60 text-ink transition-colors",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono font-bold text-primary-700",
											children: r.houseCode
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-bold text-ink",
											children: r.fullName
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: getRelationBadge(r.relation)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono text-ink-muted",
											children: r.idCard
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-medium text-ink",
											children: r.occupation
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono",
											children: r.phone
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4 text-right",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => handleOpenEditResident(r),
												className: "p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs",
												children: /* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setResidentToDelete(r),
												className: "p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									]
								}, r.id))
							})]
						})
					})
				})]
			}),
			activeSubTab === "vehicles" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Total Kendaraan"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-ink mt-0.5",
									children: [vehicles.length, " Unit"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-600 font-bold",
									children: "Terdata di Gate Barrier"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Mobil / Roda 4"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-primary-700 mt-0.5",
									children: [vehicles.filter((v) => v.type === "Mobil").length, " Unit"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted",
									children: "Barrier Gate Mobil"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Motor & Sepeda Listrik"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-sky-700 mt-0.5",
									children: [vehicles.filter((v) => v.type === "Motor" || v.type === "Sepeda Listrik").length, " Unit"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted",
									children: "Lane Motor"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Stiker RFID Aktif"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-emerald-700 mt-0.5",
									children: [vehicles.filter((v) => v.rfidStatus === "AKTIF").length, " RFID"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-600 font-bold",
									children: "100% Akses Aktif"
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
					children: /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Plat Nomor"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Unit"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Pemilik"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Jenis"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Merk & Tipe"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Tag RFID"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-center",
										children: "Status RFID"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: paginatedVehicles.map((v) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-canvas/60 text-ink transition-colors",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono font-black text-sm text-ink",
											children: v.plateNumber
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-bold text-primary-700",
											children: v.houseCode
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-bold text-ink",
											children: v.ownerName
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded bg-canvas font-bold",
												children: v.type
											})
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [
												v.brand,
												" ",
												v.model
											]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono text-ink-muted",
											children: v.rfidTag
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 text-center",
											children: /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => handleToggleRfid(v.id),
												className: `px-2.5 py-1 rounded-lg text-[10px] font-black border ${v.rfidStatus === "AKTIF" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"}`,
												children: v.rfidStatus === "AKTIF" ? "✓ AKTIF" : "✕ DIBLOKIR"
											})
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4 text-right",
											children: [
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => setSelectedPassVehicle(v),
													className: "p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(QrCode, { className: "w-3.5 h-3.5" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => handleOpenEditVehicle(v),
													className: "p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => setVehicleToDelete(v),
													className: "p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
												})
											]
										})
									]
								}, v.id))
							})]
						})
					})
				})]
			}),
			activeSubTab === "permits" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 animate-in fade-in duration-150",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Total Izin Diajukan"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-ink mt-0.5",
									children: [permits.length, " Permit"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-600 font-bold",
									children: "Tercatat di Sistem"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Sedang Berjalan"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-emerald-700 mt-0.5",
									children: [permits.filter((p) => p.status === "APPROVED").length, " Unit"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-600 font-bold",
									children: "Dalam Pengawasan"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Menunggu ACC"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-amber-700 mt-0.5",
									children: [permits.filter((p) => p.status === "PENDING_REVIEW").length, " Pengajuan"]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-amber-600 font-bold",
									children: "Perlu Review"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-ink-muted font-medium",
									children: "Total Jaminan Deposit"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xl font-black text-primary-700 mt-0.5",
									children: [
										"Rp ",
										(permits.reduce((acc, p) => p.depositStatus === "SUDAH_SETOR" ? acc + (p.depositAmount || 0) : acc, 0) / 1e6).toFixed(1),
										" Jt"
									]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted",
									children: "Uang Jaminan"
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
					children: /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "ID Permit"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Unit"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Jenis Renovasi"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Mandor"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Masa Berlaku"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Status"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-border/60",
								children: paginatedPermits.map((p) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-canvas/60 text-ink transition-colors",
									children: [
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-mono font-black text-primary-700",
											children: p.id
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-bold",
											children: p.houseCode
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 font-extrabold",
											children: p.workType
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [
												p.contractorName,
												" (",
												p.workersCount,
												" Tukang)"
											]
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [
												p.startDate,
												" s/d ",
												p.endDate
											]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: getPermitStatusBadge(p.status)
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4 text-right",
											children: [
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => setSelectedPrintPermit(p),
													className: "p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(Printer, { className: "w-3.5 h-3.5" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => handleOpenEditPermit(p),
													className: "p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => setPermitToDelete(p),
													className: "p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs",
													children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
												})
											]
										})
									]
								}, p.id))
							})]
						})
					})
				})]
			}),
			activeSubTab === "analytics" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-5 animate-in fade-in duration-150",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Tingkat Okupansi Komplek"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-emerald-700 mt-0.5",
										children: "94.2%"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-600 font-bold",
										children: "113 dari 120 Unit Dihuni"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Beban Daya Listrik PLN"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-amber-700 mt-0.5",
										children: "420 kVA"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted",
										children: "Kapasitas Gardu Utama"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Rata-Rata Air Bersih (PAM)"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-sky-700 mt-0.5",
										children: "18.5 m³"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-sky-600 font-bold",
										children: "Konsumsi Per Rumah/Bulan"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-surface rounded-2xl border border-border shadow-xs",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-ink-muted font-medium",
										children: "Potensi Iuran IPL/Bulan"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl font-black text-primary-700 mt-0.5",
										children: "Rp 92.25 Jt"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-600 font-bold",
										children: "96.8% Kolektibilitas"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-extrabold text-sm text-ink flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-primary-600" }), "Sebaran Okupansi per Wilayah (Blok, Kavling, Jalan)"]
							}), /* @__PURE__ */ jsx("div", {
								className: "space-y-3 text-xs",
								children: [
									{
										block: "Blok A (Taman Sejahtera A)",
										rate: "96.7%",
										filled: 29,
										total: 30,
										color: "bg-emerald-500"
									},
									{
										block: "Blok B (Jl. Sariwangi Indah 1)",
										rate: "90.0%",
										filled: 27,
										total: 30,
										color: "bg-blue-500"
									},
									{
										block: "Blok C (Area Kavling Cluster)",
										rate: "93.3%",
										filled: 28,
										total: 30,
										color: "bg-indigo-500"
									},
									{
										block: "Blok D (Jl. Sariwangi Indah 2)",
										rate: "96.7%",
										filled: 29,
										total: 30,
										color: "bg-purple-500"
									}
								].map((b, idx) => /* @__PURE__ */ jsxs("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between font-semibold",
										children: [/* @__PURE__ */ jsxs("span", { children: [
											b.block,
											" (",
											b.filled,
											"/",
											b.total,
											" Unit)"
										] }), /* @__PURE__ */ jsx("span", {
											className: "font-mono text-primary-700 font-bold",
											children: b.rate
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "w-full h-2 bg-canvas rounded-full overflow-hidden border border-border",
										children: /* @__PURE__ */ jsx("div", {
											className: `h-full ${b.color}`,
											style: { width: b.rate }
										})
									})]
								}, idx))
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-extrabold text-sm text-ink flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Leaf, { className: "w-4 h-4 text-emerald-600" }), "Inisiatif Eco-Green Lingkungan & Daya Listrik"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-3 text-xs",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5 text-emerald-800 font-bold",
												children: [/* @__PURE__ */ jsx(Droplets, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Sumur Resapan Biopori" })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xl font-black text-emerald-900 mt-1",
												children: "92 Unit"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-[10px] text-emerald-700",
												children: "76.7% Terpasang Biopori"
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5 text-amber-800 font-bold",
												children: [/* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-amber-600" }), /* @__PURE__ */ jsx("span", { children: "Solar Panel Rooftop" })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xl font-black text-amber-900 mt-1",
												children: "16 Unit"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-[10px] text-amber-700",
												children: "On-Grid PLTS Warga"
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "col-span-2 p-3 bg-canvas rounded-xl border border-border flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(Trash, { className: "w-4 h-4 text-primary-600" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "font-bold text-ink text-xs",
												children: "Jadwal Pengangkutan Sampah Komplek"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[10px] text-ink-muted",
												children: "Senin, Rabu, Jumat & Sabtu (Pagi 06:30 WIB)"
											})] })]
										}), /* @__PURE__ */ jsx("span", {
											className: "px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-800 text-[10px] font-black",
											children: "TERPADU"
										})]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "w-full sm:w-72 relative",
							children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ink-muted absolute left-3 top-3" }), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: "Cari unit, nama, no meter PAM, ID PLN...",
								value: utilitySearch,
								onChange: (e) => {
									setUtilitySearch(e.target.value);
									setUtilityCurrentPage(1);
								},
								className: "w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end",
							children: [
								/* @__PURE__ */ jsxs("select", {
									value: utilityPlnFilter,
									onChange: (e) => {
										setUtilityPlnFilter(e.target.value);
										setUtilityCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Daya Listrik"
										}),
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
										}),
										/* @__PURE__ */ jsx("option", {
											value: "7.700 VA",
											children: "7.700 VA"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: utilityPaymentFilter,
									onChange: (e) => {
										setUtilityPaymentFilter(e.target.value);
										setUtilityCurrentPage(1);
									},
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "ALL",
											children: "Semua Status Bayar"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "LUNAS",
											children: "Lunas"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "MENUNGGU_BAYAR",
											children: "Menunggu Bayar"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "MENUNGGAK",
											children: "Menunggak"
										})
									]
								}),
								/* @__PURE__ */ jsxs("select", {
									value: utilitySortBy,
									onChange: (e) => setUtilitySortBy(e.target.value),
									className: "px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "houseCode",
											children: "Urut Nomor Unit"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "pamUsage",
											children: "Urut Pemakaian Air"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "monthlyIplFee",
											children: "Urut Tarif IPL"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "paymentStatus",
											children: "Urut Status Bayar"
										})
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setUtilitySortOrder(utilitySortOrder === "asc" ? "desc" : "asc"),
									className: "p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink",
									children: /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3.5 h-3.5" })
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-surface rounded-2xl border border-border shadow-card overflow-hidden",
						children: [/* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-xs text-left",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
									className: "border-b border-border bg-canvas/60 text-ink-muted font-bold",
									children: [
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "No Unit / Wilayah"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Penghuni / Pemilik"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Daya Listrik PLN"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Meter Air PAM & Pemakaian"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4",
											children: "Iuran IPL Bulanan"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Fitur Eco-Green"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-center",
											children: "Status Bayar"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-3.5 px-4 text-right",
											children: "Aksi Manajemen"
										})
									]
								}) }), /* @__PURE__ */ jsx("tbody", {
									className: "divide-y divide-border/60",
									children: paginatedUtilities.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
										colSpan: 8,
										className: "py-8 text-center text-ink-muted font-medium",
										children: "Tidak ada catatan meteran utilitas yang cocok dengan filter."
									}) }) : paginatedUtilities.map((u) => /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-canvas/60 text-ink transition-colors",
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 font-mono font-bold text-primary-700",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-sm font-black",
													children: u.houseCode
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-ink-muted",
													children: u.areaLabel
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 font-bold text-ink",
												children: u.ownerName
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200",
													children: u.plnCapacity
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] font-mono text-ink-muted block mt-0.5",
													children: u.plnCustomerId
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsxs("p", {
													className: "font-bold text-ink",
													children: [
														u.pamUsage,
														" m³ ",
														/* @__PURE__ */ jsxs("span", {
															className: "text-[10px] text-ink-muted",
															children: [
																"(",
																u.pamReadingLastMonth,
																" ➔ ",
																u.pamReadingThisMonth,
																")"
															]
														})
													]
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] font-mono text-ink-muted",
													children: u.pamMeterNo
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 font-mono font-bold text-ink",
												children: ["Rp ", u.monthlyIplFee.toLocaleString("id-ID")]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-center",
												children: /* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-center gap-1",
													children: [
														u.hasBiopori && /* @__PURE__ */ jsx("span", {
															className: "px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[9px] font-bold",
															title: "Sumur Resapan Biopori Aktif",
															children: "Biopori"
														}),
														u.hasSolarPanel && /* @__PURE__ */ jsx("span", {
															className: "px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[9px] font-bold",
															title: "Solar Panel Rooftop",
															children: "Solar"
														}),
														!u.hasBiopori && !u.hasSolarPanel && /* @__PURE__ */ jsx("span", {
															className: "text-ink-muted text-[10px]",
															children: "-"
														})
													]
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-center",
												children: /* @__PURE__ */ jsx("span", {
													className: `px-2.5 py-1 rounded-lg text-[10px] font-black border ${u.paymentStatus === "LUNAS" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : u.paymentStatus === "MENUNGGAK" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200"}`,
													children: u.paymentStatus === "LUNAS" ? "✓ LUNAS" : u.paymentStatus === "MENUNGGAK" ? "✕ TUNGGAK" : "⏱ MENUNGGU"
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-right",
												children: /* @__PURE__ */ jsxs("div", {
													className: "inline-flex items-center gap-1",
													children: [
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => setActiveUtilityView(u),
															className: "p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors font-bold text-xs",
															title: "Lihat Rincian Utilitas & Rekening",
															children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), "Detail"]
														}),
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => handleOpenEditUtility(u),
															className: "p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors font-bold text-xs",
															title: "Edit Catatan Meteran",
															children: [/* @__PURE__ */ jsx(PenLine, { className: "w-3.5 h-3.5" }), "Edit"]
														}),
														/* @__PURE__ */ jsxs("button", {
															type: "button",
															onClick: () => setUtilityToDelete(u),
															className: "p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-bold text-xs",
															title: "Reset Catatan Meteran",
															children: [/* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }), "Reset"]
														})
													]
												})
											})
										]
									}, u.id))
								})]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-ink-muted",
									children: [
										"Menampilkan ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: totalUtilities === 0 ? 0 : utilStartIndex + 1
										}),
										" - ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: utilEndIndex
										}),
										" dari ",
										/* @__PURE__ */ jsx("strong", {
											className: "text-ink",
											children: totalUtilities
										}),
										" unit utilitas"
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-ink-muted",
										children: "Tampilkan:"
									}), /* @__PURE__ */ jsxs("select", {
										value: utilityPageSize,
										onChange: (e) => {
											setUtilityPageSize(Number(e.target.value));
											setUtilityCurrentPage(1);
										},
										className: "px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink",
										children: [
											/* @__PURE__ */ jsx("option", {
												value: 10,
												children: "10"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 25,
												children: "25"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 50,
												children: "50"
											}),
											/* @__PURE__ */ jsx("option", {
												value: 100,
												children: "100"
											})
										]
									})]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setUtilityCurrentPage(1),
										disabled: safeUtilityPage === 1,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronsLeft, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setUtilityCurrentPage(safeUtilityPage - 1),
										disabled: safeUtilityPage === 1,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex items-center gap-1 px-2",
										children: Array.from({ length: Math.min(5, totalUtilityPages) }, (_, i) => {
											let pageNum = safeUtilityPage - 2 + i;
											if (pageNum < 1) pageNum = i + 1;
											if (pageNum > totalUtilityPages) return null;
											return /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setUtilityCurrentPage(pageNum),
												className: `w-7 h-7 rounded-lg text-xs font-bold transition-colors ${safeUtilityPage === pageNum ? "bg-primary-600 text-white shadow-xs" : "bg-surface border border-border text-ink hover:bg-canvas"}`,
												children: pageNum
											}, pageNum);
										})
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setUtilityCurrentPage(safeUtilityPage + 1),
										disabled: safeUtilityPage === totalUtilityPages,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setUtilityCurrentPage(totalUtilityPages),
										disabled: safeUtilityPage === totalUtilityPages,
										className: "p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40",
										children: /* @__PURE__ */ jsx(ChevronsRight, { className: "w-4 h-4" })
									})
								]
							})]
						})]
					})
				]
			}),
			activeUtilityView && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border pb-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black",
									children: /* @__PURE__ */ jsx(Gauge, { className: "w-5 h-5" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
									className: "font-black text-base text-ink",
									children: ["Utilitas Unit ", activeUtilityView.houseCode]
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-xs text-ink-muted",
									children: [
										activeUtilityView.ownerName,
										" • ",
										activeUtilityView.areaLabel
									]
								})] })]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setActiveUtilityView(null),
								className: "p-1 rounded-full text-ink-muted hover:text-ink",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3 text-xs",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "p-3.5 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-ink-muted font-bold block",
											children: "Kapasitas Listrik PLN:"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "font-bold text-amber-800 text-sm mt-0.5",
											children: activeUtilityView.plnCapacity
										}),
										/* @__PURE__ */ jsx("p", {
											className: "font-mono text-[10px] text-ink-muted",
											children: activeUtilityView.plnCustomerId
										})
									] }),
									/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-ink-muted font-bold block",
											children: "Meteran Air Bersih (PAM):"
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "font-bold text-sky-800 text-sm mt-0.5",
											children: [activeUtilityView.pamUsage, " m³ (Bulan Ini)"]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "font-mono text-[10px] text-ink-muted",
											children: activeUtilityView.pamMeterNo
										})
									] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted font-bold block",
										children: "Iuran Lingkungan (IPL):"
									}), /* @__PURE__ */ jsxs("p", {
										className: "font-mono font-bold text-emerald-800 text-sm mt-0.5",
										children: [
											"Rp ",
											activeUtilityView.monthlyIplFee.toLocaleString("id-ID"),
											" / bln"
										]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted font-bold block",
										children: "Status Pembayaran:"
									}), /* @__PURE__ */ jsx("span", {
										className: "px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-200 mt-0.5 inline-block",
										children: activeUtilityView.paymentStatus
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted font-bold block",
										children: "Jadwal Angkut Sampah:"
									}), /* @__PURE__ */ jsx("p", {
										className: "font-medium text-ink mt-0.5",
										children: activeUtilityView.wasteSchedule.replace(/_/g, " ")
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-ink-muted font-bold block",
										children: "Status Eco-Green:"
									}), /* @__PURE__ */ jsxs("p", {
										className: "font-medium text-ink mt-0.5",
										children: [
											"Biopori: ",
											activeUtilityView.hasBiopori ? "✓ Ada" : "✕ Belum",
											" • Solar: ",
											activeUtilityView.hasSolarPanel ? "✓ Ada" : "✕ Belum"
										]
									})] })
								]
							}), activeUtilityView.notes && /* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-canvas/60 rounded-xl border border-border",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-ink-muted font-bold block",
									children: "Catatan Khusus Utilitas:"
								}), /* @__PURE__ */ jsx("p", {
									className: "font-medium text-ink mt-0.5",
									children: activeUtilityView.notes
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-2 flex justify-between items-center",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => {
									alert(`Mencetak lembar rekening pemakaian utilitas Unit ${activeUtilityView.houseCode}`);
									setActiveUtilityView(null);
								},
								className: "px-4 py-2 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx(Printer, { className: "w-3.5 h-3.5" }), "Cetak Lembar Rekening"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => {
										const toEdit = activeUtilityView;
										setActiveUtilityView(null);
										handleOpenEditUtility(toEdit);
									},
									className: "px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl",
									children: "Edit Data"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setActiveUtilityView(null),
									className: "px-5 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-xs text-xs",
									children: "Tutup"
								})]
							})]
						})
					]
				})
			}),
			showUtilityModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-border pb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center",
								children: /* @__PURE__ */ jsx(Gauge, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-black text-base text-ink",
								children: editingUtilityId ? `Edit Utilitas Unit ${uCode}` : "Catat & Input Meteran Utilitas Baru"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-ink-muted",
								children: "Pencatatan pembacaan meter air PAM, daya PLN, dan iuran IPL."
							})] })]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setShowUtilityModal(false),
							className: "text-ink-muted hover:text-ink",
							children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSaveUtility,
						className: "space-y-3.5 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5",
								children: [/* @__PURE__ */ jsxs("h4", {
									className: "font-black text-ink text-xs flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(House, { className: "w-3.5 h-3.5 text-primary-600" }), "1. Unit Rumah & Pemilik"]
								}), /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-bold text-ink block mb-1",
										children: "Pilih Unit Rumah / Kavling *"
									}), /* @__PURE__ */ jsx("select", {
										value: uCode,
										onChange: (e) => {
											const code = e.target.value;
											setUCode(code);
											const matchedProp = properties.find((p) => p.code === code);
											if (matchedProp) {
												setUAreaLabel(code.startsWith("KAV") ? "Kavling" : code.startsWith("SW") ? "Jl. Sariwangi Indah" : `Blok ${matchedProp.blockCode}`);
												if (matchedProp.ownerName) setUOwnerName(matchedProp.ownerName);
											}
										},
										className: "w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink",
										children: properties.map((p) => /* @__PURE__ */ jsxs("option", {
											value: p.code,
											children: [
												p.code,
												" — ",
												p.address
											]
										}, p.id))
									})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-bold text-ink block mb-1",
										children: "Nama Penghuni / Pemilik *"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										placeholder: "Nama Lengkap Pemilik",
										value: uOwnerName,
										onChange: (e) => setUOwnerName(e.target.value),
										required: true,
										className: "w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
									})] })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5",
								children: [
									/* @__PURE__ */ jsxs("h4", {
										className: "font-black text-ink text-xs flex items-center gap-1.5",
										children: [/* @__PURE__ */ jsx(Zap, { className: "w-3.5 h-3.5 text-amber-600" }), "2. Utilitas Listrik PLN & Air Bersih PAM"]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Kapasitas Daya PLN *"
										}), /* @__PURE__ */ jsxs("select", {
											value: uPlnCapacity,
											onChange: (e) => setUPlnCapacity(e.target.value),
											className: "w-full p-2 bg-surface border border-border rounded-xl font-mono font-bold text-ink",
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
												}),
												/* @__PURE__ */ jsx("option", {
													value: "7.700 VA",
													children: "7.700 VA"
												})
											]
										})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "ID Pelanggan PLN"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "PLN-5388xxxx",
											value: uPlnCustomerId,
											onChange: (e) => setUPlnCustomerId(e.target.value),
											className: "w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "No Meter PAM"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												placeholder: "PAM-88301",
												value: uPamMeterNo,
												onChange: (e) => setUPamMeterNo(e.target.value),
												className: "w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Meter Lalu (m³)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: uPamLastMonth,
												onChange: (e) => setUPamLastMonth(Number(e.target.value)),
												className: "w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Meter Ini (m³)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: uPamThisMonth,
												onChange: (e) => setUPamThisMonth(Number(e.target.value)),
												className: "w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
											})] })
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5",
								children: [
									/* @__PURE__ */ jsxs("h4", {
										className: "font-black text-ink text-xs flex items-center gap-1.5",
										children: [/* @__PURE__ */ jsx(Leaf, { className: "w-3.5 h-3.5 text-emerald-600" }), "3. Iuran IPL, Jadwal Sampah & Inisiatif Eco-Green"]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Tarif IPL (Rp/bln)"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												value: uMonthlyIplFee,
												onChange: (e) => setUMonthlyIplFee(Number(e.target.value)),
												className: "w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Jadwal Sampah"
											}), /* @__PURE__ */ jsxs("select", {
												value: uWasteSchedule,
												onChange: (e) => setUWasteSchedule(e.target.value),
												className: "w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold",
												children: [
													/* @__PURE__ */ jsx("option", {
														value: "SENIN_RABU_JUMAT",
														children: "Senin, Rabu, Jumat"
													}),
													/* @__PURE__ */ jsx("option", {
														value: "SELASA_KAMIS_SABTU",
														children: "Selasa, Kamis, Sabtu"
													}),
													/* @__PURE__ */ jsx("option", {
														value: "SETIAP_HARI",
														children: "Setiap Hari"
													})
												]
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "font-bold text-ink block mb-1",
												children: "Status Bayar"
											}), /* @__PURE__ */ jsxs("select", {
												value: uPaymentStatus,
												onChange: (e) => setUPaymentStatus(e.target.value),
												className: "w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold",
												children: [
													/* @__PURE__ */ jsx("option", {
														value: "LUNAS",
														children: "LUNAS"
													}),
													/* @__PURE__ */ jsx("option", {
														value: "MENUNGGU_BAYAR",
														children: "Menunggu Bayar"
													}),
													/* @__PURE__ */ jsx("option", {
														value: "MENUNGGAK",
														children: "Menunggak"
													})
												]
											})] })
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Sumur Resapan Biopori"
										}), /* @__PURE__ */ jsxs("select", {
											value: uHasBiopori ? "YES" : "NO",
											onChange: (e) => setUHasBiopori(e.target.value === "YES"),
											className: "w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold",
											children: [/* @__PURE__ */ jsx("option", {
												value: "YES",
												children: "Ada (Aktif)"
											}), /* @__PURE__ */ jsx("option", {
												value: "NO",
												children: "Belum Ada"
											})]
										})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "font-bold text-ink block mb-1",
											children: "Solar Panel Rooftop"
										}), /* @__PURE__ */ jsxs("select", {
											value: uHasSolarPanel ? "YES" : "NO",
											onChange: (e) => setUHasSolarPanel(e.target.value === "YES"),
											className: "w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold",
											children: [/* @__PURE__ */ jsx("option", {
												value: "NO",
												children: "Belum Terpasang"
											}), /* @__PURE__ */ jsx("option", {
												value: "YES",
												children: "Terpasang (On-Grid)"
											})]
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "font-bold text-ink block mb-1",
										children: "Catatan Khusus Utilitas"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										placeholder: "Contoh: Pompa booster terpasang / Meter air baru dikalibrasi",
										value: uNotes,
										onChange: (e) => setUNotes(e.target.value),
										className: "w-full p-2 bg-surface border border-border rounded-xl text-ink"
									})] })
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-2 flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowUtilityModal(false),
									className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
									children: "Batal"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: utilitySaving,
									className: "flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50",
									children: utilitySaving ? "Menyimpan..." : editingUtilityId ? "Perbarui Utilitas" : "Simpan Utilitas"
								})]
							})
						]
					})]
				})
			}),
			utilityToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Reset Utilitas ",
									utilityToDelete.houseCode,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted",
								children: [
									"Catatan meteran dan data utilitas untuk Unit ",
									/* @__PURE__ */ jsx("strong", { children: utilityToDelete.houseCode }),
									" (",
									utilityToDelete.ownerName,
									") akan direset. Tindakan ini tercatat di Jejak Audit."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Reset / Penghapusan:"
							}), /* @__PURE__ */ jsxs("select", {
								value: utilityDeleteReason,
								onChange: (e) => setUtilityDeleteReason(e.target.value),
								className: "w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Meteran Diganti Baru / Dikalibrasi Ulang",
										children: "Meteran Diganti Baru / Kalibrasi Ulang"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Koreksi Input Pembacaan Meter",
										children: "Koreksi Input Pembacaan Meter"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Unit Kosong / Nonaktif",
										children: "Unit Kosong / Nonaktif"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Lainnya",
										children: "Lainnya"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setUtilityToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeleteUtility,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Reset Data"
							})]
						})
					]
				})
			}),
			permitToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Hapus Izin ",
									permitToDelete.id,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted",
								children: [
									"Izin renovasi untuk Unit ",
									/* @__PURE__ */ jsx("strong", { children: permitToDelete.houseCode }),
									" (",
									permitToDelete.workType,
									") oleh ",
									/* @__PURE__ */ jsx("strong", { children: permitToDelete.contractorName }),
									" akan dihapus dan dicabut dari sistem pos satpam. Tindakan ini tercatat di Jejak Audit."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Pembatalan / Penghapusan:"
							}), /* @__PURE__ */ jsxs("select", {
								value: permitDeleteReason,
								onChange: (e) => setPermitDeleteReason(e.target.value),
								className: "w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Renovasi Batal Dilaksanakan",
										children: "Renovasi Batal Dilaksanakan"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Masa Berlaku Habis / Kedaluwarsa",
										children: "Masa Berlaku Habis"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Pelanggaran Jam Kerja Berat",
										children: "Pelanggaran Jam Kerja Berat"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Koreksi Data / Input Ganda",
										children: "Koreksi Data Ganda"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Lainnya",
										children: "Lainnya"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setPermitToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeletePermit,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Hapus Izin"
							})]
						})
					]
				})
			}),
			vehicleToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Hapus Kendaraan ",
									vehicleToDelete.plateNumber,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted",
								children: [
									"Kendaraan ",
									/* @__PURE__ */ jsx("strong", { children: vehicleToDelete.plateNumber }),
									" (",
									vehicleToDelete.brand,
									" ",
									vehicleToDelete.model,
									") milik Unit ",
									/* @__PURE__ */ jsx("strong", { children: vehicleToDelete.houseCode }),
									" akan dicabut hak akses barrier gate RFID-nya. Tindakan ini tercatat di Jejak Audit."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Pencabutan / Penghapusan:"
							}), /* @__PURE__ */ jsxs("select", {
								value: vehicleDeleteReason,
								onChange: (e) => setVehicleDeleteReason(e.target.value),
								className: "w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Kendaraan Dijual / Diganti",
										children: "Kendaraan Dijual / Diganti Baru"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Penghuni Pindah Keluar Komplek",
										children: "Penghuni Pindah Keluar Komplek"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Stiker RFID Rusak / Hilang",
										children: "Stiker RFID Rusak / Hilang"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Koreksi Data / Input Ganda",
										children: "Koreksi Data Ganda"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Lainnya",
										children: "Lainnya"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setVehicleToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeleteVehicle,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Hapus Akses"
							})]
						})
					]
				})
			}),
			residentToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Hapus Data ",
									residentToDelete.fullName,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted",
								children: [
									"Penghuni ",
									/* @__PURE__ */ jsx("strong", { children: residentToDelete.fullName }),
									" (",
									residentToDelete.houseCode,
									") akan dihapus dari data kependudukan komplek. Tindakan ini tercatat di Jejak Audit."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Penghapusan Sensus:"
							}), /* @__PURE__ */ jsxs("select", {
								value: residentDeleteReason,
								onChange: (e) => setResidentDeleteReason(e.target.value),
								className: "w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Pindah Domisili Keluar Komplek",
										children: "Pindah Domisili Keluar Komplek"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Masa Kontrak / Sewa Berakhir",
										children: "Masa Sewa Berakhir"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Meninggal Dunia",
										children: "Meninggal Dunia"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Koreksi Data / Input Ganda",
										children: "Koreksi Data Ganda"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Lainnya",
										children: "Lainnya"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setResidentToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmDeleteResident,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs",
								children: "Ya, Hapus Data"
							})]
						})
					]
				})
			}),
			propertyToDelete && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ jsx(TriangleAlert, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-1",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-black text-lg text-ink",
								children: [
									"Hapus Unit ",
									propertyToDelete.code,
									"?"
								]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-ink-muted",
								children: [
									"Unit ",
									/* @__PURE__ */ jsx("strong", { children: propertyToDelete.address }),
									" akan dinonaktifkan dari direktori master. Tindakan ini akan tercatat dalam Jejak Audit Keamanan."
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Penghapusan:"
							}), /* @__PURE__ */ jsxs("select", {
								value: deleteReason,
								onChange: (e) => setDeleteReason(e.target.value),
								className: "w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "Renovasi Penggabungan Unit / Koreksi Data",
										children: "Penggabungan Unit / Koreksi Data"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Unit Dibongkar / Direnovasi Total",
										children: "Unit Dibongkar / Renovasi Total"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Kesalahan Input Data Duplikat",
										children: "Kesalahan Input Data Duplikat"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "Lainnya",
										children: "Lainnya"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: deleting,
								onClick: () => setPropertyToDelete(null),
								className: "flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: deleting,
								onClick: handleConfirmDelete,
								className: "flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50",
								children: deleting ? "Menghapus..." : "Ya, Hapus Unit"
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/admin/properties.astro
var properties_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Properties,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Properties = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Properties;
	const properties = await getProperties();
	const tab = Astro.url.searchParams.get("tab") || "properties";
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Data Rumah & Warga - WargaHub",
		"currentPath": "/admin/properties"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "PropertiesManager", PropertiesManager, {
		"initialProperties": properties,
		"initialTab": tab,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/admin/PropertiesManager.tsx",
		"client:component-export": "PropertiesManager"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/properties.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/properties.astro";
var $$url = "/admin/properties";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/properties@_@astro
var page = () => properties_exports;
//#endregion
export { page };
