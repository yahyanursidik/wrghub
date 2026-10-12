import type { UserSession } from '../types/auth';
import { getProperties, type PropertyListItem } from './property.service';
import { getAllInvoices, getBillingPeriods } from './billing.service';
import { getPayments } from './payment.service';
import { getInitialResidents, getInitialVehicles, getInitialPermits } from './property-submodules.service';
import { getComplaints } from './complaint.service';
import { getFacilities } from './facility.service';
import { getCommunityProfile, type CommunityProfileSettings } from './settings.service';

export interface ResidentInvoice {
  id: string; code: string; shortLabel: string; name: string;
  status: 'paid' | 'pending' | 'upcoming'; paidAt: string | null;
  inv: string; billingPeriodId: string; amount: number; remaining: number;
  dueDate: string; method: string; reference: string;
}
export interface ResidentOverview {
  property: PropertyListItem | null;
  invoices: ResidentInvoice[];
  occupants: any[]; vehicles: any[]; permits: any[]; complaints: any[];
  facilities: { id: string; name: string; location: string; condition: string }[];
  profile?: CommunityProfileSettings;
}
export const emptyResidentOverview: ResidentOverview = { property: null, invoices: [], occupants: [], vehicles: [], permits: [], complaints: [], facilities: [] };

export async function getResidentOverview(user: UserSession): Promise<ResidentOverview> {
  const properties = await getProperties();
  const property = properties.find(property => (user.propertyId && property.id === user.propertyId) || (user.propertyCode && property.code.toLowerCase() === user.propertyCode.toLowerCase()));
  if (!property) return { ...emptyResidentOverview };
  const [invoices, periods, payments, occupants, vehicles, permits, complaints, facilities, profile] = await Promise.all([
    getAllInvoices(), getBillingPeriods(), getPayments(undefined, 'VERIFIED'),
    getInitialResidents(), getInitialVehicles(), getInitialPermits(), getComplaints(), getFacilities(), getCommunityProfile(),
  ]);
  const scopedInvoices = invoices.filter(invoice => invoice.propertyId === property.id).map(invoice => {
    const period = periods.find(period => period.id === invoice.billingPeriodId);
    const name = period?.name || ('billingPeriodName' in invoice ? String(invoice.billingPeriodName) : invoice.billingPeriodId);
    const payment = payments.find(payment => payment.propertyCode === property.code && payment.periodName === name);
    return {
      id: invoice.id, code: invoice.id, shortLabel: name,
      name, status: invoice.status === 'PAID' || invoice.status === 'WAIVED' ? 'paid' as const : 'pending' as const,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('id-ID') : null,
      inv: invoice.invoiceNumber, billingPeriodId: invoice.billingPeriodId,
      amount: Number(invoice.total), remaining: Math.max(0, Number(invoice.total) - Number(invoice.paidAmount)),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('id-ID') : '-',
      method: payment?.method || '-', reference: payment?.reference || '-',
    };
  }).reverse();
  return {
    property, invoices: scopedInvoices, profile,
    occupants: occupants.filter(occupant => occupant.propertyId === property.id).map(occupant => ({ ...occupant, idCardNumber: occupant.idCard || '-', isEmergencyContact: occupant.isEmergency })),
    vehicles: vehicles.filter(vehicle => vehicle.propertyId === property.id),
    permits: permits.filter(permit => permit.houseCode?.toLowerCase() === property.code.toLowerCase()),
    complaints: complaints.filter(complaint => complaint.propertyCode === property.code),
    facilities: facilities.map(facility => ({ id: facility.id, name: facility.name, location: facility.location || '-', condition: facility.condition })),
  };
}
