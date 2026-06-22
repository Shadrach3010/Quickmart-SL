"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImagePlus,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import type { VendorProduct } from "@/types";
import { vendorProductSchema } from "@/validations";

type ProductFormInput = z.input<typeof vendorProductSchema>;
type ProductForm = z.output<typeof vendorProductSchema>;

const defaults: ProductFormInput = {
  name: "",
  categoryId: null,
  sku: null,
  description: null,
  unit: "item",
  price: 0,
  compareAtPrice: null,
  stockQuantity: 0,
  lowStockThreshold: 5,
  isActive: true,
  isFeatured: false,
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed.");
  return body.data as T;
}

function ProductImage({ product }: { product: VendorProduct }) {
  if (product.imageUrl?.startsWith("http")) {
    // Product media dimensions are controlled by the surrounding table cell.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" className="size-full object-cover" src={product.imageUrl} />;
  }
  return <span className="text-2xl">{product.imageUrl ?? "📦"}</span>;
}

export function ProductManager({
  initialProducts,
}: {
  initialProducts: VendorProduct[];
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ProductFormInput, unknown, ProductForm>({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: defaults,
  });
  const { data = initialProducts } = useQuery({
    initialData: initialProducts,
    queryKey: queryKeys.products.all,
    queryFn: async () =>
      readJson<VendorProduct[]>(await fetch("/api/vendor/products")),
  });

  const filtered = useMemo(
    () =>
      data.filter((product) =>
        `${product.name} ${product.sku ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );

  const saveMutation = useMutation({
    mutationFn: async (values: ProductForm) => {
      const response = await fetch(
        editing ? `/api/vendor/products/${editing.id}` : "/api/vendor/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const product = await readJson<VendorProduct>(response);

      if (image) {
        const formData = new FormData();
        formData.set("file", image);
        const upload = await fetch(`/api/vendor/products/${product.id}/images`, {
          method: "POST",
          body: formData,
        });
        const uploadBody = await upload.json();
        if (!upload.ok) throw new Error(uploadBody.error ?? "Product saved, but its image could not be uploaded.");
        product.imageUrl = uploadBody.data.publicUrl;
      }
      return product;
    },
    onSuccess: (product) => {
      queryClient.setQueryData<VendorProduct[]>(
        queryKeys.products.all,
        (current = []) =>
          editing
            ? current.map((item) => (item.id === product.id ? product : item))
            : [product, ...current],
      );
      setOpen(false);
      setEditing(null);
      setImage(null);
      form.reset(defaults);
    },
    onError: (error) => setFormError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: VendorProduct) => {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to delete product.");
      return product.id;
    },
    onSuccess: (id) =>
      queryClient.setQueryData<VendorProduct[]>(
        queryKeys.products.all,
        (current = []) => current.filter((item) => item.id !== id),
      ),
  });

  function startCreate() {
    setEditing(null);
    setImage(null);
    setFormError(null);
    form.reset(defaults);
    setOpen(true);
  }

  function startEdit(product: VendorProduct) {
    setEditing(product);
    setImage(null);
    setFormError(null);
    form.reset({
      name: product.name,
      categoryId: product.categoryId,
      sku: product.sku,
      description: product.description,
      unit: product.unit,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setOpen(true);
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 bg-white pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products or SKU"
            value={query}
          />
        </div>
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger>
            <Button onClick={startCreate}>
              <PackagePlus /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Create product"}</DialogTitle>
              <DialogDescription>
                Add pricing, inventory, and a product image.
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit((values) => {
                setFormError(null);
                saveMutation.mutate(values);
              })}
            >
              <label className="text-sm font-medium sm:col-span-2">
                Product name
                <Input className="mt-2 h-10" {...form.register("name")} />
                <span className="mt-1 block text-xs text-destructive">
                  {form.formState.errors.name?.message}
                </span>
              </label>
              <label className="text-sm font-medium">
                SKU
                <Input className="mt-2 h-10" {...form.register("sku")} />
              </label>
              <label className="text-sm font-medium">
                Unit
                <Input
                  className="mt-2 h-10"
                  placeholder="e.g. 1 kg"
                  {...form.register("unit")}
                />
              </label>
              <label className="text-sm font-medium">
                Price (SLE)
                <Input
                  className="mt-2 h-10"
                  min="0"
                  step="0.01"
                  type="number"
                  {...form.register("price")}
                />
              </label>
              <label className="text-sm font-medium">
                Compare price
                <Input
                  className="mt-2 h-10"
                  min="0"
                  step="0.01"
                  type="number"
                  {...form.register("compareAtPrice")}
                />
              </label>
              <label className="text-sm font-medium">
                Opening stock
                <Input
                  className="mt-2 h-10"
                  min="0"
                  type="number"
                  {...form.register("stockQuantity")}
                />
              </label>
              <label className="text-sm font-medium">
                Low stock alert at
                <Input
                  className="mt-2 h-10"
                  min="0"
                  type="number"
                  {...form.register("lowStockThreshold")}
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Description
                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  {...form.register("description")}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 p-6 text-sm font-medium text-muted-foreground hover:bg-muted">
                  <ImagePlus className="size-5" />
                  {image ? image.name : "Upload JPG, PNG, or WebP (max 5 MB)"}
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </span>
              </label>
              <div className="flex items-center gap-5 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...form.register("isActive")} />
                  Product is active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...form.register("isFeatured")} />
                  Feature product
                </label>
              </div>
              {formError && (
                <p className="text-sm text-destructive sm:col-span-2">{formError}</p>
              )}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button onClick={() => setOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button disabled={saveMutation.isPending} type="submit">
                  {saveMutation.isPending
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Create product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                      <ProductImage product={product} />
                    </span>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.unit}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.sku ?? "—"}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      product.stockQuantity <= product.lowStockThreshold
                        ? "font-bold text-amber-700"
                        : ""
                    }
                  >
                    {product.stockQuantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(product.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      aria-label={`Edit ${product.name}`}
                      onClick={() => startEdit(product)}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      aria-label={`Delete ${product.name}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete ${product.name}?`)) {
                          deleteMutation.mutate(product);
                        }
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                    <Button aria-label="More options" size="icon" variant="ghost">
                      <MoreHorizontal />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length && (
          <div className="p-12 text-center">
            <p className="font-bold">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search or create your first product.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
