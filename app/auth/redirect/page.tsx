import { redirect } from "next/navigation";
import { redirectToRoleHome } from "@/lib/auth/redirects";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants/routes";

export default async function AuthRedirectPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(ROUTES.signIn);
  }
  redirectToRoleHome(profile.role);
}
