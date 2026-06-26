import "./globals.css";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Image from "next/image";
import type { Metadata } from "next";

const LIVE_ORG_CODE = "org_a2fc116942f3c";

export const metadata: Metadata = {
  title: "Kinde Auth",
  description: "Kinde with NextJS App Router",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <header>
          <nav className="nav container nav--centered">
            <div className="nav__stack">
              {!authenticated ? (
                <div className="nav-auth">
                  <div className="nav-auth__buttons">
                  <LoginLink className="btn btn-sign-in">
                      Signin
                    </LoginLink>
                    <LoginLink orgCode={LIVE_ORG_CODE} className="btn btn-sign-in">
                      Signin: Specific Org
                    </LoginLink>
                    <RegisterLink orgCode={LIVE_ORG_CODE} className="btn btn-dark">
                      Signup: Specific Org
                    </RegisterLink>
                    <RegisterLink
                      orgCode={LIVE_ORG_CODE}
                      authUrlParams={{ pricingTableKey: "user_plan" }}
                      className="btn btn-dark"
                    >
                      Signup: Specific Org: Billing
                    </RegisterLink>
                    <RegisterLink
                      authUrlParams={{ is_create_org: "true" }}
                      className="btn btn-outline"
                    >
                      Signup: Org&User
                    </RegisterLink>
                    <RegisterLink
                      authUrlParams={{
                        is_create_org: "true",
                        pricingTableKey: "organization_plan",
                      }}
                      className="btn btn-outline"
                    >
                      Signup: Org&User: Billing
                    </RegisterLink>
                    
                  </div>
                </div>
              ) : (
                <div className="profile-blob">
                  {user?.picture ? (
                    <Image
                      className="avatar"
                      src={user.picture}
                      alt="User profile"
                      width={40}
                      height={40}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="avatar">
                      {user?.given_name?.[0]}
                      {user?.family_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-heading-2">
                      {user?.given_name} {user?.family_name}
                    </p>
                    <LogoutLink className="text-subtle">Log out</LogoutLink>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
