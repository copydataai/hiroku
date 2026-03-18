import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Core ───────────────────────────────────────────────
  restaurants: defineTable({
    clerkOrgId: v.string(),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    currency: v.string(),
    whatsappPhoneNumberId: v.optional(v.string()),
    whatsappAccessToken: v.optional(v.string()),
    whatsappVerifyToken: v.optional(v.string()),
    defaultTaxRate: v.number(),
    pipelineStages: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        color: v.string(),
        order: v.number(),
      })
    ),
    logoStorageId: v.optional(v.id("_storage")),
  })
    .index("by_clerk_org", ["clerkOrgId"])
    .index("by_slug", ["slug"]),

  teamMembers: defineTable({
    restaurantId: v.id("restaurants"),
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("staff")
    ),
    name: v.string(),
    email: v.string(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_clerk_org", ["clerkOrgId"])
    .index("by_clerk_org_and_user", ["clerkOrgId", "clerkUserId"])
    .index("by_restaurant_and_user", ["restaurantId", "clerkUserId"]),

  // ── Menu System ────────────────────────────────────────
  menus: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_active", ["restaurantId", "isActive"]),

  menuCategories: defineTable({
    menuId: v.id("menus"),
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_menu", ["menuId"])
    .index("by_restaurant", ["restaurantId"]),

  menuItems: defineTable({
    categoryId: v.id("menuCategories"),
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
    isAvailable: v.boolean(),
    tags: v.array(v.string()),
    sortOrder: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_available", ["restaurantId", "isAvailable"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["restaurantId", "isAvailable"],
    }),

  // ── CRM / Leads ────────────────────────────────────────
  leads: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    source: v.union(
      v.literal("whatsapp"),
      v.literal("walk_in"),
      v.literal("manual"),
      v.literal("referral")
    ),
    pipelineStage: v.string(),
    score: v.number(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedTo: v.optional(v.id("teamMembers")),
    notes: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    whatsappPhoneNumber: v.optional(v.string()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_stage", ["restaurantId", "pipelineStage"])
    .index("by_restaurant_source", ["restaurantId", "source"])
    .index("by_restaurant_priority", ["restaurantId", "priority"])
    .index("by_assigned", ["assignedTo"])
    .index("by_restaurant_last_message", ["restaurantId", "lastMessageAt"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["restaurantId", "pipelineStage", "source"],
    }),

  activities: defineTable({
    leadId: v.id("leads"),
    restaurantId: v.id("restaurants"),
    type: v.union(
      v.literal("note"),
      v.literal("call"),
      v.literal("email"),
      v.literal("stage_change"),
      v.literal("invoice_created"),
      v.literal("invoice_paid"),
      v.literal("task_created"),
      v.literal("task_completed"),
      v.literal("message_sent"),
      v.literal("message_received")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.string()),
  })
    .index("by_lead", ["leadId"])
    .index("by_restaurant", ["restaurantId"]),

  tags: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    color: v.string(),
  }).index("by_restaurant", ["restaurantId"]),

  leadTags: defineTable({
    leadId: v.id("leads"),
    tagId: v.id("tags"),
    restaurantId: v.id("restaurants"),
  })
    .index("by_lead", ["leadId"])
    .index("by_tag", ["tagId"])
    .index("by_lead_tag", ["leadId", "tagId"]),

  tasks: defineTable({
    leadId: v.optional(v.id("leads")),
    restaurantId: v.id("restaurants"),
    assignedTo: v.optional(v.id("teamMembers")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    dueAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_lead", ["leadId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_restaurant_status", ["restaurantId", "status"]),

  // ── WhatsApp ───────────────────────────────────────────
  conversations: defineTable({
    leadId: v.id("leads"),
    restaurantId: v.id("restaurants"),
    channel: v.union(v.literal("whatsapp"), v.literal("internal")),
    lastMessagePreview: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    unreadCount: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_channel", ["restaurantId", "channel"])
    .index("by_restaurant_last_message", ["restaurantId", "lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    restaurantId: v.id("restaurants"),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    senderType: v.union(
      v.literal("customer"),
      v.literal("bot"),
      v.literal("agent")
    ),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("document"),
      v.literal("audio"),
      v.literal("video"),
      v.literal("location"),
      v.literal("template")
    ),
    content: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    mediaUrl: v.optional(v.string()),
    whatsappMessageId: v.optional(v.string()),
    whatsappStatus: v.optional(
      v.union(
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("read"),
        v.literal("failed")
      )
    ),
    metadata: v.optional(v.any()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_whatsapp_message_id", ["whatsappMessageId"]),

  // ── Invoicing & Dockets ────────────────────────────────
  invoices: defineTable({
    leadId: v.id("leads"),
    restaurantId: v.id("restaurants"),
    invoiceNumber: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    discountAmount: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("card"),
        v.literal("transfer"),
        v.literal("other")
      )
    ),
    paidAt: v.optional(v.number()),
    dueAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  })
    .index("by_lead", ["leadId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"])
    .index("by_invoice_number", ["restaurantId", "invoiceNumber"]),

  invoiceItems: defineTable({
    invoiceId: v.id("invoices"),
    restaurantId: v.id("restaurants"),
    menuItemId: v.optional(v.id("menuItems")),
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
  }).index("by_invoice", ["invoiceId"]),

  dockets: defineTable({
    restaurantId: v.id("restaurants"),
    invoiceId: v.optional(v.id("invoices")),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("order_docket"),
      v.literal("menu_print"),
      v.literal("receipt")
    ),
    docketNumber: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    tableNumber: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("printed"),
      v.literal("completed")
    ),
    printCount: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"])
    .index("by_invoice", ["invoiceId"]),
});
