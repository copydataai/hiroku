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
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
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

export default function Sidebar({
  restaurantName,
}: {
  restaurantName: string;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings")
  );

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Restaurant name */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
          {restaurantName.charAt(0).toUpperCase()}
        </div>
        <span className="truncate font-semibold">{restaurantName}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Settings group */}
          <li>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname.startsWith("/settings")
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              Settings
              <ChevronDown
                className={clsx(
                  "ml-auto h-4 w-4 transition-transform",
                  settingsOpen && "rotate-180"
                )}
              />
            </button>
            {settingsOpen && (
              <ul className="mt-1 ml-8 space-y-1">
                {settingsItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                        pathname === item.href
                          ? "text-white"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 p-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </aside>
  );
}
