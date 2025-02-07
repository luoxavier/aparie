
import { useEffect, useState } from "react";
import { ArrowDownRight } from "lucide-react";

export function AnimatedFeedbackPointer() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 10000); // Hide after 10 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-12 z-50 animate-bounce">
      <ArrowDownRight className="h-8 w-8 text-primary animate-pulse" />
      <p className="text-sm text-muted-foreground mt-1">Click to continue</p>
    </div>
  );
}
