
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "container mx-auto py-4 px-4 max-w-7xl",
      isMobile && "pt-11",
      className
    )}>
      {children}
    </div>
  );
}
