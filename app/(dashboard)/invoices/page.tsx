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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
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
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600">Invoice #</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Subtotal</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tax</th>
              <th className="px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices === undefined ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  <FileText className="mx-auto mb-2 h-8 w-8" />
                  <p>No invoices found</p>
                </td>
              </tr>
            ) : (
              invoices.map((inv: any) => (
                <tr
                  key={inv._id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${inv._id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : inv.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : inv.status === "cancelled"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${inv.subtotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${inv.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
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
