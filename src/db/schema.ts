import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Communities
export const communities = sqliteTable('communities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code'),
  settingsJson: text('settings_json'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blocks
export const blocks = sqliteTable('blocks', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Properties
export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  blockId: text('block_id').references(() => blocks.id),
  code: text('code').notNull().unique(), // e.g. "A-17"
  number: text('number').notNull(),
  address: text('address').notNull(),
  occupancyStatus: text('occupancy_status').notNull().default('OWNER_OCCUPIED'), // OWNER_OCCUPIED, RENTED, BORROWED, VACANT, RENOVATION, FOR_SALE, OTHER
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Persons (Real people in the physical world)
export const persons = sqliteTable('persons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Households
export const households = sqliteTable('households', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Household Members
export const householdMembers = sqliteTable('household_members', {
  id: text('id').primaryKey(),
  householdId: text('household_id').references(() => households.id),
  personId: text('person_id').references(() => persons.id),
  relationship: text('relationship').notNull(), // HEAD, SPOUSE, CHILD, PARENT, SIBLING, DOMESTIC_HELPER, OTHER
  birthDate: text('birth_date'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startedAt: text('started_at'),
  endedAt: text('ended_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Property Ownerships (Historical tracking)
export const propertyOwnerships = sqliteTable('property_ownerships', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  personId: text('person_id').references(() => persons.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Occupancies (Historical tracking of households in properties)
export const occupancies = sqliteTable('occupancies', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  householdId: text('household_id').references(() => households.id),
  type: text('type').notNull().default('OWNER'), // OWNER, TENANT, GUEST, OTHER
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Vehicles
export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  ownerPersonId: text('owner_person_id').references(() => persons.id),
  plateNumber: text('plate_number').notNull(),
  type: text('type').notNull(), // Mobil, Motor, Sepeda, Lainnya
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  color: text('color').notNull(),
  year: text('year'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Users (Auth accounts)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // SUPER_ADMIN, CHAIRMAN, SECRETARY, TREASURER, RESIDENT_ADMIN, SECURITY, MAINTENANCE, HOUSE_OWNER, HOUSEHOLD_HEAD, RESIDENT, AUDITOR, VIEWER
  avatarUrl: text('avatar_url'),
  personId: text('person_id').references(() => persons.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// User Property Access
export const userPropertyAccess = sqliteTable('user_property_access', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  propertyId: text('property_id').references(() => properties.id),
  relationship: text('relationship').notNull(), // OWNER, TENANT, FAMILY
  canViewBilling: integer('can_view_billing', { mode: 'boolean' }).notNull().default(true),
  canPay: integer('can_pay', { mode: 'boolean' }).notNull().default(true),
  canEditOccupants: integer('can_edit_occupants', { mode: 'boolean' }).notNull().default(false),
  canViewProperty: integer('can_view_property', { mode: 'boolean' }).notNull().default(true),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
});

// Fee Types
export const feeTypes = sqliteTable('fee_types', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  defaultAmount: real('default_amount').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Fee Rules
export const feeRules = sqliteTable('fee_rules', {
  id: text('id').primaryKey(),
  feeTypeId: text('fee_type_id').references(() => feeTypes.id),
  amount: real('amount').notNull(),
  frequency: text('frequency').notNull().default('MONTHLY'), // MONTHLY, YEARLY, ONE_TIME
  dueDay: integer('due_day').notNull().default(10),
  effectiveFrom: text('effective_from').notNull(),
  effectiveUntil: text('effective_until'),
  scope: text('scope').notNull().default('ALL'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Billing Periods
export const billingPeriods = sqliteTable('billing_periods', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1 to 12
  name: text('name').notNull(), // "Agustus 2026"
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('OPEN'), // OPEN, CLOSING, CLOSED, LOCKED
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Invoices
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  billingPeriodId: text('billing_period_id').references(() => billingPeriods.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  status: text('status').notNull().default('UNPAID'), // UNPAID, PARTIAL, PAID, OVERDUE, WAIVED, CANCELLED
  subtotal: real('subtotal').notNull(),
  total: real('total').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  dueDate: text('due_date').notNull(),
  issuedAt: text('issued_at').notNull(),
  paidAt: text('paid_at'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Invoice Items
export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id),
  feeTypeId: text('fee_type_id').references(() => feeTypes.id),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Payments
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  billingPeriodId: text('billing_period_id').references(() => billingPeriods.id),
  invoiceId: text('invoice_id').references(() => invoices.id),
  amount: real('amount').notNull(),
  method: text('method').notNull().default('TRANSFER'), // TRANSFER, CASH, QRIS, OTHER
  reference: text('reference'),
  proofFileUrl: text('proof_file_url'),
  status: text('status').notNull().default('PENDING'), // PENDING, VERIFIED, REJECTED, VOID, REVERSED
  notes: text('notes'),
  paidAt: text('paid_at').notNull(),
  submittedBy: text('submitted_by').references(() => users.id),
  verifiedBy: text('verified_by').references(() => users.id),
  verifiedAt: text('verified_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Payment Allocations
export const paymentAllocations = sqliteTable('payment_allocations', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').references(() => payments.id),
  invoiceId: text('invoice_id').references(() => invoices.id),
  amount: real('amount').notNull(),
  allocatedAt: text('allocated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Accounts (Kas & Bank)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull().default('BANK'), // CASH, BANK, SAVINGS, PETTY_CASH
  accountNumber: text('account_number'),
  bankName: text('bank_name'),
  balance: real('balance').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Ledger Entries (General Journal / Arus Kas)
export const ledgerEntries = sqliteTable('ledger_entries', {
  id: text('id').primaryKey(),
  accountId: text('account_id').references(() => accounts.id),
  entryDate: text('entry_date').notNull(),
  direction: text('direction').notNull(), // IN, OUT
  amount: real('amount').notNull(),
  sourceType: text('source_type').notNull(), // PAYMENT, EXPENSE, ADJUSTMENT, OPENING_BALANCE, REVERSAL
  sourceId: text('source_id'),
  description: text('description').notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Expense Categories
export const expenseCategories = sqliteTable('expense_categories', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  budgetPercentage: real('budget_percentage'),
  icon: text('icon'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Expenses
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  categoryId: text('category_id').references(() => expenseCategories.id),
  accountId: text('account_id').references(() => accounts.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: real('amount').notNull(),
  expenseDate: text('expense_date').notNull(),
  receiptFileUrl: text('receipt_file_url'),
  recordedBy: text('recorded_by').references(() => users.id),
  approvedBy: text('approved_by').references(() => users.id),
  status: text('status').notNull().default('APPROVED'), // PENDING, APPROVED, REJECTED
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Budgets
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  year: integer('year').notNull(),
  name: text('name').notNull(),
  totalAmount: real('total_amount').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Budget Items
export const budgetItems = sqliteTable('budget_items', {
  id: text('id').primaryKey(),
  budgetId: text('budget_id').references(() => budgets.id),
  categoryId: text('category_id').references(() => expenseCategories.id),
  name: text('name').notNull(),
  monthlyBudget: real('monthly_budget').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Monthly Snapshots (Cached Aggregates for high performance & public transparency)
export const monthlySnapshots = sqliteTable('monthly_snapshots', {
  id: text('id').primaryKey(),
  billingPeriodId: text('billing_period_id').references(() => billingPeriods.id).unique(),
  totalProperties: integer('total_properties').notNull(),
  paidProperties: integer('paid_properties').notNull(),
  unpaidProperties: integer('unpaid_properties').notNull(),
  openingBalance: real('opening_balance').notNull(),
  income: real('income').notNull(),
  expense: real('expense').notNull(),
  closingBalance: real('closing_balance').notNull(),
  breakdownJson: text('breakdown_json'),
  unpaidPropertiesListJson: text('unpaid_properties_list_json'),
  generatedAt: text('generated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Announcements
export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull().default('INFO'), // KEGIATAN, MAINTENANCE, INFO, DARURAT
  audience: text('audience').notNull().default('ALL'), // ALL, BLOCK, OWNER, RESIDENT, COMMITTEE
  targetBlockId: text('target_block_id').references(() => blocks.id),
  scheduledAt: text('scheduled_at'),
  location: text('location'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  publishedAt: text('published_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Complaints
export const complaints = sqliteTable('complaints', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  submittedByPersonId: text('submitted_by_person_id').references(() => persons.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('FASILITAS'), // KEAMANAN, KEBERSIHAN, FASILITAS, KETERTIBAN, LAINNYA
  location: text('location'),
  status: text('status').notNull().default('REPORTED'), // REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  photoUrl: text('photo_url'),
  resolutionNotes: text('resolution_notes'),
  resolvedAt: text('resolved_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Complaint Updates
export const complaintUpdates = sqliteTable('complaint_updates', {
  id: text('id').primaryKey(),
  complaintId: text('complaint_id').references(() => complaints.id),
  userId: text('user_id').references(() => users.id),
  message: text('message').notNull(),
  newStatus: text('new_status'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Facilities
export const facilities = sqliteTable('facilities', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  condition: text('condition').notNull().default('GOOD'), // GOOD, NEEDS_REPAIR, DAMAGED, UNDER_MAINTENANCE
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Maintenance Requests
export const maintenanceRequests = sqliteTable('maintenance_requests', {
  id: text('id').primaryKey(),
  facilityId: text('facility_id').references(() => facilities.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  costEstimate: real('cost_estimate').notNull().default(0),
  actualCost: real('actual_cost').notNull().default(0),
  status: text('status').notNull().default('PLANNED'), // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  scheduledDate: text('scheduled_date'),
  completedDate: text('completed_date'),
  performedBy: text('performed_by'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Documents
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  title: text('title').notNull(),
  category: text('category').notNull(), // TATA_TERTIB, LAPORAN_KEUANGAN, SURAT_EDARAN, SK_PENGURUS, FORMULIR
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  visibility: text('visibility').notNull().default('RESIDENT'), // PUBLIC, RESIDENT, COMMITTEE, ADMIN
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Decisions (Catatan Keputusan Pengurus)
export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  meetingDate: text('meeting_date').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  documentUrl: text('document_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actorUserId: text('actor_user_id').references(() => users.id),
  actorName: text('actor_name').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  oldValueJson: text('old_value_json'),
  newValueJson: text('new_value_json'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('INFO'), // PAYMENT, BILLING, ANNOUNCEMENT, COMPLAINT, MAINTENANCE, SYSTEM
  linkUrl: text('link_url'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  readAt: text('read_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Settings
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  communityId: text('community_id').references(() => communities.id),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
