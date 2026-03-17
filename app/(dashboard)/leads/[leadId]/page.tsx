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
        <div
          className="h-8 w-8 animate-spin rounded-full border-4"
          style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)" }}
        />
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
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="rounded-xl p-2 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-warm)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1
            className="text-2xl tracking-tight font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            {lead.name}
          </h1>
          <div
            className="mt-1 flex items-center gap-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
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
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
          >
            <h2
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt style={{ color: "var(--text-muted)" }}>Source</dt>
                <dd className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {lead.source}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--text-muted)" }}>Stage</dt>
                <dd>
                  <select
                    value={lead.pipelineStage}
                    onChange={(e) =>
                      updateStage({
                        leadId: lead._id,
                        pipelineStage: e.target.value,
                      })
                    }
                    className="rounded-xl px-2 py-1 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
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
                <dt style={{ color: "var(--text-muted)" }}>Priority</dt>
                <dd>
                  <select
                    value={lead.priority}
                    onChange={(e) =>
                      updateLead({
                        leadId: lead._id,
                        priority: e.target.value as any,
                      })
                    }
                    className="rounded-xl px-2 py-1 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--text-muted)" }}>Score</dt>
                <dd className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {lead.score}
                </dd>
              </div>
              <div>
                <dt style={{ color: "var(--text-muted)" }}>Created</dt>
                <dd style={{ color: "var(--text-secondary)" }}>
                  {new Date(lead._creationTime).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Tags */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
          >
            <h2
              className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              <Tag className="h-4 w-4" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {leadTags?.map((tag: any) => (
                <span
                  key={tag._id}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {(!leadTags || leadTags.length === 0) && (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No tags
                </span>
              )}
            </div>
          </div>

          {lead.notes && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            >
              <h2
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Notes
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {lead.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
          >
            {/* Tab headers */}
            <div
              className="flex"
              style={{ borderBottom: "1px solid var(--border-light)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    borderBottom: activeTab === tab.id
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    color: activeTab === tab.id
                      ? "var(--accent)"
                      : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
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
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
                    />
                    <button
                      onClick={handleAddNote}
                      className="rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md"
                      style={{
                        background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                        color: "#fff",
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Timeline */}
                  {activities?.map((activity: any) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 pl-4"
                      style={{ borderLeft: "2px solid var(--border-light)" }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            {activity.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(
                            activity._creationTime
                          ).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium"
                        style={{
                          background: "var(--surface-warm)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {activity.type}
                      </span>
                    </div>
                  ))}
                  {(!activities || activities.length === 0) && (
                    <p
                      className="py-8 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                      className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
                      style={{
                        background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                        color: "#fff",
                      }}
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
                          className="flex items-center justify-between rounded-xl p-3 transition-colors"
                          style={{ border: "1px solid var(--border-light)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--surface-warm)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div>
                            <span
                              className="font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className="ml-2 rounded-lg px-2 py-0.5 text-xs font-medium"
                              style={
                                inv.status === "paid"
                                  ? { background: "var(--success-light)", color: "var(--success)" }
                                  : inv.status === "sent"
                                    ? { background: "var(--surface-warm)", color: "var(--accent)" }
                                    : inv.status === "overdue"
                                      ? { background: "var(--danger-light)", color: "var(--danger)" }
                                      : { background: "var(--surface-warm)", color: "var(--text-secondary)" }
                              }
                            >
                              {inv.status}
                            </span>
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            ${inv.total.toFixed(2)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="py-8 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                          className="flex items-center gap-3 rounded-xl p-3"
                          style={{ border: "1px solid var(--border-light)" }}
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                task.status === "completed"
                                  ? "var(--success)"
                                  : task.status === "in_progress"
                                    ? "var(--accent)"
                                    : "var(--border-light)",
                            }}
                          />
                          <div className="flex-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {task.title}
                            </p>
                            {task.dueAt && (
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Due:{" "}
                                {new Date(task.dueAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span
                            className="rounded-lg px-2 py-1 text-xs font-medium"
                            style={
                              task.priority === "urgent"
                                ? { background: "var(--danger-light)", color: "var(--danger)" }
                                : task.priority === "high"
                                  ? { background: "var(--warning-light)", color: "var(--warning)" }
                                  : { background: "var(--surface-warm)", color: "var(--text-secondary)" }
                            }
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="py-8 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No tasks yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "conversations" && (
                <p
                  className="py-8 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Link
                    href="/conversations"
                    className="transition-colors hover:underline"
                    style={{ color: "var(--accent)" }}
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
