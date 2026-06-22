import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  RevenuePoint,
  TopProduct,
  VendorMetrics,
  VendorOrder,
  VendorProduct,
  VendorSupermarket,
} from "@/types";
import type { z } from "zod";
import type {
  inventoryUpdateSchema,
  vendorOrderStatusSchema,
  vendorProductSchema,
  vendorSettingsSchema,
} from "@/validations";

type ProductInput = z.infer<typeof vendorProductSchema>;
type InventoryInput = z.infer<typeof inventoryUpdateSchema>;
type OrderStatusInput = z.infer<typeof vendorOrderStatusSchema>;
type SettingsInput = z.infer<typeof vendorSettingsSchema>;

interface VendorContext {
  profileId: string;
  supermarket: VendorSupermarket;
  client: Awaited<ReturnType<typeof getSupabaseServerClient>>;
}

function encode(value: string) {
  return encodeURIComponent(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getVendorContext(): Promise<VendorContext> {
  const { userId } = await requireRole(USER_ROLES.VENDOR);

  const client = await getSupabaseServerClient();
  const profiles = await client.request<Array<{ id: string }>>(
    `/rest/v1/profiles?auth_user_id=eq.${encode(userId)}&select=id&limit=1`,
  );
  const profile = profiles[0];

  if (!profile) {
    throw new Error("The vendor profile has not been synchronized.");
  }

  const stores = await client.request<
    Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      phone: string | null;
      email: string | null;
      address_line: string | null;
      city: string;
      delivery_fee: number | string;
      minimum_order_amount: number | string;
      estimated_delivery_minutes: number | null;
      status: VendorSupermarket["status"];
    }>
  >(
    `/rest/v1/supermarkets?owner_profile_id=eq.${profile.id}&select=id,name,slug,description,phone,email,address_line,city,delivery_fee,minimum_order_amount,estimated_delivery_minutes,status&limit=1`,
  );
  const store = stores[0];

  if (!store) {
    throw new Error("No supermarket is assigned to this vendor account.");
  }

  return {
    profileId: profile.id,
    client,
    supermarket: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      phone: store.phone,
      email: store.email,
      addressLine: store.address_line,
      city: store.city,
      deliveryFee: Number(store.delivery_fee),
      minimumOrderAmount: Number(store.minimum_order_amount),
      estimatedDeliveryMinutes: store.estimated_delivery_minutes,
      status: store.status,
    },
  };
}

export async function getVendorSupermarket(): Promise<VendorSupermarket> {
  const context = await getVendorContext();
  return context.supermarket;
}

export async function getVendorProducts(): Promise<VendorProduct[]> {
  const context = await getVendorContext();

  const rows = await context.client.request<
    Array<{
      id: string;
      supermarket_id: string;
      category_id: string | null;
      name: string;
      slug: string;
      sku: string | null;
      description: string | null;
      unit: string;
      price: number | string;
      compare_at_price: number | string | null;
      stock_quantity: number;
      low_stock_threshold: number;
      is_active: boolean;
      is_featured: boolean;
      updated_at: string;
      product_images: Array<{ storage_path: string; is_primary: boolean }>;
    }>
  >(
    `/rest/v1/products?supermarket_id=eq.${context.supermarket.id}&select=id,supermarket_id,category_id,name,slug,sku,description,unit,price,compare_at_price,stock_quantity,low_stock_threshold,is_active,is_featured,updated_at,product_images(storage_path,is_primary)&order=updated_at.desc`,
  );

  return rows.map((row) => {
    const image = row.product_images.find((item) => item.is_primary) ??
      row.product_images[0];
    return {
      id: row.id,
      supermarketId: row.supermarket_id,
      categoryId: row.category_id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      description: row.description,
      unit: row.unit,
      price: Number(row.price),
      compareAtPrice:
        row.compare_at_price === null ? null : Number(row.compare_at_price),
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      imageUrl: image
        ? context.client.storageUrl("product-images", image.storage_path)
        : null,
      updatedAt: row.updated_at,
    };
  });
}

export async function createVendorProduct(input: ProductInput) {
  const context = await getVendorContext();

  const rows = await context.client.request<
    Array<{
      id: string;
      supermarket_id: string;
      category_id: string | null;
      name: string;
      slug: string;
      sku: string | null;
      description: string | null;
      unit: string;
      price: number | string;
      compare_at_price: number | string | null;
      stock_quantity: number;
      low_stock_threshold: number;
      is_active: boolean;
      is_featured: boolean;
      updated_at: string;
    }>
  >("/rest/v1/products?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      supermarket_id: context.supermarket.id,
      category_id: input.categoryId ?? null,
      name: input.name,
      slug: `${slugify(input.name)}-${crypto.randomUUID().slice(0, 8)}`,
      sku: input.sku ?? null,
      description: input.description ?? null,
      unit: input.unit,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      stock_quantity: input.stockQuantity,
      low_stock_threshold: input.lowStockThreshold,
      is_active: input.isActive,
      is_featured: input.isFeatured,
    }),
  });

  const row = rows[0];
  return {
    id: row.id,
    supermarketId: row.supermarket_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    unit: row.unit,
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price === null ? null : Number(row.compare_at_price),
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    imageUrl: null,
    updatedAt: row.updated_at,
  } satisfies VendorProduct;
}

export async function updateVendorProduct(
  productId: string,
  input: Partial<ProductInput>,
) {
  const context = await getVendorContext();

  const rows = await context.client.request<VendorProduct[]>(
    `/rest/v1/products?id=eq.${encode(productId)}&supermarket_id=eq.${context.supermarket.id}&select=id`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.categoryId !== undefined && {
          category_id: input.categoryId,
        }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.compareAtPrice !== undefined && {
          compare_at_price: input.compareAtPrice,
        }),
        ...(input.stockQuantity !== undefined && {
          stock_quantity: input.stockQuantity,
        }),
        ...(input.lowStockThreshold !== undefined && {
          low_stock_threshold: input.lowStockThreshold,
        }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
        ...(input.isFeatured !== undefined && {
          is_featured: input.isFeatured,
        }),
      }),
    },
  );

  if (!rows[0]) throw new Error("Product not found.");
  return getVendorProducts().then(
    (products) => products.find((product) => product.id === productId)!,
  );
}

export async function updateVendorInventory(
  productId: string,
  input: InventoryInput,
) {
  return updateVendorProduct(productId, input);
}

export async function deleteVendorProduct(productId: string) {
  const context = await getVendorContext();
  const images = await context.client.request<Array<{ storage_path: string }>>(
    `/rest/v1/product_images?product_id=eq.${encode(productId)}&select=storage_path`,
  );
  await Promise.all(
    images.map((image) =>
      context.client.request(
        `/storage/v1/object/product-images/${image.storage_path}`,
        { method: "DELETE" },
      ),
    ),
  );
  await context.client.request(
    `/rest/v1/products?id=eq.${encode(productId)}&supermarket_id=eq.${context.supermarket.id}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
}

export async function uploadVendorProductImage(productId: string, file: File) {
  const context = await getVendorContext();
  const products = await context.client.request<Array<{ id: string }>>(
    `/rest/v1/products?id=eq.${encode(productId)}&supermarket_id=eq.${context.supermarket.id}&select=id&limit=1`,
  );
  if (!products[0]) {
    throw new Error("Product not found.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${context.supermarket.id}/${productId}/${crypto.randomUUID()}.${extension}`;
  const admin = getSupabaseAdminClient();
  await admin.request(
    `/storage/v1/object/product-images/${storagePath}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    },
  );
  await admin.request(
    `/rest/v1/product_images?product_id=eq.${encode(productId)}&is_primary=eq.true`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ is_primary: false }),
    },
  );
  await admin.request("/rest/v1/product_images", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      product_id: productId,
      storage_path: storagePath,
      alt_text: file.name,
      is_primary: true,
    }),
  });
  return {
    storagePath,
    publicUrl: admin.storageUrl("product-images", storagePath),
  };
}

export async function getVendorOrders(): Promise<VendorOrder[]> {
  const context = await getVendorContext();

  const rows = await context.client.request<
    Array<{
      id: string;
      order_number: string;
      status: VendorOrder["status"];
      total_amount: number | string;
      delivery_address: {
        recipient_name?: string;
        phone?: string;
        city?: string;
        address_line?: string;
      };
      created_at: string;
      order_items: Array<{
        id: string;
        product_name: string;
        quantity: number;
        unit_price: number | string;
      }>;
    }>
  >(
    `/rest/v1/orders?supermarket_id=eq.${context.supermarket.id}&select=id,order_number,status,total_amount,delivery_address,created_at,order_items(id,product_name,quantity,unit_price)&order=created_at.desc`,
  );

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.delivery_address.recipient_name ?? "Customer",
    customerPhone: row.delivery_address.phone ?? "",
    status: row.status,
    totalAmount: Number(row.total_amount),
    itemCount: row.order_items.reduce((sum, item) => sum + item.quantity, 0),
    deliveryArea:
      row.delivery_address.city ??
      row.delivery_address.address_line ??
      "Freetown",
    createdAt: row.created_at,
    items: row.order_items.map((item) => ({
      id: item.id,
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
  }));
}

export async function updateVendorOrderStatus(
  orderId: string,
  input: OrderStatusInput,
) {
  const context = await getVendorContext();
  const current = await context.client.request<Array<{
    status: VendorOrder["status"];
    customer_profile_id: string;
    order_number: string;
  }>>(
    `/rest/v1/orders?id=eq.${encode(orderId)}&supermarket_id=eq.${context.supermarket.id}&select=status,customer_profile_id,order_number&limit=1`,
  );
  if (!current[0]) throw new Error("Order not found.");
  const allowed: Partial<Record<VendorOrder["status"], VendorOrder["status"][]>> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready_for_pickup", "cancelled"],
  };
  if (!allowed[current[0].status]?.includes(input.status)) {
    throw new Error("This vendor order status transition is not allowed.");
  }
  await context.client.request(
    `/rest/v1/orders?id=eq.${encode(orderId)}&supermarket_id=eq.${context.supermarket.id}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: input.status }),
    },
  );
  const title = input.status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const admin = getSupabaseAdminClient();
  await Promise.all([
    admin.request("/rest/v1/order_status_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        order_id: orderId,
        status: input.status,
        title,
        description: `The supermarket updated your order to ${input.status.replaceAll("_", " ")}.`,
        created_by_profile_id: context.profileId,
      }),
    }),
    admin.request("/rest/v1/notifications", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        profile_id: current[0].customer_profile_id,
        type: "order",
        title,
        body: `Order ${current[0].order_number} is now ${input.status.replaceAll("_", " ")}.`,
        data: { order_id: orderId, href: "/orders" },
      }),
    }),
  ]);
  return getVendorOrders().then(
    (orders) => orders.find((order) => order.id === orderId)!,
  );
}

export async function updateVendorSettings(input: SettingsInput) {
  const context = await getVendorContext();
  const rows = await context.client.request<VendorSupermarket[]>(
    `/rest/v1/supermarkets?id=eq.${context.supermarket.id}&select=id`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        phone: input.phone,
        email: input.email,
        address_line: input.addressLine,
        city: input.city,
        delivery_fee: input.deliveryFee,
        minimum_order_amount: input.minimumOrderAmount,
        estimated_delivery_minutes: input.estimatedDeliveryMinutes,
      }),
    },
  );
  if (!rows[0]) throw new Error("Supermarket not found.");
  return getVendorSupermarket();
}

function deriveMetrics(orders: VendorOrder[], products: VendorProduct[]) {
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const customers = new Set(orders.map((order) => order.customerPhone)).size;
  return {
    revenue,
    revenueChange: 0,
    orders: orders.length,
    ordersChange: 0,
    averageOrderValue: orders.length ? revenue / orders.length : 0,
    averageOrderChange: 0,
    customers,
    customersChange: 0,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    lowStockProducts: products.filter(
      (product) => product.stockQuantity <= product.lowStockThreshold,
    ).length,
  } satisfies VendorMetrics;
}

export async function getVendorDashboardData() {
  const [supermarket, products, orders] = await Promise.all([
    getVendorSupermarket(),
    getVendorProducts(),
    getVendorOrders(),
  ]);

  const revenueByDay = new Map<string, { revenue: number; orders: number }>();
  const productTotals = new Map<string, { units: number; revenue: number }>();
  for (const order of orders.filter((item) => item.status !== "cancelled")) {
    const label = order.createdAt.slice(0, 10);
    const day = revenueByDay.get(label) ?? { revenue: 0, orders: 0 };
    day.revenue += order.totalAmount;
    day.orders += 1;
    revenueByDay.set(label, day);
    for (const item of order.items) {
      const total = productTotals.get(item.name) ?? { units: 0, revenue: 0 };
      total.units += item.quantity;
      total.revenue += item.unitPrice * item.quantity;
      productTotals.set(item.name, total);
    }
  }
  const totalProductRevenue = [...productTotals.values()].reduce((sum, item) => sum + item.revenue, 0);
  const revenue: RevenuePoint[] = [...revenueByDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-14)
    .map(([label, value]) => ({ label, ...value }));
  const topProducts: TopProduct[] = [...productTotals.entries()]
    .map(([name, value]) => ({
      name,
      units: value.units,
      revenue: value.revenue,
      share: totalProductRevenue ? (value.revenue / totalProductRevenue) * 100 : 0,
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 8);

  return {
    supermarket,
    products,
    orders,
    metrics: deriveMetrics(orders, products),
    revenue,
    topProducts,
  };
}
