import assert from 'node:assert/strict';
import type { APIContext } from 'astro';
import { authorizeApi, financeEditors } from '../src/lib/api-authorization';

const context = (user?: unknown) => ({ session: { get: async () => user }, cookies: { get: () => ({ value: JSON.stringify({ id: 'forged', role: 'SUPER_ADMIN' }) }) } }) as unknown as APIContext;
assert.equal((await authorizeApi(context(), financeEditors)).response?.status, 401);
assert.equal((await authorizeApi(context({ id: 'resident', role: 'RESIDENT' }), financeEditors)).response?.status, 403);
assert.equal((await authorizeApi(context({ id: 'auditor', role: 'AUDITOR' }), financeEditors)).response?.status, 403);
const treasurer = await authorizeApi(context({ id: 'treasurer', role: 'TREASURER' }), financeEditors);
assert.equal(treasurer.response, undefined);
assert.equal(treasurer.user?.id, 'treasurer');
console.log('PASS authenticated session, financial role boundaries and untrusted-cookie rejection');
