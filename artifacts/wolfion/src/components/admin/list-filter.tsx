import { useMemo, useState } from "react";
import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ListFilterState = {
  search: string;
  from: string;
  to: string;
};

export function useListFilter(): [
  ListFilterState,
  React.Dispatch<React.SetStateAction<ListFilterState>>,
  (date: string, ...haystack: string[]) => boolean,
] {
  const [state, setState] = useState<ListFilterState>({
    search: "",
    from: "",
    to: "",
  });
  const matches = useMemo(() => {
    const q = state.search.trim().toLowerCase();
    return (date: string, ...haystack: string[]) => {
      if (state.from && date && date < state.from) return false;
      if (state.to && date && date > state.to) return false;
      if (!q) return true;
      return haystack.some((s) => s && s.toLowerCase().includes(q));
    };
  }, [state.search, state.from, state.to]);
  return [state, setState, matches];
}

type Props = {
  state: ListFilterState;
  onChange: React.Dispatch<React.SetStateAction<ListFilterState>>;
  searchPlaceholder?: string;
  showDateRange?: boolean;
  className?: string;
};

export function ListFilter({
  state,
  onChange,
  searchPlaceholder = "Search...",
  showDateRange = true,
  className = "",
}: Props) {
  const [dateOpen, setDateOpen] = useState(false);
  const hasFilter = Boolean(state.search || state.from || state.to);
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={state.search}
            onChange={(e) =>
              onChange((s) => ({ ...s, search: e.target.value }))
            }
            placeholder={searchPlaceholder}
            className="h-10 pl-9 pr-9"
          />
          {state.search ? (
            <button
              type="button"
              onClick={() => onChange((s) => ({ ...s, search: "" }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {showDateRange ? (
          <Button
            type="button"
            variant={state.from || state.to ? "default" : "outline"}
            size="sm"
            className="h-10 px-3"
            onClick={() => setDateOpen((v) => !v)}
          >
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Dates</span>
          </Button>
        ) : null}
        {hasFilter ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 px-2 text-muted-foreground"
            onClick={() =>
              onChange({ search: "", from: "", to: "" })
            }
          >
            Clear
          </Button>
        ) : null}
      </div>
      {showDateRange && dateOpen ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <Input
              type="date"
              value={state.from}
              onChange={(e) =>
                onChange((s) => ({ ...s, from: e.target.value }))
              }
              className="h-10"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              To
            </label>
            <Input
              type="date"
              value={state.to}
              onChange={(e) =>
                onChange((s) => ({ ...s, to: e.target.value }))
              }
              className="h-10"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
