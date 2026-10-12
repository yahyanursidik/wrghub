import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@libsql/client';

assert.equal(process.env.UI_TEST_ISOLATED, '1', 'This suite requires the isolated fixture runner. It must not run against production.');
assert.ok(process.env.UI_TEST_FIXTURE_ID);
const base = process.env.UI_TEST_URL;
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const call = async (route, { cookie, body, method = body ? 'POST' : 'GET', origin } = {}) => {
  const response = await fetch(`${base}${route}`, { method, redirect: 'manual', headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(origin ? { Origin: origin } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = null; }
  return { response, status: response.status, data, text, cookie: response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ') };
};
const login = async (username, password = process.env.UI_TEST_PASSWORD) => call('/api/auth/login', { body: { identifier: username, password } });
assert.equal((await call('/admin')).status, 302);
assert.equal((await call('/api/users')).status, 401);
assert.equal((await call('/api/ledger/transfer', { body: {} })).status, 401);
assert.equal((await call('/api/users', { cookie: `wargahub_user=${encodeURIComponent(JSON.stringify({ id:'ui-admin', role:'CHAIRMAN' }))}` })).status, 401);
let guardedMethods = 0;
const publicPaths = ['/api/health', '/api/auth/login', '/api/auth/logout', '/api/receipts/verify', '/api/settings/profile'];
for (const file of await readdir('src/pages/api', { recursive: true })) {
  if (!file.endsWith('.ts')) continue;
  const route = '/api/' + file.replaceAll('\\', '/').replace(/\.ts$/, '').replace(/\/index$/, '');
  if (publicPaths.includes(route)) continue;
  const source = await readFile(path.join('src/pages/api', file), 'utf8');
  for (const match of source.matchAll(/export const (GET|POST|PUT|PATCH|DELETE|HEAD)\b/g)) {
    const method = match[1];
    assert.equal((await call(route, { method, ...(!['GET', 'HEAD'].includes(method) ? { body: {} } : {}) })).status, 401, `Unauthenticated ${method} ${route} was not denied`);
    guardedMethods++;
  }
}
assert.equal((await login(process.env.UI_TEST_USERNAME, 'warga123')).status, 401);
const admin = await login(process.env.UI_TEST_USERNAME);
assert.equal(admin.status, 200);
const properties = await call('/api/properties', { cookie: admin.cookie });
assert.ok(Array.isArray(properties.data));
assert.equal(properties.data.length, 2);
assert.ok(properties.data.every(property => property.notes === `fixture:${process.env.UI_TEST_FIXTURE_ID}`), 'Fixture marker did not match; refusing mutations.');
const security = await login('ui_security');
assert.equal(security.status, 200);
assert.equal((await call('/api/ledger', { cookie: security.cookie })).status, 403);
assert.equal((await call('/api/security/verify-pass', { cookie: security.cookie, body:{} })).status, 400);
const securityDashboard = await call('/admin', { cookie: security.cookie });
assert.equal(securityDashboard.status, 200);
assert.ok(!securityDashboard.text.includes('PRIVATE-FINANCIAL-FIXTURE-REFERENCE'), 'Staff SSR must not serialize private financial data');
const securityNotifications = await call('/admin/notifications', { cookie: security.cookie });
assert.ok(!securityNotifications.text.includes('Pembayaran menunggu verifikasi'));
const treasurer = await login('ui_treasurer');
assert.equal(treasurer.status, 200);
assert.equal((await call('/api/accounts', { cookie: treasurer.cookie })).status, 200);
assert.equal((await call('/api/users/update-password', { cookie: treasurer.cookie, body:{} })).status, 403);
assert.equal((await call('/admin/security-gate', { cookie: treasurer.cookie })).response.headers.get('location'), '/admin');
const users = await call('/api/users', { cookie: admin.cookie });
assert.equal(users.status, 200);
assert.ok(!users.text.includes('$scrypt$') && !users.text.includes('passwordHash') && !users.text.includes('password_hash'));
const resident = await login(process.env.UI_TEST_RESIDENT_USERNAME);
assert.equal(resident.status, 200);
const adminPortalResident = await call('/api/auth/login', { body: { identifier: process.env.UI_TEST_RESIDENT_USERNAME, password: process.env.UI_TEST_PASSWORD, portal: 'admin' } });
assert.equal(adminPortalResident.data.data.redirectUrl, '/warga');
assert.equal((await call('/api/users', { cookie: resident.cookie })).status, 403);
assert.equal((await call('/admin/billing', { cookie: resident.cookie })).response.headers.get('location'), '/warga');
assert.equal((await call('/api/settings/update', { cookie: resident.cookie, body: {} })).status, 403);
assert.equal((await call('/api/payments/submit', { cookie: resident.cookie, body: { propertyId:'prop-a-02', invoiceId:'invoice-a-02', billingPeriodId:'period-test', amount:250000 } })).status, 403);
assert.equal((await call('/api/payments/submit', { cookie: resident.cookie, body: { propertyId:'prop-a-01', invoiceId:'invoice-a-02', billingPeriodId:'period-test', amount:250000 } })).status, 400);
assert.equal((await call('/api/properties/update', { cookie: resident.cookie, body: { id:'prop-a-02', propertyCode:'A-01', occupancyStatus:'VACANT' } })).status, 403);
assert.equal((await call('/api/properties/update', { cookie: resident.cookie, body: { id:'prop-a-01', code:'A-02', occupancyStatus:'VACANT' } })).status, 403);
assert.equal((await call('/api/properties/update', { cookie: resident.cookie, body: { propertyId:'prop-a-01', code:'A-02', occupancyStatus:'VACANT' } })).status, 403);
assert.equal((await call('/api/properties/update', { cookie: resident.cookie, body: { propertyId:'prop-a-01', occupancyStatus:'VACANT' } })).status, 403);
assert.equal((await call('/api/properties/update', { cookie: admin.cookie, body: { id:'prop-a-01', code:'A-02', occupancyStatus:'VACANT' } })).status, 400);
assert.equal((await call('/api/properties/update', { cookie: admin.cookie, body: { id:'missing-property', occupancyStatus:'VACANT' } })).status, 404);
assert.equal((await call('/api/properties/update', { cookie: resident.cookie, body: { propertyCode:'A-01', address:'Updated isolated fixture address' } })).status, 200);
assert.equal((await call('/portal?tab=iuran', { cookie: resident.cookie })).response.headers.get('location'), '/warga?tab=iuran');
assert.equal((await call('/api/accounts/save', { cookie: admin.cookie, origin:'https://untrusted.example', body:{} })).status, 403);
const overview = await call('/api/resident/overview', { cookie: resident.cookie });
assert.equal(overview.data.data.property.id, 'prop-a-01');
assert.ok(overview.data.data.invoices.every(invoice => invoice.id === 'invoice-a-01'));
assert.equal(overview.data.data.property.address, 'Updated isolated fixture address');
const complaint = await call('/api/complaints/create', { cookie: resident.cookie, body: { propertyId:'prop-a-01', title:'Isolated complaint', description:'Persisted complaint from an isolated fixture' } });
assert.equal(complaint.status, 201);
assert.ok((await call('/api/resident/overview', { cookie: resident.cookie })).data.data.complaints.some(item => item.id === complaint.data.data.id), 'A successful complaint must survive a fresh server read');
assert.equal((await call('/api/complaints/create', { cookie: resident.cookie, body: { propertyId:'prop-a-02', title:'Cross-house complaint', description:'This request must be denied' } })).status, 403);
const helper = await call('/api/ai/chat', { cookie: resident.cookie, body: { message:'status tagihan', propertyCode:'A-02' } });
assert.equal(helper.status, 200);
assert.ok(helper.data.data.reply.includes('A-01') && !helper.data.data.reply.includes('A-02'));

const balances = async () => (await call('/api/accounts', { cookie: admin.cookie })).data.data.map(account => [account.id, account.balance]).sort(([a],[b]) => a.localeCompare(b));
const before = await balances();
const created = await call('/api/ledger/create', { cookie: admin.cookie, body: { accountId:'acc-main', direction:'IN', amount:50000, description:'Isolated integration entry', entryDate:'2026-10-12' } });
assert.equal(created.status, 201);
const transfer = await call('/api/ledger/transfer', { cookie: admin.cookie, body: { fromAccountId:'acc-main', toAccountId:'acc-cash', amount:250000, description:'Isolated integration transfer', entryDate:'2026-10-12' } });
assert.equal(transfer.status, 201);
assert.equal(transfer.data.data.outEntry.sourceId, transfer.data.data.inEntry.sourceId);
assert.equal((await call('/api/ledger/transfer', { cookie: admin.cookie, body: { fromAccountId:'acc-main', toAccountId:'acc-cash', amount:99999999, description:'Rejected overspend', entryDate:'2026-10-12' } })).status, 400);
assert.equal((await call('/api/ledger/delete', { cookie: admin.cookie, body: { ledgerId:transfer.data.data.outEntry.id } })).status, 200);
assert.equal((await call('/api/ledger/delete', { cookie: admin.cookie, body: { ledgerId:created.data.data.id } })).status, 200);
assert.deepEqual(await balances(), before);

const resetPassword = 'A changed fixture-only password';
assert.equal((await call('/api/users/update-password', { cookie: admin.cookie, body: { userId:'ui-resident', newPassword:resetPassword, actorName:'Spoofed audit actor' } })).status, 200);
assert.equal((await call('/api/resident/overview', { cookie: resident.cookie })).status, 401, 'Old session must be revoked after a credential change');
assert.equal((await login(process.env.UI_TEST_RESIDENT_USERNAME)).status, 401);
assert.equal((await login(process.env.UI_TEST_RESIDENT_USERNAME, resetPassword)).status, 200);
// Account changes are made only in the same marked fixture checked above.
const fixtureClient = createClient({ url: `file:${path.join(process.env.WARGAHUB_DATA_DIR, 'wargahub.db').replaceAll('\\', '/')}` });
try {
  assert.equal((await fixtureClient.execute("SELECT notes FROM properties WHERE id = 'prop-a-02'")).rows[0].notes, `fixture:${process.env.UI_TEST_FIXTURE_ID}`);
  await fixtureClient.execute("UPDATE users SET role = 'HOUSEHOLD_HEAD' WHERE id = 'ui-treasurer'");
  assert.equal((await call('/api/accounts', { cookie: treasurer.cookie })).status, 403, 'A changed role must take effect on the existing session');
  await fixtureClient.execute("UPDATE users SET is_active = 0 WHERE id = 'ui-security'");
  assert.equal((await call('/api/security/verify-pass', { cookie: security.cookie, body:{} })).status, 401, 'Disabled accounts must lose existing session access');
  const audit = await fixtureClient.execute("SELECT actor_name, new_value_json FROM audit_logs WHERE action = 'user.password_updated' ORDER BY created_at DESC LIMIT 1");
  assert.equal(audit.rows[0].actor_name, 'Pengurus uji');
  assert.ok(!String(audit.rows[0].new_value_json).includes(resetPassword));
} finally { fixtureClient.close(); }
assert.equal((await call('/api/auth/logout', { cookie: admin.cookie, body:{} })).status, 200);
assert.equal((await call('/api/users', { cookie: admin.cookie })).status, 401);
console.log(`PASS HTTP: ${guardedMethods} private endpoint methods reject anonymous requests; forged cookies, roles/SSR privacy, own-house/invoice scope, CSRF origin, persisted complaints, atomic journal/transfer, hashed reset/audit identity, session revocation on password/role/deactivation, and logout`);
