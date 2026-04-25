"use client";

import { create } from "zustand";
import type { AutofillProfile } from "@/lib/types";

interface DashboardState {
  profiles: AutofillProfile[];
  selectedProfileId: string | null;
  isLoading: boolean;
  error: string | null;
  setProfiles: (profiles: AutofillProfile[]) => void;
  upsertProfile: (profile: AutofillProfile) => void;
  removeProfile: (id: string) => void;
  setSelectedProfileId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  profiles: [],
  selectedProfileId: null,
  isLoading: true,
  error: null,
  setProfiles: (profiles) =>
    set(() => ({
      profiles,
      selectedProfileId: profiles[0]?.id ?? null,
      isLoading: false,
      error: null
    })),
  upsertProfile: (profile) =>
    set((state) => {
      const index = state.profiles.findIndex((item) => item.id === profile.id);
      if (index === -1) {
        return {
          profiles: [profile, ...state.profiles],
          selectedProfileId: state.selectedProfileId ?? profile.id
        };
      }
      const updated = [...state.profiles];
      updated[index] = profile;
      return { profiles: updated };
    }),
  removeProfile: (id) =>
    set((state) => {
      const next = state.profiles.filter((profile) => profile.id !== id);
      return {
        profiles: next,
        selectedProfileId: state.selectedProfileId === id ? (next[0]?.id ?? null) : state.selectedProfileId
      };
    }),
  setSelectedProfileId: (id) => set(() => ({ selectedProfileId: id })),
  setIsLoading: (isLoading) => set(() => ({ isLoading })),
  setError: (error) => set(() => ({ error }))
}));
