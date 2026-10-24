/**
 * Formats integer amount into readable Ugandan Shillings (UGX).
 * Example: 125000 -> "UGX 125,000"
 */
export function formatUGX(amount: number | null | undefined): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('en-UG', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(safeAmount);

  return `UGX ${formatted}`;
}

/**
 * Format quantity with optional decimals if allowed
 */
export function formatQuantity(qty: number, allowDecimal: boolean = false): string {
  if (allowDecimal) {
    return Number(qty).toLocaleString('en-UG', { maximumFractionDigits: 2 });
  }
  return Math.round(qty).toLocaleString('en-UG');
}

/**
 * Format date for receipts and logs
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }

  return date.toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generates an easily readable transaction / receipt number
 */
export function generateSaleNumber(sequence: number): string {
  const padded = String(sequence).padStart(5, '0');
  return `DUKA-${padded}`;
}
