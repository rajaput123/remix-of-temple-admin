import type { BusinessCustomer } from "@/types/businessCustomer";

export function formatCustomerId(id: string): string {
  const match = id.match(/^cus-(\d+)$/i);
  if (match) return `CUS-${match[1].padStart(3, "0")}`;
  return id.toUpperCase();
}

export function formatCustomerSpend(amount: number): string {
  if (amount <= 0) return "—";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCustomerLocation(c: BusinessCustomer): string {
  const parts = [c.city, c.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}
