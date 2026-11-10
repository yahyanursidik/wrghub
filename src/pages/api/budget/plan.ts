import { applyBudgetPlan, budgetPlanInput } from '../../../services/budget-planning.service';
import { mutation } from '../../../services/operational-mutation';

export const POST=mutation(budgetPlanInput,applyBudgetPlan);
