import { mutation } from '../../../../services/operational-mutation';
import { patrolInput, recordPatrol } from '../../../../services/security-patrol.service';

export const POST=mutation(patrolInput,recordPatrol,201);
