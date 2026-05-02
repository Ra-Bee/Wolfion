import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  type Product,
  type ProductInput,
  type ProductInputCategory,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";

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
    sortOrder,
  };
}

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError, refetch } = useListProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ description: "Product created." });
        setFormOpen(false);
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
        setFormOpen(false);
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Could not update product", description: err.message }),
    },
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ description: "Product deleted." });
        setDeletingProduct(null);
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Could not delete product", description: err.message }),
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(productToForm(p));
    setFormOpen(true);
  };

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
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Manage Products</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Add, update, or remove products from the live shop catalog. Changes appear
              instantly for every customer on every device.
            </p>
          </div>
          <Button onClick={openCreate} data-testid="btn-add-product">
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Button>
        </div>

        {isLoading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Could not load products.</p>
            <Button variant="link" onClick={() => refetch()} className="mt-2">Try again</Button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl py-16 text-center" data-testid="admin-products-empty">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              The catalog is empty. Add your first product to start selling.
            </p>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add your first product
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Image</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Color</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-right font-medium">Price (Tk)</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-4 py-3 text-left font-medium">Sizes</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-border hover:bg-muted/20"
                      data-testid={`admin-product-row-${p.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                          {p.image ? (
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.color}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{p.category}</td>
                      <td className="px-4 py-3 text-right">{p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{p.inventory}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {p.sizes.join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            aria-label={`Edit ${p.name}`}
                            data-testid={`btn-edit-${p.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingProduct(p)}
                            aria-label={`Delete ${p.name}`}
                            className="text-destructive hover:text-destructive"
                            data-testid={`btn-delete-${p.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !isMutating && setFormOpen(o)}>
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
              <p className="text-xs text-muted-foreground">
                Paste a public image URL. Leave blank to show a placeholder.
              </p>
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
                onClick={() => setFormOpen(false)}
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

      {/* Delete confirmation */}
      <AlertDialog
        open={deletingProduct !== null}
        onOpenChange={(o) => !o && !deleteMutation.isPending && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProduct ? (
                <>
                  <span className="font-medium text-foreground">{deletingProduct.name}</span>
                  {" — "}
                  {deletingProduct.color}. This cannot be undone and the product will disappear
                  from the shop immediately.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deletingProduct) deleteMutation.mutate({ id: deletingProduct.id });
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="btn-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
