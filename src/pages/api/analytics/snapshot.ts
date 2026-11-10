import { analyticsSnapshotInput, saveAnalyticsSnapshot } from '../../../services/analytics-report.service';
import { mutation } from '../../../services/operational-mutation';

export const POST=mutation(analyticsSnapshotInput,saveAnalyticsSnapshot,201);
