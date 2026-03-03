// import {
//   withAuth,
// } from "@kinde-oss/kinde-auth-nextjs/middleware";

// export default withAuth(
//   async function middleware(req) {
//   },
//   {
//     publicPaths: ["/", "/api/public"],
//   }
// );

// export const config = {
//   matcher: [
//     // Run on everything but Next internals and static files
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
//   ],
// };
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware(req: NextRequest) {
    // You can add logic here if needed
    return NextResponse.next();
  },
  {
    publicPaths: ["/", "/api/public"],
  }
);

export const config = {
  matcher: [
    // Run on everything but Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};