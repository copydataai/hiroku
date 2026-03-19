"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const restaurant = useQuery(
    api.restaurants.get,
    organization ? { clerkOrgId: organization.id } : {}
  );
  const [setupComplete, setSetupComplete] = useState(false);

  const loadingSpinner = (
    <div className="flex h-screen items-center justify-center" style={{ background: "var(--background)" }}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-4"
        style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)" }}
      />
    </div>
  );

  // Still loading Clerk org or Convex
  if (!orgLoaded || restaurant === undefined) {
    return loadingSpinner;
  }

  // Just completed setup — wait for Convex to re-authenticate with new JWT
  if (setupComplete && (restaurant === null || !organization)) {
    return loadingSpinner;
  }

  // No organization — show onboarding to create one
  if (!organization) {
    return <OnboardingForm onComplete={() => setSetupComplete(true)} />;
  }

  // Org exists but restaurant not yet created (webhook pending or setup needed)
  if (restaurant === null) {
    return <SetupForm clerkOrgId={organization.id} orgName={organization.name} onComplete={() => setSetupComplete(true)} />;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sliding sidebar */}
          <div
            className="relative h-full w-[260px] animate-slide-in-left"
            style={{ animationDuration: "200ms" }}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          style={{ background: "var(--background)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Step 1: User has no Clerk Organization — create one + restaurant.
 */
function OnboardingForm({ onComplete }: { onComplete: () => void }) {
  const { createOrganization, setActive } = useOrganizationList();
  const setupRestaurant = useMutation(api.restaurants.setupFromOrg);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !createOrganization || !setActive) return;

    setLoading(true);
    setError("");
    try {
      // Create the Clerk organization
      const org = await createOrganization({ name });

      // Set it as the active org (updates JWT with org_id)
      await setActive({ organization: org });

      // Create the restaurant record in Convex
      await setupRestaurant({
        clerkOrgId: org.id,
        name,
        slug,
        currency,
      });
      toast.success("Restaurant created!");
      onComplete();
    } catch (err: any) {
      setError(err.message ?? "Failed to create restaurant");
      toast.error(err.message ?? "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <h1
          className="mb-2 text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Create your restaurant
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Set up your restaurant to start managing leads, menus, and orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Restaurant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                );
              }}
              placeholder="My Restaurant"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              URL Slug
            </label>
            <div
              className="flex items-center rounded-xl text-sm overflow-hidden"
              style={{ border: "1px solid var(--border-light)" }}
            >
              <span
                className="px-3 py-2"
                style={{ background: "var(--surface-warm)", color: "var(--text-muted)", borderRight: "1px solid var(--border-light)" }}
              >
                /menu/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-restaurant"
                className="flex-1 px-3 py-2 outline-none"
                style={{ background: "var(--surface)", color: "var(--text-primary)" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (&euro;)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="MXN">MXN ($)</option>
              <option value="BRL">BRL (R$)</option>
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)" }}
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Step 2: Org exists but restaurant record is missing.
 * This handles the case where the webhook created the org but setup wasn't completed.
 */
function SetupForm({ clerkOrgId, orgName, onComplete }: { clerkOrgId: string; orgName: string; onComplete: () => void }) {
  const setupRestaurant = useMutation(api.restaurants.setupFromOrg);
  const [slug, setSlug] = useState(
    orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setLoading(true);
    setError("");
    try {
      await setupRestaurant({
        clerkOrgId,
        name: orgName,
        slug,
        currency,
      });
      toast.success("Setup complete!");
      onComplete();
    } catch (err: any) {
      setError(err.message ?? "Failed to set up restaurant");
      toast.error(err.message ?? "Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <h1
          className="mb-2 text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Complete setup
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Finish setting up <strong>{orgName}</strong> to start using the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              URL Slug
            </label>
            <div
              className="flex items-center rounded-xl text-sm overflow-hidden"
              style={{ border: "1px solid var(--border-light)" }}
            >
              <span
                className="px-3 py-2"
                style={{ background: "var(--surface-warm)", color: "var(--text-muted)", borderRight: "1px solid var(--border-light)" }}
              >
                /menu/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-restaurant"
                className="flex-1 px-3 py-2 outline-none"
                style={{ background: "var(--surface)", color: "var(--text-primary)" }}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (&euro;)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="MXN">MXN ($)</option>
              <option value="BRL">BRL (R$)</option>
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)" }}
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
