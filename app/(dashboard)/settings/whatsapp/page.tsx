"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

export default function WhatsAppSettingsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const updateRestaurant = useMutation(api.restaurants.update);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setPhoneNumberId(restaurant.whatsappPhoneNumberId ?? "");
      setAccessToken(restaurant.whatsappAccessToken ?? "");
      setVerifyToken(restaurant.whatsappVerifyToken ?? "");
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurant({
        restaurantId: restaurant._id,
        whatsappPhoneNumberId: phoneNumberId || undefined,
        whatsappAccessToken: accessToken || undefined,
        whatsappVerifyToken: verifyToken || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const webhookUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    ? `${process.env.NEXT_PUBLIC_CONVEX_URL.replace(".cloud", ".site")}/webhooks/whatsapp`
    : "Not configured";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">WhatsApp Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Webhook URL */}
        <div className="rounded-xl bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Webhook URL</h3>
              <p className="mt-1 text-sm text-blue-700">
                Configure this URL in your WhatsApp Business API dashboard:
              </p>
              <code className="mt-2 block rounded bg-blue-100 px-3 py-2 text-sm text-blue-800">
                {webhookUrl}
              </code>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            API Configuration
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number ID
            </label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="From Meta Business dashboard"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Permanent access token"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Verify Token
            </label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Custom string for webhook verification"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Set the same token in your Meta webhook configuration.
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
    </div>
  );
}
