/** Indian Rupee (INR) price parsing and validation */

const RUPEE_AMOUNT =
  /^(?:₹|Rs\.?|INR\s*)?\s*(\d{1,3}(?:,\d{2,3})*|\d+)(?:\.(\d{1,2}))?(?:\s+(.+))?$/i;

export function validateRupeePrice(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;

  const match = v.match(RUPEE_AMOUNT);
  if (!match) {
    return "Use rupee format: ₹5,000 or ₹250 per plate";
  }

  const whole = match[1].replace(/,/g, "");
  const amount = Number(`${whole}.${match[2] ?? "0"}`);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Amount must be greater than ₹0";
  }
  if (amount > 999_999_999) {
    return "Amount is too large";
  }

  const suffix = match[3]?.trim();
  if (suffix && !/^[\w\s/-]+$/i.test(suffix)) {
    return "Use rupee format: ₹5,000 or ₹250 per plate";
  }

  return undefined;
}

export function validateRupeeDiscount(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;

  if (/^\d+(\.\d+)?%$/.test(v)) return undefined;

  const rupeeErr = validateRupeePrice(v);
  if (!rupeeErr) return undefined;

  return "Use 10% or rupee format: ₹500";
}

/** Adds ₹ prefix to plain numeric amounts on blur */
export function formatRupeePriceInput(value: string): string {
  const v = value.trim();
  if (!v) return v;
  if (/^(?:₹|Rs\.?|INR\s*)/i.test(v)) return v;

  const match = v.match(/^(\d{1,3}(?:,\d{2,3})*|\d+(?:\.\d{1,2})?)\s*(.*)$/);
  if (!match) return v;

  const amount = match[1];
  const suffix = match[2]?.trim();
  return suffix ? `₹${amount} ${suffix}` : `₹${amount}`;
}

/** Extract numeric amount for sorting (handles ₹5,000, 5000, ₹250 per plate) */
export function parseRupeeAmount(value: string | undefined): number {
  const v = value?.trim();
  if (!v) return 0;

  const match = v.match(RUPEE_AMOUNT);
  if (match) {
    const whole = match[1].replace(/,/g, "");
    return Number(`${whole}.${match[2] ?? "0"}`) || 0;
  }

  const fallback = v.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return fallback ? Number(fallback[1]) : 0;
}

/** Adds ₹ prefix to plain numeric discount amounts */
export function formatRupeeDiscountInput(value: string): string {
  const v = value.trim();
  if (!v || v.endsWith("%")) return v;
  if (/^(?:₹|Rs\.?|INR\s*)/i.test(v)) return v;

  const match = v.match(/^(\d{1,3}(?:,\d{2,3})*|\d+(?:\.\d{1,2})?)$/);
  if (!match) return v;
  return `₹${match[1]}`;
}
