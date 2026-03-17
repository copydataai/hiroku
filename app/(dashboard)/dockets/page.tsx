"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Printer, Check } from "lucide-react";

export default function DocketsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const [statusFilter, setStatusFilter] = useState<string>("");

  const dockets = useQuery(
    api.dockets.list,
    restaurant
      ? {
          restaurantId: restaurant._id,
          ...(statusFilter ? { status: statusFilter as any } : {}),
        }
      : "skip"
  );

  const markPrinted = useMutation(api.dockets.markPrinted);
  const markCompleted = useMutation(api.dockets.markCompleted);

  if (!restaurant) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dockets</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="printed">Printed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Docket list */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dockets === undefined ? (
          <p className="col-span-full py-8 text-center text-gray-400">
            Loading...
          </p>
        ) : dockets.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white py-12 text-center shadow-sm">
            <Printer className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-500">No dockets found</p>
          </div>
        ) : (
          dockets.map((docket: any) => (
            <div
              key={docket._id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {docket.docketNumber}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    docket.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : docket.status === "printed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {docket.status}
                </span>
              </div>

              <div className="mb-3 text-sm">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                  {docket.type}
                </span>
                {docket.tableNumber && (
                  <span className="ml-2 text-gray-500">
                    Table: {docket.tableNumber}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="mb-4 space-y-1">
                {docket.items.map((item: any, i: any) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    {item.notes && (
                      <span className="text-gray-400">{item.notes}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Prints: {docket.printCount}</span>
                <span>
                  {new Date(docket._creationTime).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                {docket.status !== "completed" && (
                  <>
                    <button
                      onClick={() =>
                        markPrinted({ docketId: docket._id })
                      }
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Printer className="h-3 w-3" /> Print
                    </button>
                    <button
                      onClick={() =>
                        markCompleted({ docketId: docket._id })
                      }
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3 w-3" /> Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
