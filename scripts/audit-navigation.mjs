import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)));
  return nested.flat();
}
async function exists(file) { try { await access(file); return true; } catch { return false; } }
const files = (await walk(path.join(root, 'src'))).filter(file => /\.(astro|tsx?|jsx?)$/.test(file));
const routeFiles = files.filter(file => file.includes(`${path.sep}pages${path.sep}`));
const routes = new Set(routeFiles.map(file => {
  let route = '/' + path.relative(path.join(root, 'src/pages'), file).replaceAll(path.sep, '/').replace(/\.(astro|ts|js)$/, '').replace(/\/index$/, '');
  return route === '/index' ? '/' : route;
}));
const missing = [];
const endpoints = new Map();
const linkedRoutes = new Set();
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const refs = [...source.matchAll(/(?:href\s*[:=]\s*|(?:fetch|apiFetch)\(\s*)['"`](\/[^'"`\s]*)['"`]/g)];
  for (const match of refs) {
    const target = match[1].split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (target.includes('${')) continue;
    if (target.startsWith('/api/')) endpoints.set(target, (endpoints.get(target) || 0) + 1);
    else linkedRoutes.add(target);
    if (routes.has(target) || await exists(path.join(root, 'public', target.slice(1)))) continue;
    if (routeFiles.some(routeFile => {
      const route = '/' + path.relative(path.join(root, 'src/pages'), routeFile).replaceAll(path.sep, '/').replace(/\.(astro|ts|js)$/, '').replace(/\/index$/, '');
      return new RegExp('^' + route.replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+') + '$').test(target);
    })) continue;
    missing.push({ file: path.relative(root, file).replaceAll(path.sep, '/'), line: source.slice(0, match.index).split('\n').length, target });
  }
}
const adminRoutes = [...routes].filter(route => route.startsWith('/admin') && route !== '/admin/login').sort();
console.log(JSON.stringify({ sourceFiles: files.length, adminRoutes, referencedApiEndpoints: endpoints.size, linkedRoutes: linkedRoutes.size, missing }, null, 2));
if (missing.some(item => item.target.startsWith('/api/'))) process.exitCode = 1;
