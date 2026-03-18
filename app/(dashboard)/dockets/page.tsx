"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Printer, Check } from "lucide-react";
import { toast } from "sonner";

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
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          Dockets
        </h1>
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
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            color: "var(--text-primary)",
          }}
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
          <p
            className="col-span-full py-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Loading...
          </p>
        ) : dockets.length === 0 ? (
          <div
            className="col-span-full rounded-2xl py-12 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Printer
              className="mx-auto mb-3 h-10 w-10"
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No dockets yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Dockets are created automatically from invoices.</p>
          </div>
        ) : (
          dockets.map((docket: any) => (
            <div
              key={docket._id}
              className="card-lift rounded-2xl p-6"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {docket.docketNumber}
                </h3>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={
                    docket.status === "completed"
                      ? {
                          background: "var(--success-light)",
                          color: "var(--success)",
                        }
                      : docket.status === "printed"
                        ? {
                            background: "rgba(99,102,241,0.08)",
                            color: "#6366f1",
                          }
                        : {
                            background: "var(--warning-light)",
                            color: "var(--warning)",
                          }
                  }
                >
                  {docket.status}
                </span>
              </div>

              <div className="mb-3 text-sm">
                <span
                  className="rounded-lg px-2 py-0.5"
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {docket.type}
                </span>
                {docket.tableNumber && (
                  <span
                    className="ml-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Table: {docket.tableNumber}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="mb-4 space-y-1">
                {docket.items.map((item: any, i: any) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    {item.notes && (
                      <span style={{ color: "var(--text-muted)" }}>
                        {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="flex items-center justify-between text-xs"
                style={{ color: "var(--text-muted)" }}
              >
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
                      onClick={async () => {
                        try {
                          await markPrinted({ docketId: docket._id });
                          toast.success("Marked as printed");
                        } catch { toast.error("Failed to update"); }
                      }}
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition-colors"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Printer className="h-3 w-3" /> Print
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await markCompleted({ docketId: docket._id });
                          toast.success("Marked as completed");
                        } catch { toast.error("Failed to update"); }
                      }}
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
                      style={{
                        background: "var(--success)",
                        color: "#fff",
                      }}
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
