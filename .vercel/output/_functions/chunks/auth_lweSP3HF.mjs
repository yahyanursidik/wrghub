//#region src/types/auth.ts
var PORTAL_ACCOUNTS = {
	ketua: {
		id: "user-ketua",
		username: "ketua",
		name: "Budi Santoso",
		roleTitle: "Ketua Komplek",
		role: "CHAIRMAN",
		passwordHint: "admin123",
		defaultPassword: "admin123",
		targetPortal: "admin",
		targetUrl: "/admin",
		avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "A-17",
		badge: "Akses Penuh",
		description: "Akses ke seluruh modul: dashboard, persetujuan pengeluaran, aduan, dan tata kelola warga."
	},
	bendahara: {
		id: "user-bendahara",
		username: "bendahara",
		name: "Hendra Wijaya",
		roleTitle: "Bendahara Komplek",
		role: "TREASURER",
		passwordHint: "bendahara123",
		defaultPassword: "bendahara123",
		targetPortal: "admin",
		targetUrl: "/admin/payments",
		avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
		propertyCode: "B-01",
		badge: "Keuangan & Kas",
		description: "Akses khusus verifikasi bukti transfer, pencatatan pengeluaran, arus kas, dan anggaran."
	},
	warga_a17: {
		id: "user-warga-a17",
		username: "warga_a17",
		name: "Budi Santoso (Rumah A-17)",
		roleTitle: "Warga / Kepala Keluarga",
		role: "HOUSEHOLD_HEAD",
		passwordHint: "warga123",
		defaultPassword: "warga123",
		targetPortal: "resident",
		targetUrl: "/",
		avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "A-17",
		badge: "Status: Lunas",
		description: "Portal mandiri warga Rumah A-17: pantau iuran, kartu keluarga, dan kendaraan terdaftar."
	},
	warga_b07: {
		id: "user-warga-b07",
		username: "warga_b07",
		name: "Agus Priyono (Rumah B-07)",
		roleTitle: "Warga / Penghuni",
		role: "RESIDENT",
		passwordHint: "warga123",
		defaultPassword: "warga123",
		targetPortal: "resident",
		targetUrl: "/",
		avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "B-07",
		badge: "Status: Belum Bayar",
		description: "Portal mandiri warga Rumah B-07 untuk mencoba konfirmasi pembayaran dan upload bukti transfer."
	},
	satpam: {
		id: "user-satpam",
		username: "satpam",
		name: "Joko Santoso (Komandan Satpam)",
		roleTitle: "Petugas Keamanan",
		role: "SECURITY",
		passwordHint: "satpam123",
		defaultPassword: "satpam123",
		targetPortal: "admin",
		targetUrl: "/admin/complaints",
		avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
		badge: "Operasional Pos",
		description: "Akses operasional pos keamanan, pantauan aduan warga darurat, dan fasilitas komplek."
	}
};
var DEMO_USERS = {
	ketua: {
		id: "user-ketua",
		username: "ketua",
		fullName: "Budi Santoso",
		email: "ketua@wargahub.id",
		role: "CHAIRMAN",
		avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "A-17",
		propertyId: "prop-a-17"
	},
	bendahara: {
		id: "user-bendahara",
		username: "bendahara",
		fullName: "Hendra Wijaya",
		email: "bendahara@wargahub.id",
		role: "TREASURER",
		avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
		propertyCode: "B-01",
		propertyId: "prop-b-01"
	},
	warga: {
		id: "user-warga-a17",
		username: "warga_a17",
		fullName: "Budi Santoso",
		email: "budi.santoso@wargahub.id",
		role: "HOUSEHOLD_HEAD",
		avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "A-17",
		propertyId: "prop-a-17"
	},
	warga_unpaid: {
		id: "user-warga-b07",
		username: "warga_b07",
		fullName: "Agus Priyono",
		email: "agus.b07@wargahub.id",
		role: "RESIDENT",
		avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
		propertyCode: "B-07",
		propertyId: "prop-b-07"
	},
	satpam: {
		id: "user-satpam",
		username: "satpam",
		fullName: "Joko Santoso",
		email: "satpam@wargahub.id",
		role: "SECURITY",
		avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
	}
};
//#endregion
export { PORTAL_ACCOUNTS as n, DEMO_USERS as t };
