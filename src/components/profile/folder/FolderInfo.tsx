
import React from "react";

interface FolderInfoProps {
  title: string;
  subtitle?: string;
  cardsCount: number;
}

export function FolderInfo({ title, subtitle, cardsCount }: FolderInfoProps) {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center">
        <h3 className="text-base font-medium truncate">{title}</h3>
        <span className="text-xs ml-2 text-muted-foreground whitespace-nowrap">
          ({cardsCount} {cardsCount === 1 ? "card" : "cards"})
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground truncate">
          by {subtitle}
        </p>
      )}
    </div>
  );
}
