"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  MessageSquare,
  FileText,
  CheckSquare,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const stats = useQuery(
    api.restaurants.getDashboardStats,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const recentLeads = useQuery(
    api.leads.getRecent,
    restaurant ? { restaurantId: restaurant._id, limit: 5 } : "skip"
  );

  if (!restaurant || stats === undefined) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      label: "Total Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      accent: "var(--accent)",
      accentBg: "rgba(200,150,62,0.08)",
      href: "/leads",
    },
    {
      label: "Unread Messages",
      value: stats?.totalUnreadMessages ?? 0,
      icon: MessageSquare,
      accent: "var(--success)",
      accentBg: "var(--success-light)",
      href: "/conversations",
    },
    {
      label: "Pending Invoices",
      value: stats?.pendingInvoices ?? 0,
      icon: FileText,
      accent: "var(--warning)",
      accentBg: "var(--warning-light)",
      href: "/invoices",
    },
    {
      label: "Open Tasks",
      value: stats?.openTasks ?? 0,
      icon: CheckSquare,
      accent: "var(--danger)",
      accentBg: "var(--danger-light)",
      href: "/tasks",
    },
  ];

  const pipelineStages = restaurant.pipelineStages ?? [];
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1
          className="text-3xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {greeting}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s what&apos;s happening at {restaurant.name} today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className={`animate-fade-up delay-${(i + 1) * 100} card-lift group relative overflow-hidden rounded-2xl p-6`}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            {/* Subtle top accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{ background: card.accent, opacity: 0.6 }}
            />

            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.label}
                </p>
                <p
                  className="mt-3 text-4xl font-light tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {card.value}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: card.accentBg,
                  color: card.accent,
                }}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>

            <div
              className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: card.accent }}
            >
              View details <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Pipeline Overview — wider */}
        <div
          className="animate-fade-up delay-500 lg:col-span-3 rounded-2xl p-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-medium"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                Pipeline
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Lead distribution across stages
              </p>
            </div>
            <Link
              href="/leads"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                color: "var(--accent)",
                background: "rgba(200,150,62,0.06)",
              }}
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pipelineStages
              .sort((a: any, b: any) => a.order - b.order)
              .map((stage: any) => {
                const count = stats?.leadsByStage?.[stage.id] ?? 0;
                const maxCount = Math.max(
                  ...(Object.values(stats?.leadsByStage ?? { _: 1 }) as number[]),
                  1
                );
                const width = Math.max((count / maxCount) * 100, 3);

                return (
                  <div key={stage.id} className="group flex items-center gap-4">
                    <span
                      className="w-20 truncate text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {stage.name}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-7 overflow-hidden rounded-lg"
                        style={{ background: "var(--border-light)" }}
                      >
                        <div
                          className="flex h-7 items-center rounded-lg px-3 text-[11px] font-semibold text-white transition-all duration-500"
                          style={{
                            width: `${width}%`,
                            background: `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)`,
                          }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </div>
                    </div>
                    <span
                      className="w-6 text-right text-xs font-medium tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Leads — narrower */}
        <div
          className="animate-fade-up delay-600 lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2
              className="text-lg font-medium"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Recent Leads
            </h2>
            <Link
              href="/leads"
              className="text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              View all
            </Link>
          </div>

          {recentLeads && recentLeads.length > 0 ? (
            <div className="space-y-1">
              {recentLeads.map((lead: any) => {
                const stageConfig = pipelineStages.find(
                  (s: any) => s.id === lead.pipelineStage
                );
                return (
                  <Link
                    key={lead._id}
                    href={`/leads/${lead._id}`}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-warm)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                      }}
                    >
                      {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {lead.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {lead.source}
                        </span>
                        {stageConfig && (
                          <>
                            <span
                              className="h-1 w-1 rounded-full"
                              style={{ background: stageConfig.color }}
                            />
                            <span
                              className="text-[11px]"
                              style={{ color: stageConfig.color }}
                            >
                              {stageConfig.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10" style={{ color: "var(--text-muted)" }}>
              <Users className="mb-3 h-8 w-8" style={{ opacity: 0.4 }} />
              <p className="text-sm">No leads yet</p>
              <Link
                href="/leads"
                className="mt-2 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                Create your first lead
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="animate-fade-up delay-700 rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div className="mb-5 flex items-center gap-2">
          <h2
            className="text-lg font-medium"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Activity
          </h2>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color: "var(--accent)",
              background: "rgba(200,150,62,0.08)",
            }}
          >
            Recent
          </span>
        </div>

        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          <div className="space-y-0">
            {stats.recentActivities.map((activity: any, i: number) => {
              const typeColors: Record<string, string> = {
                note: "var(--accent)",
                stage_change: "#6366f1",
                invoice_created: "var(--warning)",
                invoice_paid: "var(--success)",
                task_created: "var(--danger)",
                task_completed: "var(--success)",
              };
              const dotColor = typeColors[activity.type] ?? "var(--text-muted)";

              return (
                <div
                  key={activity._id}
                  className="relative flex items-start gap-4 py-3"
                >
                  {/* Timeline line */}
                  {i < stats.recentActivities.length - 1 && (
                    <div
                      className="absolute left-[7px] top-8 bottom-0 w-px"
                      style={{ background: "var(--border-light)" }}
                    />
                  )}
                  {/* Dot */}
                  <div
                    className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full ring-2"
                    style={{
                      background: dotColor,
                      boxShadow: "0 0 0 2px var(--surface)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: "var(--border-light)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {activity.type.replace(/_/g, " ")}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px] whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(activity._creationTime)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No activity yet. Start by creating a lead or sending a message.
          </p>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="skeleton h-9 w-56 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-72 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton h-32 rounded-2xl"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="skeleton lg:col-span-3 h-72 rounded-2xl" />
        <div className="skeleton lg:col-span-2 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
