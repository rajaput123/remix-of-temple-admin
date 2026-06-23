import { useSyncExternalStore } from "react";
import type {
  BusinessProfile,
  BusinessProfileFormData,
  ProfileStatus,
  ProfileVerificationStatus,
} from "@/types/businessProfile";
import { EMPTY_PROFILE_FORM } from "@/types/businessProfile";
import { businessProfilesSeedData } from "@/data/businessProfileData";
import {
  LEGACY_BUSINESS_TYPE_IDS,
  mergeRegistrationIntoProfileForm,
  normalizeBusinessTypeId,
  readRegistrationData,
} from "@/lib/registrationProfileBridge";

const STORAGE_KEY = "digidevalaya-business-profile-v8";

function toSingleProfile(list: Partial<BusinessProfile>[]): BusinessProfile[] {
  if (list.length === 0) return [];
  return [normalizeProfile(list[0])];
}

function normalizeProfile(raw: Partial<BusinessProfile>): BusinessProfile {
  const merged = {
    ...EMPTY_PROFILE_FORM,
    ...raw,
    businessType: normalizeBusinessTypeId(raw.businessType),
  };
  return {
    ...merged,
    id: raw.id ?? `BP-${Date.now()}`,
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    workingDays: Array.isArray(raw.workingDays) ? raw.workingDays : [...EMPTY_PROFILE_FORM.workingDays],
    gallery: Array.isArray(raw.gallery) ? raw.gallery : [],
    logo: raw.logo ?? null,
    coverImage: raw.coverImage ?? null,
    aadhaarDoc: raw.aadhaarDoc ?? null,
    panDoc: raw.panDoc ?? null,
    gstDoc: raw.gstDoc ?? null,
    incorporationDoc: raw.incorporationDoc ?? null,
    status: (raw.status as ProfileStatus) ?? "draft",
    verificationStatus: (raw.verificationStatus as ProfileVerificationStatus) ?? "not_submitted",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function isStaleProfile(profile: BusinessProfile): boolean {
  if (LEGACY_BUSINESS_TYPE_IDS.includes(profile.businessType)) return true;
  if (/pooja|temple|priest|devotee/i.test(profile.businessName)) return true;
  return profile.entityType === undefined;
}

function initialProfiles(): BusinessProfile[] {
  if (readRegistrationData()?.mobile) return [];
  const seeded = seedProfiles();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function seedProfiles(): BusinessProfile[] {
  return businessProfilesSeedData.map(normalizeProfile);
}

function load(): BusinessProfile[] {
  if (typeof window === "undefined") return seedProfiles();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialProfiles();
    }
    const parsed = JSON.parse(raw) as Partial<BusinessProfile>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return initialProfiles();
    }
    const single = toSingleProfile(parsed);
    if (parsed.length > 1 || (single[0] && isStaleProfile(single[0]))) {
      return initialProfiles();
    }
    return single;
  } catch {
    const seeded = seedProfiles();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {
      /* ignore */
    }
    return seeded;
  }
}

let profiles: BusinessProfile[] = load();
const listeners = new Set<() => void>();

let statsSnapshot = {
  total: 0,
  published: 0,
  draft: 0,
  pendingVerification: 0,
};

function refreshStats() {
  statsSnapshot = {
    total: profiles.length,
    published: profiles.filter((p) => p.status === "published").length,
    draft: profiles.filter((p) => p.status === "draft").length,
    pendingVerification: profiles.filter(
      (p) => p.verificationStatus === "pending" || p.verificationStatus === "reupload_requested",
    ).length,
  };
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  refreshStats();
  listeners.forEach((l) => l());
}

refreshStats();

function nextId() {
  const max = profiles.reduce((m, p) => Math.max(m, Number(p.id.replace("BP-", "")) || 0), 0);
  return `BP-${String(max + 1).padStart(4, "0")}`;
}

function hasVerificationDocs(data: Pick<BusinessProfileFormData, "aadhaarDoc" | "panDoc" | "gstDoc" | "aadhaar" | "pan">) {
  return !!(data.aadhaar || data.pan) && !!(data.aadhaarDoc || data.panDoc);
}

function deriveVerificationStatus(
  data: BusinessProfileFormData,
  publish = false,
): ProfileVerificationStatus {
  if (!hasVerificationDocs(data)) return "not_submitted";
  if (publish) return "pending";
  return "pending";
}

export const businessProfileStore = {
  getAll: () => profiles,

  getProfile: (): BusinessProfile | null => profiles[0] ?? null,

  getById: (id: string) => profiles.find((p) => p.id === id),

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  create: (data: BusinessProfileFormData, asPublished = false): BusinessProfile => {
    if (profiles.length > 0) {
      const existing = profiles[0];
      businessProfileStore.update(existing.id, data);
      if (asPublished) businessProfileStore.publish(existing.id);
      return businessProfileStore.getProfile()!;
    }
    const now = new Date().toISOString();
    const profile = normalizeProfile({
      ...data,
      id: nextId(),
      status: asPublished ? "published" : "draft",
      verificationStatus: asPublished
        ? deriveVerificationStatus(data, true)
        : hasVerificationDocs(data)
          ? "pending"
          : "not_submitted",
      createdAt: now,
      updatedAt: now,
    });
    profiles = [profile];
    emit();
    return profile;
  },

  update: (id: string, data: Partial<BusinessProfileFormData>): BusinessProfile | undefined => {
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = normalizeProfile({ ...profiles[idx], ...data, updatedAt: new Date().toISOString() });
    profiles = profiles.map((p) => (p.id === id ? updated : p));
    emit();
    return updated;
  },

  delete: (_id: string) => {
    profiles = [];
    emit();
  },

  /** Wipe stored profile when a new business account registers. */
  clearForNewRegistration: () => {
    profiles = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    emit();
  },

  publish: (id: string): BusinessProfile | undefined => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return undefined;
    const updated: BusinessProfile = {
      ...profile,
      status: "published",
      verificationStatus: hasVerificationDocs(profile)
        ? profile.verificationStatus === "verified"
          ? "verified"
          : "pending"
        : profile.verificationStatus,
      updatedAt: new Date().toISOString(),
    };
    profiles = profiles.map((p) => (p.id === id ? updated : p));
    emit();
    return updated;
  },

  saveDraft: (id: string, data: BusinessProfileFormData): BusinessProfile | undefined => {
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = normalizeProfile({
      ...profiles[idx],
      ...data,
      status: "draft",
      verificationStatus: hasVerificationDocs(data) ? "pending" : "not_submitted",
      updatedAt: new Date().toISOString(),
    });
    profiles = profiles.map((p) => (p.id === id ? updated : p));
    emit();
    return updated;
  },

  setVerificationStatus: (id: string, verificationStatus: ProfileVerificationStatus, status?: ProfileStatus) => {
    profiles = profiles.map((p) =>
      p.id === id
        ? {
            ...p,
            verificationStatus,
            status: status ?? p.status,
            updatedAt: new Date().toISOString(),
          }
        : p,
    );
    emit();
  },

  approve: (id: string) => {
    businessProfileStore.setVerificationStatus(id, "verified");
  },

  reject: (id: string) => {
    businessProfileStore.setVerificationStatus(id, "rejected", "draft");
  },

  requestReupload: (id: string) => {
    businessProfileStore.setVerificationStatus(id, "reupload_requested", "pending");
  },

  getStats: () => statsSnapshot,
};

export function useBusinessProfiles() {
  return useSyncExternalStore(
    businessProfileStore.subscribe,
    businessProfileStore.getAll,
    () => seedProfiles(),
  );
}

export function useBusinessProfile() {
  return useSyncExternalStore(
    businessProfileStore.subscribe,
    businessProfileStore.getProfile,
    () => null,
  );
}

const EMPTY_STATS = { total: 0, published: 0, draft: 0, pendingVerification: 0 };

export function useBusinessProfileStats() {
  return useSyncExternalStore(
    businessProfileStore.subscribe,
    businessProfileStore.getStats,
    () => EMPTY_STATS,
  );
}

export function profileToFormData(profile: BusinessProfile): BusinessProfileFormData {
  const { id: _id, status: _s, verificationStatus: _v, createdAt: _c, updatedAt: _u, ...rest } = profile;
  return rest;
}

export function formDataFromEmpty(): BusinessProfileFormData {
  return mergeRegistrationIntoProfileForm();
}
