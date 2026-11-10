import { z } from 'zod';
import { rupiahAmount } from '../../../services/expense-input';
import { updateManualLedgerEntry } from '../../../services/manual-ledger.service';
import { dateField, idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({ledgerId:idField,description:textField(500).pipe(z.string().min(3)).optional(),amount:rupiahAmount.optional(),
  direction:z.enum(['IN','OUT']).optional(),entryDate:dateField.optional(),accountId:idField.optional(),referenceNo:textField(64).optional()});
export const POST = mutation(input,(patch,actor)=>updateManualLedgerEntry(patch.ledgerId,patch,actor));
