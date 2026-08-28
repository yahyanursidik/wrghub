import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function migrateNeon() {
  console.log('Connecting to Neon PostgreSQL database...');
  const sql = postgres(connectionString, { ssl: 'require', max: 5 });

  console.log('Creating database schema on Neon PostgreSQL...');

  await sql`
    CREATE TABLE IF NOT EXISTS communities (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(64) NOT NULL UNIQUE,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20),
      settings_json TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blocks (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      block_id VARCHAR(64) REFERENCES blocks(id),
      code VARCHAR(30) NOT NULL UNIQUE,
      number VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      occupancy_status VARCHAR(50) NOT NULL DEFAULT 'OWNER_OCCUPIED',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS persons (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(100),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS households (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS household_members (
      id VARCHAR(64) PRIMARY KEY,
      household_id VARCHAR(64) REFERENCES households(id),
      person_id VARCHAR(64) REFERENCES persons(id),
      relationship VARCHAR(50) NOT NULL,
      birth_date VARCHAR(30),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      started_at VARCHAR(30),
      ended_at VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS property_ownerships (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      person_id VARCHAR(64) REFERENCES persons(id),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      started_at VARCHAR(30) NOT NULL,
      ended_at VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS occupancies (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      household_id VARCHAR(64) REFERENCES households(id),
      type VARCHAR(50) NOT NULL DEFAULT 'OWNER',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      started_at VARCHAR(30) NOT NULL,
      ended_at VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      owner_person_id VARCHAR(64) REFERENCES persons(id),
      plate_number VARCHAR(30) NOT NULL,
      type VARCHAR(30) NOT NULL,
      brand VARCHAR(50) NOT NULL,
      model VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      year VARCHAR(10),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      avatar_url TEXT,
      person_id VARCHAR(64) REFERENCES persons(id),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_property_access (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id),
      property_id VARCHAR(64) REFERENCES properties(id),
      relationship VARCHAR(50) NOT NULL,
      can_view_billing BOOLEAN NOT NULL DEFAULT TRUE,
      can_pay BOOLEAN NOT NULL DEFAULT TRUE,
      can_edit_occupants BOOLEAN NOT NULL DEFAULT FALSE,
      can_view_property BOOLEAN NOT NULL DEFAULT TRUE,
      started_at VARCHAR(30) NOT NULL,
      ended_at VARCHAR(30)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS fee_types (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      default_amount NUMERIC(14,2) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS fee_rules (
      id VARCHAR(64) PRIMARY KEY,
      fee_type_id VARCHAR(64) REFERENCES fee_types(id),
      amount NUMERIC(14,2) NOT NULL,
      frequency VARCHAR(30) NOT NULL DEFAULT 'MONTHLY',
      due_day INT NOT NULL DEFAULT 10,
      effective_from VARCHAR(30) NOT NULL,
      effective_until VARCHAR(30),
      scope VARCHAR(50) NOT NULL DEFAULT 'ALL',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_periods (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      year INT NOT NULL,
      month INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      due_date VARCHAR(30) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      billing_period_id VARCHAR(64) REFERENCES billing_periods(id),
      invoice_number VARCHAR(100) NOT NULL UNIQUE,
      status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
      subtotal NUMERIC(14,2) NOT NULL,
      total NUMERIC(14,2) NOT NULL,
      paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      due_date VARCHAR(30) NOT NULL,
      issued_at VARCHAR(30) NOT NULL,
      paid_at VARCHAR(30),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id VARCHAR(64) PRIMARY KEY,
      invoice_id VARCHAR(64) REFERENCES invoices(id),
      fee_type_id VARCHAR(64) REFERENCES fee_types(id),
      description TEXT NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      billing_period_id VARCHAR(64) REFERENCES billing_periods(id),
      invoice_id VARCHAR(64) REFERENCES invoices(id),
      amount NUMERIC(14,2) NOT NULL,
      method VARCHAR(50) NOT NULL DEFAULT 'TRANSFER',
      reference VARCHAR(100),
      proof_file_url TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      paid_at VARCHAR(30) NOT NULL,
      submitted_by VARCHAR(64) REFERENCES users(id),
      verified_by VARCHAR(64) REFERENCES users(id),
      verified_at VARCHAR(30),
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_allocations (
      id VARCHAR(64) PRIMARY KEY,
      payment_id VARCHAR(64) REFERENCES payments(id),
      invoice_id VARCHAR(64) REFERENCES invoices(id),
      amount NUMERIC(14,2) NOT NULL,
      allocated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'BANK',
      account_number VARCHAR(100),
      bank_name VARCHAR(100),
      balance NUMERIC(14,2) NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id VARCHAR(64) PRIMARY KEY,
      account_id VARCHAR(64) REFERENCES accounts(id),
      entry_date VARCHAR(30) NOT NULL,
      direction VARCHAR(10) NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      source_type VARCHAR(50) NOT NULL,
      source_id VARCHAR(64),
      description TEXT NOT NULL,
      created_by VARCHAR(64) REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL,
      budget_percentage NUMERIC(5,2),
      icon VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      category_id VARCHAR(64) REFERENCES expense_categories(id),
      account_id VARCHAR(64) REFERENCES accounts(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      amount NUMERIC(14,2) NOT NULL,
      expense_date VARCHAR(30) NOT NULL,
      receipt_file_url TEXT,
      recorded_by VARCHAR(64) REFERENCES users(id),
      approved_by VARCHAR(64) REFERENCES users(id),
      status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      year INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      total_amount NUMERIC(14,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS budget_items (
      id VARCHAR(64) PRIMARY KEY,
      budget_id VARCHAR(64) REFERENCES budgets(id),
      category_id VARCHAR(64) REFERENCES expense_categories(id),
      name VARCHAR(255) NOT NULL,
      monthly_budget NUMERIC(14,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS monthly_snapshots (
      id VARCHAR(64) PRIMARY KEY,
      billing_period_id VARCHAR(64) REFERENCES billing_periods(id) UNIQUE,
      total_properties INT NOT NULL,
      paid_properties INT NOT NULL,
      unpaid_properties INT NOT NULL,
      opening_balance NUMERIC(14,2) NOT NULL,
      income NUMERIC(14,2) NOT NULL,
      expense NUMERIC(14,2) NOT NULL,
      closing_balance NUMERIC(14,2) NOT NULL,
      breakdown_json TEXT,
      unpaid_properties_list_json TEXT,
      generated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'INFO',
      audience VARCHAR(50) NOT NULL DEFAULT 'ALL',
      target_block_id VARCHAR(64) REFERENCES blocks(id),
      scheduled_at VARCHAR(100),
      location VARCHAR(255),
      is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_by VARCHAR(64) REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS complaints (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64) REFERENCES properties(id),
      submitted_by_person_id VARCHAR(64) REFERENCES persons(id),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'FASILITAS',
      location VARCHAR(255),
      status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
      priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
      photo_url TEXT,
      resolution_notes TEXT,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS facilities (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      condition VARCHAR(50) NOT NULL DEFAULT 'GOOD',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id VARCHAR(64) PRIMARY KEY,
      facility_id VARCHAR(64) REFERENCES facilities(id),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      cost_estimate NUMERIC(14,2) NOT NULL DEFAULT 0,
      actual_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
      scheduled_date VARCHAR(50),
      completed_date VARCHAR(50),
      performed_by VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      file_url TEXT NOT NULL,
      file_size VARCHAR(50),
      visibility VARCHAR(50) NOT NULL DEFAULT 'RESIDENT',
      uploaded_by VARCHAR(64) REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      actor_user_id VARCHAR(64) REFERENCES users(id),
      actor_name VARCHAR(255) NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100) NOT NULL,
      old_value_json TEXT,
      new_value_json TEXT,
      ip_address VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(64) PRIMARY KEY,
      community_id VARCHAR(64) REFERENCES communities(id),
      key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_properties_code_pg ON properties(code);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_prop_pg ON invoices(property_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_prop_pg ON payments(property_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ledger_date_pg ON ledger_entries(entry_date);`;

  console.log('Neon PostgreSQL database migrated successfully!');
  await sql.end();
}

migrateNeon().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
