"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input className="h-11 pr-11" type={visible ? "text" : "password"} {...props} />
      <Button
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-0.5 text-muted-foreground"
        onClick={() => setVisible((value) => !value)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
