import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_RECEIPT_DIM = 1280;
const RECEIPT_QUALITY = 0.7;

async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read image"));
    el.src = dataUrl;
  });
  let { width, height } = img;
  if (width > MAX_RECEIPT_DIM || height > MAX_RECEIPT_DIM) {
    const scale = Math.min(MAX_RECEIPT_DIM / width, MAX_RECEIPT_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", RECEIPT_QUALITY);
}

type Props = {
  value?: string;
  onChange: (next: string | undefined) => void;
  label?: string;
  className?: string;
};

export function ReceiptCapture({ value, onChange, label = "Receipt / Bill photo (optional)", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [view, setView] = useState(false);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const c = await compressImage(file);
      onChange(c);
    } catch {
      setErr("Could not read image. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={pick}
      />
      {value ? (
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setView(true)}
            className="block border rounded-md overflow-hidden shrink-0"
          >
            <img src={value} alt="Receipt preview" className="h-20 w-20 object-cover" />
          </button>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Camera className="h-4 w-4 mr-1" /> Retake
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Camera className="h-5 w-5 mr-2" />
          {busy ? "Processing..." : "Scan receipt / bill with camera"}
        </Button>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}

      <Dialog open={view} onOpenChange={setView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {value ? <img src={value} alt="Receipt" className="w-full h-auto rounded" /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ThumbProps = {
  src?: string;
  size?: number;
};

export function ReceiptThumb({ src, size = 24 }: ThumbProps) {
  const [open, setOpen] = useState(false);
  if (!src) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border rounded overflow-hidden block"
      >
        <img
          src={src}
          alt="Receipt"
          style={{ width: size, height: size }}
          className="object-cover"
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          <img src={src} alt="Receipt" className="w-full h-auto rounded" />
        </DialogContent>
      </Dialog>
    </>
  );
}
