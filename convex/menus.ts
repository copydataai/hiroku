import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRestaurantAccess } from "./lib/permissions";

// ── Menus ────────────────────────────────────────────────

export const listMenus = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    const menus = await ctx.db
      .query("menus")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
    return menus.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createMenu = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    const existing = await ctx.db
      .query("menus")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();

    return await ctx.db.insert("menus", {
      restaurantId: args.restaurantId,
      name: args.name,
      description: args.description,
      isActive: args.isActive ?? true,
      sortOrder: existing.length,
    });
  },
});

export const updateMenu = mutation({
  args: {
    menuId: v.id("menus"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.menuId);
    if (!menu) throw new Error("Menu not found");
    await requireRestaurantAccess(ctx, menu.restaurantId);

    const { menuId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(menuId, patch);
  },
});

export const removeMenu = mutation({
  args: { menuId: v.id("menus") },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.menuId);
    if (!menu) throw new Error("Menu not found");
    await requireRestaurantAccess(ctx, menu.restaurantId);

    // Delete child categories and items
    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_menu", (q) => q.eq("menuId", args.menuId))
      .collect();
    for (const cat of categories) {
      const items = await ctx.db
        .query("menuItems")
        .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
        .collect();
      for (const item of items) await ctx.db.delete(item._id);
      await ctx.db.delete(cat._id);
    }
    await ctx.db.delete(args.menuId);
  },
});

// ── Categories ───────────────────────────────────────────

export const listCategories = query({
  args: { menuId: v.id("menus") },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.menuId);
    if (!menu) throw new Error("Menu not found");
    await requireRestaurantAccess(ctx, menu.restaurantId);

    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_menu", (q) => q.eq("menuId", args.menuId))
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createCategory = mutation({
  args: {
    menuId: v.id("menus"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const menu = await ctx.db.get(args.menuId);
    if (!menu) throw new Error("Menu not found");
    await requireRestaurantAccess(ctx, menu.restaurantId);

    const existing = await ctx.db
      .query("menuCategories")
      .withIndex("by_menu", (q) => q.eq("menuId", args.menuId))
      .collect();

    return await ctx.db.insert("menuCategories", {
      menuId: args.menuId,
      restaurantId: menu.restaurantId,
      name: args.name,
      description: args.description,
      sortOrder: existing.length,
    });
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("menuCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireRestaurantAccess(ctx, cat.restaurantId);

    const { categoryId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(categoryId, patch);
  },
});

export const removeCategory = mutation({
  args: { categoryId: v.id("menuCategories") },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireRestaurantAccess(ctx, cat.restaurantId);

    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);
    await ctx.db.delete(args.categoryId);
  },
});

// ── Items ────────────────────────────────────────────────

export const listItems = query({
  args: { categoryId: v.id("menuCategories") },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireRestaurantAccess(ctx, cat.restaurantId);

    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listAllItems = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    await requireRestaurantAccess(ctx, args.restaurantId);
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId)
      )
      .collect();
  },
});

export const createItem = mutation({
  args: {
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    isAvailable: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireRestaurantAccess(ctx, cat.restaurantId);

    const existing = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return await ctx.db.insert("menuItems", {
      categoryId: args.categoryId,
      restaurantId: cat.restaurantId,
      name: args.name,
      description: args.description,
      price: args.price,
      isAvailable: args.isAvailable ?? true,
      tags: args.tags ?? [],
      sortOrder: existing.length,
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id("_storage")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await requireRestaurantAccess(ctx, item.restaurantId);

    const { itemId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(itemId, patch);
  },
});

export const removeItem = mutation({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await requireRestaurantAccess(ctx, item.restaurantId);
    await ctx.db.delete(args.itemId);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// ── Public menu (no auth) ────────────────────────────────

export const getPublicMenu = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!restaurant) return null;

    const menus = await ctx.db
      .query("menus")
      .withIndex("by_restaurant_active", (q) =>
        q.eq("restaurantId", restaurant._id).eq("isActive", true)
      )
      .collect();

    const result = [];
    for (const menu of menus) {
      const categories = await ctx.db
        .query("menuCategories")
        .withIndex("by_menu", (q) => q.eq("menuId", menu._id))
        .collect();

      const categoriesWithItems = [];
      for (const category of categories) {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        categoriesWithItems.push({
          ...category,
          items: items
            .filter((i) => i.isAvailable)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        });
      }

      result.push({
        ...menu,
        categories: categoriesWithItems.sort(
          (a, b) => a.sortOrder - b.sortOrder
        ),
      });
    }

    return {
      restaurant: {
        name: restaurant.name,
        description: restaurant.description,
        currency: restaurant.currency,
        phone: restaurant.phone,
      },
      menus: result.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});
