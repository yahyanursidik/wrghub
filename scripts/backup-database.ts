import postgres from 'postgres';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function backupDatabase() {
  console.log('=== MEMULAI BACKUP BASIS DATA WARGAHUB ===');

  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupJsonPath = path.join(backupsDir, `backup-pre-clean-${timestamp}.json`);

  // 1. Backup local SQLite database if exists
  const localDbPath = path.resolve(process.cwd(), 'data', 'wargahub.db');
  if (fs.existsSync(localDbPath)) {
    const backupDbPath = path.join(backupsDir, `wargahub-pre-clean-${timestamp}.db`);
    fs.copyFileSync(localDbPath, backupDbPath);
    console.log(`✓ Local SQLite backup tersimpan di: ${backupDbPath}`);
  }

  // 2. Backup Neon PostgreSQL
  console.log('Menghubungkan ke Neon PostgreSQL...');
  const sql = postgres(connectionString, { ssl: 'require', max: 5 });

  const tables = [
    'communities',
    'blocks',
    'properties',
    'persons',
    'households',
    'household_members',
    'property_ownerships',
    'occupancies',
    'vehicles',
    'users',
    'user_property_access',
    'fee_types',
    'fee_rules',
    'billing_periods',
    'invoices',
    'invoice_items',
    'payments',
    'payment_allocations',
    'accounts',
    'ledger_entries',
    'expense_categories',
    'expenses',
    'budgets',
    'budget_items',
    'monthly_snapshots',
    'announcements',
    'complaints',
    'facilities',
    'maintenance_requests',
    'documents',
    'audit_logs',
    'settings'
  ];

  const backupData: Record<string, any[]> = {};
  let totalRecords = 0;

  for (const table of tables) {
    try {
      const rows = await sql`SELECT * FROM ${sql(table)}`;
      backupData[table] = rows;
      totalRecords += rows.length;
      console.log(`  - Tabel ${table}: ${rows.length} records dibackup`);
    } catch (err: any) {
      console.warn(`  ! Tabel ${table} tidak ditemukan atau gagal dibaca: ${err.message}`);
    }
  }

  fs.writeFileSync(backupJsonPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\n✓ Backup Neon PostgreSQL selesai: ${totalRecords} total records disimpan ke ${backupJsonPath}`);

  await sql.end();
}

backupDatabase().catch(err => {
  console.error('Backup gagal:', err);
  process.exit(1);
});
