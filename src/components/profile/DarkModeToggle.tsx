
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and initialize theme
  useEffect(() => {
    setMounted(true);
    // Get stored theme from localStorage or default to 'light'
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    // Ensure the class is set on initial load
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, [setTheme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle("dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative"
    >
      <Sun className={`h-5 w-5 transition-all scale-100 rotate-0 ${theme === 'dark' ? 'scale-0 rotate-90' : ''}`} />
      <Moon className={`absolute h-5 w-5 transition-all scale-0 rotate-90 ${theme === 'dark' ? 'scale-100 rotate-0' : ''}`} />
    </Button>
  );
}
