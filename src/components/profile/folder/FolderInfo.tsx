
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
        <h3 className="text-base font-medium line-clamp-2 mr-2">{title}</h3>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          ({cardsCount})
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground truncate">
          {subtitle.replace('Created by ', '')}
        </p>
      )}
    </div>
  );
}
