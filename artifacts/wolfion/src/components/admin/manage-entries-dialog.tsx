import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import {
  hasAdminPin,
  setAdminPin,
  verifyAdminPin,
} from "@/lib/admin-pin";

export type ManageColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export type EditField<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "date";
  placeholder?: string;
};

type Props<T extends { id: string }> = {
  title: string;
  description?: string;
  triggerLabel?: string;
  entries: T[];
  columns: ManageColumn<T>[];
  onDelete: (id: string) => void;
  /** Custom edit handler — overrides built-in editFields form if provided. */
  onEdit?: (row: T) => void;
  /** Declarative inline edit. When set (and onEdit is not), pencil opens a form for these fields. */
  editFields?: EditField<T>[];
  /** Called when the user saves the inline edit form. Page should apply patch + recompute derived fields. */
  onSave?: (id: string, patch: Partial<T>) => void;
  emptyText?: string;
};

export function ManageEntriesDialog<T extends { id: string }>({
  title,
  description,
  triggerLabel = "Edit entries",
  entries,
  columns,
  onDelete,
  onEdit,
  editFields,
  onSave,
  emptyText = "No saved entries yet.",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);

  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState("");
  const [pendingEditPatch, setPendingEditPatch] = useState<{ id: string; patch: Partial<T> } | null>(null);

  const canInlineEdit = !onEdit && editFields && editFields.length > 0 && onSave;
  const confirmMode: "delete" | "edit" | null = confirmId !== null ? "delete" : pendingEditPatch !== null ? "edit" : null;

  useEffect(() => {
    if (editingRow && editFields) {
      const init: Record<string, string> = {};
      for (const f of editFields) {
        const v = (editingRow as unknown as Record<string, unknown>)[f.key];
        init[f.key] = v === undefined || v === null ? "" : String(v);
      }
      setEditValues(init);
      setEditError("");
    }
  }, [editingRow, editFields]);

  // When confirm dialog opens, decide whether user needs to set up a PIN.
  useEffect(() => {
    if (confirmMode !== null) {
      setNeedsSetup(!hasAdminPin());
      setPin("");
      setPinConfirm("");
      setVerifyError("");
      setVerifying(false);
    }
  }, [confirmMode]);

  const closeConfirm = () => {
    setConfirmId(null);
    setPendingEditPatch(null);
    setPin("");
    setPinConfirm("");
    setVerifyError("");
    setVerifying(false);
    setNeedsSetup(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmId && !pendingEditPatch) return;
    if (!pin || pin.length < 4) {
      setVerifyError("PIN must be at least 4 digits.");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    try {
      if (needsSetup) {
        if (pin !== pinConfirm) {
          setVerifyError("PINs do not match.");
          setVerifying(false);
          return;
        }
        await setAdminPin(pin);
      } else {
        const ok = await verifyAdminPin(pin);
        if (!ok) {
          setVerifyError("Wrong PIN.");
          setVerifying(false);
          return;
        }
      }
      if (confirmId) {
        onDelete(confirmId);
      } else if (pendingEditPatch && onSave) {
        onSave(pendingEditPatch.id, pendingEditPatch.patch);
        setEditingRow(null);
      }
      closeConfirm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not verify PIN.";
      setVerifyError(msg);
      setVerifying(false);
    }
  };

  const handleSaveEdit = () => {
    if (!editingRow || !editFields || !onSave) return;
    const patch: Record<string, unknown> = {};
    for (const f of editFields) {
      const raw = editValues[f.key] ?? "";
      if (f.type === "number") {
        if (raw === "") {
          setEditError(`${f.label} is required.`);
          return;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          setEditError(`${f.label} must be a number.`);
          return;
        }
        patch[f.key] = n;
      } else {
        if (raw.trim() === "") {
          setEditError(`${f.label} is required.`);
          return;
        }
        patch[f.key] = f.type === "text" ? raw.trim() : raw;
      }
    }
    setPendingEditPatch({ id: editingRow.id, patch: patch as Partial<T> });
  };

  const handlePencilClick = (row: T) => {
    if (onEdit) {
      onEdit(row);
      setOpen(false);
    } else if (canInlineEdit) {
      setEditingRow(row);
    }
  };

  const showPencil = Boolean(onEdit || canInlineEdit);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" type="button">
            {triggerLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {emptyText}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {columns.map((c, i) => (
                      <th key={i} className={`text-left py-2 pr-3 ${c.className ?? ""}`}>
                        {c.header}
                      </th>
                    ))}
                    <th className="text-right py-2 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      {columns.map((c, i) => (
                        <td key={i} className={`py-2 pr-3 align-top ${c.className ?? ""}`}>
                          {c.render(row)}
                        </td>
                      ))}
                      <td className="py-2 text-right whitespace-nowrap">
                        {showPencil ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8"
                            aria-label="Edit"
                            onClick={() => handlePencilClick(row)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="h-8 w-8 text-destructive"
                          aria-label="Delete"
                          onClick={() => setConfirmId(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {canInlineEdit ? (
        <Dialog
          open={editingRow !== null}
          onOpenChange={(o) => {
            if (!o) {
              setEditingRow(null);
              setEditError("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit entry</DialogTitle>
              <DialogDescription>
                Change any field and save. Other linked totals will update.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {editFields!.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={`edit-${f.key}`}>{f.label}</Label>
                  <Input
                    id={`edit-${f.key}`}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    step={f.type === "number" ? "0.01" : undefined}
                    value={editValues[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => {
                      setEditValues((v) => ({ ...v, [f.key]: e.target.value }));
                      if (editError) setEditError("");
                    }}
                  />
                </div>
              ))}
              {editError ? (
                <p className="text-sm text-destructive">{editError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditingRow(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveEdit}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      <AlertDialog
        open={confirmMode !== null}
        onOpenChange={(o) => !o && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {needsSetup
                ? "Set your Admin PIN"
                : confirmMode === "edit"
                ? "Confirm edit with PIN"
                : "Confirm delete with PIN"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {needsSetup
                ? "Create a PIN (at least 4 digits). You will need it for every edit or delete from now on. Keep it secret."
                : confirmMode === "edit"
                ? "Enter your Admin PIN to save these changes."
                : "Enter your Admin PIN to permanently delete this entry. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="admin-pin">{needsSetup ? "New PIN" : "PIN"}</Label>
            <Input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              disabled={verifying}
              onChange={(e) => {
                setPin(e.target.value);
                if (verifyError) setVerifyError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !verifying && !needsSetup) {
                  e.preventDefault();
                  handleConfirmAction();
                }
              }}
              placeholder="Enter PIN"
            />
            {needsSetup ? (
              <>
                <Label htmlFor="admin-pin-confirm">Confirm PIN</Label>
                <Input
                  id="admin-pin-confirm"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pinConfirm}
                  disabled={verifying}
                  onChange={(e) => {
                    setPinConfirm(e.target.value);
                    if (verifyError) setVerifyError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !verifying) {
                      e.preventDefault();
                      handleConfirmAction();
                    }
                  }}
                  placeholder="Re-enter PIN"
                />
              </>
            ) : null}
            {verifyError ? (
              <p className="text-sm text-destructive">{verifyError}</p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifying} onClick={closeConfirm}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant={confirmMode === "edit" || needsSetup ? "default" : "destructive"}
              disabled={verifying || !pin || (needsSetup && !pinConfirm)}
              onClick={handleConfirmAction}
            >
              {verifying
                ? "Working..."
                : needsSetup
                ? "Save PIN & continue"
                : confirmMode === "edit"
                ? "Confirm save"
                : "Confirm delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
