import { z } from 'zod';
import { saveCashAccount } from '../../../services/cash-ledger.service';
import { idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({id:idField.optional(),name:textField(120).pipe(z.string().min(2)),code:z.string().trim().regex(/^[A-Za-z0-9_-]{2,40}$/),
  type:z.enum(['BANK','CASH','SAVINGS','PETTY_CASH']),bankName:textField(100).optional(),accountNumber:textField(100).optional(),
  balance:z.number().finite().min(0).max(9_999_999_999).multipleOf(0.01).default(0)});
export const POST = mutation(input,saveCashAccount,({id})=>id?200:201);
