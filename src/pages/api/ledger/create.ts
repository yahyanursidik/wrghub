import { z } from 'zod';
import { jakartaDate } from '../../../lib/billing-data';
import { rupiahAmount } from '../../../services/expense-input';
import { createManualLedgerEntry } from '../../../services/manual-ledger.service';
import { dateField, idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({accountId:idField.default('acc-main'),entryDate:dateField.default(jakartaDate),direction:z.enum(['IN','OUT']),
  amount:rupiahAmount,sourceType:z.enum(['MANUAL_JOURNAL','ADJUSTMENT']).default('MANUAL_JOURNAL'),
  description:textField(500).pipe(z.string().min(3)),referenceNo:textField(64).optional()});
export const POST = mutation(input,createManualLedgerEntry,201);
