import type { Client } from '@libsql/client';

export const operationColumns = {
  properties: { profile_json: "TEXT NOT NULL DEFAULT '{}'" },
  household_members: { profile_json: "TEXT NOT NULL DEFAULT '{}'" },
  facilities: { capacity: 'INTEGER', hourly_rate: 'NUMERIC', operating_hours: 'TEXT', pic_name: 'TEXT', archived_at: 'TEXT' },
} as const;

export const operationTables = [
  `CREATE TABLE IF NOT EXISTS property_utilities (
    id TEXT PRIMARY KEY, property_id TEXT NOT NULL UNIQUE REFERENCES properties(id), pln_customer_id TEXT NOT NULL,
    meter_previous NUMERIC NOT NULL CHECK (meter_previous >= 0), meter_current NUMERIC NOT NULL CHECK (meter_current >= meter_previous),
    waste_schedule TEXT NOT NULL, has_biopori BOOLEAN NOT NULL DEFAULT false, has_solar_panel BOOLEAN NOT NULL DEFAULT false,
    notes TEXT, updated_at TEXT NOT NULL, archived_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS account_recovery_tokens (user_id TEXT PRIMARY KEY REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE, issued_role TEXT NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS renovation_permits (
    id TEXT PRIMARY KEY, property_id TEXT NOT NULL REFERENCES properties(id),
    payload TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('PENDING_REVIEW','APPROVED','COMPLETED','SUSPENDED')),
    issued_at TEXT NOT NULL, archived_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_renovation_property ON renovation_permits(property_id, archived_at)`,
  `CREATE TABLE IF NOT EXISTS staff_loans (
    id TEXT PRIMARY KEY, payload TEXT NOT NULL, amount NUMERIC NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL CHECK (status IN ('PENDING_APPROVAL','ACTIVE_INSTALLMENT','REJECTED')),
    approved_by TEXT, created_at TEXT NOT NULL, archived_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS staff_loan_installments (
    id TEXT PRIMARY KEY, loan_id TEXT NOT NULL REFERENCES staff_loans(id), installment_no INTEGER NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0), payment_date TEXT NOT NULL, payment_method TEXT NOT NULL,
    received_by TEXT NOT NULL, notes TEXT, UNIQUE(loan_id, installment_no)
  )`,
  `CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id TEXT PRIMARY KEY, task_name TEXT NOT NULL, category TEXT NOT NULL, location TEXT NOT NULL,
    assigned_to TEXT NOT NULL, notes TEXT, completed_at TEXT, completed_by TEXT REFERENCES users(id), created_at TEXT NOT NULL
  )`,
] as const;

export async function migrateSqliteOperations(client: Client) {
  const tx = await client.transaction('write');
  try {
    for (const [table, columns] of Object.entries(operationColumns)) {
      const known = new Set((await tx.execute(`PRAGMA table_info(${table})`)).rows.map(row => row.name));
      for (const [name, definition] of Object.entries(columns)) {
        if (!known.has(name)) await tx.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
      }
    }
    for (const statement of operationTables) await tx.execute(statement);
    await tx.commit();
  } finally { tx.close(); }
}
