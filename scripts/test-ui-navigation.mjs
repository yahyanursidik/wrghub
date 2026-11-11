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
  const wait = async condition => {
    const deadline = Date.now()+60_000;
    do {
      try { if (await evaluate(`Boolean(${condition})`)) return true; }
      catch (error) { if (!/navigated|context|target closed/i.test(error.message)) throw error; }
      await new Promise(resolve=>setTimeout(resolve,50));
    } while (Date.now()<deadline);
    throw new Error('UI condition timed out: '+condition);
  };
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
  if (process.env.UI_TEST_ROLE_LAYOUTS === '1') {
    assert.equal(process.env.UI_TEST_ISOLATED, '1');
    const profiles = {
      super: 'SUPER_ADMIN', admin: 'CHAIRMAN', treasurer: 'TREASURER', secretary: 'SECRETARY', people: 'RESIDENT_ADMIN',
      security: 'SECURITY', maintenance: 'MAINTENANCE', auditor: 'AUDITOR', owner: 'HOUSE_OWNER', resident: 'HOUSEHOLD_HEAD', tenant: 'RESIDENT', viewer: 'VIEWER',
    };
    for (const [username, role] of Object.entries(profiles)) {
      await navigate('/', '#resident-identifier');
      const isResident = ['owner', 'resident', 'tenant', 'viewer'].includes(username);
      const expected = isResident ? '/warga' : '/admin';
      const attribute = isResident ? 'data-resident-workspace' : 'data-workspace-role';
      const payload = JSON.stringify({ identifier: `ui_${username}`, password: process.env.UI_TEST_PASSWORD });
      const signedIn = await evaluate(`fetch('/api/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(${payload})}).then(async r => ({status:r.status,data:(await r.json()).data}))`);
      assert.equal(signedIn.status, 200, `Login ${role}`);
      assert.equal(signedIn.data.redirectUrl, expected);
      await navigate(expected, `[${attribute}="${role}"]`);
      for (const width of [320, 375, 414, 768, 1440]) {
        await viewport(width);
        await noOverflow(`${role} ${width}px`);
        const clipped = await evaluate(`Array.from(document.querySelectorAll('.workspace-button,.workspace-module-group a,.resident-service-button,.workspace-shortcuts a,.workspace-row')).filter(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth + 1).map(e => e.textContent.trim())`);
        assert.deepEqual(clipped, [], `Clipped links: ${role} ${width}px`);
        if ([320, 1440].includes(width)) await screenshot(`role-${role.toLowerCase()}-${width}`);
      }
      console.log(`PASS ${role} at 320, 375, 414, 768 and 1440px`);
    }
    assert.deepEqual(errors, [], 'Unexpected browser errors in role dashboards');
    console.log(`Screenshots: ${output}`);
  } else {
  await navigate('/', '#resident-identifier');
  const login = await evaluate(`fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(${JSON.stringify({ identifier: process.env.UI_TEST_USERNAME, password: process.env.UI_TEST_PASSWORD, portal: 'admin' })}) }).then(async response => ({ status:response.status, body:await response.json() }))`);
  assert.equal(login.status, 200, 'Fixture login failed');
  await evaluate(`localStorage.setItem('wargahub_user', JSON.stringify(${JSON.stringify(login.body.data.user)}))`);

  for (const width of [320, 360, 375, 414, 768, 1440]) {
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

  // Use the isolated resident account to check that login resumes the selected month.
  if (process.env.UI_TEST_RESIDENT_USERNAME) {
    await evaluate(`fetch('/api/auth/logout',{method:'POST'}).then(()=>localStorage.removeItem('wargahub_user'))`);
    await navigate('/warga?tab=iuran&month=2026-10','#resident-identifier','/login');
    await evaluate(`document.querySelector('#resident-identifier').focus()`);
    await cdp('Input.insertText',{text:process.env.UI_TEST_RESIDENT_USERNAME});
    await evaluate(`document.querySelector('#resident-identifier').closest('form').querySelector('input[type=password]').focus()`);
    await cdp('Input.insertText',{text:process.env.UI_TEST_PASSWORD});
    await evaluate(`document.querySelector('#resident-identifier').closest('form').requestSubmit()`);
    await wait(`location.pathname==='/warga' && location.search.includes('tab=iuran') && location.search.includes('month=2026-10') &&
      document.querySelector('main')?.innerText.includes('INV-TEST-A01')`);
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
  const complaintsShortcut = 'Array.from(document.querySelectorAll(".resident-service-button")).find(button => button.textContent.trim() === "Aduan saya")';
  await evaluate(`${complaintsShortcut}.click()`);
  await wait(`location.search.includes('tab=info') && location.search.includes('info=complaints')`);
  await evaluate('history.back()');
  await wait(`location.search.includes('tab=beranda') && document.querySelector('[data-resident-workspace]')`);
  for (const width of [320, 375, 414, 768]) {
    await viewport(width);
    await noOverflow(`Resident home ${width}px`);
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('.resident-service-button')).every(button => button.scrollWidth <= button.clientWidth)`), true, `Resident shortcut clips at ${width}px`);
    await screenshot(`resident-${width}`);
  }
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
    await navigate('/admin/properties?tab=units&house=A-01','#registry-heading');
    assert.equal(await evaluate("document.querySelector('[aria-label=\"Lingkup rumah\"]').value"),'A-01');
    for (const width of [320,375,414,768]) { await viewport(width); await noOverflow('Rumah & Warga '+width); if(width===375) { assert.ok(await evaluate("document.querySelector('#tab-panel-units table').getClientRects().length===0")); await screenshot('rumah-warga-375'); } }
    await viewport(1440); await screenshot('rumah-warga-desktop');
    await evaluate("document.querySelector('#tab-btn-residents').click()");
    await wait("location.search.includes('tab=residents') && location.search.includes('house=A-01') && document.querySelector('#tab-panel-residents')");
    await evaluate('history.back()');
    await wait("location.search.includes('tab=units') && document.querySelector('#tab-panel-units')");
    await navigate('/admin/passwords?house=A-01','main h1');
    await wait("document.querySelector('input[type=search]')?.value==='A-01'");
    await navigate('/pulihkan-akun?portal=admin','input[name=code]');
    for (const width of [320,375,414,768]) { await viewport(width); await noOverflow('Pemulihan '+width); if(width===375) await screenshot('pemulihan-375'); }
    assert.equal(await evaluate("document.querySelector('input[name=password]').minLength"),12);
    assert.ok(await evaluate("Array.from(document.querySelectorAll('main a')).some(link=>link.href.endsWith('/login?portal=admin'))"));
    await viewport(1440);
    console.log('PASS house scope, linked accounts, browser Back, and recovery at 320/375/414/768px');
    const financeScreens = [
      ['billing-list','/admin/billing?period=period-test','Daftar tagihan'],
      ['billing-year','/admin/billing?tab=annual_matrix','Rekap tahunan'],
      ['billing-tariff','/admin/billing?tab=tariffs','Tarif iuran'],
      ['billing-batch','/admin/billing?tab=batch','Penerbitan massal'],
      ['payments-queue','/admin/payments?tab=verification','Verifikasi pembayaran'],
      ['payments-receipts','/admin/payments?tab=history','Riwayat kuitansi'],
      ['payments-record','/admin/payments?tab=manual_counter&invoice=invoice-a-02','Catat pembayaran'],
      ['public-dues','/transparency/2026/10?tab=dues_breakdown','Rekap iuran'],
      ['cash-expenses','/admin/expenses','Transaksi pengeluaran'],
      ['cash-recurring','/admin/expenses?tab=recurring_expenses','Rencana rutin'],
      ['cash-social','/admin/expenses?tab=social_aid','Riwayat bantuan sosial'],
      ['cash-projects','/admin/expenses?tab=fasum_projects','Proyek fasum'],
      ['cash-journal','/admin/ledger','Jurnal kas'],
      ['cash-accounts','/admin/ledger?tab=accounts_manage','Rekening kas'],
      ['cash-reconciliation','/admin/ledger?tab=bank_reconciliation','Rekonsiliasi rekening'],
      ['cash-reports','/admin/ledger?tab=financial_reports&month=2026-10','Laporan kas'],
      ['budget-matrix','/admin/budget?month=2026-10','Realisasi Buku Kas'],
      ['budget-reserves','/admin/budget?tab=sinking_fund&month=2026-10','Dana cadangan'],
      ['budget-public','/admin/budget?tab=public_transparency&month=2026-10','Transparansi anggaran'],
      ['budget-plan','/admin/budget?tab=manual_form&month=2026-10','Susun pagu'],
      ['analytics-cash','/admin/analytics?month=2026-10','Tren kas'],
      ['analytics-block','/admin/analytics?tab=block_compliance&month=2026-10','Iuran per blok'],
      ['analytics-utility','/admin/analytics?tab=utility_efficiency&month=2026-10','Utilitas'],
      ['analytics-sla','/admin/analytics?tab=security_sla&month=2026-10','Keamanan dan aduan'],
    ];
    for (const [name,route,section] of financeScreens) {
      await navigate(route,'main');
      const selector = `main [aria-label="${section}"]`;
      await wait(`document.querySelector(${JSON.stringify(selector)})`);
      for (const width of [320,375,414,768,1440]) {
        await viewport(width);
        await noOverflow(`${name} ${width}`);
        const clipped=await evaluate(`Array.from(document.querySelectorAll('main a, main button')).filter(e=>{
          const rect=e.getBoundingClientRect();return rect.width>0&&(rect.right>innerWidth+1||e.scrollWidth>e.clientWidth+1);
        }).map(e=>e.textContent.trim())`);
        assert.deepEqual(clipped,[],`${name} clipped controls at ${width}`);
        await screenshot(`${name}-${width}`);
      }
    }
    await navigate('/admin/billing?period=period-test','main [aria-label="Daftar tagihan"]');
    await viewport(320);
    await evaluate(`document.querySelector('[aria-controls="billing-filters"]').click()`);
    await wait(`document.querySelector('[aria-controls="billing-filters"]').getAttribute('aria-expanded')==='true'`);
    assert.ok(await evaluate(`document.querySelector('#billing-filters select').getClientRects().length>0`));
    await noOverflow('Filter tagihan 320');
    await viewport(1440);
    const pendingLink=await evaluate(`Array.from(document.querySelectorAll('main a')).find(link=>link.textContent.trim()==='Cek bukti')?.getAttribute('href')`);
    assert.ok(pendingLink?.includes('invoice=invoice-a-01') && pendingLink.includes('payment=payment-test'));
    await navigate(pendingLink,'main [aria-label="Verifikasi pembayaran"]');
    await evaluate(`Array.from(document.querySelectorAll('main button')).find(button=>button.textContent.trim()==='Cek bukti').click()`);
    await wait(`document.querySelector('dialog[open]')?.innerText.includes('Belum ada bukti terlampir')`);
    assert.ok(await evaluate(`Boolean(document.querySelector('dialog[open] a[href*="invoice=invoice-a-01"]'))`));
    await navigate('/admin/billing?tab=annual_matrix','main [aria-label="Rekap tahunan"]');
    assert.equal(await evaluate(`document.querySelectorAll('main [data-month-status="unissued"]').length`),22);
    await navigate('/admin/payments?tab=manual_counter&invoice=invoice-a-02','main [aria-label="Catat pembayaran"]');
    assert.equal(await evaluate(`document.querySelector('main [aria-label="Catat pembayaran"] select[required]').value`),'invoice-a-02');
    assert.equal(await evaluate(`document.querySelector('main [aria-label="Catat pembayaran"] input[type="number"]').value`),'250000');
    await navigate('/admin/payments?tab=history&payment=receipt-test','main [aria-label="Riwayat kuitansi"]');
    await evaluate(`Array.from(document.querySelectorAll('main button')).filter(button=>button.textContent.trim()==='Kuitansi').at(-1).click()`);
    await wait(`document.querySelector('dialog[open] img[alt="QR verifikasi kuitansi"]')`);
    await viewport(320);await noOverflow('Kuitansi 320');await screenshot('payments-receipt-open-320');
    await viewport(1440);
    console.log('PASS finance tabs at 320/375/414/768/1440px; exact pending link, unissued months, prefilling, and verified receipt QR');
    assert.equal(process.env.UI_TEST_ISOLATED,'1','Finance form tests require the isolated fixture.');
    const fixture = process.env.UI_TEST_FIXTURE_ID;
    assert.ok(fixture && await evaluate(`fetch('/api/properties').then(r=>r.json()).then(data=>(Array.isArray(data)?data:data.data || []).some(property=>property.notes===${JSON.stringify('fixture:'+fixture)}))`),
      'Fixture marker did not match; refusing to change expenses or bank details.');
    await navigate('/admin/expenses','main [aria-label="Transaksi pengeluaran"]');
    await viewport(320);
    const expenseJournalLink=await evaluate(`document.querySelector('[data-expense-id="expense-test"] a[href^="/admin/ledger"]')?.getAttribute('href')`);
    assert.equal(expenseJournalLink,'/admin/ledger?expense=expense-test');
    await evaluate(`Array.from(document.querySelectorAll('main button')).find(b=>b.textContent.trim()==='Catat pengeluaran').click()`);
    await wait(`document.querySelector('dialog[open] input[name=title]')`);
    await noOverflow('Expense form 320');
    await screenshot('cash-expense-dialog-320');
    await evaluate(`(()=>{const form=document.querySelector('dialog[open] form'); form.elements.title.value='Perlengkapan kas uji dari UI'; form.elements.amount.value='20000'; form.elements.categoryId.value='cat-pemeliharaan'; form.elements.bookNow.value='draft'; form.requestSubmit();})()`);
    await wait(`location.search.includes('saved=expense') && document.querySelector('[data-expense-id]')?.textContent.includes('Draf') && !document.querySelector('astro-island[ssr][client="load"]')`);
    assert.equal(await evaluate(`Boolean(document.querySelector('[data-expense-id] a[href^="/admin/ledger"]'))`),false);
    await evaluate(`Array.from(document.querySelectorAll('[data-expense-id] button')).find(b=>b.textContent.trim()==='Bukukan').click()`);
    await wait(`document.querySelector('dialog[open] form')`);
    await evaluate(`document.querySelector('dialog[open] form').requestSubmit()`);
    await wait(`location.search.includes('saved=book') && Boolean(document.querySelector('[data-expense-id] a[href^="/admin/ledger"]')) && !document.querySelector('astro-island[ssr][client="load"]')`);
    const writtenJournal=await evaluate(`document.querySelector('[data-expense-id] a[href^="/admin/ledger"]').getAttribute('href')`);
    await navigate(writtenJournal,'main [data-journal-id]');
    assert.equal(await evaluate(`document.querySelector('main h1').textContent.trim()`),'Jurnal pengeluaran');
    assert.ok(await evaluate(`document.querySelector('[data-journal-id]').textContent.includes('Perlengkapan kas uji dari UI')`));
    await noOverflow('Linked cash entry 320');
    await viewport(1440);
    console.log('PASS pengeluaran dan buku kas: alur formulir draf → pembukuan → jurnal terkait serta delapan subhalaman di lima lebar.');

    const waDialog = 'dialog[open][aria-label="Laporan WA (wa.me)"]';
    const waText = `document.querySelector(${JSON.stringify(waDialog+' textarea[name=waMessage]')})?.value`;
    const waHref = `document.querySelector(${JSON.stringify(waDialog+' a[href^="https://wa.me/"]')})?.href`;
    const waSelect = (name,value)=>evaluate(`(()=>{const select=document.querySelector(${JSON.stringify(waDialog+' select[name='+name+']')});select.value=${JSON.stringify(value)};select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    const openWa = async label => {
      await evaluate(`Array.from(document.querySelectorAll('main button')).find(button=>button.textContent.trim()===${JSON.stringify(label)}).click()`);
      await wait(`document.querySelector(${JSON.stringify(waDialog)})`);
    };
    await navigate('/admin/billing?period=period-test','main [aria-label="Daftar tagihan"]');
    await viewport(320);
    await openWa('Laporan WA (wa.me)');
    assert.match(await evaluate(waText),/Oktober 2026/);
    assert.match(await evaluate(waText),/Menunggu verifikasi.*\n• A-01/);
    await noOverflow('Laporan WA 320');
    await screenshot('finance-wa-report-320');
    await waSelect('waPeriod','period-wa-test');
    await wait(`${waText}?.includes('Desember 2025')`);
    let text = await evaluate(waText);
    assert.match(text,/Iuran terbayar: \*Rp100\.000\*/);
    assert.match(text,/Sisa tagihan: \*Rp200\.000\*/);
    assert.doesNotMatch(text,/Oktober 2026|A-01|PRIVATE-FINANCIAL/);
    assert.equal(new URL(await evaluate(waHref)).searchParams.get('text'),text);
    await waSelect('waTemplate','dues_summary');
    await wait(`${waText}?.includes('Ringkasan iuran')`);
    assert.doesNotMatch(await evaluate(waText),/A-02/);
    await waSelect('waTemplate','dues_thr');
    await wait(`${waText}?.includes('Iuran & THR penjaga')`);
    await evaluate(`document.querySelector(${JSON.stringify(waDialog+' summary')}).click()`);
    await evaluate(`(()=>{const input=document.querySelector(${JSON.stringify(waDialog+' input[name=waPhone]')});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'0812-3456-7890');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await wait(`${waHref}?.includes('/6281234567890?')`);
    await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedWa=text;}}}); true`);
    const pressDialogButton = label => evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(waDialog+' button')})).find(button=>button.textContent.trim()===${JSON.stringify(label)}).click()`);
    await pressDialogButton('Salin pesan');
    await wait(`window.__copiedWa === ${waText}`);
    await pressDialogButton('Salin tautan');
    await wait(`window.__copiedWa === ${waHref}`);
    await viewport(1440);
    await screenshot('finance-wa-report-1440');
    await waSelect('waTemplate','bank');
    await wait(`document.querySelector(${JSON.stringify(waDialog)})?.innerText.includes('Rekening resmi belum tersedia')`);
    assert.equal(await evaluate(waHref),undefined);
    const bankFixture = await evaluate(`fetch('/api/accounts/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'acc-main',name:'Rekening uji',code:'TEST-BANK',type:'BANK',bankName:'Bank uji',accountNumber:'9876543210'})}).then(r=>r.status)`);
    assert.equal(bankFixture,200);

    await navigate('/admin/payments?period=period-wa-test','main [aria-label="Verifikasi pembayaran"]');
    await openWa('Laporan WA (wa.me)');
    assert.match(await evaluate(waText),/Desember 2025/);
    await waSelect('waTemplate','bank');
    await wait(`${waText}?.includes('Bank uji · 9876543210')`);
    assert.match(new URL(await evaluate(waHref)).searchParams.get('text'),/Cantumkan kode rumah/);
    await navigate('/admin/payments?tab=receiving_channels','main [aria-label="Rekening kas"]','/admin/ledger');
    await openWa('Siaran rekening WA');
    assert.match(await evaluate(waText),/Bank uji · 9876543210/);
    await navigate('/admin/ledger?tab=financial_reports&month=2026-10','main [aria-label="Laporan kas"]');
    await openWa('Laporan WA (wa.me)');
    text = await evaluate(waText);
    assert.match(text,/Pengeluaran bersih tercatat: \*Rp50\.000\*/);
    assert.match(text,/\/transparency\/2026\/10/);
    assert.doesNotMatch(text,/9876543210/);
    assert.equal(new URL(await evaluate(waHref)).searchParams.get('text'),text);
    console.log('PASS laporan WA dari Tagihan, Pembayaran, Buku Kas, dan Rekening; template, periode, clipboard dan tautan diuji tanpa membuka WhatsApp.');

    const clickNamedButton = (label,selector='main button')=>evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(button=>button.textContent.trim()===${JSON.stringify(label)}).click()`);
    const fillNativeForm = async (selector,values)=>{
      // Astro can remove the SSR marker while React is still attaching the form.
      const target=`document.querySelector(${JSON.stringify(selector)})`;
      await wait(`(()=>{const form=${target};return form && Object.keys(form).some(key=>key.startsWith('__reactProps$') && typeof form[key]?.onSubmit==='function');})()`);
      return evaluate(`(()=>{const form=${target};for(const [key,value] of Object.entries(${JSON.stringify(values)})){form.elements.namedItem(key).value=value;}form.requestSubmit();})()`);
    };
    await navigate('/admin/budget?tab=manual_form&month=2026-10','main [aria-label="Susun pagu"]');
    await viewport(320);
    await fillNativeForm('section[aria-label="Susun pagu"] form',{categoryId:'cat-pemeliharaan',amount:'85000',pic:'Bendahara fixture'});
    await wait(`document.querySelector('main [role=status]')?.textContent.includes('Pos pagu tersimpan')`);
    await navigate('/admin/budget?month=2026-10','main [aria-label="Realisasi Buku Kas"]');
    await clickNamedButton('Sahkan pagu');
    await wait(`document.querySelector('dialog[open][aria-label="Sahkan pagu bulanan"]')`);
    await noOverflow('Pengesahan pagu 320');
    await evaluate(`Promise.all(document.querySelector('dialog[open]').getAnimations().map(animation=>animation.finished)).then(()=>true)`);
    await screenshot('budget-approve-320');
    await clickNamedButton('Sahkan','dialog[open] button');
    await wait(`document.querySelector('main [aria-label="Realisasi Buku Kas"]')?.textContent.includes('Disahkan oleh')`);
    const budgetHref=await evaluate(`document.querySelector('main a[href^="/api/budget?"]').getAttribute('href')`);
    assert.match(await evaluate(`fetch(${JSON.stringify(budgetHref)}).then(r=>r.text())`),/"Pemeliharaan","Disahkan","85000","50000","35000"/);

    await navigate('/admin/budget?tab=sinking_fund','main [aria-label="Dana cadangan"]');
    await clickNamedButton('Dana baru');
    await wait(`document.querySelector('dialog[open] form')`);
    await fillNativeForm('dialog[open] form',{name:'Dana taman fixture',target:'150000',purpose:'Perbaikan taman'});
    await wait(`document.querySelector('article[data-fund-id]')?.textContent.includes('Dana taman fixture') && !document.querySelector('astro-island[ssr][client="load"]')`);
    await clickNamedButton('Setor','article[data-fund-id] button');
    await wait(`document.querySelector('dialog[open][aria-label="Setor dana cadangan"]')`);
    await noOverflow('Mutasi cadangan 320');
    await fillNativeForm('dialog[open] form',{accountId:'acc-main',amount:'25000'});
    await wait(`location.search.includes('moved=transfer-') && document.querySelector('article[data-fund-id]')?.textContent.includes('Rp25.000')`);
    const reserveJournal=await evaluate(`document.querySelector('main a[href*="transfer=transfer-"]').getAttribute('href')`);
    await navigate(reserveJournal,'main [data-journal-id]');
    assert.equal(await evaluate(`document.querySelectorAll('[data-journal-id]').length`),2);

    await navigate('/admin/analytics?month=2026-10','main [aria-label="Tren kas"]');
    await clickNamedButton('Simpan arsip');
    await wait(`document.querySelector('dialog[open] form')`);
    await fillNativeForm('dialog[open] form',{notes:'Arsip laporan browser fixture'});
    await wait(`document.querySelector('[data-snapshot-id]')?.textContent.includes('Arsip laporan browser fixture')`);
    await navigate('/admin/analytics?month=2026-10&tab=utility_efficiency','main [aria-label="Utilitas"]');
    await clickNamedButton('Lihat arsip','[data-snapshot-id] button');
    await wait(`document.querySelector('dialog[open]')?.textContent.includes('Arsip laporan browser fixture')`);
    await noOverflow('Arsip laporan 320');
    await viewport(1440);
    console.log('PASS Anggaran dan Laporan: delapan submenu di lima lebar; formulir pagu dan pengesahan, mutasi dan tautan jurnal, CSV, serta arsip lintas submenu.');

    for(const [name,route,label] of [
      ['staff-active','/admin/staff-loans','Daftar kasbon'],
      ['staff-requests','/admin/staff-loans?tab=new_requests','Pengajuan kasbon'],
      ['staff-payroll','/admin/staff-loans?tab=payroll_deductions','Potong gaji'],
      ['staff-history','/admin/staff-loans?tab=repayment_history','Riwayat angsuran'],
      ['staff-policy','/admin/staff-loans?tab=loan_policies','Kebijakan kasbon'],
      ['transparency-cash','/transparency/2026/10?tab=cashflow_summary','Ringkasan arus kas'],
      ['transparency-journal','/transparency/2026/10?tab=public_ledger','Jurnal publik'],
      ['transparency-dues','/rekap-iuran?period=period-test','Rekap iuran'],
      ['transparency-confirm','/transparency/2026/10?tab=citizen_confirm','Cek iuran saya'],
      ['transparency-help','/transparency/2026/10?tab=audit_faq','Bantuan laporan'],
    ]) {
      await navigate(route,`main [aria-label="${label}"]`,name==='transparency-dues'?'/transparency/2026/10':undefined);
      for(const width of [320,375,414,768,1440]) {
        await viewport(width);await noOverflow(label+' '+width);
        if(name.startsWith('transparency-')) assert.equal(await evaluate(`Array.from(document.querySelectorAll('header a')).some(a=>a.getClientRects().length && a.getBoundingClientRect().right>innerWidth)`),false);
        if([320,1440].includes(width)) await screenshot(name+'-'+width);
      }
    }
    await viewport(320);
    await navigate('/transparency/2026/10?tab=cashflow_summary','main [aria-label="Target dan penerimaan iuran"]');
    const publicSummary=await evaluate(`document.querySelector('[aria-label="Target dan penerimaan iuran"]').innerText.replace(/\\s+/g,' ')`);
    assert.match(publicSummary,/Total yang harus diterima Rp500\.000/);
    assert.match(publicSummary,/sudah diterima.*Sisa tagihan/);
    const expenseLink=await evaluate(`document.querySelector('[aria-label="Pengeluaran yang dibukukan"] a').getAttribute('href')`);
    assert.equal(expenseLink,'/transparency/2026/10?tab=public_ledger&scope=expenses');
    await navigate(expenseLink,'main [aria-label="Entri jurnal"]');
    assert.match(await evaluate(`document.querySelector('main h2').textContent`),/Jurnal pengeluaran/);
    assert.ok(await evaluate(`document.querySelector('main a[download]').href.includes('scope=expenses')`));
    await noOverflow('Jurnal pengeluaran publik 320');
    await viewport(320);
    await navigate('/admin/staff-loans?tab=new_requests','main [aria-label="Pengajuan kasbon"]');
    await clickNamedButton('Ajukan kasbon');
    await wait(`document.querySelector('dialog[open][aria-label="Ajukan kasbon"]')`);
    await noOverflow('Formulir kasbon 320');
    await fillNativeForm('dialog[open] form',{name:'Petugas uji browser',salary:'300000',principal:'30000',monthly:'15000',tenor:'2',purpose:'Pengujian browser'});
    await wait(`document.querySelector('main [role=status]')?.textContent.includes('Pengajuan tersimpan')`);
    await clickNamedButton('Setujui');
    await wait(`document.querySelector('dialog[open][aria-label="Setujui pengajuan"]')`);
    await clickNamedButton('Setujui','dialog[open] button');
    await wait(`document.querySelector('main [role=status]')?.textContent.includes('Lanjutkan ke pencairan')`);
    await navigate('/admin/staff-loans','main [aria-label="Daftar kasbon"]');
    await clickNamedButton('Cairkan');
    await wait(`document.querySelector('dialog[open][aria-label="Catat pencairan"]')`);
    await fillNativeForm('dialog[open] form',{account:'acc-main'});
    await wait(`document.querySelector('main [role=status]')?.textContent.includes('Pencairan tercatat')`);
    await clickNamedButton('Catat angsuran');
    await wait(`document.querySelector('dialog[open][aria-label="Catat angsuran"]')`);
    await fillNativeForm('dialog[open] form',{account:'acc-main'});
    await wait(`document.querySelector('dialog[open][aria-label="Kuitansi angsuran"]')`);
    assert.equal(await evaluate(`Boolean(document.querySelector('dialog[open] a[href^="https://wa.me/"]'))`),false);
    await screenshot('staff-receipt-320');
    const printLoan=await evaluate(`document.querySelector('dialog[open] a[href*="receipt="]').getAttribute('href')`);
    const loanJournal=await evaluate(`document.querySelector('dialog[open] a[href*="installment="]').getAttribute('href')`);
    await navigate(printLoan,'#print-loan-receipt');
    assert.match(await evaluate('document.querySelector("main").innerText'),/Petugas uji browser/);
    await navigate(loanJournal,'main [data-journal-id]');
    assert.equal(await evaluate('document.querySelectorAll("main [data-journal-id]").length'),1);

    await navigate('/transparency/2026/10?tab=public_ledger','main [aria-label="Jurnal publik"]');
    const publicCsv=await evaluate(`document.querySelector('main a[download]').getAttribute('href')`);
    const csvText=await evaluate(`fetch(${JSON.stringify(publicCsv)},{credentials:'omit'}).then(r=>r.text())`);
    assert.match(csvText,/Nomor jurnal publik/);
    assert.doesNotMatch(csvText,/PRIVATE-FINANCIAL|INV-TEST|A-01|A-02/);
    await clickNamedButton('Bagikan');
    await wait(`document.querySelector('dialog[open][aria-label="Bagikan laporan"] img')`);
    assert.equal(await evaluate(`new URL(document.querySelector('dialog[open] input').value).searchParams.get('tab')`),'public_ledger');
    await noOverflow('Bagikan transparansi 320');
    await navigate('/transparency/2026/10?tab=citizen_confirm','main [aria-label="Cek iuran saya"]');
    assert.equal(await evaluate(`document.querySelector('main a[href^="/warga?tab=iuran"]').getAttribute('href')`),'/warga?tab=iuran&month=2026-10');
    await viewport(1440);
    console.log('PASS Kasbon dan Transparansi: 10 submenu di lima lebar, pengajuan sampai kuitansi dan Buku Kas, CSV aman, tautan periode dan QR.');

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
          if (menu === 'security-gate' && tab === 'gate') {
            assert.ok(content.includes('Simulasi palang masuk'), 'Gate controls must be identified as simulations');
          }
          if (menu === 'security-gate' && tab === 'emergency') {
            assert.ok(content.includes('Simulasi di layar ini tidak mengirim notifikasi'), 'Emergency simulator must not imply broadcast');
          }
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
  }
} finally {
  socket?.close();
  chrome.kill();
}
