"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  MessageSquare,
  FileText,
  CheckSquare,
  TrendingUp,
  Clock,
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
      color: "bg-indigo-50 text-indigo-600",
      href: "/leads",
    },
    {
      label: "Unread Messages",
      value: stats?.totalUnreadMessages ?? 0,
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-600",
      href: "/conversations",
    },
    {
      label: "Pending Invoices",
      value: stats?.pendingInvoices ?? 0,
      icon: FileText,
      color: "bg-amber-50 text-amber-600",
      href: "/invoices",
    },
    {
      label: "Open Tasks",
      value: stats?.openTasks ?? 0,
      icon: CheckSquare,
      color: "bg-rose-50 text-rose-600",
      href: "/tasks",
    },
  ];

  const pipelineStages = restaurant.pipelineStages ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Overview */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Pipeline Overview
          </h2>
          <div className="space-y-3">
            {pipelineStages
              .sort((a: any, b: any) => a.order - b.order)
              .map((stage: any) => {
                const count = stats?.leadsByStage?.[stage.id] ?? 0;
                const maxCount = Math.max(
                  ...(Object.values(stats?.leadsByStage ?? { _: 1 }) as number[])
                );
                const width =
                  maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4;

                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 truncate">
                      {stage.name}
                    </span>
                    <div className="flex-1">
                      <div className="h-6 rounded-full bg-gray-100">
                        <div
                          className="flex h-6 items-center rounded-full px-2 text-xs font-medium text-white transition-all"
                          style={{
                            width: `${width}%`,
                            backgroundColor: stage.color,
                          }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Leads
            </h2>
            <Link
              href="/leads"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">
                      {lead.source} &middot; {lead.pipelineStage}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      lead.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : lead.priority === "high"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {lead.priority}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Users className="mb-2 h-8 w-8" />
              <p className="text-sm">No leads yet</p>
              <Link
                href="/leads"
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                Create your first lead
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivities.map((activity: any) => (
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
                    <Clock className="mr-1 inline-block h-3 w-3" />
                    {new Date(activity._creationTime).toLocaleString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            No activity yet
          </p>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}
