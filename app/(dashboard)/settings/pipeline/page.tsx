"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
      toast.success("Pipeline saved");
    } catch {
      toast.error("Failed to save");
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

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border-light)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1
          className="text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Pipeline Stages
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Customize your lead pipeline stages and their order.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Customize your lead pipeline stages. Drag to reorder.
            </p>
            <button
              onClick={addStage}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              <Plus className="h-4 w-4" /> Add Stage
            </button>
          </div>

          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ border: "1px solid var(--border-light)" }}
              >
                <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  {i > 0 && (
                    <button
                      onClick={() => moveStage(i, i - 1)}
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      ▲
                    </button>
                  )}
                  {i < stages.length - 1 && (
                    <button
                      onClick={() => moveStage(i, i + 1)}
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
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
                  className="flex-1 rounded-xl px-2 py-1 text-sm outline-none"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />

                <select
                  value={stage.color}
                  onChange={(e) =>
                    updateStage(i, { color: e.target.value })
                  }
                  className="rounded-xl px-2 py-1 text-sm"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    color: stage.color,
                  }}
                >
                  {colors.map((c) => (
                    <option key={c} value={c} style={{ color: c }}>
                      ■ {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeStage(i)}
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--danger)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
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
            className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
              color: "#fff",
            }}
          >
            {saving ? "Saving..." : "Save Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}
