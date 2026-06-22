import { ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
