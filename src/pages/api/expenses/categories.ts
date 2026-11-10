import { z } from 'zod';
import { addExpenseCategory } from '../../../services/expense-operations.service';
import { mutation, textField } from '../../../services/operational-mutation';

export const POST = mutation(z.object({name:textField(100).pipe(z.string().min(2))}),({name},actor)=>addExpenseCategory(name,actor),201);
