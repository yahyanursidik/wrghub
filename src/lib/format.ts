export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, '');
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp${(amount / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(2).replace('.', ',')} jt`;
  }
  return formatRupiah(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}
