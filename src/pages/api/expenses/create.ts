import { expenseCreateInput } from '../../../services/expense-input';
import { recordExpense } from '../../../services/expense-operations.service';
import { mutation } from '../../../services/operational-mutation';

export const POST = mutation(expenseCreateInput,(input,actor)=>recordExpense(input,actor,{projectId:input.projectId}),201);
