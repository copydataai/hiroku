"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
  Tag,
  Plus,
} from "lucide-react";

type Tab = "activity" | "conversations" | "invoices" | "tasks";

export default function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  const lead = useQuery(api.leads.get, {
    leadId: leadId as Id<"leads">,
  });
  const restaurant = useQuery(api.restaurants.get, {});
  const activities = useQuery(api.activities.listByLead, {
    leadId: leadId as Id<"leads">,
  });
  const leadTags = useQuery(api.tags.getLeadTags, {
    leadId: leadId as Id<"leads">,
  });
  const leadInvoices = useQuery(api.invoices.listByLead, {
    leadId: leadId as Id<"leads">,
  });
  const leadTasks = useQuery(api.tasks.listByLead, {
    leadId: leadId as Id<"leads">,
  });

  const updateStage = useMutation(api.leads.updateStage);
  const updateLead = useMutation(api.leads.update);
  const addActivity = useMutation(api.activities.create);

  const [noteText, setNoteText] = useState("");

  if (!lead || !restaurant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const stageConfig = restaurant.pipelineStages?.find(
    (s: any) => s.id === lead.pipelineStage
  );

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addActivity({
      leadId: lead._id,
      type: "note",
      title: noteText,
    });
    setNoteText("");
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "activity", label: "Activity", icon: Clock },
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            {lead.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {lead.phone}
              </span>
            )}
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {lead.email}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Lead Info */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Source</dt>
                <dd className="font-medium text-gray-900">{lead.source}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Stage</dt>
                <dd>
                  <select
                    value={lead.pipelineStage}
                    onChange={(e) =>
                      updateStage({
                        leadId: lead._id,
                        pipelineStage: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  >
                    {(restaurant.pipelineStages ?? []).map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Priority</dt>
                <dd>
                  <select
                    value={lead.priority}
                    onChange={(e) =>
                      updateLead({
                        leadId: lead._id,
                        priority: e.target.value as any,
                      })
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Score</dt>
                <dd className="font-medium text-gray-900">{lead.score}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  {new Date(lead._creationTime).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Tags */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
              <Tag className="h-4 w-4" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {leadTags?.map((tag: any) => (
                <span
                  key={tag._id}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {(!leadTags || leadTags.length === 0) && (
                <span className="text-sm text-gray-400">No tags</span>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h2>
              <p className="text-sm text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-sm">
            {/* Tab headers */}
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "activity" && (
                <div className="space-y-4">
                  {/* Add note */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddNote()
                      }
                      placeholder="Add a note..."
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  {/* Timeline */}
                  {activities?.map((activity: any) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            activity._creationTime
                          ).toLocaleString()}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {activity.type}
                      </span>
                    </div>
                  ))}
                  {(!activities || activities.length === 0) && (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No activity yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "invoices" && (
                <div>
                  <div className="mb-4 flex justify-end">
                    <Link
                      href={`/invoices/new?leadId=${lead._id}`}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" /> New Invoice
                    </Link>
                  </div>
                  {leadInvoices && leadInvoices.length > 0 ? (
                    <div className="space-y-2">
                      {leadInvoices.map((inv: any) => (
                        <Link
                          key={inv._id}
                          href={`/invoices/${inv._id}`}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <div>
                            <span className="font-medium">
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                                inv.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : inv.status === "sent"
                                    ? "bg-blue-100 text-blue-700"
                                    : inv.status === "overdue"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                          <span className="font-medium">
                            ${inv.total.toFixed(2)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No invoices yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "tasks" && (
                <div>
                  {leadTasks && leadTasks.length > 0 ? (
                    <div className="space-y-2">
                      {leadTasks.map((task: any) => (
                        <div
                          key={task._id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              task.status === "completed"
                                ? "bg-emerald-500"
                                : task.status === "in_progress"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            {task.dueAt && (
                              <p className="text-xs text-gray-500">
                                Due:{" "}
                                {new Date(task.dueAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              task.priority === "urgent"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "high"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-400">
                      No tasks yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "conversations" && (
                <p className="py-8 text-center text-sm text-gray-400">
                  <Link
                    href="/conversations"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Open conversations
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
