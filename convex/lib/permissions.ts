import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

export async function getUserRestaurant(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", userId))
    .first();

  if (!member) return null;

  const restaurant = await ctx.db.get(member.restaurantId);
  return restaurant ? { restaurant, member } : null;
}

export async function requireRestaurantAccess(
  ctx: QueryCtx | MutationCtx,
  restaurantId?: Id<"restaurants">
) {
  const userId = await getAuthUserId(ctx);

  if (restaurantId) {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_restaurant_and_user", (q) =>
        q.eq("restaurantId", restaurantId).eq("clerkUserId", userId)
      )
      .first();

    if (!member) throw new Error("Access denied");

    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    return { restaurant, member };
  }

  const result = await getUserRestaurant(ctx);
  if (!result) throw new Error("No restaurant access");
  return result;
}

export function requireRole(
  memberRole: string,
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(memberRole)) {
    throw new Error(
      `Role '${memberRole}' does not have permission for this action`
    );
  }
}
