import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import {
  buildInvitationRegisterPath,
  getInvitationCode,
} from "@/lib/invitation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    auth_error?: string;
    invitation_code?: string;
    code?: string;
  }>;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const { auth_error, invitation_code, code } = await searchParams;

  // If the URL carries an invitation code, start the invited-registration flow.
  const invitationCode = getInvitationCode({ invitation_code, code });
  if (invitationCode) {
    redirect(buildInvitationRegisterPath(invitationCode));
  }

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
