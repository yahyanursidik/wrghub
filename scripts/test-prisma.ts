import { prisma, isPrismaConnected } from '../src/db/prisma';

async function main() {
  console.log('=== VERIFIKASI SINGLETON PRISMA 7 ORM (src/db/prisma.ts) ===');
  
  const connected = await isPrismaConnected();
  console.log(`✓ Status Koneksi Database: ${connected ? 'ONLINE / CONNECTED' : 'OFFLINE'}`);

  const userCount = await prisma.users.count();
  console.log(`✓ Total User Terdaftar: ${userCount}`);

  const activeUsers = await prisma.users.findMany({
    where: { is_active: true },
    select: { username: true, role: true, full_name: true }
  });
  console.log('✓ Akun Pengurus Aktif:');
  activeUsers.forEach(u => {
    console.log(`  - [${u.role}] ${u.username} (${u.full_name})`);
  });

  const accountBalances = await prisma.accounts.findMany({
    select: { code: true, name: true, type: true, balance: true }
  });
  console.log('✓ Rekening Kas Paguyuban:');
  accountBalances.forEach(a => {
    console.log(`  - [${a.type}] ${a.name} (${a.code}): Rp ${Number(a.balance).toLocaleString('id-ID')}`);
  });

  console.log('\n>>> SUKSES: Prisma 7 ORM terintegrasi penuh dan siap digunakan di seluruh aplikasi WargaHub! <<<');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
