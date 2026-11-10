import { z } from 'zod';
import { rupiahAmount } from '../../../services/expense-input';
import { transferBetweenAccounts } from '../../../services/manual-ledger.service';
import { dateField, idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({fromAccountId:idField,toAccountId:idField,amount:rupiahAmount,description:textField(500).pipe(z.string().min(3)),entryDate:dateField});
export const POST = mutation(input,transferBetweenAccounts,201);
