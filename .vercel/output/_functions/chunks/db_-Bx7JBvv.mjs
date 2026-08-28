import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import fs from "node:fs";
import nodePath from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
//#region src/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	accounts: () => accounts,
	announcements: () => announcements,
	auditLogs: () => auditLogs,
	billingPeriods: () => billingPeriods,
	blocks: () => blocks,
	budgetItems: () => budgetItems,
	budgets: () => budgets,
	communities: () => communities,
	complaintUpdates: () => complaintUpdates,
	complaints: () => complaints,
	decisions: () => decisions,
	documents: () => documents,
	expenseCategories: () => expenseCategories,
	expenses: () => expenses,
	facilities: () => facilities,
	feeRules: () => feeRules,
	feeTypes: () => feeTypes,
	householdMembers: () => householdMembers,
	households: () => households,
	invoiceItems: () => invoiceItems,
	invoices: () => invoices,
	ledgerEntries: () => ledgerEntries,
	maintenanceRequests: () => maintenanceRequests,
	monthlySnapshots: () => monthlySnapshots,
	notifications: () => notifications,
	occupancies: () => occupancies,
	paymentAllocations: () => paymentAllocations,
	payments: () => payments,
	persons: () => persons,
	properties: () => properties,
	propertyOwnerships: () => propertyOwnerships,
	settings: () => settings,
	userPropertyAccess: () => userPropertyAccess,
	users: () => users,
	vehicles: () => vehicles
});
var communities = sqliteTable("communities", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	address: text("address").notNull(),
	city: text("city").notNull(),
	postalCode: text("postal_code"),
	settingsJson: text("settings_json"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var blocks = sqliteTable("blocks", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	name: text("name").notNull(),
	code: text("code").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var properties = sqliteTable("properties", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	blockId: text("block_id").references(() => blocks.id),
	code: text("code").notNull().unique(),
	number: text("number").notNull(),
	address: text("address").notNull(),
	occupancyStatus: text("occupancy_status").notNull().default("OWNER_OCCUPIED"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	notes: text("notes"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var persons = sqliteTable("persons", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	phone: text("phone"),
	email: text("email"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var households = sqliteTable("households", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var householdMembers = sqliteTable("household_members", {
	id: text("id").primaryKey(),
	householdId: text("household_id").references(() => households.id),
	personId: text("person_id").references(() => persons.id),
	relationship: text("relationship").notNull(),
	birthDate: text("birth_date"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	startedAt: text("started_at"),
	endedAt: text("ended_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var propertyOwnerships = sqliteTable("property_ownerships", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	personId: text("person_id").references(() => persons.id),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	startedAt: text("started_at").notNull(),
	endedAt: text("ended_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var occupancies = sqliteTable("occupancies", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	householdId: text("household_id").references(() => households.id),
	type: text("type").notNull().default("OWNER"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	startedAt: text("started_at").notNull(),
	endedAt: text("ended_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var vehicles = sqliteTable("vehicles", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	ownerPersonId: text("owner_person_id").references(() => persons.id),
	plateNumber: text("plate_number").notNull(),
	type: text("type").notNull(),
	brand: text("brand").notNull(),
	model: text("model").notNull(),
	color: text("color").notNull(),
	year: text("year"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var users = sqliteTable("users", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	fullName: text("full_name").notNull(),
	role: text("role").notNull(),
	avatarUrl: text("avatar_url"),
	personId: text("person_id").references(() => persons.id),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var userPropertyAccess = sqliteTable("user_property_access", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	propertyId: text("property_id").references(() => properties.id),
	relationship: text("relationship").notNull(),
	canViewBilling: integer("can_view_billing", { mode: "boolean" }).notNull().default(true),
	canPay: integer("can_pay", { mode: "boolean" }).notNull().default(true),
	canEditOccupants: integer("can_edit_occupants", { mode: "boolean" }).notNull().default(false),
	canViewProperty: integer("can_view_property", { mode: "boolean" }).notNull().default(true),
	startedAt: text("started_at").notNull(),
	endedAt: text("ended_at")
});
var feeTypes = sqliteTable("fee_types", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	code: text("code").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	defaultAmount: real("default_amount").notNull(),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var feeRules = sqliteTable("fee_rules", {
	id: text("id").primaryKey(),
	feeTypeId: text("fee_type_id").references(() => feeTypes.id),
	amount: real("amount").notNull(),
	frequency: text("frequency").notNull().default("MONTHLY"),
	dueDay: integer("due_day").notNull().default(10),
	effectiveFrom: text("effective_from").notNull(),
	effectiveUntil: text("effective_until"),
	scope: text("scope").notNull().default("ALL"),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var billingPeriods = sqliteTable("billing_periods", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	year: integer("year").notNull(),
	month: integer("month").notNull(),
	name: text("name").notNull(),
	dueDate: text("due_date").notNull(),
	status: text("status").notNull().default("OPEN"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var invoices = sqliteTable("invoices", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	billingPeriodId: text("billing_period_id").references(() => billingPeriods.id),
	invoiceNumber: text("invoice_number").notNull().unique(),
	status: text("status").notNull().default("UNPAID"),
	subtotal: real("subtotal").notNull(),
	total: real("total").notNull(),
	paidAmount: real("paid_amount").notNull().default(0),
	dueDate: text("due_date").notNull(),
	issuedAt: text("issued_at").notNull(),
	paidAt: text("paid_at"),
	notes: text("notes"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var invoiceItems = sqliteTable("invoice_items", {
	id: text("id").primaryKey(),
	invoiceId: text("invoice_id").references(() => invoices.id),
	feeTypeId: text("fee_type_id").references(() => feeTypes.id),
	description: text("description").notNull(),
	amount: real("amount").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var payments = sqliteTable("payments", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	billingPeriodId: text("billing_period_id").references(() => billingPeriods.id),
	invoiceId: text("invoice_id").references(() => invoices.id),
	amount: real("amount").notNull(),
	method: text("method").notNull().default("TRANSFER"),
	reference: text("reference"),
	proofFileUrl: text("proof_file_url"),
	status: text("status").notNull().default("PENDING"),
	notes: text("notes"),
	paidAt: text("paid_at").notNull(),
	submittedBy: text("submitted_by").references(() => users.id),
	verifiedBy: text("verified_by").references(() => users.id),
	verifiedAt: text("verified_at"),
	rejectionReason: text("rejection_reason"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var paymentAllocations = sqliteTable("payment_allocations", {
	id: text("id").primaryKey(),
	paymentId: text("payment_id").references(() => payments.id),
	invoiceId: text("invoice_id").references(() => invoices.id),
	amount: real("amount").notNull(),
	allocatedAt: text("allocated_at").default(sql`CURRENT_TIMESTAMP`)
});
var accounts = sqliteTable("accounts", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	type: text("type").notNull().default("BANK"),
	accountNumber: text("account_number"),
	bankName: text("bank_name"),
	balance: real("balance").notNull().default(0),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var ledgerEntries = sqliteTable("ledger_entries", {
	id: text("id").primaryKey(),
	accountId: text("account_id").references(() => accounts.id),
	entryDate: text("entry_date").notNull(),
	direction: text("direction").notNull(),
	amount: real("amount").notNull(),
	sourceType: text("source_type").notNull(),
	sourceId: text("source_id"),
	description: text("description").notNull(),
	createdBy: text("created_by").references(() => users.id),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var expenseCategories = sqliteTable("expense_categories", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	name: text("name").notNull(),
	code: text("code").notNull(),
	budgetPercentage: real("budget_percentage"),
	icon: text("icon"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var expenses = sqliteTable("expenses", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	categoryId: text("category_id").references(() => expenseCategories.id),
	accountId: text("account_id").references(() => accounts.id),
	title: text("title").notNull(),
	description: text("description"),
	amount: real("amount").notNull(),
	expenseDate: text("expense_date").notNull(),
	receiptFileUrl: text("receipt_file_url"),
	recordedBy: text("recorded_by").references(() => users.id),
	approvedBy: text("approved_by").references(() => users.id),
	status: text("status").notNull().default("APPROVED"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var budgets = sqliteTable("budgets", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	year: integer("year").notNull(),
	name: text("name").notNull(),
	totalAmount: real("total_amount").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var budgetItems = sqliteTable("budget_items", {
	id: text("id").primaryKey(),
	budgetId: text("budget_id").references(() => budgets.id),
	categoryId: text("category_id").references(() => expenseCategories.id),
	name: text("name").notNull(),
	monthlyBudget: real("monthly_budget").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var monthlySnapshots = sqliteTable("monthly_snapshots", {
	id: text("id").primaryKey(),
	billingPeriodId: text("billing_period_id").references(() => billingPeriods.id).unique(),
	totalProperties: integer("total_properties").notNull(),
	paidProperties: integer("paid_properties").notNull(),
	unpaidProperties: integer("unpaid_properties").notNull(),
	openingBalance: real("opening_balance").notNull(),
	income: real("income").notNull(),
	expense: real("expense").notNull(),
	closingBalance: real("closing_balance").notNull(),
	breakdownJson: text("breakdown_json"),
	unpaidPropertiesListJson: text("unpaid_properties_list_json"),
	generatedAt: text("generated_at").default(sql`CURRENT_TIMESTAMP`)
});
var announcements = sqliteTable("announcements", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	title: text("title").notNull(),
	content: text("content").notNull(),
	category: text("category").notNull().default("INFO"),
	audience: text("audience").notNull().default("ALL"),
	targetBlockId: text("target_block_id").references(() => blocks.id),
	scheduledAt: text("scheduled_at"),
	location: text("location"),
	isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
	isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
	publishedAt: text("published_at").default(sql`CURRENT_TIMESTAMP`),
	createdBy: text("created_by").references(() => users.id),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var complaints = sqliteTable("complaints", {
	id: text("id").primaryKey(),
	propertyId: text("property_id").references(() => properties.id),
	submittedByPersonId: text("submitted_by_person_id").references(() => persons.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull().default("FASILITAS"),
	location: text("location"),
	status: text("status").notNull().default("REPORTED"),
	priority: text("priority").notNull().default("MEDIUM"),
	photoUrl: text("photo_url"),
	resolutionNotes: text("resolution_notes"),
	resolvedAt: text("resolved_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var complaintUpdates = sqliteTable("complaint_updates", {
	id: text("id").primaryKey(),
	complaintId: text("complaint_id").references(() => complaints.id),
	userId: text("user_id").references(() => users.id),
	message: text("message").notNull(),
	newStatus: text("new_status"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var facilities = sqliteTable("facilities", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	category: text("category").notNull(),
	location: text("location").notNull(),
	condition: text("condition").notNull().default("GOOD"),
	notes: text("notes"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var maintenanceRequests = sqliteTable("maintenance_requests", {
	id: text("id").primaryKey(),
	facilityId: text("facility_id").references(() => facilities.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	costEstimate: real("cost_estimate").notNull().default(0),
	actualCost: real("actual_cost").notNull().default(0),
	status: text("status").notNull().default("PLANNED"),
	scheduledDate: text("scheduled_date"),
	completedDate: text("completed_date"),
	performedBy: text("performed_by"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var documents = sqliteTable("documents", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	title: text("title").notNull(),
	category: text("category").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: text("file_size"),
	visibility: text("visibility").notNull().default("RESIDENT"),
	uploadedBy: text("uploaded_by").references(() => users.id),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var decisions = sqliteTable("decisions", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	meetingDate: text("meeting_date").notNull(),
	title: text("title").notNull(),
	summary: text("summary").notNull(),
	documentUrl: text("document_url"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var auditLogs = sqliteTable("audit_logs", {
	id: text("id").primaryKey(),
	actorUserId: text("actor_user_id").references(() => users.id),
	actorName: text("actor_name").notNull(),
	action: text("action").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: text("entity_id").notNull(),
	oldValueJson: text("old_value_json"),
	newValueJson: text("new_value_json"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var notifications = sqliteTable("notifications", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	title: text("title").notNull(),
	message: text("message").notNull(),
	type: text("type").notNull().default("INFO"),
	linkUrl: text("link_url"),
	isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
	readAt: text("read_at"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
var settings = sqliteTable("settings", {
	id: text("id").primaryKey(),
	communityId: text("community_id").references(() => communities.id),
	key: text("key").notNull().unique(),
	value: text("value").notNull(),
	description: text("description"),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
//#endregion
//#region src/db/index.ts
var dbDir = nodePath.resolve(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
var dbPath = nodePath.join(dbDir, "wargahub.db");
var client = createClient({ url: `file:${dbPath.replace(/\\/g, "/")}` });
var db = drizzle(client, { schema: schema_exports });
//#endregion
export { propertyOwnerships as _, billingPeriods as a, expenseCategories as c, invoices as d, ledgerEntries as f, properties as g, persons as h, auditLogs as i, expenses as l, payments as m, accounts as n, blocks as o, maintenanceRequests as p, announcements as r, complaints as s, db as t, facilities as u };
