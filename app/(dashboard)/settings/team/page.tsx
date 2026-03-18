"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export default function TeamSettingsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1
          className="text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Team Management
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your team members, roles, and invitations.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none w-full",
              navbar: "hidden",
              pageScrollBox: "p-0",
            },
          }}
        />
      </div>
    </div>
  );
}
