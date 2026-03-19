"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateText, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// ── Main AI Response Action ────────────────────────────────

export const generateResponse = internalAction({
  args: {
    restaurantId: v.id("restaurants"),
    conversationId: v.id("conversations"),
    leadId: v.id("leads"),
    customerMessage: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Fetch context in parallel
    const [restaurant, conversationHistory, menuData] = await Promise.all([
      ctx.runQuery(internal.aiHelpers.getRestaurantContext, {
        restaurantId: args.restaurantId,
      }),
      ctx.runQuery(internal.aiHelpers.getConversationHistory, {
        conversationId: args.conversationId,
      }),
      ctx.runQuery(internal.aiHelpers.getMenuContext, {
        restaurantId: args.restaurantId,
      }),
    ]);

    if (!restaurant) throw new Error("Restaurant not found");

    const systemPrompt = buildSystemPrompt(restaurant, menuData);
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.direction === "inbound" ? ("user" as const) : ("assistant" as const),
      content: msg.content || "",
    }));

    // Add the current message
    messages.push({ role: "user" as const, content: args.customerMessage });

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages,
      tools: {
        searchMenu: tool({
          description:
            "Search for menu items by name or description. Use when the customer asks about specific dishes, prices, or ingredients.",
          inputSchema: z.object({
            query: z.string().describe("Search term for menu items"),
          }),
          execute: async ({ query }: { query: string }) => {
            const results = await ctx.runQuery(
              internal.aiHelpers.searchMenuItems,
              {
                restaurantId: args.restaurantId,
                query,
              }
            );
            return results;
          },
        }),
        getFullMenu: tool({
          description:
            "Get the complete menu with all categories and items. Use when the customer asks to see the menu or wants to know what's available.",
          inputSchema: z.object({}),
          execute: async () => menuData,
        }),
        updateLeadStage: tool({
          description:
            "Update the lead's pipeline stage. Use when the conversation indicates the customer is progressing (e.g., from 'new' to 'contacted' or 'qualified').",
          inputSchema: z.object({
            stage: z.enum([
              "new",
              "contacted",
              "qualified",
              "proposal",
              "negotiation",
              "won",
              "lost",
            ]),
            reason: z.string().describe("Why the stage is changing"),
          }),
          execute: async ({ stage, reason }: { stage: string; reason: string }) => {
            await ctx.runMutation(internal.aiHelpers.updateLeadStage, {
              leadId: args.leadId,
              restaurantId: args.restaurantId,
              stage,
              reason,
            });
            return { success: true, newStage: stage };
          },
        }),
        placeOrder: tool({
          description:
            "Place an order for the customer. Use ONLY after the customer has confirmed their complete order with specific items and quantities. Always confirm the order summary with the customer before calling this tool.",
          inputSchema: z.object({
            items: z.array(
              z.object({
                name: z.string().describe("Menu item name"),
                quantity: z.number().describe("Quantity ordered"),
                unitPrice: z.number().describe("Price per unit"),
              })
            ),
            notes: z
              .string()
              .optional()
              .describe("Special requests or order notes"),
          }),
          execute: async ({
            items,
            notes,
          }: {
            items: Array<{
              name: string;
              quantity: number;
              unitPrice: number;
            }>;
            notes?: string;
          }) => {
            const result = await ctx.runMutation(
              internal.aiHelpers.createOrderFromChat,
              {
                restaurantId: args.restaurantId,
                leadId: args.leadId,
                items,
                notes,
              }
            );
            return result;
          },
        }),
      },
      stopWhen: stepCountIs(3),
    });

    return text;
  },
});

// ── System Prompt Builder ──────────────────────────────────

function buildSystemPrompt(restaurant: any, menuData: any) {
  const menuSummary =
    menuData.menus
      ?.map((menu: any) =>
        menu.categories
          ?.map(
            (cat: any) =>
              `**${cat.name}**: ${cat.items?.map((i: any) => `${i.name} (${restaurant.currency} ${i.price})`).join(", ")}`
          )
          .join("\n")
      )
      .join("\n\n") || "No menu items configured yet.";

  return `You are the AI assistant for ${restaurant.name}. You help customers via WhatsApp.

## Your role
- Answer menu questions accurately with prices
- Help customers decide what to order
- Be friendly, concise, and professional
- Use the restaurant's currency: ${restaurant.currency}
- If asked about items not on the menu, say so politely
- Keep responses short — this is WhatsApp, not email. 2-3 sentences max unless listing items.
- Do NOT use markdown formatting (no **, no bullets with -). Use plain text with line breaks.
- Use emojis sparingly and naturally.

## Restaurant info
Name: ${restaurant.name}
${restaurant.description ? `Description: ${restaurant.description}` : ""}
${restaurant.address ? `Address: ${restaurant.address}` : ""}
${restaurant.phone ? `Phone: ${restaurant.phone}` : ""}

## Current menu
${menuSummary}

## Guidelines
- When listing prices, always include the currency symbol
- If a customer seems ready to order, ask them to confirm their items and quantities
- If you don't know something (hours, delivery, etc.), suggest they call the restaurant directly
- Never make up information about items not on the menu

## Taking orders
- When a customer wants to order, help them build their order item by item
- Always confirm the complete order before placing it: list every item, quantity, and price
- After confirming, use the placeOrder tool to create the order
- Tell the customer their order number and total after placing
- If a customer changes their mind about items, adjust before confirming
- Never place an order without explicit customer confirmation`;
}
