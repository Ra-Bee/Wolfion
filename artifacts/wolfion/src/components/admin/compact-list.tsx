import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  previewCount?: number;
  emptyText?: string;
  emptyHint?: string;
};

export function CompactList<T>({
  items,
  keyOf,
  renderItem,
  previewCount = 2,
  emptyText = "No entries yet",
  emptyHint,
}: Props<T>) {
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-5 text-center">
        <p className="text-sm font-medium">{emptyText}</p>
        {emptyHint ? <p className="text-xs text-muted-foreground mt-1">{emptyHint}</p> : null}
      </div>
    );
  }

  const visible = showAll ? items : items.slice(0, previewCount);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border divide-y overflow-hidden bg-card/60">
        {visible.map((item) => (
          <div key={keyOf(item)} className="px-3 py-2 text-sm">
            {renderItem(item)}
          </div>
        ))}
      </div>
      {items.length > previewCount && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show less" : `See more (${items.length - previewCount})`}
        </Button>
      )}
    </div>
  );
}
