import { useCallback, useRef, useState } from "react";

const FLICKER_GUARD_MS = 400;

export function useStableDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const lastOpenedAt = useRef(0);

  const handleOpenChange = useCallback((next: boolean) => {
    const now = Date.now();
    if (!next && now - lastOpenedAt.current < FLICKER_GUARD_MS) {
      return;
    }
    if (next) {
      lastOpenedAt.current = now;
    }
    setOpen(next);
  }, []);

  return [open, handleOpenChange] as const;
}
