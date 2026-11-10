import type { WorkKey } from '../lib/dashboard-workspace';
import { getAnnouncements } from './announcement.service';
import { getAuditLogs } from './audit.service';
import { getBillingProgress, getCurrentBillingPeriod } from './billing.service';
import { getOpenComplaintsCount } from './complaint.service';
import { getDocuments } from './document.service';
import { getFacilityBookings, getNeedingRepairCount } from './facility.service';
import { getMainAccountBalance } from './finance.service';
import { getPendingPaymentsCount } from './payment.service';
import { getPropertyStats } from './property.service';
import { getInitialVehicles } from './property-submodules.service';

const readWork: Record<WorkKey, () => Promise<number | null>> = {
  payments: getPendingPaymentsCount,
  complaints: getOpenComplaintsCount,
  bookings: async () => (await getFacilityBookings()).filter(item => item.status === 'PENDING').length,
  maintenance: getNeedingRepairCount,
  households: async () => (await getPropertyStats()).total,
  vehicles: async () => (await getInitialVehicles()).length,
  announcements: async () => (await getAnnouncements()).filter(item => item.isPublished).length,
  documents: async () => (await getDocuments()).length,
  audit: async () => (await getAuditLogs(20)).length,
  cash: getMainAccountBalance,
  billing: async () => {
    const period = await getCurrentBillingPeriod();
    return period ? (await getBillingProgress(period.id)).unpaidCount : null;
  },
};

export async function getDashboardCounts(keys: readonly WorkKey[]): Promise<Partial<Record<WorkKey, number | null>>> {
  return Object.fromEntries(await Promise.all(keys.map(async key =>
    [key, await readWork[key]().catch(() => null)] as const,
  )));
}
