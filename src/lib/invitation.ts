/**
 * Organization-invitation handling (invitee side).
 *
 * When a Kinde invite link points at this app (e.g. `/?invitation_code=inv_...`
 * or `/?code=inv_...`), we start Kinde's registration flow FROM the app so it
 * owns the state/PKCE the callback validates, while Kinde resolves the org and
 * the invited role from the code.
 */

export interface InvitationSearchParams {
  invitation_code?: string;
  code?: string;
}

/**
 * Extracts an invitation code from the incoming URL params.
 * Accepts `invitation_code` or a `code` value with the `inv_` prefix
 * (the prefix avoids clashing with the OAuth `code` param).
 */
export function getInvitationCode(
  params: InvitationSearchParams
): string | null {
  if (params.invitation_code) return params.invitation_code;
  if (params.code?.startsWith("inv_")) return params.code;
  return null;
}

/**
 * Builds the Kinde register redirect for an invitation code.
 *
 * - `is_invitation=true` tells Kinde to run the invite-acceptance logic
 *   (join the org + assign the invited role); without it the user is created
 *   with no organization.
 * - `prompt=create` / `start_page=registration` force the sign-up screen with
 *   the invited user's details prefilled.
 * - We intentionally do NOT pass `org_code` — Kinde derives the org (and role)
 *   from the invite; passing org_code would assign the org's default roles.
 */
export function buildInvitationRegisterPath(invitationCode: string): string {
  const params = new URLSearchParams({
    invitation_code: invitationCode,
    is_invitation: "true",
    start_page: "registration",
    prompt: "create",
  });

  return `/api/auth/register?${params.toString()}`;
}

/**
 * Builds the full, shareable invite link that points at THIS app (never Kinde's
 * domain), so the invitee lands on the prefilled sign-up flow.
 *
 * The base URL comes from `KINDE_SITE_URL` so the same code yields the right
 * link per environment (e.g. `http://localhost:3000` locally,
 * `https://app.example.com` in production). Send the invitee this link rather
 * than the raw `https://<>.kinde.com/team_invitation?code=...` one.
 */
export function buildInvitationLink(invitationCode: string): string {
  const siteUrl = process.env.KINDE_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "KINDE_SITE_URL is not set; cannot build an invitation link."
    );
  }

  const base = siteUrl.replace(/\/+$/, "");
  const params = new URLSearchParams({ invitation_code: invitationCode });

  return `${base}/?${params.toString()}`;
}
