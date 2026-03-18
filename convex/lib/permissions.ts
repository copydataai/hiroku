import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Get the authenticated Clerk user ID from the JWT identity.
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

/**
 * Get the active Clerk Organization ID from the JWT identity.
 * Returns null if the user has no active organization.
 */
export async function getActiveOrgId(
  ctx: QueryCtx | MutationCtx
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // Clerk includes org_id as a custom claim when an org is active
  const orgId = (identity as any).org_id ?? null;
  return orgId;
}

/**
 * Get the restaurant and team member for the current user's active organization.
 * Returns null if no org is active or no restaurant exists for the org.
 */
export async function getUserRestaurant(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const orgId = (identity as any).org_id;
  if (!orgId) return null;

  const restaurant = await ctx.db
    .query("restaurants")
    .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
    .first();
  if (!restaurant) return null;

  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_clerk_org_and_user", (q) =>
      q.eq("clerkOrgId", orgId).eq("clerkUserId", identity.subject)
    )
    .first();

  return { restaurant, member };
}

/**
 * Require access to a restaurant. If restaurantId is provided, verifies the
 * user's org matches. Otherwise, uses the active org to find the restaurant.
 */
export async function requireRestaurantAccess(
  ctx: QueryCtx | MutationCtx,
  restaurantId?: Id<"restaurants">
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const orgId = (identity as any).org_id;
  if (!orgId) throw new Error("No active organization");

  if (restaurantId) {
    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    if (restaurant.clerkOrgId !== orgId) throw new Error("Access denied");

    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_clerk_org_and_user", (q) =>
        q.eq("clerkOrgId", orgId).eq("clerkUserId", identity.subject)
      )
      .first();

    return { restaurant, member };
  }

  const result = await getUserRestaurant(ctx);
  if (!result) throw new Error("No restaurant access");
  return result;
}

/**
 * Check if a team member has one of the allowed roles.
 */
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
