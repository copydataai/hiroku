"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export default function BillingSettingsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const updateRestaurant = useMutation(api.restaurants.update);

  const [currency, setCurrency] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setCurrency(restaurant.currency);
      setTaxRate(String(restaurant.defaultTaxRate));
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurant({
        restaurantId: restaurant._id,
        currency,
        defaultTaxRate: parseFloat(taxRate) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          Billing Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Configure currency and tax defaults for invoicing.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-md space-y-4 rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={inputFocus}
            onBlur={inputBlur}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (&euro;)</option>
            <option value="GBP">GBP (&pound;)</option>
            <option value="MXN">MXN ($)</option>
            <option value="BRL">BRL (R$)</option>
            <option value="ARS">ARS ($)</option>
            <option value="COP">COP ($)</option>
            <option value="CLP">CLP ($)</option>
            <option value="PEN">PEN (S/)</option>
          </select>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Default Tax Rate (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            step="0.01"
            min="0"
            max="100"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Applied by default when creating new invoices.
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
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm" style={{ color: "var(--success)" }}>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
