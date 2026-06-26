import { init } from "@kinde/management-api-js";
import { getManagementConfig } from "./config";

/**
 * Initializes the Kinde Management API SDK with the dedicated M2M credentials.
 * Returns false if credentials are not configured, so callers can skip the call
 * and the UI can show "Unknown" instead of erroring.
 */
export function initManagementClient(): boolean {
  const config = getManagementConfig();
  if (!config) {
    console.error("[kinde-management] missing Management API credentials");
    return false;
  }

  init({
    kindeDomain: config.kindeDomain,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });

  return true;
}
