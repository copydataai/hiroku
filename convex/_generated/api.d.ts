/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as aiChatbot from "../aiChatbot.js";
import type * as aiHelpers from "../aiHelpers.js";
import type * as analytics from "../analytics.js";
import type * as clerkWebhooks from "../clerkWebhooks.js";
import type * as conversations from "../conversations.js";
import type * as dockets from "../dockets.js";
import type * as http from "../http.js";
import type * as invoiceItems from "../invoiceItems.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as menus from "../menus.js";
import type * as messages from "../messages.js";
import type * as publicOrders from "../publicOrders.js";
import type * as restaurants from "../restaurants.js";
import type * as storage from "../storage.js";
import type * as tags from "../tags.js";
import type * as tasks from "../tasks.js";
import type * as teamMembers from "../teamMembers.js";
import type * as users from "../users.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  aiChatbot: typeof aiChatbot;
  aiHelpers: typeof aiHelpers;
  analytics: typeof analytics;
  clerkWebhooks: typeof clerkWebhooks;
  conversations: typeof conversations;
  dockets: typeof dockets;
  http: typeof http;
  invoiceItems: typeof invoiceItems;
  invoices: typeof invoices;
  leads: typeof leads;
  "lib/permissions": typeof lib_permissions;
  menus: typeof menus;
  messages: typeof messages;
  publicOrders: typeof publicOrders;
  restaurants: typeof restaurants;
  storage: typeof storage;
  tags: typeof tags;
  tasks: typeof tasks;
  teamMembers: typeof teamMembers;
  users: typeof users;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
