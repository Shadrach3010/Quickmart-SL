import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Access denied
        </p>
        <h1 className="text-3xl font-semibold">This area is not for your role.</h1>
        <p className="text-muted-foreground">
          Your account is signed in, but it does not have permission to open
          this section.
        </p>
        <Link className="underline underline-offset-4" href={ROUTES.authRedirect}>
          Go to my dashboard
        </Link>
      </div>
    </main>
  );
}
