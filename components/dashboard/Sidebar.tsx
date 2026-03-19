"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  MessageSquare,
  FileText,
  Printer,
  CheckSquare,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/dockets", label: "Dockets", icon: Printer },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

const settingsItems = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/whatsapp", label: "WhatsApp" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/pipeline", label: "Pipeline" },
  { href: "/settings/billing", label: "Billing" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings")
  );

  return (
    <aside
      className="noise-overlay relative flex h-full w-[260px] flex-col"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Organization switcher */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full rounded-lg px-2 py-2 text-sm justify-start gap-2",
            },
          }}
        />
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  "animate-slide-in-left"
                )}
                style={{
                  animationDelay: `${i * 40}ms`,
                  color: isActive
                    ? "var(--sidebar-text-active)"
                    : "var(--sidebar-text)",
                  background: isActive
                    ? "rgba(200,150,62,0.08)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--sidebar-text-active)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--sidebar-text)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                    style={{
                      background: "var(--accent)",
                      boxShadow: "0 0 8px rgba(200,150,62,0.4)",
                    }}
                  />
                )}

                <item.icon
                  className="h-[18px] w-[18px] shrink-0 transition-colors"
                  style={{
                    color: isActive ? "var(--accent)" : undefined,
                  }}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div
          className="my-4 h-px"
          style={{ background: "var(--sidebar-border)" }}
        />

        {/* Settings */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200"
            style={{
              color: pathname.startsWith("/settings")
                ? "var(--sidebar-text-active)"
                : "var(--sidebar-text)",
              background: pathname.startsWith("/settings")
                ? "rgba(200,150,62,0.08)"
                : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!pathname.startsWith("/settings")) {
                e.currentTarget.style.color = "var(--sidebar-text-active)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname.startsWith("/settings")) {
                e.currentTarget.style.color = "var(--sidebar-text)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {pathname.startsWith("/settings") && (
              <div
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 8px rgba(200,150,62,0.4)",
                }}
              />
            )}
            <Settings
              className="h-[18px] w-[18px] shrink-0"
              style={{
                color: pathname.startsWith("/settings")
                  ? "var(--accent)"
                  : undefined,
              }}
            />
            Settings
            <ChevronDown
              className={clsx(
                "ml-auto h-3.5 w-3.5 transition-transform duration-200",
                settingsOpen && "rotate-180"
              )}
            />
          </button>

          <div
            className={clsx(
              "overflow-hidden transition-all duration-300",
              settingsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="ml-5 mt-1 space-y-0.5 border-l pl-4" style={{ borderColor: "var(--sidebar-border)" }}>
              {settingsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className="block rounded-md px-3 py-1.5 text-[13px] transition-colors duration-150"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--sidebar-text)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "var(--sidebar-text-active)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "var(--sidebar-text)";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-xs font-medium"
              style={{ color: "var(--sidebar-text)" }}
            >
              Account
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
