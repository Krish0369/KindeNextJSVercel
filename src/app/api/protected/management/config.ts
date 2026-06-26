/**
 * Management API credentials — the single place that resolves the Kinde domain,
 * client ID and client secret used for Management API (M2M) calls.
 *
 * These are SEPARATE from the user-facing auth app credentials. Create an M2M
 * application in Kinde, authorize it for the Management API with the required
 * scopes (e.g. `read:organizations`), then set these env vars in `.env`:
 *
 *   KINDE_MGMT_DOMAIN=https://your-subdomain.kinde.com
 *   KINDE_MGMT_CLIENT_ID=...
 *   KINDE_MGMT_CLIENT_SECRET=...
 *
 * If any are unset, it falls back to the auth app values
 * (KINDE_ISSUER_URL / KINDE_CLIENT_ID / KINDE_CLIENT_SECRET).
 */

export interface ManagementConfig {
  kindeDomain: string;
  clientId: string;
  clientSecret: string;
}

export function getManagementConfig(): ManagementConfig | null {
  const kindeDomain = process.env.KINDE_MGMT_DOMAIN ?? process.env.KINDE_ISSUER_URL;
  const clientId = process.env.KINDE_MGMT_CLIENT_ID ?? process.env.KINDE_CLIENT_ID;
  const clientSecret =
    process.env.KINDE_MGMT_CLIENT_SECRET ?? process.env.KINDE_CLIENT_SECRET;

  if (!kindeDomain || !clientId || !clientSecret) {
    return null;
  }

  return { kindeDomain, clientId, clientSecret };
}
