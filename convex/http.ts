import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ── Clerk Organization Webhooks ─────────────────────────────

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();

    // Verify webhook signature
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const isValid = await verifyWebhookSignature(
      webhookSecret,
      svixId,
      svixTimestamp,
      body,
      svixSignature
    );
    if (!isValid) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType: string = event.type;
    const data: any = event.data;

    try {
      switch (eventType) {
        case "organization.created": {
          const slug = (data.slug ?? data.name ?? "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          await ctx.runMutation(
            internal.clerkWebhooks.createRestaurantFromOrg,
            {
              clerkOrgId: data.id,
              name: data.name,
              slug: slug || `org-${data.id.slice(-8)}`,
            }
          );
          break;
        }

        case "organization.updated": {
          await ctx.runMutation(
            internal.clerkWebhooks.updateRestaurantFromOrg,
            {
              clerkOrgId: data.id,
              name: data.name,
            }
          );
          break;
        }

        case "organization.deleted": {
          await ctx.runMutation(
            internal.clerkWebhooks.deleteRestaurantFromOrg,
            { clerkOrgId: data.id }
          );
          break;
        }

        case "organizationMembership.created": {
          const user = data.public_user_data;
          await ctx.runMutation(internal.clerkWebhooks.addMemberFromOrg, {
            clerkOrgId: data.organization.id,
            clerkUserId: user.user_id,
            role: data.role,
            name:
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              user.identifier ||
              "",
            email: user.identifier || "",
          });
          break;
        }

        case "organizationMembership.updated": {
          const updatedUser = data.public_user_data;
          await ctx.runMutation(internal.clerkWebhooks.updateMemberFromOrg, {
            clerkOrgId: data.organization.id,
            clerkUserId: updatedUser.user_id,
            role: data.role,
          });
          break;
        }

        case "organizationMembership.deleted": {
          const deletedUser = data.public_user_data;
          await ctx.runMutation(internal.clerkWebhooks.removeMemberFromOrg, {
            clerkOrgId: data.organization.id,
            clerkUserId: deletedUser.user_id,
          });
          break;
        }
      }
    } catch (err) {
      console.error(`Error processing ${eventType}:`, err);
      return new Response("Webhook processing error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

/**
 * Verify Clerk/Svix webhook signature using Web Crypto API.
 * Clerk uses svix which signs with HMAC-SHA256 using a base64-encoded secret
 * prefixed with "whsec_".
 */
async function verifyWebhookSignature(
  secret: string,
  msgId: string,
  timestamp: string,
  body: string,
  signatures: string
): Promise<boolean> {
  // Check timestamp isn't too old (5 min tolerance)
  const ts = parseInt(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  // Decode the secret (strip "whsec_" prefix, base64 decode)
  const secretBytes = base64ToUint8Array(secret.replace(/^whsec_/, ""));

  // Create the signature content
  const signatureContent = `${msgId}.${timestamp}.${body}`;
  const encoder = new TextEncoder();

  // Import key and sign
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signatureContent)
  );

  const expectedSignature = uint8ArrayToBase64(new Uint8Array(signatureBytes));

  // Svix sends multiple signatures separated by space, each prefixed with "v1,"
  const providedSignatures = signatures.split(" ");
  for (const sig of providedSignatures) {
    const [version, value] = sig.split(",");
    if (version === "v1" && value === expectedSignature) {
      return true;
    }
  }

  return false;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ── WhatsApp Webhooks ───────────────────────────────────────

http.route({
  path: "/webhooks/whatsapp",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && challenge) {
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  }),
});

http.route({
  path: "/webhooks/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const messages = value?.messages ?? [];

        for (const message of messages) {
          try {
            await ctx.runMutation(internal.whatsapp.processIncomingMessage, {
              restaurantId: message.restaurantId,
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
