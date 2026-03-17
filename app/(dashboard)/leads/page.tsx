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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Source</th>
              <th className="px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="px-4 py-3 font-medium text-gray-600">Priority</th>
              <th className="px-4 py-3 font-medium text-gray-600">Score</th>
            </tr>
          </thead>
          <tbody>
            {leads === undefined ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.phone ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: stageConfig?.color ?? "#6b7280" }}
                      >
                        {stageConfig?.name ?? lead.pipelineStage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          lead.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : lead.priority === "high"
                              ? "bg-amber-100 text-amber-700"
                              : lead.priority === "medium"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.score}</td>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          New Lead
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
            >
              <option value="manual">Manual</option>
              <option value="walk_in">Walk-in</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
