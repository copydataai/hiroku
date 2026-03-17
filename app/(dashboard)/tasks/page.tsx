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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
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
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Quick create */}
      {showCreate && (
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Task title..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            autoFocus
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Create
          </button>
          <button
            onClick={() => setShowCreate(false)}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks === undefined ? (
          <p className="py-8 text-center text-gray-400">Loading...</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow-sm">
            <CheckSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div
              key={task._id}
              className="flex items-center gap-4 rounded-xl bg-white px-6 py-4 shadow-sm"
            >
              {/* Status indicator */}
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task._id, e.target.value)
                }
                className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                  task.status === "completed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : task.status === "in_progress"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : task.status === "cancelled"
                        ? "border-gray-200 bg-gray-50 text-gray-500"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.status === "completed"
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {task.dueAt && (
                  <span
                    className={`text-sm ${
                      task.dueAt < Date.now() && task.status !== "completed"
                        ? "font-medium text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(task.dueAt).toLocaleDateString()}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    task.priority === "urgent"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "high"
                        ? "bg-amber-100 text-amber-700"
                        : task.priority === "medium"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                  }`}
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
