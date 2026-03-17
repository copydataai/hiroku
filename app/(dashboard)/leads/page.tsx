"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

export default function LeadsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const [stage, setStage] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  const leads = useQuery(
    api.leads.list,
    restaurant
      ? {
          restaurantId: restaurant._id,
          ...(stage ? { stage } : {}),
          ...(source ? { source: source as any } : {}),
          ...(priority ? { priority: priority as any } : {}),
        }
      : "skip"
  );

  if (!restaurant) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl tracking-tight font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Leads
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
        >
          <option value="">All Stages</option>
          {(restaurant.pipelineStages ?? []).map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
        >
          <option value="">All Sources</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="walk_in">Walk-in</option>
          <option value="manual">Manual</option>
          <option value="referral">Referral</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Leads Table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              style={{ background: "var(--surface-warm)" }}
            >
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Name
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Phone
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Source
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Stage
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Priority
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {leads === undefined ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="h-5 w-5 animate-spin rounded-full border-2"
                      style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)" }}
                    />
                    <span style={{ color: "var(--text-muted)" }}>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => {
                const stageConfig = restaurant.pipelineStages?.find(
                  (s: any) => s.id === lead.pipelineStage
                );
                return (
                  <tr
                    key={lead._id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface-warm)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="font-medium transition-colors hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {lead.phone ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-lg px-2 py-1 text-xs font-medium"
                        style={{
                          background: "var(--surface-warm)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-lg px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: stageConfig?.color ?? "#6b7280" }}
                      >
                        {stageConfig?.name ?? lead.pipelineStage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-lg px-2 py-1 text-xs font-medium"
                        style={
                          lead.priority === "urgent"
                            ? { background: "var(--danger-light)", color: "var(--danger)" }
                            : lead.priority === "high"
                              ? { background: "var(--warning-light)", color: "var(--warning)" }
                              : lead.priority === "medium"
                                ? { background: "var(--surface-warm)", color: "var(--accent)" }
                                : { background: "var(--surface-warm)", color: "var(--text-secondary)" }
                        }
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {lead.score}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Lead Modal */}
      {showCreate && (
        <CreateLeadModal
          restaurantId={restaurant._id}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function CreateLeadModal({
  restaurantId,
  onClose,
}: {
  restaurantId: any;
  onClose: () => void;
}) {
  const createLead = useMutation(api.leads.create);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<"walk_in" | "manual" | "referral">("manual");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead({
        restaurantId,
        name,
        phone: phone || undefined,
        email: email || undefined,
        source,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ background: "var(--surface)" }}
      >
        <h2
          className="mb-4 text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          New Lead
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
              />
            </div>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
            >
              <option value="manual">Manual</option>
              <option value="walk_in">Walk-in</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                color: "#fff",
              }}
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
