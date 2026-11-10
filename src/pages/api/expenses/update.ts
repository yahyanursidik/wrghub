import { expenseUpdateInput } from '../../../services/expense-input';
import { updateExpense } from '../../../services/expense-operations.service';
import { mutation } from '../../../services/operational-mutation';

export const POST = mutation(expenseUpdateInput,(input,actor)=>updateExpense((input.id || input.expenseId)!,input,actor));
