"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function InvoicesPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const [statusFilter, setStatusFilter] = useState<string>("");

  const invoices = useQuery(
    api.invoices.list,
    restaurant
      ? {
          restaurantId: restaurant._id,
          ...(statusFilter ? { status: statusFilter as any } : {}),
        }
      : "skip"
  );

  if (!restaurant) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return { background: "var(--success-light)", color: "var(--success)" };
      case "sent":
        return { background: "rgba(99,102,241,0.08)", color: "#6366f1" };
      case "overdue":
        return { background: "var(--danger-light)", color: "var(--danger)" };
      case "cancelled":
        return { background: "var(--border-light)", color: "var(--text-muted)" };
      case "draft":
      default:
        return { background: "var(--warning-light)", color: "var(--warning)" };
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          Invoices
        </h1>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm outline-none"
          style={{
            background: "var(--surface-warm)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border-light)",
                background: "var(--surface-warm)",
              }}
            >
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Invoice #
              </th>
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Status
              </th>
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Subtotal
              </th>
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Tax
              </th>
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Total
              </th>
              <th
                className="px-5 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices === undefined ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="mb-3 h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No invoices yet</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Create your first invoice to start billing.</p>
                    <Link
                      href="/invoices/new"
                      className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md"
                      style={{ background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)" }}
                    >
                      <Plus className="h-4 w-4" /> Create Invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv: any) => (
                <tr
                  key={inv._id}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--accent-light)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/invoices/${inv._id}`}
                      className="font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--accent)" }}
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                      style={getStatusStyle(inv.status)}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ${inv.subtotal.toFixed(2)}
                  </td>
                  <td
                    className="px-5 py-3.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ${inv.taxAmount.toFixed(2)}
                  </td>
                  <td
                    className="px-5 py-3.5 font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${inv.total.toFixed(2)}
                  </td>
                  <td
                    className="px-5 py-3.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(inv._creationTime).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
