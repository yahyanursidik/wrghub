export function receiptNumber(periodName: string, propertyCode: string, paymentId?: string) {
  if (paymentId) return 'KW-' + paymentId.toUpperCase();
  return `KW-${periodName.replace(/\s+/g, '')}-${propertyCode.replace(/[^a-zA-Z0-9]/g, '')}`;
}
