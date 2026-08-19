import type { ComponentType, ReactNode } from "react";
import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}
    >
      <div className="rounded-full bg-primary/10 p-4 mb-3">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          type="button"
          size="sm"
          className="mt-4 h-10"
          onClick={onAction}
        >
          <Plus className="h-4 w-4 mr-1" /> {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
