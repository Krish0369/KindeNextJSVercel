import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { fetchOrgStatus } from "./management/organizations";

export async function GET() {
  const {
    getUser,
    isAuthenticated,
    getIdToken,
    getIdTokenRaw,
    getAccessToken,
    getAccessTokenRaw,
    getEntitlements,
    getPermissions,
    getRoles,
    getOrganization,
  } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    user,
    idToken,
    idTokenJwt,
    accessToken,
    accessTokenJwt,
    entitlements,
    permissions,
    roles,
    organization,
  ] = await Promise.all([
    getUser(),
    getIdToken(),
    getIdTokenRaw(),
    getAccessToken(),
    getAccessTokenRaw(),
    getEntitlements(),
    getPermissions(),
    getRoles(),
    getOrganization(),
  ]);

  const orgCode =
    organization?.orgCode ?? permissions?.orgCode ?? entitlements?.orgCode ?? null;

  const orgStatus = orgCode
    ? await fetchOrgStatus(orgCode)
    : { name: null, isSuspended: null, suspendedOn: null };

  return NextResponse.json({
    data: {
      dashboard: {
        organization: {
          code: orgCode,
          name: organization?.orgName ?? orgStatus.name ?? null,
          isSuspended: orgStatus.isSuspended,
          suspendedOn: orgStatus.suspendedOn,
        },
        user: {
          id: user?.id ?? null,
          email: user?.email ?? null,
          givenName: user?.given_name ?? null,
          familyName: user?.family_name ?? null,
          fullName: [user?.given_name, user?.family_name].filter(Boolean).join(" "),
        },
        entitlements,
        permissions,
        roles,
      },
      idToken: {
        readable: JSON.stringify(idToken, null, 2),
        raw: idTokenJwt,
      },
      accessToken: {
        readable: JSON.stringify(accessToken, null, 2),
        raw: accessTokenJwt,
      },
    },
  });
}
