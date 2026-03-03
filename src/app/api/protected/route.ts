import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

function log(message: string, value: any) {
  console.log("--------------------------------");
  console.log(message);
  console.log("--------------------------------");
  console.log("Formatted:");
  console.log(JSON.stringify(value, null, 2));
  console.log("Raw:");
  console.log(value);
}

export async function GET() {
  const {
    getUser,
    isAuthenticated,
    getIdToken,
    getAccessToken,
    refreshTokens,
    getEntitlements,
  } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get tokens
  const idToken = await getIdToken();
  const accessToken = await getAccessToken();
  const refreshToken = await refreshTokens();
  const entitlements = await getEntitlements();

  log("idToken", idToken);
  log("accessToken", accessToken);
  log("refreshToken", refreshToken);
  log('Entitlements for user:', entitlements);
  
  const data = {
    idToken: {
      readable: JSON.stringify(idToken, null, 2),
      raw: idToken,
    },
    accessToken: {
      readable: JSON.stringify(accessToken, null, 2),
      raw: accessToken,
    },
    refreshToken: {
      readable: JSON.stringify(refreshToken, null, 2),
      raw: refreshToken,
    },
    entitlements: {
      readable: JSON.stringify(entitlements, null, 2),
      raw: entitlements,
    },
  };
  
  return NextResponse.json(
    { data },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}