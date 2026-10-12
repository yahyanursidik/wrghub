export function receiptNumber(periodName: string, propertyCode: string) {
  return `KW-${(periodName || '2026').replace(/\s+/g, '')}-${propertyCode.replace(/[^a-zA-Z0-9]/g, '')}`;
}
