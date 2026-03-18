"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const updateRestaurant = useMutation(api.restaurants.update);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description ?? "");
      setPhone(restaurant.phone ?? "");
      setEmail(restaurant.email ?? "");
      setAddress(restaurant.address ?? "");
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurant({
        restaurantId: restaurant._id,
        name,
        description: description || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          Restaurant Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your restaurant details and public information.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-2xl space-y-4 rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={inputFocus}
            onBlur={inputBlur}
            required
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={inputFocus}
            onBlur={inputBlur}
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
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={inputFocus}
              onBlur={inputBlur}
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
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            URL Slug
          </label>
          <p
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: "var(--surface-warm)",
              border: "1px solid var(--border-light)",
              color: "var(--text-muted)",
            }}
          >
            /menu/{restaurant.slug}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
              color: "#fff",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
