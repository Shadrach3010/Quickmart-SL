"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

const themes = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme = "system", setTheme } = useTheme();
  const current = themes.includes(theme as (typeof themes)[number])
    ? (theme as (typeof themes)[number])
    : "system";
  const visibleTheme = mounted ? current : "system";
  const next = themes[(themes.indexOf(visibleTheme) + 1) % themes.length];
  const Icon = visibleTheme === "system" ? Laptop : visibleTheme === "dark" ? Moon : Sun;

  return (
    <Button
      aria-label={`Theme: ${visibleTheme}. Switch to ${next}.`}
      className="rounded-full"
      disabled={!mounted}
      onClick={() => setTheme(next)}
      size="icon"
      title={`Theme: ${visibleTheme}`}
      variant="ghost"
    >
      <Icon />
    </Button>
  );
}
