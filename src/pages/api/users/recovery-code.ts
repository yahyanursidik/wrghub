import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { issueRecoveryCode, issueRecoveryInput } from '../../../services/account-recovery.service';

export const POST: APIRoute = mutation(issueRecoveryInput, issueRecoveryCode, 201);
