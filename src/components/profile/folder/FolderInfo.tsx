
interface FolderInfoProps {
  title: string;
  subtitle?: string;
  cardsCount: number;
}

export function FolderInfo({ title, subtitle, cardsCount }: FolderInfoProps) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-base font-medium">
          {title} ({cardsCount})
        </h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground">
            {subtitle.replace('Created by ', '')}
          </span>
        )}
      </div>
    </div>
  );
}
