"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Stage = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export default function PipelineSettingsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const updateRestaurant = useMutation(api.restaurants.update);

  const [stages, setStages] = useState<Stage[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (restaurant?.pipelineStages) {
      setStages(
        [...restaurant.pipelineStages].sort((a, b) => a.order - b.order)
      );
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const addStage = () => {
    const id = `stage_${Date.now()}`;
    setStages([
      ...stages,
      { id, name: "New Stage", color: "#6b7280", order: stages.length },
    ]);
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    setStages(
      stages.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const removeStage = (index: number) => {
    setStages(
      stages
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i }))
    );
  };

  const moveStage = (from: number, to: number) => {
    const updated = [...stages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStages(updated.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRestaurant({
        restaurantId: restaurant._id,
        pipelineStages: stages,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const colors = [
    "#6366f1",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6b7280",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pipeline Stages</h1>

      <div className="max-w-2xl space-y-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Customize your lead pipeline stages. Drag to reorder.
            </p>
            <button
              onClick={addStage}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add Stage
            </button>
          </div>

          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-1 text-gray-400">
                  {i > 0 && (
                    <button
                      onClick={() => moveStage(i, i - 1)}
                      className="text-xs hover:text-gray-600"
                    >
                      ▲
                    </button>
                  )}
                  {i < stages.length - 1 && (
                    <button
                      onClick={() => moveStage(i, i + 1)}
                      className="text-xs hover:text-gray-600"
                    >
                      ▼
                    </button>
                  )}
                </div>

                <div
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />

                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) =>
                    updateStage(i, { name: e.target.value })
                  }
                  className="flex-1 rounded border px-2 py-1 text-sm outline-none focus:border-indigo-500"
                />

                <select
                  value={stage.color}
                  onChange={(e) =>
                    updateStage(i, { color: e.target.value })
                  }
                  className="rounded border px-2 py-1 text-sm"
                  style={{ color: stage.color }}
                >
                  {colors.map((c) => (
                    <option key={c} value={c} style={{ color: c }}>
                      ■ {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeStage(i)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Pipeline"}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600">Saved!</span>
          )}
        </div>
      </div>
    </div>
  );
}
