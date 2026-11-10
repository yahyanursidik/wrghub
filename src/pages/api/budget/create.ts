import { budgetCreateInput, saveBudgetAllocation } from '../../../services/budget-planning.service';
import { mutation } from '../../../services/operational-mutation';

export const POST=mutation(budgetCreateInput,saveBudgetAllocation,201);
