import { receiptNumber } from '../lib/receipt-number';
import { getPayments } from './payment.service';

export async function findVerifiedReceipt(query: string) {
  const normalized = query.trim().toUpperCase();
  if (normalized.length < 3 || normalized.length > 180) return undefined;
  const modernId = /^(?:KW-)?(PAY-[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12})$/.exec(normalized)?.[1];
  if (modernId) return (await getPayments(undefined,'VERIFIED',undefined,modernId.toLowerCase()))[0];

  const payments = await getPayments(undefined, 'VERIFIED');
  const direct = payments.find(payment => [payment.id,receiptNumber('', '', payment.id)].some(value=>value.toUpperCase()===normalized));
  if (direct) return direct;
  // Old printed numbers may be ambiguous. New transfers never match a predictable house/period number.
  const matches = payments.filter(payment => payment.reference?.toUpperCase() === normalized ||
    (!/^pay-[a-f0-9]{8}-[a-f0-9]{4}-/i.test(payment.id) &&
      receiptNumber(payment.periodName || '', payment.propertyCode).toUpperCase() === normalized));
  return matches.length === 1 ? matches[0] : undefined;
}
