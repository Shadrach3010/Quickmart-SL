export { requireRole, requireUser } from "@/lib/auth/guards";
export {
  getRoleHomeRoute,
  isAppRole,
} from "@/lib/auth/roles";
export { redirectToRoleHome, redirectToSignIn } from "@/lib/auth/redirects";
export { SignInForm } from "@/features/auth/components/sign-in-form";
export { SignUpForm } from "@/features/auth/components/sign-up-form";
export { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
export { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
export { setUserRole } from "@/lib/auth/role-management";
export {
  useCurrentRole,
  useCurrentUser,
  useRoleGuard,
  useRoleHome,
} from "@/hooks/use-auth";
