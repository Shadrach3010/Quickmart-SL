import type { LayoutProps } from "@/types";

interface AppShellProps extends LayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({ children, header, sidebar }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
