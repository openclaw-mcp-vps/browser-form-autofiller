"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldMapper } from "@/components/FieldMapper";
import { ProfileEditor } from "@/components/ProfileEditor";
import { useDashboardStore } from "@/lib/store";
import type { AutofillProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface DashboardWorkspaceProps {
  mode: "mapper" | "profiles";
}

export function DashboardWorkspace({ mode }: DashboardWorkspaceProps) {
  const {
    profiles,
    selectedProfileId,
    setProfiles,
    setSelectedProfileId,
    removeProfile,
    setIsLoading,
    isLoading,
    setError,
    error
  } = useDashboardStore();

  const [editingProfile, setEditingProfile] = useState<AutofillProfile | null>(null);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  useEffect(() => {
    async function loadProfiles() {
      setIsLoading(true);
      try {
        const response = await axios.get<{ profiles: AutofillProfile[] }>("/api/profiles");
        setProfiles(response.data.profiles);
      } catch {
        setError("Could not load profiles.");
        setIsLoading(false);
      }
    }

    void loadProfiles();
  }, [setError, setIsLoading, setProfiles]);

  async function saveProfile(profile: AutofillProfile) {
    const response = await axios.post<{ profiles: AutofillProfile[] }>("/api/profiles", profile);
    setProfiles(response.data.profiles);
    setEditingProfile(null);
  }

  async function deleteSelectedProfile(id: string) {
    await axios.delete("/api/profiles", {
      data: { id }
    });
    removeProfile(id);
    setEditingProfile(null);
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>
              Keep multiple profile variants for different clients, roles, or compliance contexts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => setEditingProfile(null)}>
              New profile
            </Button>
            <div className="space-y-2">
              {profiles.map((profile) => {
                const active = selectedProfile?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfileId(profile.id);
                      setEditingProfile(profile);
                    }}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      active
                        ? "border-sky-500 bg-slate-900"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-100">{profile.name}</p>
                    <p className="text-xs text-slate-400">Updated {formatDate(profile.updatedAt)}</p>
                  </button>
                );
              })}
            </div>
            {!profiles.length && !isLoading ? (
              <p className="text-sm text-slate-400">No profiles yet. Create one to start mapping forms.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary">Paid access enabled</Badge>
            <p className="text-sm text-slate-300">
              Use your mapped JSON in the extension popup or `/api/sync` endpoint for browser-side autofill.
            </p>
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-6">
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        {mode === "profiles" || editingProfile || !selectedProfile ? (
          <ProfileEditor
            initialProfile={editingProfile}
            onCancel={() => setEditingProfile(null)}
            onSave={saveProfile}
          />
        ) : null}

        {mode === "mapper" ? <FieldMapper profile={selectedProfile} /> : null}

        {selectedProfile ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEditingProfile(selectedProfile)}>
              Edit selected profile
            </Button>
            <Button variant="danger" onClick={() => deleteSelectedProfile(selectedProfile.id)}>
              Delete selected profile
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
