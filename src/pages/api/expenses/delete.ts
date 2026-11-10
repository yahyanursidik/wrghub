import { expenseCancelInput } from '../../../services/expense-input';
import { cancelExpenses } from '../../../services/expense-operations.service';
import { mutation } from '../../../services/operational-mutation';

export const POST = mutation(expenseCancelInput,(input,actor)=>cancelExpenses(input.ids || [(input.id || input.expenseId)!],input.reason,actor));
