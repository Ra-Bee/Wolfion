import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface PhotoViewerProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DESKTOP_ZOOM = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PhotoViewer({ src, alt, open, onClose }: PhotoViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const lastPointerType = useRef<string>("mouse");

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [animating, setAnimating] = useState(true);

  const touchState = useRef<{
    mode: "none" | "pinch" | "pan";
    initialDistance: number;
    initialScale: number;
    initialTranslate: { x: number; y: number };
    lastPoint: { x: number; y: number } | null;
  }>({
    mode: "none",
    initialDistance: 0,
    initialScale: 1,
    initialTranslate: { x: 0, y: 0 },
    lastPoint: null,
  });

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setOrigin({ x: 50, y: 50 });
      setAnimating(true);
    }
  }, [open]);

  // Lock body scroll while open and restore exact scroll position on close
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Esc key closes the viewer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const distance = (a: React.Touch, b: React.Touch): number => {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleImagePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    lastPointerType.current = e.pointerType || "mouse";
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    // Click-to-zoom is only for mouse / pen (desktop). Touch uses pinch.
    if (lastPointerType.current === "touch") return;
    if (touchState.current.mode !== "none") return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnimating(true);
    if (scale === 1) {
      setOrigin({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
      setTranslate({ x: 0, y: 0 });
      setScale(DESKTOP_ZOOM);
    } else {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale === 1) return;
    if (lastPointerType.current === "touch") return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchState.current = {
        mode: "pinch",
        initialDistance: distance(t1, t2),
        initialScale: scale,
        initialTranslate: { ...translate },
        lastPoint: null,
      };
      setAnimating(false);
      // Pinch always zooms relative to image center
      setOrigin({ x: 50, y: 50 });
    } else if (e.touches.length === 1 && scale > 1) {
      touchState.current = {
        mode: "pan",
        initialDistance: 0,
        initialScale: scale,
        initialTranslate: { ...translate },
        lastPoint: { x: e.touches[0].clientX, y: e.touches[0].clientY },
      };
      setAnimating(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchState.current.mode === "pinch" && e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDistance = distance(t1, t2);
      if (touchState.current.initialDistance === 0) return;
      const ratio = newDistance / touchState.current.initialDistance;
      const newScale = clamp(
        touchState.current.initialScale * ratio,
        MIN_SCALE,
        MAX_SCALE,
      );
      setScale(newScale);
    } else if (
      touchState.current.mode === "pan" &&
      e.touches.length === 1 &&
      touchState.current.lastPoint
    ) {
      const dx = e.touches[0].clientX - touchState.current.lastPoint.x;
      const dy = e.touches[0].clientY - touchState.current.lastPoint.y;
      setTranslate({
        x: touchState.current.initialTranslate.x + dx,
        y: touchState.current.initialTranslate.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      touchState.current.mode = "none";
      // Snap back if essentially unzoomed
      if (scale <= 1.02) {
        setAnimating(true);
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      // Transitioned from pinch to single finger — switch to pan if still zoomed
      if (scale > 1) {
        touchState.current = {
          mode: "pan",
          initialDistance: 0,
          initialScale: scale,
          initialTranslate: { ...translate },
          lastPoint: {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          },
        };
      } else {
        touchState.current.mode = "none";
      }
    }
  };

  const transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  const transformOrigin = `${origin.x}% ${origin.y}%`;
  const cursorClass =
    scale === 1 ? "cursor-zoom-in" : "cursor-zoom-out";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product photo viewer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ touchAction: "none" }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-testid="photo-viewer"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 h-11 w-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-colors"
        aria-label="Close photo viewer"
        data-testid="photo-viewer-close"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onPointerDown={handleImagePointerDown}
        onClick={handleImageClick}
        className={`max-h-[90vh] max-w-[92vw] select-none will-change-transform ${cursorClass}`}
        style={{
          transform,
          transformOrigin,
          transition: animating ? "transform 300ms ease-out" : "none",
          touchAction: "none",
        }}
        data-testid="photo-viewer-image"
      />
    </div>
  );
}
