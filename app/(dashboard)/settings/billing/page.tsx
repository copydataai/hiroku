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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing Settings</h1>

      <form
        onSubmit={handleSave}
        className="max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Default Tax Rate (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            step="0.01"
            min="0"
            max="100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Applied by default when creating new invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600">Saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
