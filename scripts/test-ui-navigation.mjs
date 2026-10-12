import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';

const baseUrl = process.env.UI_TEST_URL || 'http://localhost:4321';
const chromePath = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert.ok(chromePath, 'Set CHROME_PATH to a Chromium browser executable.');
const profile = await mkdtemp(path.join(tmpdir(), 'wargahub-ui-'));
const output = process.env.UI_TEST_OUTPUT || path.join(profile, 'screenshots');
await mkdir(output, { recursive: true });
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--disable-extensions', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

let socket;
let id = 0;
const pending = new Map();
const errors = [];
try {
  const endpoint = await new Promise((resolve, reject) => {
    let logs = '';
    const timer = setTimeout(() => reject(new Error(`Chrome startup timed out: ${logs.slice(-2000)}`)), 30000);
    chrome.once('error', error => { clearTimeout(timer); reject(error); });
    chrome.once('exit', code => { clearTimeout(timer); reject(new Error(`Chrome exited during startup (${code}): ${logs.slice(-2000)}`)); });
    chrome.stderr.on('data', chunk => {
      logs += chunk;
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const debugUrl = new URL(endpoint);
  const targets = await fetch(`http://${debugUrl.host}/json/list`).then(response => response.json());
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  socket.on('message', raw => {
    const message = JSON.parse(raw);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer); pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`${method} timed out`)); }, 75000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = condition => evaluate(`new Promise((resolve, reject) => { const start = Date.now(); const check = () => { if (${condition}) resolve(true); else if (Date.now() - start > 60000) reject(new Error('UI condition timed out')); else setTimeout(check, 50); }; check(); })`);
  const navigate = async (route, selector, expectedPath = route.split('?')[0]) => {
    await cdp('Page.navigate', { url: `${baseUrl}${route}` });
    await wait(`location.pathname === ${JSON.stringify(expectedPath)} && document.querySelector(${JSON.stringify(selector)}) && !document.querySelector('astro-island[ssr][client="load"]')`);
  };
  const viewport = (width, height = 900) => cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const screenshot = async name => {
    const image = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(path.join(output, `${name}.png`), Buffer.from(image.data, 'base64'));
  };
  const noOverflow = async label => {
    const dimensions = await evaluate('({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth })');
    if (dimensions.scrollWidth > dimensions.width + 1) {
      console.log(await evaluate(`Array.from(document.querySelectorAll('main *')).filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0 && !el.closest('.overflow-x-auto'); }).slice(0, 12).map(el => ({tag:el.tagName,classes:el.className,text:el.textContent.slice(0,80)}))`));
    }
    assert.ok(dimensions.scrollWidth <= dimensions.width + 1, `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
  };
  await cdp('Runtime.enable'); await cdp('Page.enable');
  assert.ok(process.env.UI_TEST_USERNAME && process.env.UI_TEST_PASSWORD, 'Use npm run test:ui to create an isolated authenticated fixture, or provide UI_TEST_USERNAME/UI_TEST_PASSWORD.');
  await navigate('/', '#resident-identifier');
  const login = await evaluate(`fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(${JSON.stringify({ identifier: process.env.UI_TEST_USERNAME, password: process.env.UI_TEST_PASSWORD, portal: 'admin' })}) }).then(async response => ({ status:response.status, body:await response.json() }))`);
  assert.equal(login.status, 200, 'Fixture login failed');
  await evaluate(`localStorage.setItem('wargahub_user', JSON.stringify(${JSON.stringify(login.body.data.user)}))`);

  for (const width of [360, 768, 1440]) {
    await viewport(width);
    await navigate('/admin', '.admin-header');
    await wait(`document.querySelector('.admin-sidebar[data-ready="true"]')`);
    await noOverflow(`Dashboard ${width}`);
    await screenshot(`admin-${width}`);
    const sidebarVisible = await evaluate(`getComputedStyle(document.querySelector('.admin-sidebar')).display !== 'none'`);
    assert.equal(sidebarVisible, width >= 1024);
    if (width < 1024) {
      await evaluate(`document.querySelector('[aria-label="Buka menu navigasi"]').click()`);
      await wait(`document.querySelector('.navigation-drawer').open`);
      assert.equal(await evaluate(`document.body.style.overflow`), 'hidden');
      await screenshot(`menu-${width}`);
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait(`!document.querySelector('.navigation-drawer').open`);
    }
    await evaluate(`document.querySelector('.header-search').click()`);
    await wait(`document.querySelector('.search-dialog').open`);
    assert.equal(await evaluate(`document.activeElement.tagName`), 'INPUT');
    await cdp('Input.insertText', { text: 'pengeluaran' });
    await wait(`document.querySelector('.search-dialog .search-result')?.textContent.includes('Pengeluaran')`);
    await screenshot(`search-${width}`);
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await wait(`location.pathname === '/admin/expenses' && document.querySelector('.admin-header')`);
    await screenshot(`expenses-${width}`);
    await noOverflow(`Expenses ${width}`);
    console.log(`PASS admin navigation / search / layout at ${width}px`);
  }

  await viewport(360);
  await navigate('/', '#resident-identifier');
  await noOverflow('Resident login');
  assert.equal(await evaluate(`document.querySelector('label[for="resident-identifier"]') !== null`), true);
  await screenshot('login-mobile');
  await navigate('/login?portal=resident', '#resident-identifier');
  await navigate('/login?portal=admin', '#admin-identifier');
  await noOverflow('Admin login');
  await screenshot('login-admin-mobile');
  await navigate('/kuitansi', 'main');
  await noOverflow('Public receipt');
  assert.equal(await evaluate(`document.querySelector('[aria-label="Menu publik seluler"] [aria-current="page"]').textContent.trim()`), 'Kuitansi');
  await screenshot('public-mobile');

  // Isolated browser UI session only; no login or data mutation is sent to the server.
  if (process.env.UI_TEST_RESIDENT_USERNAME) {
    const residentLogin = await evaluate(`fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(${JSON.stringify({ identifier: process.env.UI_TEST_RESIDENT_USERNAME, password: process.env.UI_TEST_PASSWORD, portal: 'resident' })}) }).then(async response => ({ status:response.status, body:await response.json() }))`);
    assert.equal(residentLogin.status, 200);
    await evaluate(`localStorage.setItem('wargahub_user', JSON.stringify(${JSON.stringify(residentLogin.body.data.user)}))`);
  }
  await navigate('/warga?tab=info&info=sanitation', '.resident-app');
  await wait(`document.querySelector('[aria-label="Menu warga seluler"] [aria-current="page"]')?.href.includes('tab=info')`);
  await noOverflow('Resident info');
  await screenshot('resident-info-mobile');
  await evaluate(`document.querySelector('[aria-label="Menu warga seluler"] a[href="/warga?tab=rumah"]').click()`);
  await wait(`location.search.includes('tab=rumah')`);
  await evaluate('history.back()');
  await wait(`document.querySelector('[aria-label="Menu warga seluler"] [aria-current="page"]')?.href.includes('tab=info')`);
  await evaluate(`document.querySelector('[aria-label="Menu warga seluler"] a[href="/warga?tab=beranda"]').click()`);
  await wait(`location.search.includes('tab=beranda')`);
  await noOverflow('Resident home');
  await screenshot('resident-mobile');
  await viewport(1440);
  await noOverflow('Resident desktop');
  await screenshot('resident-desktop');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[aria-label="Menu warga"]')).display !== 'none'`), true);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[aria-label="Menu warga seluler"]')).display`), 'none');
  assert.deepEqual(errors, [], `Uncaught browser errors: ${errors.join(', ')}`);
  console.log('PASS login, public navigation, resident deep links and browser Back');
  if (process.env.UI_TEST_ALL_MENUS === '1') {
    const adminLogin = await evaluate(`fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(${JSON.stringify({ identifier: process.env.UI_TEST_USERNAME, password: process.env.UI_TEST_PASSWORD, portal: 'admin' })}) }).then(async response => ({ status:response.status, body:await response.json() }))`);
    assert.equal(adminLogin.status, 200);
    await evaluate(`localStorage.removeItem('wargahub_user')`);
    const menus = {
      properties: ['units', 'residents', 'vehicles', 'permits', 'analytics'],
      billing: ['invoices', 'annual_matrix', 'tariffs', 'batch'],
      payments: ['verification', 'history', 'manual_counter', 'receiving_channels'],
      expenses: ['expenses_list', 'recurring_expenses', 'social_aid', 'fasum_projects'],
      ledger: ['ledger_list', 'accounts_manage', 'bank_reconciliation', 'financial_reports'],
      budget: ['budget_matrix', 'sinking_fund', 'public_transparency', 'manual_form'],
      analytics: ['financial_trends', 'block_compliance', 'utility_efficiency', 'security_sla'],
      'staff-loans': ['active_loans', 'new_requests', 'payroll_deductions', 'repayment_history', 'loan_policies'],
      'security-gate': ['guards', 'roster', 'patrol', 'gate', 'inventory', 'emergency'],
      'cleaning-staff': ['staff_roster', 'routes_schedule', 'daily_checklist', 'equipment_inventory', 'citizen_tickets'],
      facilities: ['facilities', 'bookings', 'maintenance', 'staff'],
      announcements: ['announcements', 'agenda', 'templates', 'audience'],
      voting: ['election', 'polls', 'voters', 'regulations'],
      'whatsapp-bot': ['templates', 'simulator', 'history', 'settings'],
      settings: ['branding', 'profile', 'finances', 'security', 'sanitation', 'notifications', 'committee', 'inputs_directory'],
      complaints: [], documents: [], audit: [], notifications: [], backup: [], passwords: [],
    };
    const findings = [];
    let checked = 0;
    for (const [menu, tabs] of Object.entries(menus)) {
      for (const tab of tabs.length ? tabs : ['']) {
        try {
          await navigate(`/admin/${menu}${tab ? `?tab=${tab}` : ''}`, '.admin-header', menu === 'payments' && tab === 'receiving_channels' ? '/admin/ledger' : `/admin/${menu}`);
          const content = await evaluate(`document.querySelector('main').innerText`);
          assert.ok(content.trim().length > 0, 'Empty content');
          assert.ok(!content.includes('Muat Ulang Halaman'), 'ErrorBoundary fallback');
          checked++;
          await viewport(360);
          try { await noOverflow(`${menu}/${tab || 'main'} mobile`); } catch (error) { findings.push({ menu, tab, error: error.message }); await screenshot(`overflow-${menu}-${tab || 'main'}`); }
          await viewport(1440);
        } catch (error) { findings.push({ menu, tab, error: error.message }); }
      }
    }
    console.log(JSON.stringify({ checkedTabsAndMenus: checked, findings, browserErrors: errors }, null, 2));
    assert.deepEqual(findings, [], 'Menu audit has remaining findings');
    assert.deepEqual(errors, [], 'Menu audit has browser errors');
  }
  console.log(`Screenshots: ${output}`);
} finally {
  socket?.close();
  chrome.kill();
}
