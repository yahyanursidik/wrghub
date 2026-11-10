import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { initializeDatabase } from '../src/db/migrate';
import { hashPassword } from '../src/lib/passwords';

const directory = await mkdtemp(path.join(tmpdir(), 'wargahub-ui-fixture-'));
process.env.DATABASE_URL = '';
process.env.WARGAHUB_DATA_DIR = directory;
const client = await initializeDatabase(path.join(directory, 'wargahub.db'));
const password = randomBytes(18).toString('base64url');
const fixtureId = randomBytes(16).toString('hex');
try {
  await client.executeMultiple(`
    INSERT INTO communities (id,name,code,address,city) VALUES ('comm-01','Lingkungan uji','TEST','Alamat pengujian','Kota uji');
    INSERT INTO blocks (id,community_id,name,code) VALUES ('block-test','comm-01','Blok uji','A');
    INSERT INTO properties (id,community_id,block_id,code,number,address,occupancy_status,notes) VALUES ('prop-a-01','comm-01','block-test','A-01','01','Rumah uji 01','OWNER_OCCUPIED','fixture:${fixtureId}'),('prop-a-02','comm-01','block-test','A-02','02','Rumah uji 02','OWNER_OCCUPIED','fixture:${fixtureId}');
    INSERT INTO users (id,username,email,full_name,role,is_active) VALUES ('ui-admin','ui_admin','admin@example.test','Pengurus uji','CHAIRMAN',1),('ui-resident','ui_resident','resident@example.test','Warga uji','HOUSEHOLD_HEAD',1);
    INSERT INTO users (id,username,email,full_name,role,is_active) VALUES ('ui-security','ui_security','security@example.test','Petugas uji','SECURITY',1),('ui-treasurer','ui_treasurer','treasurer@example.test','Bendahara uji','TREASURER',1);
    INSERT INTO user_property_access (id,user_id,property_id,relationship,started_at) VALUES ('access-test','ui-resident','prop-a-01','OWNER','2026-01-01');
    INSERT INTO accounts (id,community_id,code,name,type,balance) VALUES ('acc-main','comm-01','TEST-BANK','Rekening uji','BANK',1000000),('acc-cash','comm-01','TEST-CASH','Kas uji','CASH',200000);
    INSERT INTO expense_categories (id,community_id,name,code) VALUES ('cat-pemeliharaan','comm-01','Pemeliharaan','PEMELIHARAAN');
    INSERT INTO expenses (id,community_id,category_id,account_id,title,amount,expense_date,status) VALUES ('expense-test','comm-01','cat-pemeliharaan','acc-main','Perbaikan lampu uji',50000,'2026-10-12','APPROVED');
    INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,source_id,description) VALUES ('expense-ledger-test','acc-main','2026-10-12','OUT',50000,'EXPENSE','expense-test','Perbaikan lampu uji');
    INSERT INTO facilities (id,community_id,code,name,category,location,condition) VALUES ('fac-test','comm-01','TEST-FAC','Balai uji','FASUM','Area uji','GOOD');
    INSERT INTO maintenance_requests (id,facility_id,title,description,status) VALUES ('repair-test','fac-test','Perawatan uji','Fixture perawatan','PLANNED');
    INSERT INTO billing_periods (id,community_id,year,month,name,due_date,status) VALUES ('period-test','comm-01',2026,10,'Oktober 2026','2026-10-31','OPEN');
    INSERT INTO invoices (id,property_id,billing_period_id,invoice_number,status,subtotal,total,paid_amount,due_date,issued_at) VALUES ('invoice-a-01','prop-a-01','period-test','INV-TEST-A01','UNPAID',250000,250000,0,'2026-10-31','2026-10-01'),('invoice-a-02','prop-a-02','period-test','INV-TEST-A02','UNPAID',250000,250000,0,'2026-10-31','2026-10-01');
    INSERT INTO payments (id,property_id,billing_period_id,invoice_id,amount,reference,status,paid_at) VALUES ('payment-test','prop-a-01','period-test','invoice-a-01',250000,'PRIVATE-FINANCIAL-FIXTURE-REFERENCE','PENDING','2026-10-10');
  `);
  const { setLocalCredentialHash } = await import('../src/services/local-credentials.service');
  await setLocalCredentialHash('ui-admin', hashPassword(password));
  await setLocalCredentialHash('ui-resident', hashPassword(password));
  await setLocalCredentialHash('ui-security', hashPassword(password));
  await setLocalCredentialHash('ui-treasurer', hashPassword(password));
  const additional = [
    ['super', 'SUPER_ADMIN'], ['secretary', 'SECRETARY'], ['people', 'RESIDENT_ADMIN'],
    ['maintenance', 'MAINTENANCE'], ['auditor', 'AUDITOR'],
    ['owner', 'HOUSE_OWNER', 'prop-a-01'], ['tenant', 'RESIDENT', 'prop-a-02'],
    ['viewer', 'VIEWER', 'prop-a-01'],
  ];
  for (const [key, role, propertyId] of additional) {
    const id = `ui-${key}`;
    await client.execute({ sql: 'INSERT INTO users (id, username, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)', args: [id, `ui_${key}`, `${key}@example.test`, `Fixture ${key}`, role] });
    if (propertyId) await client.execute({ sql: 'INSERT INTO user_property_access (id, user_id, property_id, relationship, started_at) VALUES (?, ?, ?, ?, ?)',
      args: [`access-${key}`, id, propertyId, 'FAMILY', '2026-01-01'] });
    await setLocalCredentialHash(id, hashPassword(password));
  }
  await client.execute("UPDATE properties SET occupancy_status = 'RENTED' WHERE id = 'prop-a-02'");
  await client.execute("INSERT INTO payments (id, property_id, billing_period_id, invoice_id, amount, reference, status, paid_at) VALUES ('receipt-test','prop-a-02','period-test','invoice-a-02',25000,'VERIFIED-FIXTURE-RECEIPT','VERIFIED','2026-10-10')");
  process.stdout.write(JSON.stringify({ directory, fixtureId, username: 'ui_admin', residentUsername: 'ui_resident', password }));
} finally {
  client.close();
  const { client: appClient } = await import('../src/db');
  appClient.close();
}
