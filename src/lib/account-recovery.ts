import type { UserRole } from '../types/auth';

export const recoveryCodePattern = /^[A-Za-z0-9_-]{43}$/;
export const minimumNewPassword = 12;
export function isStrongAccountPassword(password:string) {
  return password.trim().length>=minimumNewPassword && password.length<=1024 &&
    !['warga123','password','password123','password1234','123456789012'].includes(password.trim().toLowerCase());
}
const managed: UserRole[] = ['HOUSE_OWNER','HOUSEHOLD_HEAD','RESIDENT','VIEWER','SECURITY','MAINTENANCE'];

export function mayManageCredential(actor: {id:string;role:UserRole}, target: {id:string;role:UserRole}) {
  return actor.role === 'SUPER_ADMIN' || (actor.role === 'CHAIRMAN' && (actor.id === target.id || managed.includes(target.role)));
}
