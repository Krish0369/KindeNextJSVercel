
import "./globals.css";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";

export const metadata = {
  title: "Kinde Auth",
  description: "Kinde with NextJS App Router",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();
  return (
    <html lang="en">
      <body>
        <header>
          <nav className="nav container">
            <h1 className="text-display-3">KindeAuth</h1>
            <div className="flex flex-col gap-3">
              {!(await isAuthenticated()) ? (
                <>
                  <LoginLink className="btn btn-ghost sign-in-btn mr-4">
                    Sign in
                  </LoginLink>

                  <LoginLink orgCode="org_4be1cd496a53d" className="btn btn-ghost sign-in-btn mr-4">
                    Signin to Live
                  </LoginLink>
                  <Link href="/api/auth/register?pricing_table_key=user_plan" className="btn btn-dark mr-4">
                    Sign up User
                  </Link>
                  {/* Organization sign-up with billing plan */}
                  <Link 
                    href="/api/auth/register?is_create_org=true&pricing_table_key=organization_plans"
                    className="btn btn-dark"
                  >
                    Sign Up Org And User
                  </Link>
                  
                </>
              ) : (
                <div className="profile-blob">
                  {user?.picture ? (
                    <img
                      className="avatar"
                      src={user?.picture}
                      alt="user profile avatar"
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
        <footer className="footer">
          <div className="container">
            <strong className="text-heading-2">KindeAuth</strong>
            <p className="footer-tagline text-body-3">
              Visit our{" "}
              <Link className="link" href="https://kinde.com/docs">
                help center
              </Link>
            </p>
            <small className="text-subtle">
              © 2023 KindeAuth, Inc. All rights reserved
            </small>
          </div>
        </footer>
      </body>
    </html>
  );
}