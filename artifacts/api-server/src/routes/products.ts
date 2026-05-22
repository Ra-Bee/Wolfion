import { Router, type IRouter, type Request, type Response } from "express";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, productsTable, type ProductRow } from "@workspace/db";
import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/admin";
import { firebaseDb } from "../lib/firebase";

// Phase-3 migration fallback: the canonical product catalog still lives in
// Postgres, but the Render deploy has had its DATABASE_URL unset (see
// migration plan). When the SQL read fails we serve the snapshot that admin
// cloud-sync writes to RTDB at /wolfion/products so the customer storefront
// keeps working instead of returning 500.
async function listProductsFromFirebase(): Promise<ReturnType<typeof serializeProduct>[]> {
  const snap = await firebaseDb().ref("wolfion/products").once("value");
  const val = snap.val() as Record<string, Record<string, unknown>> | null;
  if (!val) return [];
  const rows = Object.values(val).map((p) => ({
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    price: Number(p.price ?? 0),
    color: String(p.color ?? ""),
    category: String(p.category ?? ""),
    sizes: (p.sizes as string[] | undefined) ?? [],
    description: String(p.description ?? ""),
    inventory: Number(p.inventory ?? 0),
    image: (p.image as string | null) ?? "",
    video: (p.video as string | null) ?? "",
    sortOrder: Number(p.sortOrder ?? 0),
    createdAt: String(p.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(p.updatedAt ?? new Date(0).toISOString()),
  }));
  rows.sort((a, b) =>
    a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  );
  return rows;
}

// The OpenAPI spec declares `inventory` and `sortOrder` as `integer`, but the
// generated Zod schemas only call `z.number()` (the orval->zod codegen does not
// emit `.int()` for `type: integer`). Without this override, decimals slip past
// validation and crash the Postgres integer column at insert time, returning a
// 500 instead of the contractually-correct 400. We tighten just those two
// fields rather than regenerating or hand-editing the codegen output.
const IntegerOverrides = z.object({
  inventory: z.number().int().min(0),
  sortOrder: z.number().int().optional(),
});

const CreateProductBodyStrict = CreateProductBody.merge(IntegerOverrides);
const UpdateProductBodyStrict = UpdateProductBody.merge(IntegerOverrides);

const router: IRouter = Router();

function generateProductId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `p_${ts}${rand}`;
}

function serializeProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    color: row.color,
    category: row.category,
    sizes: row.sizes,
    description: row.description,
    inventory: row.inventory,
    image: row.image,
    video: row.video,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// GET /products — public listing, ordered by sortOrder then creation date
router.get("/products", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder), asc(productsTable.createdAt));
    res.json(rows.map(serializeProduct));
  } catch (err) {
    req.log.warn({ err }, "products: SQL list failed, falling back to Firebase");
    try {
      const rows = await listProductsFromFirebase();
      res.json(rows);
    } catch (fbErr) {
      req.log.error({ err: fbErr }, "products: Firebase fallback also failed");
      res.status(500).json({ error: "Could not load products." });
    }
  }
});

// POST /products — admin only
router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBodyStrict.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const id = generateProductId();
    const [row] = await db
      .insert(productsTable)
      .values({ id, ...parsed.data })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to insert product." });
      return;
    }
    res.status(201).json(serializeProduct(row));
  } catch (err) {
    req.log.error({ err }, "products: create failed");
    res.status(500).json({ error: "Could not create product." });
  }
});

// PATCH /products/:id — admin only
router.patch("/products/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const id = req.params.id;
  const parsed = UpdateProductBodyStrict.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [row] = await db
      .update(productsTable)
      .set(parsed.data)
      .where(eq(productsTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Product not found." });
      return;
    }
    res.json(serializeProduct(row));
  } catch (err) {
    req.log.error({ err, id }, "products: update failed");
    res.status(500).json({ error: "Could not update product." });
  }
});

// DELETE /products/:id — admin only
router.delete("/products/:id", requireAdmin, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    const result = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id });
    if (result.length === 0) {
      res.status(404).json({ error: "Product not found." });
      return;
    }
    res.status(204).end();
  } catch (err) {
    req.log.error({ err, id }, "products: delete failed");
    res.status(500).json({ error: "Could not delete product." });
  }
});

export default router;
