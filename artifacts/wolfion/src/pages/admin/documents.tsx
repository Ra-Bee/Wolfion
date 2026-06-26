import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  classifyKind,
  deleteDocument,
  formatBytes,
  getDocumentBlob,
  listDocuments,
  saveDocument,
  scanifyImage,
  updateDocumentMeta,
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
  Pencil,
  User as UserIcon,
  Calendar,
  Hash,
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type Preview = { id: string; url: string };

type DocGroup = {
  groupId: string;
  customerName: string;
  docDate: string;
  memoNumber: string;
  createdAt: number;
  docs: DocumentMeta[];
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New-document metadata form
  const [customerName, setCustomerName] = useState("");
  const [docDate, setDocDate] = useState(todayISO());
  const [memoNumber, setMemoNumber] = useState("");

  // Gallery view state
  const [galleryGroup, setGalleryGroup] = useState<DocGroup | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Edit group metadata
  const [editGroup, setEditGroup] = useState<DocGroup | null>(null);
  const [editCustomer, setEditCustomer] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMemo, setEditMemo] = useState("");

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
    const groupId = uid();
    const sharedCustomer = customerName.trim();
    const sharedDate = docDate || todayISO();
    const sharedMemo = memoNumber.trim();
    try {
      for (const file of Array.from(files)) {
        let blob: Blob = file;
        let mime = file.type || "application/octet-stream";
        let name = file.name || `file_${Date.now()}`;

        if (asScan && file.type.startsWith("image/")) {
          blob = await scanifyImage(file);
          mime = "image/jpeg";
          const base = name.replace(/\.[^.]+$/, "");
          name = `Scan_${base || sharedDate}.jpg`;
        }

        const meta: DocumentMeta = {
          id: uid(),
          name,
          kind: classifyKind(mime, asScan),
          mimeType: mime,
          size: blob.size,
          createdAt: Date.now(),
          groupId,
          ...(sharedCustomer ? { customerName: sharedCustomer } : {}),
          ...(sharedDate ? { docDate: sharedDate } : {}),
          ...(sharedMemo ? { memoNumber: sharedMemo } : {}),
        };
        await saveDocument(meta, blob);
      }
      await refresh();
      // reset memo number after each save; keep customer/date sticky for quick batch entry
      setMemoNumber("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save document");
    } finally {
      setBusy(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  }

  async function handleDeleteOne(id: string) {
    await deleteDocument(id);
    setPreviews((cur) => {
      const found = cur.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return cur.filter((p) => p.id !== id);
    });
    await refresh();
  }

  async function handleDeleteGroup(group: DocGroup) {
    if (
      !window.confirm(
        `Delete entire entry (${group.docs.length} file${
          group.docs.length === 1 ? "" : "s"
        })? This cannot be undone.`,
      )
    )
      return;
    for (const d of group.docs) await deleteDocument(d.id);
    setPreviews((cur) => {
      const removeIds = new Set(group.docs.map((d) => d.id));
      cur.forEach((p) => {
        if (removeIds.has(p.id)) URL.revokeObjectURL(p.url);
      });
      return cur.filter((p) => !removeIds.has(p.id));
    });
    await refresh();
  }

  async function handleSaveEditGroup() {
    if (!editGroup) return;
    const patch = {
      customerName: editCustomer.trim() || undefined,
      docDate: editDate || undefined,
      memoNumber: editMemo.trim() || undefined,
    };
    for (const d of editGroup.docs) {
      await updateDocumentMeta(d.id, patch);
    }
    setEditGroup(null);
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

  const groups = useMemo<DocGroup[]>(() => {
    const map = new Map<string, DocGroup>();
    for (const d of docs) {
      const key = d.groupId || `__solo_${d.id}`;
      let g = map.get(key);
      if (!g) {
        g = {
          groupId: key,
          customerName: d.customerName ?? "",
          docDate: d.docDate ?? "",
          memoNumber: d.memoNumber ?? "",
          createdAt: d.createdAt,
          docs: [],
        };
        map.set(key, g);
      } else {
        if (!g.customerName && d.customerName) g.customerName = d.customerName;
        if (!g.docDate && d.docDate) g.docDate = d.docDate;
        if (!g.memoNumber && d.memoNumber) g.memoNumber = d.memoNumber;
        if (d.createdAt > g.createdAt) g.createdAt = d.createdAt;
      }
      g.docs.push(d);
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [docs]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      if (g.customerName.toLowerCase().includes(q)) return true;
      if (g.memoNumber.toLowerCase().includes(q)) return true;
      if (g.docDate.toLowerCase().includes(q)) return true;
      return g.docs.some(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.kind.toLowerCase().includes(q) ||
          d.mimeType.toLowerCase().includes(q),
      );
    });
  }, [groups, query]);

  const totals = useMemo(() => {
    const totalBytes = docs.reduce((s, d) => s + d.size, 0);
    return {
      count: docs.length,
      bytes: totalBytes,
      images: docs.filter((d) => d.kind === "image" || d.kind === "scan").length,
      audio: docs.filter((d) => d.kind === "audio").length,
    };
  }, [docs]);

  function openGallery(group: DocGroup, startIndex = 0) {
    setGalleryGroup(group);
    setGalleryIndex(startIndex);
  }

  function openEdit(group: DocGroup) {
    setEditGroup(group);
    setEditCustomer(group.customerName);
    setEditDate(group.docDate);
    setEditMemo(group.memoNumber);
  }

  const galleryDoc = galleryGroup ? galleryGroup.docs[galleryIndex] : null;
  const galleryPreview = galleryDoc
    ? previews.find((p) => p.id === galleryDoc.id)
    : undefined;

  return (
    <AdminLayout>
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Save cash memos, receipts, and other files. Tag with customer, date and
            memo number so you can find them later.
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
              Fill in customer / date / memo number, then upload or scan. Pick
              multiple files at once to keep them together as one entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-customer">Customer name</Label>
                <Input
                  id="doc-customer"
                  placeholder="e.g. Karim"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-date">Date</Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-memo">Memo number</Label>
                <Input
                  id="doc-memo"
                  placeholder="e.g. M-1024"
                  value={memoNumber}
                  onChange={(e) => setMemoNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="default"
                className="h-14 text-base font-semibold"
                onClick={() => uploadInputRef.current?.click()}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Upload file(s)
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
              Pick multiple files in the upload dialog (Ctrl/Cmd-click) to save them as
              one entry with a gallery view.
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
              placeholder="Search by customer, memo number, date, or file name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add customer info above, then upload or scan to get started.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredGroups.map((group) => {
                const first = group.docs[0];
                const Icon = kindIcon(first.kind);
                const firstPreview = previews.find((p) => p.id === first.id);
                const totalSize = group.docs.reduce((s, d) => s + d.size, 0);
                const extras = group.docs.slice(1, 4);
                const more = Math.max(0, group.docs.length - 4);

                return (
                  <Card key={group.groupId} className="overflow-hidden">
                    <div
                      className="aspect-[4/3] bg-muted relative cursor-pointer"
                      onClick={() => openGallery(group, 0)}
                    >
                      {firstPreview ? (
                        <img
                          src={firstPreview.url}
                          alt={first.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Icon className="h-12 w-12" strokeWidth={1.25} />
                          <span className="text-xs uppercase tracking-wide">{first.kind}</span>
                        </div>
                      )}
                      {group.docs.length > 1 ? (
                        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                          {group.docs.length} files
                        </div>
                      ) : null}
                    </div>

                    {group.docs.length > 1 ? (
                      <div className="grid grid-cols-4 gap-1 p-1 bg-muted/30">
                        {extras.map((d, i) => {
                          const p = previews.find((pv) => pv.id === d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => openGallery(group, i + 1)}
                              className="aspect-square bg-muted overflow-hidden rounded"
                            >
                              {p ? (
                                <img
                                  src={p.url}
                                  alt={d.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <FileIcon className="h-5 w-5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                        {more > 0 ? (
                          <button
                            type="button"
                            onClick={() => openGallery(group, 4)}
                            className="aspect-square rounded bg-black/70 text-white text-sm font-semibold"
                          >
                            +{more}
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    <CardContent className="pt-3 space-y-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 font-semibold">
                          <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {group.customerName || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {group.docDate
                              ? new Date(group.docDate).toLocaleDateString()
                              : new Date(group.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Hash className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {group.memoNumber || "no memo"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">
                          {group.docs.length} file
                          {group.docs.length === 1 ? "" : "s"} · {formatBytes(totalSize)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openGallery(group, 0)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(group)}
                          aria-label="Edit entry"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteGroup(group)}
                          aria-label="Delete entry"
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

        {/* Gallery viewer */}
        <Dialog
          open={galleryGroup !== null}
          onOpenChange={(o) => !o && setGalleryGroup(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {galleryGroup?.customerName || "Document"}
                {galleryGroup?.memoNumber ? ` · ${galleryGroup.memoNumber}` : ""}
              </DialogTitle>
              <DialogDescription>
                {galleryGroup
                  ? `${galleryIndex + 1} of ${galleryGroup.docs.length} · ${
                      galleryGroup.docDate
                        ? new Date(galleryGroup.docDate).toLocaleDateString()
                        : ""
                    }`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            {galleryDoc ? (
              <div className="space-y-3">
                <div className="bg-muted rounded flex items-center justify-center min-h-[260px]">
                  {galleryPreview ? (
                    <img
                      src={galleryPreview.url}
                      alt={galleryDoc.name}
                      className="max-h-[60vh] w-auto rounded"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <FileIcon className="h-12 w-12 mx-auto" strokeWidth={1.25} />
                      <p className="mt-2 text-sm">{galleryDoc.name}</p>
                      <p className="text-xs">
                        Preview not available — download or open to view.
                      </p>
                    </div>
                  )}
                </div>
                {galleryGroup && galleryGroup.docs.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryGroup.docs.map((d, i) => {
                      const p = previews.find((pv) => pv.id === d.id);
                      const active = i === galleryIndex;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setGalleryIndex(i)}
                          className={`h-16 w-16 shrink-0 rounded border-2 overflow-hidden bg-muted ${
                            active ? "border-primary" : "border-transparent"
                          }`}
                        >
                          {p ? (
                            <img
                              src={p.url}
                              alt={d.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <FileIcon className="h-5 w-5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {galleryDoc.name} · {formatBytes(galleryDoc.size)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpen(galleryDoc)}>
                      Open
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(galleryDoc)}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Delete this file from the entry? This cannot be undone.",
                          )
                        )
                          return;
                        const id = galleryDoc.id;
                        await handleDeleteOne(id);
                        if (galleryGroup) {
                          const remaining = galleryGroup.docs.filter((x) => x.id !== id);
                          if (remaining.length === 0) {
                            setGalleryGroup(null);
                          } else {
                            const nextIndex = Math.min(galleryIndex, remaining.length - 1);
                            setGalleryGroup({ ...galleryGroup, docs: remaining });
                            setGalleryIndex(nextIndex);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Edit group metadata */}
        <Dialog open={editGroup !== null} onOpenChange={(o) => !o && setEditGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit entry details</DialogTitle>
              <DialogDescription>
                Update customer, date and memo number for all files in this entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-customer">Customer name</Label>
                <Input
                  id="edit-customer"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-memo">Memo number</Label>
                <Input
                  id="edit-memo"
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditGroup}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
