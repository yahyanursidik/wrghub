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
