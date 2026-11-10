import { z } from 'zod';
import { bookExpense } from '../../../services/expense-operations.service';
import { idField, mutation } from '../../../services/operational-mutation';

export const POST = mutation(z.object({id:idField}),(input,actor)=>bookExpense(input.id,actor));
