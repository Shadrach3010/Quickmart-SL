import type { LayoutProps } from "@/types";

export function AuthLayout({ children }: LayoutProps) {
  return (
    <main className="relative grid min-h-screen overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 size-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative z-10 m-auto w-full max-w-md">{children}</div>
    </main>
  );
}
