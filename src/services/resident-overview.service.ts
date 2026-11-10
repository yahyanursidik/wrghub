import { receiptNumber } from '../lib/receipt-number';
import type { UserSession } from '../types/auth';
import { getProperties, type PropertyListItem } from './property.service';
import { getInvoices, getBillingPeriods } from './billing.service';
import { billingMonthKey, invoiceCollected, invoiceRemaining, type TariffComponent } from '../lib/billing-data';
import { getPayments } from './payment.service';
import { getInitialResidents, getInitialVehicles, getInitialPermits } from './property-submodules.service';
import { getComplaints, type ComplaintItem } from './complaint.service';
import type { VehicleItem } from '../types/property-submodules';
import { getFacilities, getFacilityBookings } from './facility.service';
import type { ReservationStatus } from '../lib/reservation';
import { getCommunityProfile, type CommunityProfileSettings } from './settings.service';

export interface ResidentInvoice {
  id: string; code: string; shortLabel: string; name: string; monthKey?:string;
  status: 'paid' | 'pending' | 'upcoming' | 'waived'; paidAt: string | null;
  inv: string; billingPeriodId: string; amount: number; remaining: number;
  dueDate: string; method: string; reference: string;
  paidAmount?: number;
  awaitingVerification?: boolean;
  items?: TariffComponent[];
  receipts?: {id:string; number:string; amount:number; paidAt:string; method:string; reference:string; accountName?:string}[];
}
export interface ResidentOverview {
  property: PropertyListItem | null;
  invoices: ResidentInvoice[];
  occupants: any[]; vehicles: VehicleItem[]; permits: any[]; complaints: ComplaintItem[];
  facilities: { id: string; name: string; location: string; condition: string }[];
  bookings: { id: string; facilityName: string; date: string; startTime: string; endTime: string; status: ReservationStatus }[];
  profile?: CommunityProfileSettings;
}
export const emptyResidentOverview: ResidentOverview = { property: null, invoices: [], occupants: [], vehicles: [], permits: [], complaints: [], facilities: [], bookings: [] };

export async function getResidentOverview(user: UserSession): Promise<ResidentOverview> {
  if (user.role === 'VIEWER' || (!user.propertyId && !user.propertyCode)) return { ...emptyResidentOverview };
  const properties = await getProperties();
  const property = properties.find(property => user.propertyId ? property.id === user.propertyId : property.code.toLowerCase() === user.propertyCode?.toLowerCase());
  if (!property) return { ...emptyResidentOverview };
  const [invoices, periods, payments, occupants, vehicles, permits, complaints, facilities, profile, bookings] = await Promise.all([
    getInvoices('ALL',{details:true,propertyId:property.id}), getBillingPeriods(), getPayments(undefined, 'VERIFIED', property.id),
    getInitialResidents(property.id), getInitialVehicles(property.id), getInitialPermits(property.id), getComplaints(property.id), getFacilities(), getCommunityProfile(),
    getFacilityBookings(property.id),
  ]);
  const scopedInvoices = invoices.filter(invoice => invoice.propertyId === property.id && !['VOID','CANCELLED'].includes(invoice.status)).map(invoice => {
    const period = periods.find(period => period.id === invoice.billingPeriodId);
    const name = period?.name || invoice.billingPeriodName || invoice.billingPeriodId;
    const uniquePeriod = invoices.filter(item => item.propertyId === property.id && item.billingPeriodId === invoice.billingPeriodId).length === 1;
    const related = payments.filter(payment => payment.invoiceId === invoice.id || (!payment.invoiceId && uniquePeriod && payment.billingPeriodId === invoice.billingPeriodId));
    const payment = related[0];
    const receipts = related.map(item => ({ id:item.id, number:receiptNumber(name,property.code,item.id), amount:item.amount,
      paidAt:item.paidAt,method:item.method,reference:item.reference || '-',accountName:item.accountName || undefined }));
    return {
      id: invoice.id, code: invoice.id, shortLabel: name, monthKey:period?billingMonthKey(period.year,period.month):undefined,
      name, status: invoice.status === 'WAIVED' ? 'waived' as const : invoice.status === 'PAID' ? 'paid' as const : 'pending' as const,
      paidAt: invoice.paidAt,
      inv: invoice.invoiceNumber, billingPeriodId: invoice.billingPeriodId,
      amount: invoice.total, remaining: invoiceRemaining(invoice),paidAmount:invoiceCollected(invoice),
      awaitingVerification:Boolean(invoice.pendingPaymentId),items:invoice.items,
      dueDate: invoice.dueDate, method: payment?.method || '-', reference: payment?.reference || '-', receipts,
    };
  }).reverse();
  return {
    property:{...property,notes:null}, invoices: scopedInvoices, profile,
    occupants: occupants.map(({ id, fullName, relation, phone, idCard, isEmergency, birthPlaceDate }) => ({
      id, fullName, relation: ({ KEPALA_KELUARGA:'Kepala Keluarga', ISTRI:'Istri', ANAK:'Anak', ORANG_TUA:'Orang Tua', FAMILI_LAIN:'Keluarga Lain', ART:'ART / Supir', PENYEWA:'Penyewa' })[relation], phone, idCardNumber: idCard ? '••••' + idCard.slice(-4) : '-', isEmergencyContact: isEmergency, birthDate: birthPlaceDate || '-',
    })),
    vehicles,
    permits,
    complaints,
    bookings: bookings.map(({ id, facilityName, date, startTime, endTime, status }) => ({ id, facilityName, date, startTime, endTime, status })),
    facilities: facilities.map(facility => ({ id: facility.id, name: facility.name, location: facility.location || '-', condition: facility.condition })),
  };
}
