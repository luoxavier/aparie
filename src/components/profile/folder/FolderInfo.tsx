interface FolderInfoProps {
  title: string;
  subtitle?: string;
  cardsCount: number;
}

export function FolderInfo({ title, subtitle, cardsCount }: FolderInfoProps) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-base font-medium">
          {title}
          <span className="text-sm text-muted-foreground ml-2">
            ({cardsCount} cards)
          </span>
        </h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}