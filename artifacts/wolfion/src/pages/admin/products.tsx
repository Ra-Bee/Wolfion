import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProducts,
  useDeleteProduct,
  getListProductsQueryKey,
  type Product,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Loader2, Video as VideoIcon } from "lucide-react";

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError, refetch } = useListProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ description: "Product deleted." });
        setDeletingProduct(null);
      },
      onError: (err: Error) =>
        toast({ variant: "destructive", title: "Could not delete product", description: err.message }),
    },
  });

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormOpen(true);
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
                    <th className="px-4 py-3 text-center font-medium">Video</th>
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
                      <td className="px-4 py-3 text-center">
                        {p.video ? (
                          <VideoIcon className="h-4 w-4 inline-block text-primary" aria-label="Has video" />
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingProduct={editingProduct}
      />

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
