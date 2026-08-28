import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const BASE_URL = 'http://localhost:4321';

async function runVerification() {
  console.log('====================================================');
  console.log('  WARGAHUB — AUTOMATED END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  const sql = postgres(DATABASE_URL);
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Neon DB Schema & Tables
    console.log('--- 1. DATABASE & RELATIONAL INTEGRITY ---');
    const tableCounts = await sql`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `;
    assert(tableCounts.length >= 25, `Neon DB contains ${tableCounts.length} relational tables (Expected >= 25)`);

    const propCount = await sql`SELECT count(*) as total FROM properties`;
    assert(Number(propCount[0].total) >= 120, `Property records exist: ${propCount[0].total} units (Expected >= 120)`);

    const invCount = await sql`SELECT count(*) as total FROM invoices`;
    assert(Number(invCount[0].total) >= 120, `Invoices seeded in Neon DB: ${invCount[0].total} records`);

    const accBalance = await sql`SELECT balance FROM accounts WHERE code = 'BCA_MAIN' OR code LIKE '%BCA%' LIMIT 1`;
    assert(Number(accBalance[0]?.balance) > 0, `Official Bank BCA balance: Rp ${Number(accBalance[0]?.balance).toLocaleString('id-ID')}`);

    // 2. HTTP Routes Verification
    console.log('\n--- 2. FRONTEND ROUTES & SSR RENDERING ---');
    const routesToTest = [
      { path: '/', name: 'Portal Warga Mobile (/)' },
      { path: '/transparency', name: 'Laporan Transparansi Keuangan (/transparency)' },
      { path: '/login', name: 'Halaman Login Terpadu (/login)' },
      { path: '/admin', name: 'Admin Dashboard Ringkasan (/admin)' },
      { path: '/admin/billing', name: 'Admin Billing & Iuran (/admin/billing)' },
      { path: '/admin/payments', name: 'Admin Pembayaran (/admin/payments)' },
      { path: '/admin/ledger', name: 'Admin Buku Kas & Ledger (/admin/ledger)' },
      { path: '/admin/budget', name: 'Admin Anggaran & Realisasi (/admin/budget)' },
      { path: '/admin/facilities', name: 'Admin Sarana & Fasilitas (/admin/facilities)' },
      { path: '/admin/announcements', name: 'Admin Pengumuman & Broadcast (/admin/announcements)' },
      { path: '/admin/complaints', name: 'Admin Aduan & Keamanan (/admin/complaints)' },
      { path: '/admin/audit', name: 'Admin Jejak Audit Keamanan (/admin/audit)' },
      { path: '/admin/documents', name: 'Admin Arsip & Dokumen (/admin/documents)' },
      { path: '/admin/settings', name: 'Admin Pengaturan Komplek (/admin/settings)' },
      { path: '/admin/security-gate', name: 'Admin Pos Satpam & QR Scanner (/admin/security-gate)' },
      { path: '/admin/analytics', name: 'Admin Analitik & Tren (/admin/analytics)' },
      { path: '/admin/backup', name: 'Admin Pencadangan & Handover (/admin/backup)' },
      { path: '/admin/whatsapp-bot', name: 'Admin Simulator WhatsApp Bot (/admin/whatsapp-bot)' },
      { path: '/admin/voting', name: 'Admin E-Voting & Musyawarah Warga (/admin/voting)' },
      { path: '/manifest.webmanifest', name: 'PWA Web App Manifest (/manifest.webmanifest)' },
      { path: '/sw.js', name: 'PWA Service Worker (/sw.js)' },
      { path: '/api/health', name: 'Health Check & Diagnostic API (/api/health)' },
    ];

    for (const r of routesToTest) {
      try {
        const res = await fetch(`${BASE_URL}${r.path}`);
        assert(res.status === 200, `${r.name} returned HTTP ${res.status}`);
      } catch (err: any) {
        assert(false, `${r.name} error: ${err.message}`);
      }
    }

    // 3. API Endpoints Transactional Verification
    console.log('\n--- 3. API ENDPOINTS & CLOUD TRANSACTION VERIFICATION ---');

    // A. Document Upload API
    const docRes = await fetch(`${BASE_URL}/api/documents/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Verifikasi Final Sistem WargaHub 2026',
        category: 'SURAT_EDARAN',
        visibility: 'RESIDENT',
        fileSize: '2.1 MB',
      })
    });
    const docData = await docRes.json();
    assert(docRes.status === 201 && Boolean(docData.data?.id), `API /api/documents/create: Document uploaded successfully`);

    // B. Settings Update API
    const setRes = await fetch(`${BASE_URL}/api/settings/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communityName: 'Komplek Perumahan Taman Sejahtera',
        rtRw: 'RT 02 / RW 05',
        address: 'Jl. Taman Sejahtera Utama No. 1, Jakarta',
        monthlyRate: 750000,
        bankName: 'BCA (Bank Central Asia)',
        bankAccount: '8830-1928-33',
        accountHolder: 'PENGURUS KOMPLEK TAMAN SEJAHTERA',
        securityPhone: '0811-9988-7766',
        rwHeadPhone: '0812-3456-7890',
      })
    });
    const setData = await setRes.json();
    assert(setRes.status === 200 && setData.data?.success === true, `API /api/settings/update: Profile and bank settings persisted`);

    // C. Complaint Submission & Dispatch
    const compRes = await fetch(`${BASE_URL}/api/complaints/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop-b-07',
        title: 'Uji Otomatis Sensor Gerbang',
        description: 'Testing otomatisasi workflow keamanan',
        category: 'KEAMANAN',
        location: 'Pos Timur',
      })
    });
    const compData = await compRes.json();
    assert(compRes.status === 201 && Boolean(compData.data?.id), `API /api/complaints/create: Created complaint ${compData.data?.id}`);

    // D. Facility Booking & Approval
    const facRes = await fetch(`${BASE_URL}/api/facilities/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId: 'fac-3',
        facilityName: 'Balai Warga Serbaguna',
        residentName: 'Budi Santoso',
        date: '2026-09-05',
        startTime: '13:00',
        endTime: '16:00',
        purpose: 'Musyawarah Warga Tahunan',
      })
    });
    const facData = await facRes.json();
    assert(facRes.status === 201 && Boolean(facData.data?.id), `API /api/facilities/book: Facility booking registered`);

    // E. Pos Satpam QR Verification
    const passRes = await fetch(`${BASE_URL}/api/security/verify-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrPayload: 'INV-202608-A17' })
    });
    const passData = await passRes.json();
    assert(passRes.status === 200 && passData.data?.isValid === true, `API /api/security/verify-pass: QR Pass verified (${passData.data?.status})`);

    // F. Full Database Backup Export
    const backupRes = await fetch(`${BASE_URL}/api/backup/export`);
    const backupData = await backupRes.json();
    assert(backupRes.status === 200 && Boolean(backupData.tables?.propertiesCount), `API /api/backup/export: Generated full database dump (${backupData.tables?.propertiesCount} properties)`);

    // G. Warga AI Assistant Engine
    const aiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Berapa nomor rekening BCA untuk bayar iuran?',
        propertyCode: 'A-17',
      })
    });
    const aiData = await aiRes.json();
    assert(aiRes.status === 200 && aiData.data?.reply.includes('8830-1928-33'), `API /api/ai/chat: AI Assistant provided accurate context reply`);

    // H. E-Voting & Digital Polls
    const pollRes = await fetch(`${BASE_URL}/api/voting/polls`);
    const pollData = await pollRes.json();
    assert(pollRes.status === 200 && Boolean(pollData.data?.election?.candidates?.length), `API /api/voting/polls: Active election & polls loaded (${pollData.data?.election?.candidates?.length} candidates)`);

    const voteRes = await fetch(`${BASE_URL}/api/voting/cast-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType: 'ELECTION',
        targetId: 'elect-2026',
        choiceId: 'cand-1',
        propertyCode: 'A-17',
        voterName: 'Budi Santoso',
      })
    });
    const voteData = await voteRes.json();
    assert(voteRes.status === 201 && voteData.data?.status === 'RECORDED_AND_VERIFIED', `API /api/voting/cast-vote: Citizen vote securely registered`);

    // I. Property Management Suite Endpoints
    const occRes = await fetch(`${BASE_URL}/api/properties/occupants/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop-a-17',
        fullName: 'Test Penghuni Baru',
        relation: 'ANAK',
        idCardNumber: '3171000000000009',
        phone: '0812-9999-8888',
        isEmergencyContact: true,
      })
    });
    const occData = await occRes.json();
    assert(occRes.status === 201 && Boolean(occData.data?.id), `API /api/properties/occupants/create: New family occupant registered`);

    const occDelRes = await fetch(`${BASE_URL}/api/properties/occupants/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        occupantId: occData.data?.id || 'occ-test',
        fullName: 'Test Penghuni Baru',
        houseCode: 'A-17',
        reason: 'Uji Otomatis Penghapusan Penghuni',
      })
    });
    const occDelData = await occDelRes.json();
    assert(occDelRes.status === 200 && occDelData.data?.success === true, `API /api/properties/occupants/delete: Occupant record removed/archived`);

    const vehCreateRes = await fetch(`${BASE_URL}/api/properties/vehicles/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop-a-17',
        houseCode: 'A-17',
        ownerName: 'Budi Santoso',
        plateNumber: 'B 9999 TST',
        type: 'Mobil',
        brand: 'Toyota',
        model: 'Innova Zenix',
        year: 2024,
        color: 'Hitam',
        rfidTag: 'RFID-9999999',
        gateAccess: 'SEMUA_GERBANG',
        rfidStatus: 'AKTIF',
        notes: 'Uji Otomatis Registrasi Kendaraan & RFID'
      })
    });
    const vehCreateData = await vehCreateRes.json();
    assert(vehCreateRes.status === 201 && Boolean(vehCreateData.data?.id), `API /api/properties/vehicles/create: Vehicle & RFID registered`);

    const vehDelRes = await fetch(`${BASE_URL}/api/properties/vehicles/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: vehCreateData.data?.id || 'veh-test',
        plateNumber: 'B 9999 TST',
        houseCode: 'A-17',
        reason: 'Uji Otomatis Penghapusan Kendaraan & Pencabutan RFID',
      })
    });
    const vehDelData = await vehDelRes.json();
    assert(vehDelRes.status === 200 && vehDelData.data?.success === true, `API /api/properties/vehicles/delete: Vehicle & RFID revoked/archived`);

    const permitRes = await fetch(`${BASE_URL}/api/properties/permits/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyCode: 'A-17',
        workType: 'Pengecatan & Kanopi',
        contractorName: 'Mandor Berkah Test',
        workersCount: 3,
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        description: 'Uji izin renovasi dan pekerja bangunan',
      })
    });
    const permitData = await permitRes.json();
    assert(permitRes.status === 201 && permitData.data?.status === 'APPROVED', `API /api/properties/permits/create: Renovation permit issued`);

    const permitDelRes = await fetch(`${BASE_URL}/api/properties/permits/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitId: permitData.data?.id || 'PERMIT-TEST',
        houseCode: 'A-17',
        contractorName: 'Mandor Berkah Test',
        reason: 'Uji Otomatis Penghapusan Izin Renovasi',
      })
    });
    const permitDelData = await permitDelRes.json();
    assert(permitDelRes.status === 200 && permitDelData.data?.success === true, `API /api/properties/permits/delete: Renovation permit revoked/archived`);

    const utilCreateRes = await fetch(`${BASE_URL}/api/properties/utilities/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop-a-17',
        houseCode: 'A-17',
        plnCapacity: '3.500 VA',
        plnCustomerId: 'PLN-5388123490',
        pamMeterNo: 'PAM-88301',
        pamReadingLastMonth: 120,
        pamReadingThisMonth: 138,
        monthlyIplFee: 750000,
        wasteSchedule: 'SENIN_RABU_JUMAT',
        hasBiopori: true,
        hasSolarPanel: false,
        paymentStatus: 'LUNAS',
        notes: 'Uji Otomatis Pencatatan Meteran Utilitas'
      })
    });
    const utilCreateData = await utilCreateRes.json();
    assert(utilCreateRes.status === 201 && utilCreateData.data?.pamUsage === 18, `API /api/properties/utilities/create: Utility & meter reading recorded`);

    const utilDelRes = await fetch(`${BASE_URL}/api/properties/utilities/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utilityId: 'UTIL-A-17',
        houseCode: 'A-17',
        reason: 'Uji Otomatis Reset Catatan Utilitas',
      })
    });
    const utilDelData = await utilDelRes.json();
    assert(utilDelRes.status === 200 && utilDelData.data?.success === true, `API /api/properties/utilities/delete: Utility record reset/archived`);

    const waTplCreateRes = await fetch(`${BASE_URL}/api/whatsapp/templates/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pengingat Iuran Rutin Bulanan Test',
        category: 'KEUANGAN',
        targetType: 'WARGA_INDIVIDU',
        description: 'Uji otomatis template WhatsApp wa.me',
        templateText: 'Halo {nama_warga} ({nomor_unit}), tagihan {bulan} sebesar Rp {nominal}.',
        tags: ['Test', 'IPL', 'WhatsApp']
      })
    });
    const waTplCreateData = await waTplCreateRes.json();
    assert(waTplCreateRes.status === 201 && Boolean(waTplCreateData.data?.id), `API /api/whatsapp/templates/create: WhatsApp wa.me template created`);

    const waTplDelRes = await fetch(`${BASE_URL}/api/whatsapp/templates/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: waTplCreateData.data?.id || 'WATPL-TEST',
        title: 'Pengingat Iuran Rutin Bulanan Test',
        reason: 'Uji Otomatis Penghapusan Template WA',
      })
    });
    const waTplDelData = await waTplDelRes.json();
    assert(waTplDelRes.status === 200 && waTplDelData.data?.success === true, `API /api/whatsapp/templates/delete: WhatsApp template deleted/archived`);

    const invCreateRes = await fetch(`${BASE_URL}/api/billing/invoices/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyCode: 'A-17',
        houseCode: 'A-17',
        ownerName: 'Budi Santoso',
        periodName: 'Agustus 2026',
        securityFee: 450000,
        cleaningFee: 150000,
        sinkingFund: 150000,
        additionalFee: 0,
        total: 750000,
        dueDate: '2026-08-10',
        status: 'UNPAID'
      })
    });
    const invCreateData = await invCreateRes.json();
    assert(invCreateRes.status === 201 && Boolean(invCreateData.data?.invoiceNumber), `API /api/billing/invoices/create: Single invoice created`);

    const invUpdRes = await fetch(`${BASE_URL}/api/billing/invoices/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invCreateData.data?.id || 'inv-test',
        invoiceNumber: invCreateData.data?.invoiceNumber || 'INV-202608-A17',
        propertyCode: 'A-17',
        status: 'PAID',
        total: 750000,
        dueDate: '2026-08-10',
        paidAt: '2026-08-28'
      })
    });
    const invUpdData = await invUpdRes.json();
    assert(invUpdRes.status === 200 && invUpdData.data?.success === true, `API /api/billing/invoices/update: Invoice marked as paid`);

    const invDelRes = await fetch(`${BASE_URL}/api/billing/invoices/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invCreateData.data?.id || 'inv-test',
        invoiceNumber: invCreateData.data?.invoiceNumber || 'INV-202608-A17',
        propertyCode: 'A-17',
        reason: 'Uji Otomatis Pembatalan Invoice',
      })
    });
    const invDelData = await invDelRes.json();
    assert(invDelRes.status === 200 && invDelData.data?.success === true, `API /api/billing/invoices/delete: Invoice voided/archived`);

    const payCreateRes = await fetch(`${BASE_URL}/api/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyCode: 'A-17',
        houseCode: 'A-17',
        ownerName: 'Budi Santoso',
        periodName: 'Agustus 2026',
        amount: 750000,
        method: 'BCA_TRANSFER',
        reference: 'TRX-A17-TEST',
        paidAt: '2026-08-28',
        status: 'VERIFIED'
      })
    });
    const payCreateData = await payCreateRes.json();
    assert(payCreateRes.status === 201 && Boolean(payCreateData.data?.id), `API /api/payments/create: Manual payment recorded`);

    const payUpdRes = await fetch(`${BASE_URL}/api/payments/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payCreateData.data?.id || 'pay-test',
        amount: 750000,
        method: 'BCA_TRANSFER',
        reference: 'TRX-A17-TEST-UPDATED',
        status: 'VERIFIED',
        paidAt: '2026-08-28'
      })
    });
    const payUpdData = await payUpdRes.json();
    assert(payUpdRes.status === 200 && payUpdData.data?.success === true, `API /api/payments/update: Payment record updated`);

    const payDelRes = await fetch(`${BASE_URL}/api/payments/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payCreateData.data?.id || 'pay-test',
        propertyCode: 'A-17',
        amount: 750000,
        reason: 'Uji Otomatis Penghapusan Pembayaran',
      })
    });
    const payDelData = await payDelRes.json();
    assert(payDelRes.status === 200 && payDelData.data?.success === true, `API /api/payments/delete: Payment record removed/archived`);

    const expCreateRes = await fetch(`${BASE_URL}/api/expenses/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pembelian Lampu PJU LED 50W Komplek Test',
        amount: 450000,
        categoryId: 'cat-pemeliharaan',
        categoryName: 'Pemeliharaan Sarana',
        vendor: 'Toko Terang Abadi Test',
        expenseDate: '2026-08-28',
        description: 'Uji otomatis pencatatan pengeluaran kas'
      })
    });
    const expCreateData = await expCreateRes.json();
    assert(expCreateRes.status === 201 && Boolean(expCreateData.data?.id), `API /api/expenses/create: Expense voucher & receipt recorded`);

    const expUpdRes = await fetch(`${BASE_URL}/api/expenses/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenseId: expCreateData.data?.id || 'exp-test',
        title: 'Pembelian Lampu PJU LED 50W Komplek Test (Updated)',
        categoryName: 'Pemeliharaan Sarana',
        amount: 450000,
        vendor: 'Toko Terang Abadi Test'
      })
    });
    const expUpdData = await expUpdRes.json();
    assert(expUpdRes.status === 200 && expUpdData.data?.success === true, `API /api/expenses/update: Expense voucher updated`);

    const expDelRes = await fetch(`${BASE_URL}/api/expenses/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenseId: expCreateData.data?.id || 'exp-test',
        title: 'Pembelian Lampu PJU LED 50W Komplek Test',
        amount: 450000,
        reason: 'Uji Otomatis Pembatalan Pengeluaran',
      })
    });
    const expDelData = await expDelRes.json();
    assert(expDelRes.status === 200 && expDelData.data?.success === true, `API /api/expenses/delete: Expense record removed/archived`);

    const loanCreateRes = await fetch(`${BASE_URL}/api/expenses/loans/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffName: 'Pak Joko Sutrisno',
        staffRole: 'SATPAM',
        totalLoanAmount: 1500000,
        monthlyDeduction: 500000,
        tenorMonths: 3,
        purpose: 'Uji Otomatis Kasbon Satpam Masuk Sekolah Anak',
      })
    });
    const loanCreateData = await loanCreateRes.json();
    assert(loanCreateRes.status === 201 && Boolean(loanCreateData.data?.id), `API /api/expenses/loans/create: Staff loan / kasbon recorded`);

    const loanInstRes = await fetch(`${BASE_URL}/api/expenses/loans/installment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loanId: loanCreateData.data?.id || 'LOAN-TEST',
        staffName: 'Pak Joko Sutrisno',
        installmentAmount: 500000,
        paymentMethod: 'POTONG_GAJI',
      })
    });
    const loanInstData = await loanInstRes.json();
    assert(loanInstRes.status === 200 && loanInstData.data?.success === true, `API /api/expenses/loans/installment: Salary advance installment paid`);

    const socialCreateRes = await fetch(`${BASE_URL}/api/expenses/social/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: 'Pak Agus Suparman (Satpam)',
        recipientRole: 'SATPAM',
        aidType: 'SANTUNAN_KESEHATAN',
        amount: 1000000,
        description: 'Uji otomatis santunan biaya rawat inap istri satpam',
        hospitalOrDetails: 'RSUD Al-Ihsan Bandung'
      })
    });
    const socialCreateData = await socialCreateRes.json();
    assert(socialCreateRes.status === 201 && Boolean(socialCreateData.data?.id), `API /api/expenses/social/create: Social & health aid granted`);

    const prjCreateRes = await fetch(`${BASE_URL}/api/expenses/projects/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'Pengecatan Gapura Utama Komplek Test',
        projectType: 'PENGECATAN_KOMPLEK',
        budgetAmount: 3500000,
        vendorOrContractor: 'Mandor Wawan Test',
        description: 'Uji otomatis pencatatan proyek cat & perbaikan fasum komplek',
        location: 'Gerbang Utama & Tembok Pembatas'
      })
    });
    const prjCreateData = await prjCreateRes.json();
    assert(prjCreateRes.status === 201 && Boolean(prjCreateData.data?.id), `API /api/expenses/projects/create: Facility maintenance project recorded`);

    const ledCreateRes = await fetch(`${BASE_URL}/api/ledger/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'acc-main',
        direction: 'IN',
        amount: 500000,
        sourceType: 'SUMBANGAN_WARGA',
        description: 'Uji Otomatis Penerimaan Sumbangan Warga',
        entryDate: '2026-08-28',
      })
    });
    const ledCreateData = await ledCreateRes.json();
    assert(ledCreateRes.status === 201 && Boolean(ledCreateData.data?.id), `API /api/ledger/create: Manual journal entry recorded`);

    const ledUpdRes = await fetch(`${BASE_URL}/api/ledger/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ledgerId: ledCreateData.data?.id || 'led-test',
        description: 'Uji Otomatis Penerimaan Sumbangan Warga (Updated)',
        amount: 500000,
        direction: 'IN',
      })
    });
    const ledUpdData = await ledUpdRes.json();
    assert(ledUpdRes.status === 200 && ledUpdData.data?.success === true, `API /api/ledger/update: Journal entry updated`);

    const ledDelRes = await fetch(`${BASE_URL}/api/ledger/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ledgerId: ledCreateData.data?.id || 'led-test',
        description: 'Uji Otomatis Penerimaan Sumbangan Warga',
        amount: 500000,
        reason: 'Uji Otomatis Pembatalan Jurnal Kas',
      })
    });
    const ledDelData = await ledDelRes.json();
    assert(ledDelRes.status === 200 && ledDelData.data?.success === true, `API /api/ledger/delete: Journal entry removed/archived`);

    const budCreateRes = await fetch(`${BASE_URL}/api/budget/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Operasional Keamanan & Ronda Warga Test',
        period: 'Agustus 2026',
        budgetAmount: 5000000,
        actualAmount: 2500000,
        pic: 'Seksi Keamanan Test',
        notes: 'Uji otomatis penetapan pos pagu anggaran',
      })
    });
    const budCreateData = await budCreateRes.json();
    assert(budCreateRes.status === 201 && Boolean(budCreateData.data?.id), `API /api/budget/create: Budget allocation created & authorized`);

    const budUpdRes = await fetch(`${BASE_URL}/api/budget/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetId: budCreateData.data?.id || 'bud-test',
        category: 'Operasional Keamanan & Ronda Warga Test (Updated)',
        budgetAmount: 5500000,
        actualAmount: 2500000,
      })
    });
    const budUpdData = await budUpdRes.json();
    assert(budUpdRes.status === 200 && budUpdData.data?.success === true, `API /api/budget/update: Budget allocation updated`);

    const budDelRes = await fetch(`${BASE_URL}/api/budget/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetId: budCreateData.data?.id || 'bud-test',
        category: 'Operasional Keamanan & Ronda Warga Test',
        budgetAmount: 5500000,
        reason: 'Uji Otomatis Pembatalan Pos Anggaran',
      })
    });
    const budDelData = await budDelRes.json();
    assert(budDelRes.status === 200 && budDelData.data?.success === true, `API /api/budget/delete: Budget allocation removed/archived`);

    const propUpdRes = await fetch(`${BASE_URL}/api/properties/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyCode: 'A-17',
        buildingType: 'Tipe 72/120',
        landArea: 120,
        buildingArea: 72,
        plnCapacity: '3.500 VA',
        pamMeterNo: 'PAM-88301',
        occupancyStatus: 'Dihuni Pemilik',
      })
    });
    const propUpdData = await propUpdRes.json();
    assert(propUpdRes.status === 200 && propUpdData.data?.pamMeterNo === 'PAM-88301', `API /api/properties/update: Technical specifications updated`);
    const propCreateFullRes = await fetch(`${BASE_URL}/api/properties/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'A-99',
        number: '99',
        blockId: 'block-a',
        address: 'Jl. Taman Sejahtera Blok A No. 99',
        occupancyStatus: 'OWNER_OCCUPIED',
        ownerName: 'Warga Baru Uji',
        ownerPhone: '0812-9999-0000',
        buildingType: 'Tipe 120/200',
        landArea: 200,
        buildingArea: 120,
        plnCapacity: '5.500 VA',
        pamMeterNo: 'PAM-88399',
        monthlyRate: 750000,
      })
    });
    const propCreateFullData = await propCreateFullRes.json();
    assert(propCreateFullRes.status === 201 && propCreateFullData.data?.code === 'A-99', `API /api/properties/create (Full Columns): Created unit A-99`);

    const propDelRes = await fetch(`${BASE_URL}/api/properties/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop-a-99',
        propertyCode: 'A-99',
        reason: 'Uji Otomatis Penghapusan Unit',
      })
    });
    const propDelData = await propDelRes.json();
    assert(propDelRes.status === 200 && propDelData.data?.success === true, `API /api/properties/delete: Property A-99 archived/deleted`);

    // J. Audit Trail Logging Verification
    const auditRes = await sql`
      SELECT count(*) as total FROM audit_logs
    `;
    assert(Number(auditRes[0].total) > 0, `Neon DB audit_logs contains ${auditRes[0].total} verified audit records`);

    console.log('\n====================================================');
    console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log('====================================================');
  } catch (e: any) {
    console.error('Verification error:', e);
  } finally {
    await sql.end();
  }
}

runVerification();
