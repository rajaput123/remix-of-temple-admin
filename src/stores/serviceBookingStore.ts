import { useSyncExternalStore } from "react";
import { SEED_SERVICE_BOOKINGS } from "@/data/serviceBookingSeed";
import type { ServiceBooking, ServiceBookingStatus } from "@/types/serviceBooking";

const STORAGE_KEY = "digidevalaya-service-bookings-v1";

let cache: ServiceBooking[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist(data: ServiceBooking[]) {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  notify();
}

function load(): ServiceBooking[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as ServiceBooking[];
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = [...SEED_SERVICE_BOOKINGS];
  persist(cache);
  return cache;
}

export function getServiceBookings(): ServiceBooking[] {
  return load();
}

export function subscribeServiceBookings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useServiceBookings() {
  return useSyncExternalStore(subscribeServiceBookings, getServiceBookings, getServiceBookings);
}

function nextBookingId(existing: ServiceBooking[]) {
  const nums = existing
    .map((b) => b.id.match(/^bkg-(\d+)$/i)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `bkg-${String(next).padStart(3, "0")}`;
}

export function recordServiceBooking(
  input: Omit<ServiceBooking, "id" | "createdAt">,
): ServiceBooking {
  const all = load();
  const booking: ServiceBooking = {
    ...input,
    id: nextBookingId(all),
    createdAt: new Date().toISOString(),
  };
  persist([booking, ...all]);
  return booking;
}

export function updateServiceBookingStatus(id: string, status: ServiceBookingStatus) {
  persist(load().map((b) => (b.id === id ? { ...b, status } : b)));
}
