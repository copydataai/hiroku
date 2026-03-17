import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// WhatsApp webhook verification (GET)
http.route({
  path: "/webhooks/whatsapp",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // For now, accept any subscribe request with a token
    // In production, verify against the restaurant's whatsappVerifyToken
    if (mode === "subscribe" && token && challenge) {
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  }),
});

// WhatsApp webhook messages (POST)
http.route({
  path: "/webhooks/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Process WhatsApp Cloud API webhook payload
    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const messages = value?.messages ?? [];
        const phoneNumberId = value?.metadata?.phone_number_id;

        for (const message of messages) {
          // Find restaurant by WhatsApp phone number ID
          // For now, we'll need the restaurantId passed or look it up
          // This is a simplified version — in production, look up by phoneNumberId
          try {
            await ctx.runMutation(internal.whatsapp.processIncomingMessage, {
              restaurantId: message.restaurantId, // This would come from a lookup
              from: message.from,
              whatsappMessageId: message.id,
              messageType: message.type ?? "text",
              content:
                message.text?.body ??
                message.caption ??
                `[${message.type}]`,
              timestamp: parseInt(message.timestamp) * 1000,
            });
          } catch (e) {
            console.error("Failed to process WhatsApp message:", e);
          }
        }
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
