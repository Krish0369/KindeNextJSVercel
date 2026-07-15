import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    auth_error?: string;
  }>;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const { auth_error } = await searchParams;

  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <div className="container home-intro">
      {auth_error ? (
        <p className="text-body-3">
          Your previous session expired or could not be read. Please sign in again.
        </p>
      ) : null}
    </div>
  );
}
