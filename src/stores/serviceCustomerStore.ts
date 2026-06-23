import { useSyncExternalStore } from "react";
import { SEED_SERVICE_CUSTOMERS } from "@/data/serviceCustomerSeed";
import type { ServiceCustomer } from "@/types/serviceCustomer";

const STORAGE_KEY = "digidevalaya-service-customers-v1";

let cache: ServiceCustomer[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist(data: ServiceCustomer[]) {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  notify();
}

function load(): ServiceCustomer[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as ServiceCustomer[];
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = [...SEED_SERVICE_CUSTOMERS];
  persist(cache);
  return cache;
}

export function getServiceCustomers(): ServiceCustomer[] {
  return load();
}

export function subscribeServiceCustomers(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useServiceCustomers() {
  return useSyncExternalStore(subscribeServiceCustomers, getServiceCustomers, getServiceCustomers);
}

function nextCustomerId(existing: ServiceCustomer[]) {
  const nums = existing
    .map((c) => c.id.match(/^cust-(\d+)$/i)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `cust-${String(next).padStart(3, "0")}`;
}

export function createServiceCustomer(
  input: Omit<ServiceCustomer, "id" | "createdAt">,
): ServiceCustomer {
  const all = load();
  const customer: ServiceCustomer = {
    ...input,
    id: nextCustomerId(all),
    createdAt: new Date().toISOString(),
  };
  persist([customer, ...all]);
  return customer;
}

export function searchServiceCustomers(query: string): ServiceCustomer[] {
  const q = query.trim().toLowerCase();
  if (!q) return load();
  return load().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
  );
}

export function findCustomerByPhone(phone: string): ServiceCustomer | undefined {
  const normalized = phone.replace(/\s/g, "");
  return load().find((c) => c.phone.replace(/\s/g, "") === normalized);
}
