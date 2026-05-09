import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  classifyKind,
  deleteDocument,
  formatBytes,
  getDocumentBlob,
  listDocuments,
  saveDocument,
  scanifyImage,
  type DocumentMeta,
} from "@/lib/documents-store";
import {
  Upload,
  ScanLine,
  Trash2,
  Download,
  Search,
  ImageIcon,
  Music2,
  FileText,
  Video,
  File as FileIcon,
  Loader2,
} from "lucide-react";

function kindIcon(kind: DocumentMeta["kind"]) {
  switch (kind) {
    case "image":
    case "scan":
      return ImageIcon;
    case "audio":
      return Music2;
    case "pdf":
      return FileText;
    case "video":
      return Video;
    default:
      return FileIcon;
  }
}

function uid() {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type Preview = { id: string; url: string };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const scanInputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const list = await listDocuments();
      setDocs(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Build preview URLs for image-like docs
  useEffect(() => {
    let active = true;
    const created: Preview[] = [];
    (async () => {
      for (const d of docs) {
        if (d.kind !== "image" && d.kind !== "scan") continue;
        if (previews.find((p) => p.id === d.id)) continue;
        const blob = await getDocumentBlob(d.id);
        if (!active || !blob) continue;
        created.push({ id: d.id, url: URL.createObjectURL(blob) });
      }
      if (active && created.length) {
        setPreviews((cur) => [...cur, ...created]);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiles(files: FileList | null, asScan = false) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        let blob: Blob = file;
        let mime = file.type || "application/octet-stream";
        let name = file.name || `file_${Date.now()}`;

        if (asScan && file.type.startsWith("image/")) {
          blob = await scanifyImage(file);
          mime = "image/jpeg";
          const base = name.replace(/\.[^.]+$/, "");
          name = `Scan_${base || new Date().toISOString().slice(0, 10)}.jpg`;
        }

        const meta: DocumentMeta = {
          id: uid(),
          name,
          kind: classifyKind(mime, asScan),
          mimeType: mime,
          size: blob.size,
          createdAt: Date.now(),
        };
        await saveDocument(meta, blob);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save document");
    } finally {
      setBusy(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    await deleteDocument(id);
    setPreviews((cur) => {
      const found = cur.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return cur.filter((p) => p.id !== id);
    });
    await refresh();
  }

  async function handleDownload(doc: DocumentMeta) {
    const blob = await getDocumentBlob(doc.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleOpen(doc: DocumentMeta) {
    const blob = await getDocumentBlob(doc.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.kind.toLowerCase().includes(q) ||
        d.mimeType.toLowerCase().includes(q),
    );
  }, [docs, query]);

  const totals = useMemo(() => {
    const totalBytes = docs.reduce((s, d) => s + d.size, 0);
    return {
      count: docs.length,
      bytes: totalBytes,
      images: docs.filter((d) => d.kind === "image" || d.kind === "scan").length,
      audio: docs.filter((d) => d.kind === "audio").length,
    };
  }, [docs]);

  return (
    <AdminLayout>
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload photos, audio, or any file. Or scan a paper document with your phone camera.
            Everything is saved on this device.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total files</p>
            <p className="mt-1 text-2xl font-bold">{totals.count}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Storage used</p>
            <p className="mt-1 text-2xl font-bold">{formatBytes(totals.bytes)}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Images / scans</p>
            <p className="mt-1 text-2xl font-bold">{totals.images}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Audio</p>
            <p className="mt-1 text-2xl font-bold">{totals.audio}</p>
          </CardContent></Card>
        </div>

        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Add a document</CardTitle>
            <CardDescription>
              Upload from your device, or use Scan to take a clean photo of a paper document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="default"
                className="h-14 text-base font-semibold"
                onClick={() => uploadInputRef.current?.click()}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Upload file
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base font-semibold"
                onClick={() => scanInputRef.current?.click()}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
                Scan with camera
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepts photos, audio, PDFs, videos and any other file. Scans are auto-cleaned for
              readability and saved as JPG.
            </p>
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, false)}
            />
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, true)}
            />
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-12 text-base"
              placeholder="Search by name or type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a file or scan a paper to get started.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((doc) => {
                const Icon = kindIcon(doc.kind);
                const preview = previews.find((p) => p.id === doc.id);
                return (
                  <Card key={doc.id} className="overflow-hidden">
                    <div
                      className="aspect-[4/3] bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => handleOpen(doc)}
                    >
                      {preview ? (
                        <img
                          src={preview.url}
                          alt={doc.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Icon className="h-12 w-12" strokeWidth={1.25} />
                          <span className="text-xs uppercase tracking-wide">{doc.kind}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-3 space-y-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.size)} · {new Date(doc.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" /> Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(doc.id)}
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
