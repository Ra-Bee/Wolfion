import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateProduct,
  useUpdateProduct,
  getListProductsQueryKey,
  type Product,
  type ProductInput,
  type ProductInputCategory,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CATEGORY_OPTIONS: { value: ProductInputCategory; label: string }[] = [
  { value: "short", label: "Short Socks" },
  { value: "ankle", label: "Ankle Socks" },
  { value: "kids", label: "Kids Socks" },
  { value: "others", label: "Others" },
];

type FormState = {
  name: string;
  price: string;
  color: string;
  category: ProductInputCategory;
  sizesText: string;
  description: string;
  inventory: string;
  image: string;
  video: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  color: "",
  category: "ankle",
  sizesText: "",
  description: "",
  inventory: "0",
  image: "",
  video: "",
  sortOrder: "0",
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    price: String(p.price),
    color: p.color,
    category: p.category as ProductInputCategory,
    sizesText: p.sizes.join(", "),
    description: p.description,
    inventory: String(p.inventory),
    image: p.image,
    video: p.video,
    sortOrder: String(p.sortOrder),
  };
}

function parseFormToInput(f: FormState): ProductInput | { error: string } {
  const name = f.name.trim();
  if (!name) return { error: "Name is required." };
  const price = Number(f.price);
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a non-negative number." };
  const color = f.color.trim();
  if (!color) return { error: "Color is required." };
  const sizes = f.sizesText
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const inventory = Number(f.inventory);
  if (!Number.isInteger(inventory) || inventory < 0) {
    return { error: "Inventory must be a non-negative whole number." };
  }
  const sortOrder = Number(f.sortOrder);
  if (!Number.isInteger(sortOrder)) {
    return { error: "Sort order must be a whole number." };
  }
  return {
    name,
    price,
    color,
    category: f.category,
    sizes,
    description: f.description,
    inventory,
    image: f.image.trim(),
    video: f.video.trim(),
    sortOrder,
  };
}

export type ProductFormDialogProps = {
  /** Controls dialog visibility. */
  open: boolean;
  /** Called when the dialog requests open/close (e.g. user clicks Cancel or backdrop). */
  onOpenChange: (open: boolean) => void;
  /**
   * If provided, the dialog opens in EDIT mode and pre-fills with this product.
   * If null/undefined, the dialog opens in CREATE mode with an empty form.
   */
  editingProduct?: Product | null;
};

/**
 * Add / Edit product dialog. Owns its own form state, mutations, validation,
 * success toast, and react-query cache invalidation. Used both by the
 * dedicated admin page and by the inline "Add Product" button on the public
 * /products listing.
 */
export function ProductFormDialog({ open, onOpenChange, editingProduct }: ProductFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editingId = editingProduct?.id ?? null;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Reset / pre-fill the form whenever the dialog opens or the target changes.
  // We intentionally only reset on `open=true` so a half-typed form isn't wiped
  // by a focus blur that briefly toggles `open`.
  useEffect(() => {
    if (!open) return;
    setForm(editingProduct ? productToForm(editingProduct) : EMPTY_FORM);
  }, [open, editingProduct]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ description: "Product created." });
        onOpenChange(false);
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Could not create product", description: err.message }),
    },
  });

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ description: "Product updated." });
        onOpenChange(false);
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Could not update product", description: err.message }),
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFormToInput(form);
    if ("error" in parsed) {
      toast({ variant: "destructive", title: "Invalid form", description: parsed.error });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: parsed });
    } else {
      createMutation.mutate({ data: parsed });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isMutating && onOpenChange(o)}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            All customers will see these details immediately after saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                maxLength={200}
                data-testid="input-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                required
                maxLength={100}
                data-testid="input-color"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (Tk)</Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                data-testid="input-price"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={form.inventory}
                onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.value }))}
                required
                data-testid="input-inventory"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as ProductInputCategory }))}
              >
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                inputMode="numeric"
                step="1"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                data-testid="input-sort-order"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sizes">Sizes</Label>
            <Input
              id="sizes"
              placeholder="e.g. S, M, L, XL"
              value={form.sizesText}
              onChange={(e) => setForm((f) => ({ ...f, sizesText: e.target.value }))}
              data-testid="input-sizes"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              data-testid="input-image"
            />
            {form.image ? (
              <div className="mt-2 h-32 w-32 rounded-md border border-border overflow-hidden bg-muted">
                <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Paste a public image URL. Leave blank to show a placeholder.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video">Video URL (optional)</Label>
            <Input
              id="video"
              type="url"
              placeholder="https://… (mp4 / webm)"
              value={form.video}
              onChange={(e) => setForm((f) => ({ ...f, video: e.target.value }))}
              data-testid="input-video"
            />
            {form.video ? (
              <video
                src={form.video}
                controls
                className="mt-2 h-40 w-full max-w-sm rounded-md border border-border bg-black"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Optional. Customers will see this video on the product page alongside the photo.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={4000}
              data-testid="input-description"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating} data-testid="btn-save-product">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
