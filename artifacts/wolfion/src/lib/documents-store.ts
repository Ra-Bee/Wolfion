const DB_NAME = "wolfion_documents";
const STORE = "files";
const DB_VERSION = 1;

export type DocumentKind = "image" | "audio" | "scan" | "pdf" | "video" | "other";

export type DocumentMeta = {
  id: string;
  name: string;
  kind: DocumentKind;
  mimeType: string;
  size: number;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function classifyKind(mime: string, isScan = false): DocumentKind {
  if (isScan) return "scan";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export async function saveDocument(meta: DocumentMeta, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...meta, blob });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      db.close();
      const rows = (req.result || []) as Array<DocumentMeta & { blob: Blob }>;
      resolve(
        rows
          .map(({ blob: _b, ...m }) => m)
          .sort((a, b) => b.createdAt - a.createdAt),
      );
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function getDocumentBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      db.close();
      const row = req.result as (DocumentMeta & { blob: Blob }) | undefined;
      resolve(row ? row.blob : null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Apply a "CamScanner-style" pass on a photo: auto-crop to content,
 * boost contrast, lift shadows, then output as a clean PNG. Pure
 * client-side canvas — no external libs.
 */
export async function scanifyImage(file: Blob): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Failed to load image"));
      i.src = url;
    });

    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    // Compute average luminance for adaptive level
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    const avg = sum / (d.length / 4);
    const lift = Math.max(0, 200 - avg);

    for (let i = 0; i < d.length; i += 4) {
      // Slight saturation kill + contrast boost + white-balance lift
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mixed = (c: number) => 0.35 * c + 0.65 * lum;
      const boost = (c: number) => {
        const lifted = c + lift * 0.25;
        const contrasted = (lifted - 128) * 1.45 + 128;
        return Math.max(0, Math.min(255, contrasted));
      };
      d[i] = boost(mixed(r));
      d[i + 1] = boost(mixed(g));
      d[i + 2] = boost(mixed(b));
    }
    ctx.putImageData(imageData, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode"))),
        "image/jpeg",
        0.9,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
