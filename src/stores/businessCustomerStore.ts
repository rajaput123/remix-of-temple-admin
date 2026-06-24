import { useSyncExternalStore } from "react";
import { SEED_BUSINESS_CUSTOMERS } from "@/data/businessCustomerSeed";
import { getServiceBookings, subscribeServiceBookings } from "@/stores/serviceBookingStore";
import type { BusinessCustomer } from "@/types/businessCustomer";
import type { ServiceBooking } from "@/types/serviceBooking";

const STORAGE_KEY = "digidevalaya-business-customers-v1";

let cache: BusinessCustomer[] | null = null;
let snapshot: BusinessCustomer[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  rebuildSnapshot();
  listeners.forEach((l) => l());
}

function persist(data: BusinessCustomer[]) {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  notify();
}

function normalizePhone(phone: string) {
  return phone.replace(/\s/g, "");
}

function normalizeCustomer(c: BusinessCustomer): BusinessCustomer {
  return {
    ...c,
    tags: c.tags ?? [],
    totalBookings: c.totalBookings ?? 0,
    lifetimeSpend: c.lifetimeSpend ?? 0,
    createdAt: c.createdAt || new Date().toISOString(),
  };
}

function enrichFromBookings(customers: BusinessCustomer[], bookings: ServiceBooking[]): BusinessCustomer[] {
  const byPhone = new Map<string, BusinessCustomer>();

  for (const c of customers) {
    byPhone.set(normalizePhone(c.phone || ""), normalizeCustomer(c));
  }

  for (const b of bookings) {
    const key = normalizePhone(b.customerPhone || "");
    if (!key) continue;
    const existing = byPhone.get(key);

    if (existing) {
      const totalBookings = bookings.filter((x) => normalizePhone(x.customerPhone) === key).length;
      const lifetimeSpend = bookings
        .filter((x) => normalizePhone(x.customerPhone) === key)
        .reduce((sum, x) => sum + (x.amount ?? 0), 0);
      const dates = bookings
        .filter((x) => normalizePhone(x.customerPhone) === key)
        .map((x) => x.scheduledDate)
        .sort();
      byPhone.set(key, {
        ...existing,
        name: existing.name || b.customerName,
        email: existing.email || b.customerEmail,
        city: existing.city || b.customerCity,
        state: existing.state || b.customerState,
        pincode: existing.pincode || b.customerPincode,
        address: existing.address || b.customerAddress,
        pan: existing.pan || b.customerPan,
        totalBookings,
        lifetimeSpend,
        lastBookingDate: dates[dates.length - 1],
      });
    } else {
      const phoneBookings = bookings.filter((x) => normalizePhone(x.customerPhone) === key);
      byPhone.set(key, {
        id: b.customerId || `cus-auto-${key.slice(-4)}`,
        name: b.customerName,
        phone: b.customerPhone,
        email: b.customerEmail,
        customerType: "Individual",
        city: b.customerCity,
        state: b.customerState,
        pincode: b.customerPincode,
        address: b.customerAddress,
        pan: b.customerPan,
        tags: ["From Booking"],
        source: b.source,
        status: "Active",
        totalBookings: phoneBookings.length,
        lifetimeSpend: phoneBookings.reduce((sum, x) => sum + (x.amount ?? 0), 0),
        lastBookingDate: phoneBookings.map((x) => x.scheduledDate).sort().pop(),
        createdAt: b.createdAt || new Date().toISOString(),
      });
    }
  }

  return [...byPhone.values()].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
}

function loadRaw(): BusinessCustomer[] {
  if (cache) return cache;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BusinessCustomer[];
      if (parsed.length > 0) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    /* ignore */
  }

  cache = [...SEED_BUSINESS_CUSTOMERS];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  return cache;
}

function rebuildSnapshot() {
  snapshot = enrichFromBookings(loadRaw(), getServiceBookings());
  return snapshot;
}

let bookingSyncStarted = false;

function ensureBookingSync() {
  if (bookingSyncStarted) return;
  bookingSyncStarted = true;
  subscribeServiceBookings(() => notify());
}

export function getBusinessCustomers(): BusinessCustomer[] {
  if (!snapshot) return rebuildSnapshot();
  return snapshot;
}

export function subscribeBusinessCustomers(listener: () => void) {
  ensureBookingSync();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBusinessCustomers() {
  return useSyncExternalStore(subscribeBusinessCustomers, getBusinessCustomers, getBusinessCustomers);
}

function nextCustomerId(existing: BusinessCustomer[]) {
  const nums = existing
    .map((c) => c.id.match(/^cus-(\d+)$/i)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `cus-${String(next).padStart(3, "0")}`;
}

export function addBusinessCustomer(
  input: Omit<BusinessCustomer, "id" | "createdAt" | "totalBookings" | "lifetimeSpend">,
): BusinessCustomer {
  const raw = loadRaw();
  if (raw.some((c) => normalizePhone(c.phone) === normalizePhone(input.phone))) {
    throw new Error("A customer with this phone number already exists");
  }
  const customer: BusinessCustomer = {
    ...input,
    id: nextCustomerId(raw),
    totalBookings: 0,
    lifetimeSpend: 0,
    createdAt: new Date().toISOString(),
  };
  persist([customer, ...raw]);
  return customer;
}

export function getCustomerBookings(customer: BusinessCustomer): ServiceBooking[] {
  const key = normalizePhone(customer.phone);
  return getServiceBookings().filter((b) => normalizePhone(b.customerPhone) === key);
}
