import { useSyncExternalStore } from "react";
import type { BCState } from "@/types/businessConnect";

const STORAGE_KEY = "bc-onboarding-v1";

const initialState: BCState = {
  account: { verified: false },
  profileStatus: "draft",
  completedSteps: [],
};

function load(): BCState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

let state: BCState = load();
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

export const bcStore = {
  get: () => state,
  set: (patch: Partial<BCState>) => {
    state = { ...state, ...patch };
    emit();
  },
  markStep: (id: string) => {
    if (state.completedSteps.includes(id)) return;
    state = { ...state, completedSteps: [...state.completedSteps, id] };
    emit();
  },
  reset: () => {
    state = initialState;
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useBCStore<T = BCState>(selector: (s: BCState) => T = (s) => s as unknown as T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => selector(state),
    () => selector(initialState),
  );
}

export function computeCompletion(s: BCState): number {
  const weights: Array<[boolean, number]> = [
    [!!s.businessType?.category, 10],
    [!!s.info?.name && !!s.info?.ownerName && !!s.info?.phone && !!s.info?.email, 25],
    [!!s.location?.line1 && !!s.location?.city && !!s.location?.pincode, 15],
    [!!s.comms?.languages?.length, 10],
    [
      s.verification?.status === "verified" ||
        s.verification?.status === "review" ||
        (s.verification?.docs?.length ?? 0) > 0,
      20,
    ],
    [!!s.media?.logo || (s.media?.gallery?.length ?? 0) > 0, 10],
    [!!s.subscription?.plan, 10],
  ];
  return weights.reduce((sum, [ok, w]) => sum + (ok ? w : 0), 0);
}
