import { useEffect, useState, type ReactNode } from "react";
import { useUser } from "@clerk/react";
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
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editError, setEditError] = useState("");

  const canInlineEdit = !onEdit && editFields && editFields.length > 0 && onSave;

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

  const closeConfirm = () => {
    setConfirmId(null);
    setPassword("");
    setVerifyError("");
    setVerifying(false);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    if (!password) {
      setVerifyError("Enter your login password to confirm.");
      return;
    }
    if (!user) {
      setVerifyError("Not signed in.");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    try {
      const res = await (
        user as unknown as {
          verifyPassword: (p: { password: string }) => Promise<{ verified: boolean }>;
        }
      ).verifyPassword({ password });
      if (!res.verified) {
        setVerifyError("Wrong password.");
        setVerifying(false);
        return;
      }
      onDelete(confirmId);
      closeConfirm();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not verify password.";
      setVerifyError(msg.includes("password") ? "Wrong password." : msg);
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
    onSave(editingRow.id, patch as Partial<T>);
    setEditingRow(null);
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
        open={confirmId !== null}
        onOpenChange={(o) => !o && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete with password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your login password to permanently delete this entry. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-pw">Password</Label>
            <Input
              id="delete-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={verifying}
              onChange={(e) => {
                setPassword(e.target.value);
                if (verifyError) setVerifyError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !verifying) {
                  e.preventDefault();
                  handleConfirmDelete();
                }
              }}
              placeholder="Your account password"
            />
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
              variant="destructive"
              disabled={verifying || !password}
              onClick={handleConfirmDelete}
            >
              {verifying ? "Verifying..." : "Confirm delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
