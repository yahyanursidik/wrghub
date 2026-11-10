import assert from 'node:assert/strict';

assert.equal(process.env.UI_TEST_ISOLATED, '1');
assert.ok(process.env.UI_TEST_FIXTURE_ID);
const base = new URL(process.env.UI_TEST_URL);
assert.equal(base.hostname, '127.0.0.1');

async function request(path, cookie, body) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual', method: body ? 'POST' : 'GET',
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = response.headers.get('Content-Type')?.includes('application/json') ? JSON.parse(text) : null;
  return { status: response.status, data, text, location: response.headers.get('location'),
    cookie: response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ') };
}
async function login(username) {
  const result = await request('/api/auth/login', null, { identifier: `ui_${username}`, password: process.env.UI_TEST_PASSWORD });
  assert.equal(result.status, 200, `Login ${username}`);
  return result;
}
const staffRoles = {
  super: ['SUPER_ADMIN', 'Administrasi lingkungan', '/admin/settings?tab=profile'],
  admin: ['CHAIRMAN', 'Ringkasan lingkungan', '/admin/complaints?status=OPEN'],
  treasurer: ['TREASURER', 'Ruang bendahara', '/admin/payments?tab=verification'],
  secretary: ['SECRETARY', 'Ruang sekretariat', '/admin/announcements?tab=announcements'],
  people: ['RESIDENT_ADMIN', 'Administrasi warga', '/admin/properties?tab=vehicles'],
  security: ['SECURITY', 'Pos keamanan', '/admin/security-gate?tab=gate'],
  maintenance: ['MAINTENANCE', 'Perawatan lingkungan', '/admin/cleaning-staff?tab=routes_schedule'],
  auditor: ['AUDITOR', 'Pemeriksaan dan audit', '/admin/audit'],
};
const residentRoles = { owner: 'HOUSE_OWNER', resident: 'HOUSEHOLD_HEAD', tenant: 'RESIDENT', viewer: 'VIEWER' };
const staff = {};
const residents = {};
for (const [name, [role, heading, shortcut]] of Object.entries(staffRoles)) {
  const result = await login(name);
  staff[name] = result.cookie;
  assert.equal(result.data.data.redirectUrl, '/admin');
  const page = await request('/admin', result.cookie);
  assert.equal(page.status, 200);
  assert.ok(page.text.includes(`data-workspace-role="${role}"`) && page.text.includes(`<h1>${heading}</h1>`), role);
  assert.ok(page.text.includes(`href="${shortcut}"`), `${role} missing ${shortcut}`);
  assert.equal((await request(shortcut, result.cookie)).status, 200, `${role} cannot open ${shortcut}`);
}
for (const [name, role] of Object.entries(residentRoles)) {
  const result = await login(name);
  residents[name] = result.cookie;
  assert.equal(result.data.data.redirectUrl, '/warga');
  const page = await request('/warga', result.cookie);
  assert.equal(page.status, 200);
  assert.ok(page.text.includes(`data-resident-workspace="${role}"`), role);
  assert.equal((await request('/admin', result.cookie)).location, '/warga');
  if (name === 'viewer') {
    assert.ok(page.text.includes('Informasi lingkungan'));
    assert.ok(!page.text.includes('INV-TEST-A01'));
    assert.ok(!page.text.includes('Masuk pengurus'));
    const overview = await request('/api/resident/overview', result.cookie);
    assert.equal(overview.data.data.property, null);
  }
}
const properties = await request('/api/properties', staff.admin);
assert.ok(properties.data.length === 2 && properties.data.every(property => property.notes === `fixture:${process.env.UI_TEST_FIXTURE_ID}`), 'Refusing mutations outside the marked test fixture.');
const overview = async who => (await request('/api/resident/overview', residents[who])).data.data;

const complaint = await request('/api/complaints/create', residents.resident, { propertyId: 'prop-a-01', title: 'Lampu halaman mati', description: 'Lampu padam di dekat pintu rumah.' });
assert.equal(complaint.status, 201);
const complaintId = complaint.data.data.id;
const adminComplaints = await request('/admin/complaints?status=OPEN', staff.maintenance);
assert.ok(adminComplaints.text.includes('Lampu halaman mati'));
const setComplaint = (body, cookie = staff.maintenance) => request('/api/complaints/update', cookie, { complaintId, ...body });
assert.equal((await setComplaint({ status: 'RESOLVED', notes: 'Diperbaiki.' })).status, 409);
assert.equal((await setComplaint({ status: 'IN_PROGRESS' }, residents.resident)).status, 403);
assert.equal((await setComplaint({ status: 'IN_PROGRESS', notes: 'Sedang diperiksa.' })).status, 200);
assert.equal((await setComplaint({ status: 'RESOLVED' })).status, 400);
assert.equal((await setComplaint({ status: 'RESOLVED', notes: 'Lampu sudah diganti.' })).status, 200);
assert.equal((await overview('resident')).complaints.find(item => item.id === complaintId).resolutionNotes, 'Lampu sudah diganti.');
assert.ok(!(await overview('tenant')).complaints.some(item => item.id === complaintId));
assert.ok((await request('/warga?tab=info&info=complaints', residents.resident)).text.includes('Lampu sudah diganti.'));

const vehicle = { propertyId: 'prop-a-01', plateNumber: 'D 5412 UX', type: 'Mobil', brand: 'Honda', model: 'Jazz', color: 'Biru' };
const registered = await request('/api/vehicles/create', residents.resident, vehicle);
assert.equal(registered.status, 201);
const vehicleId = registered.data.data.id;
assert.equal((await request('/api/vehicles/create', residents.resident, { ...vehicle, plateNumber: 'D5412UX' })).status, 409);
assert.equal((await request('/api/vehicles/create', residents.resident, { ...vehicle, propertyId: 'prop-a-02' })).status, 403);
const registry = await request('/api/properties/vehicles', staff.people);
assert.ok(registry.data.some(item => item.id === vehicleId && item.rfidStatus === 'PENDING_VERIFIKASI'));
assert.ok((await request('/admin/security-gate?tab=gate', staff.security)).text.includes('D 5412 UX'));
assert.ok((await overview('resident')).vehicles.some(item => item.id === vehicleId));
assert.ok(!(await overview('tenant')).vehicles.some(item => item.id === vehicleId));
assert.equal((await request('/api/properties/vehicles/create', staff.people, { ...vehicle, id: vehicleId, color: 'Putih' })).status, 200);
assert.equal((await overview('resident')).vehicles.find(item => item.id === vehicleId).color, 'Putih');
assert.equal((await request('/api/properties/vehicles/delete', staff.people, { id: vehicleId })).status, 200);
assert.ok(!(await overview('resident')).vehicles.some(item => item.id === vehicleId));

const announcement = { title: 'Informasi khusus penyewa', content: 'Pertemuan penyewa di balai.', audience: 'PENYEWA_SAJA' };
assert.equal((await request('/api/announcements/create', staff.security, announcement)).status, 403);
const news = await request('/api/announcements/create', staff.secretary, announcement);
assert.equal(news.status, 201);
const newsId = news.data.data.id;
assert.ok((await request('/warga', residents.tenant)).text.includes(announcement.title));
assert.ok(!(await request('/warga', residents.owner)).text.includes(announcement.title));
assert.ok(!(await request('/warga', residents.viewer)).text.includes(announcement.title));
assert.equal((await request('/api/announcements/update', staff.secretary, { id: newsId, title: 'Informasi untuk seluruh warga', audience: 'ALL' })).status, 200);
assert.ok((await request('/warga', residents.owner)).text.includes('Informasi untuk seluruh warga'));
assert.equal((await request('/api/announcements/delete', staff.secretary, { id: newsId })).status, 200);
assert.ok(!(await request('/warga', residents.owner)).text.includes('Informasi untuk seluruh warga'));

const requestBooking = (cookie, propertyId, extra = {}) => request('/api/facilities/book', cookie, {
  facilityId: 'fac-test', propertyId, residentName: 'Tidak boleh disalin dari browser',
  date: '2027-11-22', startTime: '09:00', endTime: '10:00', purpose: 'Rapat lingkungan', ...extra,
});
const booking = await requestBooking(residents.resident, 'prop-a-01');
assert.equal(booking.status, 201);
const bookingId = booking.data.data.id;
assert.equal(booking.data.data.residentName, 'Warga uji');
assert.equal((await request('/api/facilities/update-status', staff.maintenance, { requestId: bookingId, status: 'IN_PROGRESS' })).status, 404);
assert.equal((await request('/api/facilities/update-status', staff.maintenance, { requestId: 'repair-test', status: 'IN_PROGRESS' })).status, 200);
assert.equal((await requestBooking(residents.resident, 'prop-a-02')).status, 403);
assert.equal((await overview('resident')).bookings.find(item => item.id === bookingId).status, 'PENDING');
assert.ok(!(await overview('tenant')).bookings.some(item => item.id === bookingId));
const overlapping = await requestBooking(residents.tenant, 'prop-a-02', { startTime: '09:30', endTime: '10:30' });
assert.equal(overlapping.status, 201);
const status = (id, state) => request('/api/facilities/booking-status', staff.maintenance, { id, status: state });
assert.equal((await status(bookingId, 'APPROVED')).status, 200);
assert.equal((await status(overlapping.data.data.id, 'APPROVED')).status, 409);
assert.equal((await status(overlapping.data.data.id, 'REJECTED')).status, 200);
assert.equal((await overview('resident')).bookings.find(item => item.id === bookingId).status, 'APPROVED');
assert.ok((await request('/warga?tab=info&info=facilities', residents.resident)).text.includes('Disetujui'));
assert.ok(!(await request('/admin/notifications', staff.security)).text.includes('/admin/audit'));

const scan = qrPayload => request('/api/security/verify-pass', staff.security, { qrPayload });
assert.equal((await scan('PASS-Rumah-A-01-fake')).data.data.isValid, false);
assert.equal((await scan('PRIVATE-FINANCIAL-FIXTURE-REFERENCE')).data.data.isValid, false);
const receipt = await scan('/kuitansi?q=VERIFIED-FIXTURE-RECEIPT');
assert.equal(receipt.data.data.isValid, true);
assert.equal(receipt.data.data.allowsEntry, false);

console.log('PASS 12 role dashboards; scoped complaints and vehicle lifecycle; targeted announcement publish/edit/archive; reservation decision, conflict and visibility; forged/pending QR denied.');
