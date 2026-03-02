/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_generatePattern from "../actions/generatePattern.js";
import type * as mutations_generationLogs from "../mutations/generationLogs.js";
import type * as mutations_savePattern from "../mutations/savePattern.js";
import type * as queries_admin from "../queries/admin.js";
import type * as queries_getPatterns from "../queries/getPatterns.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/generatePattern": typeof actions_generatePattern;
  "mutations/generationLogs": typeof mutations_generationLogs;
  "mutations/savePattern": typeof mutations_savePattern;
  "queries/admin": typeof queries_admin;
  "queries/getPatterns": typeof queries_getPatterns;
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
