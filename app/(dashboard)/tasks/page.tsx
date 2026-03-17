"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, CheckSquare } from "lucide-react";

export default function TasksPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  const tasks = useQuery(
    api.tasks.list,
    restaurant
      ? {
          restaurantId: restaurant._id,
          ...(statusFilter ? { status: statusFilter as any } : {}),
        }
      : "skip"
  );

  const updateTask = useMutation(api.tasks.update);
  const createTask = useMutation(api.tasks.create);

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<string>("medium");
  const [loading, setLoading] = useState(false);

  if (!restaurant) return null;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await createTask({
        restaurantId: restaurant._id,
        title: newTitle,
        priority: newPriority as any,
      });
      setNewTitle("");
      setShowCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (taskId: any, status: string) => {
    updateTask({ taskId, status: status as any });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          background: "var(--success-light)",
          color: "var(--success)",
          border: "1px solid var(--success-light)",
        };
      case "in_progress":
        return {
          background: "rgba(99,102,241,0.08)",
          color: "#6366f1",
          border: "1px solid rgba(99,102,241,0.12)",
        };
      case "cancelled":
        return {
          background: "var(--border-light)",
          color: "var(--text-muted)",
          border: "1px solid var(--border-light)",
        };
      default:
        return {
          background: "var(--warning-light)",
          color: "var(--warning)",
          border: "1px solid var(--warning-light)",
        };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          background: "var(--danger-light)",
          color: "var(--danger)",
        };
      case "high":
        return {
          background: "var(--warning-light)",
          color: "var(--warning)",
        };
      case "medium":
        return {
          background: "rgba(99,102,241,0.08)",
          color: "#6366f1",
        };
      default:
        return {
          background: "var(--border-light)",
          color: "var(--text-muted)",
        };
    }
  };

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
          Tasks
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
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
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Quick create */}
      {showCreate && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Task title..."
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
              boxShadow: "0 0 0 0 transparent",
              transition: "box-shadow 0.2s ease",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 2px rgba(200,150,62,0.3)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")
            }
            autoFocus
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
              color: "#fff",
            }}
          >
            Create
          </button>
          <button
            onClick={() => setShowCreate(false)}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks === undefined ? (
          <p
            className="py-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Loading...
          </p>
        ) : tasks.length === 0 ? (
          <div
            className="rounded-2xl py-12 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <CheckSquare
              className="mx-auto mb-2 h-8 w-8"
              style={{ color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>No tasks found</p>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div
              key={task._id}
              className="flex items-center gap-4 rounded-2xl px-6 py-4 transition-all"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                borderLeft: "3px solid transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderLeftColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderLeftColor = "transparent")
              }
            >
              {/* Status indicator */}
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task._id, e.target.value)
                }
                className="rounded-lg px-2 py-1 text-xs font-medium outline-none"
                style={getStatusStyle(task.status)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="flex-1">
                <p
                  className="font-medium"
                  style={
                    task.status === "completed"
                      ? {
                          textDecoration: "line-through",
                          color: "var(--text-muted)",
                        }
                      : { color: "var(--text-primary)" }
                  }
                >
                  {task.title}
                </p>
                {task.description && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {task.dueAt && (
                  <span
                    className="text-sm"
                    style={
                      task.dueAt < Date.now() && task.status !== "completed"
                        ? {
                            color: "var(--danger)",
                            fontWeight: 500,
                          }
                        : { color: "var(--text-secondary)" }
                    }
                  >
                    {new Date(task.dueAt).toLocaleDateString()}
                  </span>
                )}
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={getPriorityStyle(task.priority)}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
