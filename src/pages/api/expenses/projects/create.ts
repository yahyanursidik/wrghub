import { projectInput } from '../../../../services/expense-input';
import { saveFacilityProject } from '../../../../services/expense-operations.service';
import { mutation } from '../../../../services/operational-mutation';

export const POST = mutation(projectInput,saveFacilityProject,({id})=>id?200:201);
