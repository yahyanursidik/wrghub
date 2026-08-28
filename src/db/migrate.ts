import { createClient } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';

export async function initializeDatabase(dbPath?: string) {
  const targetPath = dbPath || path.resolve(process.cwd(), 'data/wargahub.db');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const client = createClient({
    url: `file:${targetPath.replace(/\\/g, '/')}`
  });

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT,
      settings_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      block_id TEXT REFERENCES blocks(id),
      code TEXT NOT NULL UNIQUE,
      number TEXT NOT NULL,
      address TEXT NOT NULL,
      occupancy_status TEXT NOT NULL DEFAULT 'OWNER_OCCUPIED',
      is_active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS households (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS household_members (
      id TEXT PRIMARY KEY,
      household_id TEXT REFERENCES households(id),
      person_id TEXT REFERENCES persons(id),
      relationship TEXT NOT NULL,
      birth_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      started_at TEXT,
      ended_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS property_ownerships (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      person_id TEXT REFERENCES persons(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS occupancies (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      household_id TEXT REFERENCES households(id),
      type TEXT NOT NULL DEFAULT 'OWNER',
      is_active INTEGER NOT NULL DEFAULT 1,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      owner_person_id TEXT REFERENCES persons(id),
      plate_number TEXT NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      color TEXT NOT NULL,
      year TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      person_id TEXT REFERENCES persons(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_property_access (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      property_id TEXT REFERENCES properties(id),
      relationship TEXT NOT NULL,
      can_view_billing INTEGER NOT NULL DEFAULT 1,
      can_pay INTEGER NOT NULL DEFAULT 1,
      can_edit_occupants INTEGER NOT NULL DEFAULT 0,
      can_view_property INTEGER NOT NULL DEFAULT 1,
      started_at TEXT NOT NULL,
      ended_at TEXT
    );

    CREATE TABLE IF NOT EXISTS fee_types (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      default_amount REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fee_rules (
      id TEXT PRIMARY KEY,
      fee_type_id TEXT REFERENCES fee_types(id),
      amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'MONTHLY',
      due_day INTEGER NOT NULL DEFAULT 10,
      effective_from TEXT NOT NULL,
      effective_until TEXT,
      scope TEXT NOT NULL DEFAULT 'ALL',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing_periods (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      billing_period_id TEXT REFERENCES billing_periods(id),
      invoice_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'UNPAID',
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      paid_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT REFERENCES invoices(id),
      fee_type_id TEXT REFERENCES fee_types(id),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      billing_period_id TEXT REFERENCES billing_periods(id),
      invoice_id TEXT REFERENCES invoices(id),
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'TRANSFER',
      reference TEXT,
      proof_file_url TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      paid_at TEXT NOT NULL,
      submitted_by TEXT REFERENCES users(id),
      verified_by TEXT REFERENCES users(id),
      verified_at TEXT,
      rejection_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_allocations (
      id TEXT PRIMARY KEY,
      payment_id TEXT REFERENCES payments(id),
      invoice_id TEXT REFERENCES invoices(id),
      amount REAL NOT NULL,
      allocated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'BANK',
      account_number TEXT,
      bank_name TEXT,
      balance REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      account_id TEXT REFERENCES accounts(id),
      entry_date TEXT NOT NULL,
      direction TEXT NOT NULL,
      amount REAL NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT,
      description TEXT NOT NULL,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      budget_percentage REAL,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      category_id TEXT REFERENCES expense_categories(id),
      account_id TEXT REFERENCES accounts(id),
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      receipt_file_url TEXT,
      recorded_by TEXT REFERENCES users(id),
      approved_by TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      year INTEGER NOT NULL,
      name TEXT NOT NULL,
      total_amount REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budget_items (
      id TEXT PRIMARY KEY,
      budget_id TEXT REFERENCES budgets(id),
      category_id TEXT REFERENCES expense_categories(id),
      name TEXT NOT NULL,
      monthly_budget REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_snapshots (
      id TEXT PRIMARY KEY,
      billing_period_id TEXT REFERENCES billing_periods(id) UNIQUE,
      total_properties INTEGER NOT NULL,
      paid_properties INTEGER NOT NULL,
      unpaid_properties INTEGER NOT NULL,
      opening_balance REAL NOT NULL,
      income REAL NOT NULL,
      expense REAL NOT NULL,
      closing_balance REAL NOT NULL,
      breakdown_json TEXT,
      unpaid_properties_list_json TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'INFO',
      audience TEXT NOT NULL DEFAULT 'ALL',
      target_block_id TEXT REFERENCES blocks(id),
      scheduled_at TEXT,
      location TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      published_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      submitted_by_person_id TEXT REFERENCES persons(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'FASILITAS',
      location TEXT,
      status TEXT NOT NULL DEFAULT 'REPORTED',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      photo_url TEXT,
      resolution_notes TEXT,
      resolved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaint_updates (
      id TEXT PRIMARY KEY,
      complaint_id TEXT REFERENCES complaints(id),
      user_id TEXT REFERENCES users(id),
      message TEXT NOT NULL,
      new_status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      condition TEXT NOT NULL DEFAULT 'GOOD',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id TEXT PRIMARY KEY,
      facility_id TEXT REFERENCES facilities(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      cost_estimate REAL NOT NULL DEFAULT 0,
      actual_cost REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PLANNED',
      scheduled_date TEXT,
      completed_date TEXT,
      performed_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size TEXT,
      visibility TEXT NOT NULL DEFAULT 'RESIDENT',
      uploaded_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      meeting_date TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      document_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT REFERENCES users(id),
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value_json TEXT,
      new_value_json TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      link_url TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      read_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      community_id TEXT REFERENCES communities(id),
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(code);
    CREATE INDEX IF NOT EXISTS idx_invoices_property_id ON invoices(property_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_billing_period_id ON invoices(billing_period_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_ledger_entries_entry_date ON ledger_entries(entry_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
  `);

  return client;
}
