import { useMemo, useSyncExternalStore } from "react";
import type {
  AvailabilitySettings,
  BookingSettings,
  BusinessService,
  PricingRule,
  ServicePackage,
  ServiceStatus,
} from "@/types/serviceManagement";
import {
  SEED_AVAILABILITY,
  SEED_PACKAGES,
  SEED_PRICING_RULES,
  SEED_SERVICES,
} from "@/data/serviceManagementSeed";

const STORAGE_KEY = "digidevalaya-service-management-v4";
const SEED_VERSION = 4;

interface ServiceManagementState {
  services: BusinessService[];
  packages: ServicePackage[];
  availability: AvailabilitySettings;
  pricingRules: PricingRule[];
  seedVersion?: number;
}

function defaultState(): ServiceManagementState {
  return {
    services: SEED_SERVICES,
    packages: SEED_PACKAGES,
    availability: SEED_AVAILABILITY,
    pricingRules: SEED_PRICING_RULES,
    seedVersion: SEED_VERSION,
  };
}

const defaultBooking = (): BookingSettings => ({
  allowEnquiries: true,
  allowConsultation: true,
  allowDirectBooking: false,
  requireApproval: true,
});

export function emptyService(): BusinessService {
  return {
    id: "",
    name: "",
    category: "",
    subcategory: "",
    description: "",
    serviceType: "at_customer",
    durationValue: "2",
    durationUnit: "Hours",
    languages: [],
    state: "",
    district: "",
    city: "",
    coverage: "Local",
    gallery: [],
    videoLinks: [],
    pricingType: "Fixed Price",
    price: "",
    discount: "",
    currency: "INR",
    requirements: "",
    booking: defaultBooking(),
    availability: "Available",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    startTime: "09:00",
    endTime: "18:00",
    startDate: "",
    endDate: "",
    slots: "",
    status: "Draft",
    updatedAt: new Date().toISOString().slice(0, 10),
    views: 0,
    enquiries: 0,
  };
}

function normalizeService(raw: Partial<BusinessService> & { id: string }): BusinessService {
  return {
    ...emptyService(),
    ...raw,
    gallery: raw.gallery ?? [],
    videoLinks: raw.videoLinks ?? [],
    languages: raw.languages ?? [],
    days: raw.days ?? [],
    requirements: raw.requirements ?? "",
    booking: { ...defaultBooking(), ...raw.booking },
  };
}

function normalizePackage(raw: Partial<ServicePackage> & { includedServiceIds?: string[]; addonServiceIds?: string[] }): ServicePackage {
  let primaryServiceId = raw.primaryServiceId ?? "";

  if (!primaryServiceId && raw.includedServiceIds?.length) {
    primaryServiceId = raw.includedServiceIds[0];
  }

  return {
    id: raw.id ?? "",
    primaryServiceId,
    name: raw.name ?? "",
    description: raw.description ?? "",
    price: raw.price ?? "",
    discount: raw.discount,
    validity: raw.validity,
    status: raw.status ?? "Draft",
    updatedAt: raw.updatedAt ?? "",
  };
}

function normalizeState(data: ServiceManagementState): ServiceManagementState {
  return {
    services: (data.services ?? []).map((s) => normalizeService(s)),
    packages: (data.packages ?? SEED_PACKAGES).map((p) => normalizePackage(p)),
    availability: data.availability ?? SEED_AVAILABILITY,
    pricingRules: data.pricingRules ?? SEED_PRICING_RULES,
  };
}

function load(): ServiceManagementState {
  if (typeof window === "undefined") {
    return normalizeState(defaultState());
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return normalizeState(seeded);
    }
    const parsed = JSON.parse(raw) as ServiceManagementState;
    if (parsed.seedVersion !== SEED_VERSION) {
      const seeded = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return normalizeState(seeded);
    }
    return normalizeState(parsed);
  } catch {
    return normalizeState(defaultState());
  }
}

let state = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const serviceManagementStore = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  getServices: () => state.services,
  getService: (id: string) => state.services.find((s) => s.id === id),
  upsertService: (service: BusinessService) => {
    const payload = { ...service, updatedAt: today() };
    const exists = state.services.some((s) => s.id === payload.id);
    state = {
      ...state,
      services: exists
        ? state.services.map((s) => (s.id === payload.id ? payload : s))
        : [{ ...payload, id: payload.id || `svc-${Date.now()}` }, ...state.services],
    };
    emit();
  },
  deleteService: (id: string) => {
    state = { ...state, services: state.services.filter((s) => s.id !== id) };
    emit();
  },
  setServiceStatus: (id: string, status: ServiceStatus) => {
    state = {
      ...state,
      services: state.services.map((s) => (s.id === id ? { ...s, status, updatedAt: today() } : s)),
    };
    emit();
  },
  duplicateService: (id: string) => {
    const src = state.services.find((s) => s.id === id);
    if (!src) return;
    const copy: BusinessService = {
      ...src,
      id: `svc-${Date.now()}`,
      name: `${src.name} (Copy)`,
      status: "Draft",
      updatedAt: today(),
      views: 0,
      enquiries: 0,
    };
    state = { ...state, services: [copy, ...state.services] };
    emit();
    return copy;
  },

  getPackages: () => state.packages,
  upsertPackage: (pkg: ServicePackage) => {
    const payload = { ...pkg, updatedAt: today() };
    const exists = state.packages.some((p) => p.id === payload.id);
    state = {
      ...state,
      packages: exists
        ? state.packages.map((p) => (p.id === payload.id ? payload : p))
        : [{ ...payload, id: payload.id || `pkg-${Date.now()}` }, ...state.packages],
    };
    emit();
  },
  deletePackage: (id: string) => {
    state = { ...state, packages: state.packages.filter((p) => p.id !== id) };
    emit();
  },
  setPackageStatus: (id: string, status: ServiceStatus) => {
    state = {
      ...state,
      packages: state.packages.map((p) => (p.id === id ? { ...p, status, updatedAt: today() } : p)),
    };
    emit();
  },

  getAvailability: () => state.availability,
  setAvailability: (availability: AvailabilitySettings) => {
    state = { ...state, availability };
    emit();
  },

  getPricingRules: () => state.pricingRules,
  upsertPricingRule: (rule: PricingRule) => {
    const payload = { ...rule, updatedAt: today() };
    const exists = state.pricingRules.some((r) => r.id === payload.id);
    state = {
      ...state,
      pricingRules: exists
        ? state.pricingRules.map((r) => (r.id === payload.id ? payload : r))
        : [{ ...payload, id: payload.id || `pr-${Date.now()}` }, ...state.pricingRules],
    };
    emit();
  },
  deletePricingRule: (id: string) => {
    state = { ...state, pricingRules: state.pricingRules.filter((r) => r.id !== id) };
    emit();
  },

  getStats: () => {
    const services = state.services;
    const mostViewed = [...services].sort((a, b) => b.views - a.views)[0];
    const mostEnquired = [...services].sort((a, b) => b.enquiries - a.enquiries)[0];
    return {
      total: services.length,
      active: services.filter((s) => s.status === "Active").length,
      draft: services.filter((s) => s.status === "Draft").length,
      mostViewed,
      mostEnquired,
      upcomingBookings: 0,
    };
  },
};

export function useServiceManagementStore() {
  return useSyncExternalStore(
    serviceManagementStore.subscribe,
    serviceManagementStore.getState,
    () => ({
      services: SEED_SERVICES,
      packages: SEED_PACKAGES,
      availability: SEED_AVAILABILITY,
      pricingRules: SEED_PRICING_RULES,
    }),
  );
}

export function useServices() {
  return useSyncExternalStore(
    serviceManagementStore.subscribe,
    serviceManagementStore.getServices,
    () => SEED_SERVICES,
  );
}

export function usePackages() {
  return useSyncExternalStore(
    serviceManagementStore.subscribe,
    serviceManagementStore.getPackages,
    () => SEED_PACKAGES,
  );
}

/** Derived stats — memoized to avoid re-render loops. */
export function useServiceStats() {
  const services = useServices();
  return useMemo(() => serviceManagementStore.getStats(), [services]);
}
