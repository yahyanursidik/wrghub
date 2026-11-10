import { query, type Query } from '../db/operational-query';
import { RESERVE_ACCOUNT } from '../lib/planning-data';

export interface FinanceAccount {
  id: string;
  communityId: string | null;
  name: string;
  code: string;
  type: string;
  bankName: string | null;
  accountNumber: string | null;
  balance: number;
  isActive: boolean;
}

type AccountRow={id:string;community_id:string|null;name:string;code:string;type:string;is_active:boolean|number;
  bank_name:string|null;account_number:string|null;balance:number|string};
const accountSelect='SELECT id,community_id,name,code,type,bank_name,account_number,balance,is_active FROM accounts';
const mapAccount=(row:AccountRow):FinanceAccount=>({id:row.id,communityId:row.community_id,name:row.name,code:row.code,type:row.type,
  bankName:row.bank_name,accountNumber:row.account_number,balance:Number(row.balance),isActive:Boolean(row.is_active)});
export async function getAccounts(run: Query = query,includeReserves=false): Promise<FinanceAccount[]> {
  const rows = await run<AccountRow>(accountSelect+' WHERE is_active=true '+(includeReserves?'':'AND type<>? ')+
    "ORDER BY CASE WHEN id='acc-main' THEN 0 WHEN code IN ('BCA_MAIN','BCA-UTAMA') THEN 1 ELSE 2 END,name,id",includeReserves?[]:[RESERVE_ACCOUNT]);
  return rows.map(mapAccount);
}
export async function getArchivedReserveAccount(id:string,run:Query=query) {
  const [row]=await run<AccountRow>(accountSelect+' WHERE id=? AND type=? AND is_active=false',[id,RESERVE_ACCOUNT]);
  return row ? mapAccount(row) : undefined;
}

export async function getMainAccountBalance() {
  return (await getAccounts())[0]?.balance ?? 0;
}

export async function getLedgerEntries(limit = 30, paymentId?: string) {
  const scope = paymentId ? "WHERE l.source_id=? AND l.source_type IN ('PAYMENT','PAYMENT_REVERSAL')" : '';
  const rows = await query<{id:string;account_id:string|null;entry_date:string;direction:string;amount:number|string;source_type:string;
    source_id:string|null;description:string;created_by:string|null;created_at:string|Date;account_name:string|null}>(
    `SELECT l.id,l.account_id,l.entry_date,l.direction,l.amount,l.source_type,l.source_id,l.description,l.created_by,l.created_at,a.name AS account_name
    FROM ledger_entries l LEFT JOIN accounts a ON a.id=l.account_id ${scope}
    ORDER BY l.entry_date DESC,l.created_at DESC,l.id LIMIT ?`, paymentId ? [paymentId,limit] : [limit]);
  return rows.map(row => ({id:row.id,accountId:row.account_id,accountName:row.account_name,entryDate:row.entry_date,direction:row.direction,amount:Number(row.amount),
    sourceType:row.source_type,sourceId:row.source_id,description:row.description,createdBy:row.created_by,createdAt:row.created_at}));
}
