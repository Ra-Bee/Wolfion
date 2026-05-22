import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type ManageColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type Props<T extends { id: string }> = {
  title: string;
  description?: string;
  triggerLabel?: string;
  entries: T[];
  columns: ManageColumn<T>[];
  onDelete: (id: string) => void;
  onEdit?: (row: T) => void;
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
  emptyText = "No saved entries yet.",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8"
                            aria-label="Edit"
                            onClick={() => {
                              onEdit(row);
                              setOpen(false);
                            }}
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

      <AlertDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The entry will be permanently removed from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmId) onDelete(confirmId);
                setConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
