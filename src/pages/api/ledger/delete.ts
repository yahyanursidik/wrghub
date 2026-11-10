import { z } from 'zod';
import { deleteManualLedgerEntry } from '../../../services/manual-ledger.service';
import { idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({ledgerId:idField.optional(),id:idField.optional(),reason:textField(500).pipe(z.string().min(5))})
  .refine(value=>Boolean(value.ledgerId || value.id),'Pilih jurnal yang akan dibatalkan.');
export const POST = mutation(input,({ledgerId,id,reason},actor)=>deleteManualLedgerEntry((ledgerId || id)!,actor,reason));
