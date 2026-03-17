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
          WhatsApp Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Connect your WhatsApp Business API for messaging.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Webhook URL */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(200,150,62,0.06)",
            border: "1px solid rgba(200,150,62,0.15)",
          }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare
              className="mt-0.5 h-5 w-5"
              style={{ color: "var(--accent)" }}
            />
            <div>
              <h3
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Webhook URL
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Configure this URL in your WhatsApp Business API dashboard:
              </p>
              <code
                className="mt-2 block rounded-xl px-3 py-2 text-sm"
                style={{
                  background: "rgba(200,150,62,0.08)",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(200,150,62,0.12)",
                }}
              >
                {webhookUrl}
              </code>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            API Configuration
          </h2>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Phone Number ID
            </label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="From Meta Business dashboard"
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
              Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Permanent access token"
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
              Verify Token
            </label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Custom string for webhook verification"
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
              Set the same token in your Meta webhook configuration.
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
    </div>
  );
}
