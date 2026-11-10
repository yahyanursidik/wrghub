import type { ResidentItem } from '../types/property-submodules';
import type { UserRole } from '../types/auth';
import { navigationForRole } from './navigation';
import { hasWorkspace } from './dashboard-workspace';

const leaders: UserRole[] = ['SUPER_ADMIN', 'CHAIRMAN'];
const finance: UserRole[] = [...leaders, 'TREASURER'];
const financeRead: UserRole[] = [...finance, 'AUDITOR'];
const people: UserRole[] = [...leaders, 'SECRETARY', 'RESIDENT_ADMIN'];
const peopleRead: UserRole[] = [...people, 'TREASURER', 'SECURITY', 'AUDITOR'];
const residentRoles: UserRole[] = ['HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT'];
export const canEditHousing = (role:UserRole) => people.includes(role);
export const canReadHousingBilling = (role:UserRole) => financeRead.includes(role);
export const canManageFinance = (role: UserRole) => finance.includes(role);
export const canReversePayment = (role: UserRole) => role === 'SUPER_ADMIN' || role === 'TREASURER';
export function residentsForRole(items:ResidentItem[],role:UserRole):ResidentItem[] {
  if(canEditHousing(role)) return items;
  return items.map(item=>({...item,birthPlaceDate:'',religion:'',idCard:'',familyCard:'',phone:'',email:'',bloodType:'',notes:undefined}));
}

export const isResidentRole = (role: UserRole) => residentRoles.includes(role);

export function canAccessAdminPage(role: UserRole, pathname: string) {
  if (pathname.replace(/\/$/, '') === '/admin') return hasWorkspace(role);
  return navigationForRole(role).some(group => group.items.some(item => item.href === pathname.replace(/\/$/, '')));
}

export function allowedApiRoles(path: string, method: string): UserRole[] | null {
  const read = ['GET', 'HEAD'].includes(method);
  if (['/api/health', '/api/auth/login', '/api/auth/logout', '/api/auth/recover', '/api/receipts/verify', '/api/settings/profile'].includes(path)) return null;
  if (path === '/api/payments/submit') return [...finance, ...residentRoles];
  if (path === '/api/payments/reverse') return finance.filter(canReversePayment);
  if (path === '/api/settings/security-roster') return read ? [...leaders, 'SECRETARY', 'SECURITY', 'MAINTENANCE'] : [...leaders, 'SECURITY'];
  if (path === '/api/complaints/create') return [...people, 'SECURITY', 'MAINTENANCE', ...residentRoles];
  if (path === '/api/facilities/book' || path === '/api/voting/cast-vote') return [...people, 'TREASURER', 'SECURITY', 'MAINTENANCE', ...residentRoles];
  if (['/api/properties/occupants/create', '/api/properties/permits/create', '/api/properties/update', '/api/vehicles/create'].includes(path)) return [...people, ...residentRoles];
  if (path === '/api/properties/occupants/delete') return [...people, 'HOUSE_OWNER', 'HOUSEHOLD_HEAD'];
  if (path.startsWith('/api/properties')) return read ? peopleRead : people;
  if (path.startsWith('/api/users')) return read ? [...peopleRead, 'TREASURER'] : leaders;
  if (/^\/api\/(payments|billing|expenses|ledger|budget|accounts|analytics)(\/|$)/.test(path)) return read ? financeRead : finance;
  if (path.startsWith('/api/security')) return [...leaders, 'SECURITY'];
  if (path.startsWith('/api/cleaning')) return [...leaders, 'MAINTENANCE', 'SECURITY'];
  if (path.startsWith('/api/facilities')) return [...leaders, 'MAINTENANCE', 'SECRETARY', 'SECURITY'];
  if (path.startsWith('/api/announcements')) return read ? [...leaders, 'SECRETARY', 'SECURITY', 'MAINTENANCE'] : [...leaders, 'SECRETARY'];
  if (path.startsWith('/api/whatsapp')) return [...leaders, 'SECRETARY', 'TREASURER'];
  if (path.startsWith('/api/voting')) return read ? [...leaders, 'SECRETARY', ...residentRoles, 'TREASURER', 'SECURITY', 'MAINTENANCE'] : [...leaders, 'SECRETARY'];
  if (path.startsWith('/api/settings')) return read ? [...leaders, 'SECRETARY', 'TREASURER', 'SECURITY', 'MAINTENANCE'] : leaders;
  if (path.startsWith('/api/documents')) return [...leaders, 'SECRETARY', 'TREASURER'];
  if (path.startsWith('/api/backup')) return leaders;
  if (path.startsWith('/api/complaints')) return [...people, 'SECURITY', 'MAINTENANCE'];
  if (path.startsWith('/api/resident') || path.startsWith('/api/ai')) return [...leaders, 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE', 'AUDITOR', 'VIEWER', ...residentRoles];
  return [];
}

export function residentWriteMatches(body: Record<string, unknown>, identity: { propertyId?: string; propertyCode?: string }) {
  const ids = [body.propertyId].filter(value => typeof value === 'string') as string[];
  const codes = [body.propertyCode, body.houseCode].filter(value => typeof value === 'string') as string[];
  if (!ids.length && !codes.length) return false;
  return ids.every(id => id === identity.propertyId) && codes.every(code => code.trim().toLowerCase() === identity.propertyCode?.trim().toLowerCase());
}

export function residentPropertyUpdateMatches(body: Record<string, unknown>, identity: { propertyId?: string; propertyCode?: string }) {
  const ids = [body.id, body.propertyId].filter(value => value !== undefined);
  const codes = [body.code, body.propertyCode].filter(value => value !== undefined);
  if (body.id === undefined && body.code === undefined && body.propertyCode === undefined) return false;
  return ids.every(id => typeof id === 'string' && id === identity.propertyId)
    && codes.every(code => typeof code === 'string' && code.trim().toLowerCase() === identity.propertyCode?.trim().toLowerCase());
}
