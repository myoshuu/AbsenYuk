"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ui/theme-provider";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
