process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '4321';

console.log('====================================================');
console.log('  WARGAHUB — SISTEM TATA KELOLA KOMPLEK (MASTER PROD)');
console.log('====================================================');
console.log('  Status: ACTIVE & LIVE PRODUCTION');
console.log('  Database: Neon PostgreSQL Cloud (Pooler Enabled)');
console.log('  Portals Ready:');
console.log('   - 📱 Portal Warga Mobile:        http://localhost:4321/');
console.log('   - 📊 Laporan Transparansi Warga: http://localhost:4321/transparency');
console.log('   - ⚙️ Dashboard Ketua Komplek:    http://localhost:4321/admin');
console.log('   - 🛡️ Pos Satpam & QR Scanner:   http://localhost:4321/admin/security-gate');
console.log('   - 🗳️ E-Voting & Musyawarah:      http://localhost:4321/admin/voting');
console.log('   - 📲 Simulator WhatsApp Bot:     http://localhost:4321/admin/whatsapp-bot');
console.log('   - 🩺 Health & Diagnostics:       http://localhost:4321/api/health');
console.log('====================================================');

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

await import('./dist/server/entry.mjs');
