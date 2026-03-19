"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";

export default function Topbar({ onMenuToggle }: { onMenuToggle?: () => void } = {}) {
  const [search, setSearch] = useState("");

  return (
    <header
      className="flex h-14 items-center justify-between px-4 md:px-6"
      style={{
        background: "var(--background)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="flex items-center gap-2">
        {/* Hamburger menu — mobile only */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 md:hidden"
          style={{ color: "var(--text-muted)", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search — hidden on very small screens, visible from sm+ */}
        <div className="relative hidden sm:block sm:w-60 md:w-80">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search leads, invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Search icon — visible only on very small screens (below sm) */}
        <button
          className="rounded-lg p-2 sm:hidden"
          style={{ color: "var(--text-muted)", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: "var(--text-muted)", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
