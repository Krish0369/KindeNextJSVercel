# Organization Invitations

How users are invited into an organization and how the app handles accepting
those invitations.

There are two separate halves:

- **Creating** an invite — done in Kinde (dashboard or Management API). Produces
  an invitation code like `inv_59a47f1123ec44`.
- **Accepting** an invite — handled by this app, so the invited user is created
  in the correct organization with the role set on the invite.

---

## How to do

1. **Create an invite.** In Kinde (dashboard → the organization → Members →
   Invite), create an invitation for the person's email and choose their role.
   Kinde generates an invitation code like `inv_59a47f1123ec44`.

2. **Send them the right link.** The invitee must open the invite on **our app**,
   not on Kinde's domain. Use this format:

   ```
   https://<our-app-domain>/?invitation_code=<the inv_ code>
   ```

   Example (local testing):

   ```
   http://localhost:3000/?invitation_code=inv_59a47f1123ec44
   ```

3. **What the invitee sees.** Opening that link takes them to the sign-up screen
   with their details prefilled. After they sign up, they are automatically added
   to the **correct organization with the role from the invite**, and land logged
   in.

> **Important:** Do **not** send the raw
> `https://<>.kinde.com/team_invitation?code=...` link. That one starts on
> Kinde's side and the app cannot complete it (the user ends up created with no
> organization). Always convert it to the app link in step 2 — take the `inv_...`
> code and put it after `/?invitation_code=`.

---

## Why the link must point at the app (not Kinde)

Login/registration uses the OAuth Authorization Code flow with PKCE. When the
flow starts, the app generates and stores two secrets in a cookie:

- **`state`** — anti-CSRF value that must come back unchanged.
- **PKCE `code_verifier`** — secret kept in the cookie; only its hash is sent to
  Kinde.

The callback only succeeds if the **same party that started the flow** receives
the response (it needs the stored `state`/`code_verifier` to validate and to
exchange the code for tokens).

- The raw `team_invitation` link starts the flow **on Kinde's side**, so Kinde
  generates the `state`. The app never stored a matching value, so its callback
  rejects the request (this causes callback errors / redirect loops, or a user
  with no org).
- Pointing the link at the app means **the app** starts the flow (stores
  `state`/`code_verifier`) while still forwarding `invitation_code` so Kinde
  resolves the org + role. The callback then validates correctly.

---

## For the developer (technical detail)

### Flow

1. Invite link lands on the public home page: `/?invitation_code=inv_...`
   (or `/?code=inv_...`).
2. The home page detects the code and redirects to the Kinde register handler:

   ```
   /api/auth/register?invitation_code=<code>&is_invitation=true&start_page=registration&prompt=create
   ```

3. The app starts the OIDC flow (stores `state`/PKCE), forwards the params to
   Kinde. Kinde shows the prefilled sign-up screen and, on completion, joins the
   user to the org with the invited role, then redirects back to the callback
   logged in.

### Parameters

| Param | Purpose |
| --- | --- |
| `invitation_code` | The code Kinde uses to look up the org + role for the invite. |
| `is_invitation=true` | Tells Kinde to **run invite-acceptance** (join org + assign invited role). Without it the user is created with no org. |
| `start_page=registration` / `prompt=create` | Force the sign-up screen with the invited user's details prefilled (disabled fields). |
| _(no `org_code`)_ | Intentionally omitted. Kinde derives the org/role from the invite; passing `org_code` would assign the org's **default** roles instead. |

### Requirement

`https://<our-app-domain>/api/auth/kinde_callback` must be listed in
Kinde → app → **Allowed callback URLs**.

---

## Code

The invitee-side logic lives in `src/lib/invitation.ts` (two pure helpers) and is
called from `src/app/page.tsx`. The Kinde middleware is **not** modified.

### `getInvitationCode(params)`

Reads the invite code from the URL query. Accepts `?invitation_code=inv_...` or
`?code=inv_...` (the `inv_` prefix prevents clashing with the OAuth `code` param).
Returns the code, or `null` when there is no invite.

```ts
export function getInvitationCode(
  params: InvitationSearchParams
): string | null {
  if (params.invitation_code) return params.invitation_code;
  if (params.code?.startsWith("inv_")) return params.code;
  return null;
}
```

### `buildInvitationRegisterPath(invitationCode)`

Builds the internal `/api/auth/register?...` URL with the invitation parameters
described above.

```ts
export function buildInvitationRegisterPath(invitationCode: string): string {
  const params = new URLSearchParams({
    invitation_code: invitationCode,
    is_invitation: "true",
    start_page: "registration",
    prompt: "create",
  });

  return `/api/auth/register?${params.toString()}`;
}
```

### Usage in `src/app/page.tsx`

```ts
const invitationCode = getInvitationCode({ invitation_code, code });
if (invitationCode) {
  redirect(buildInvitationRegisterPath(invitationCode));
}
```

---

## Quick test

1. Create an invite in Kinde with a specific role (e.g. `admin:access`).
2. Take the `inv_...` code and open, in a private/incognito window:

   ```
   http://localhost:3000/?invitation_code=inv_<code>
   ```

3. Complete sign-up.
4. Confirm in Kinde that the new user is a member of the correct organization
   with the invited role.

> Each invite code is single-use — once accepted it can't be reused. Generate a
> fresh invite to test again.
