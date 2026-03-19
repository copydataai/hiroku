import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export function useRestaurant() {
  const { organization } = useOrganization();
  return useQuery(
    api.restaurants.get,
    organization ? { clerkOrgId: organization.id } : {}
  );
}
