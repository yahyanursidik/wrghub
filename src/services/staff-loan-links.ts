import { createHash } from 'node:crypto';
import type { Query } from '../db/operational-query';

const key = (prefix:string,id:string) => prefix+createHash('sha256').update(id).digest('hex').slice(0,48);
export const staffInstallmentKey = (id:string) => key('sl-i-',id);
export const staffPayrollKey = (id:string) => key('sl-p-',id);

export async function readLoanLink<T>(run:Query,key:string):Promise<T|undefined> {
  const [row]=await run<{value:string}>('SELECT value FROM settings WHERE key=?',[key]);
  return row ? JSON.parse(row.value) as T : undefined;
}
export async function writeLoanLink(run:Query,key:string,value:unknown,description:string) {
  await run(`INSERT INTO settings (id,key,value,description) VALUES (?,?,?,?)
    ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`,[key,key,JSON.stringify(value),description]);
}
export const payrollInstallments = async (run:Query,expenseId:string) => (await readLoanLink<string[]>(run,staffPayrollKey(expenseId))) || [];
// Callers lock the referenced expense before changing the list.
export const savePayrollInstallments = (run:Query,expenseId:string,ids:string[]) => writeLoanLink(run,staffPayrollKey(expenseId),ids,'Tautan potongan kasbon dari jurnal gaji bersih');
