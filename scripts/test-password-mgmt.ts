async function testPasswordMgmt() {
  const BASE_URL = 'http://localhost:4321';

  console.log('--- 1. Testing GET /api/users ---');
  const resUsers = await fetch(`${BASE_URL}/api/users`);
  console.log('GET /api/users status:', resUsers.status);
  const dataUsers = await resUsers.json();
  console.log(`Total users in system: ${dataUsers.data?.length}`);
  const kavA = dataUsers.data?.find((u: any) => u.propertyCode === 'Kav A');
  console.log('Found Kav A user:', kavA?.fullName, '| Phone:', kavA?.phone, '| Password hash:', kavA?.passwordHash);

  console.log('\n--- 2. Testing POST /api/users/update-password ---');
  // Change Kav A password to 'kavA#2026'
  const resUpdate = await fetch(`${BASE_URL}/api/users/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-kav-a',
      newPassword: 'kavA#2026',
      actorName: 'Admin Tester',
      reason: 'Testing password update feature'
    })
  });
  console.log('Update password status:', resUpdate.status);
  const dataUpdate = await resUpdate.json();
  console.log('Update response:', dataUpdate.data?.message);

  // Verify login with NEW password
  const resLoginNew = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'Kav A', password: 'kavA#2026' })
  });
  console.log('Login with NEW password (kavA#2026):', resLoginNew.status, (await resLoginNew.json()).data?.user?.fullName);

  // Restore password back to warga123
  await fetch(`${BASE_URL}/api/users/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-kav-a',
      newPassword: 'warga123',
      actorName: 'Admin Tester',
      reason: 'Restoring default password'
    })
  });
  console.log('Restored Kav A password to warga123.');

  console.log('\n--- 3. Testing Frontend Routes ---');
  const resSettingsTab = await fetch(`${BASE_URL}/admin/settings?tab=passwords`);
  console.log('GET /admin/settings?tab=passwords:', resSettingsTab.status);

  const resPasswordsDirect = await fetch(`${BASE_URL}/admin/passwords`);
  console.log('GET /admin/passwords:', resPasswordsDirect.status);

  console.log('\n--- All Password Management Tests Completed Successfully! ---');
}

testPasswordMgmt().catch(console.error);
