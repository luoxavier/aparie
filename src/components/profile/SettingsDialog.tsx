import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem('soundEnabled') === 'true'
  );
  const [vibrationEnabled, setVibrationEnabled] = useState(() => 
    localStorage.getItem('vibrationEnabled') === 'true'
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Get stored theme from localStorage or default to 'light'
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, [setTheme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle("dark");
  };

  // Handle sound toggle
  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('soundEnabled', checked.toString());
  };

  // Handle vibration toggle
  const handleVibrationToggle = (checked: boolean) => {
    setVibrationEnabled(checked);
    localStorage.setItem('vibrationEnabled', checked.toString());
    if (checked) {
      // Test vibration
      navigator.vibrate?.(200);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Settings className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sound Effects</Label>
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="vibration-enabled">Vibration</Label>
            <Switch
              id="vibration-enabled"
              checked={vibrationEnabled}
              onCheckedChange={handleVibrationToggle}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}