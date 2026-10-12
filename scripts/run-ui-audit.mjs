import { spawn } from 'node:child_process';
import path from 'node:path';

const run = (args, env, capture = false) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, { env, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  let output = ''; let errors = '';
  if (capture) { child.stdout.on('data', chunk => output += chunk); child.stderr.on('data', chunk => errors += chunk); }
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve(output) : reject(new Error(`${args.join(' ')} failed (${code}): ${errors}`)));
});

let server;
const securityOnly = process.argv.includes('--security-only');
try {
  if (!securityOnly && process.env.UI_TEST_URL && process.env.UI_TEST_USERNAME && process.env.UI_TEST_PASSWORD) {
    await run(['scripts/test-ui-navigation.mjs'], process.env);
  } else {
    const fixture = JSON.parse(await run(['--import', 'tsx', 'scripts/create-ui-test-fixture.ts'], process.env, true));
    const port = process.env.UI_AUDIT_PORT || '4330';
    const env = { ...process.env, DATABASE_URL: '', WARGAHUB_DATA_DIR: fixture.directory, HOST: '127.0.0.1', PORT: port };
    server = spawn(process.execPath, ['dist/server/entry.mjs'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Isolated UI server did not start. Build the app first.')), 20000);
      server.once('error', reject);
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Isolated server exited (${code}).`)); });
      server.stdout.on('data', chunk => { if (String(chunk).includes('Server listening')) { clearTimeout(timer); resolve(); } });
      server.stderr.on('data', chunk => process.stderr.write(chunk));
    });
    const testEnv = { ...env, UI_TEST_URL: `http://127.0.0.1:${port}`, UI_TEST_USERNAME: fixture.username, UI_TEST_PASSWORD: fixture.password, UI_TEST_RESIDENT_USERNAME: fixture.residentUsername, UI_TEST_ALL_MENUS: '1', UI_TEST_OUTPUT: process.env.UI_TEST_OUTPUT || path.join(fixture.directory, 'screenshots'), UI_TEST_ISOLATED:'1', UI_TEST_FIXTURE_ID:fixture.fixtureId };
    const suites = securityOnly ? ['scripts/test-server-security.mjs'] : ['scripts/test-ui-navigation.mjs', 'scripts/test-server-security.mjs'];
    for (const suite of suites) {
      try { await run([suite], testEnv); }
      catch (error) { console.error(error.message); process.exitCode = 1; }
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { server?.kill(); }
