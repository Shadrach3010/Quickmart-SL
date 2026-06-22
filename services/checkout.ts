import "server-only";

import { requireRole } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants/roles";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { z } from "zod";
import type { checkoutSchema } from "@/validations";

type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrder(input: CheckoutInput) {
  const { profile } = await requireRole(USER_ROLES.CUSTOMER);
  const admin = getSupabaseAdminClient();
  const productIds = input.items.map((item) => item.productId);
  const products = await admin.request<Array<{
    id: string;
    supermarket_id: string;
    name: string;
    sku: string | null;
    unit: string;
    price: number | string;
    stock_quantity: number;
    track_inventory: boolean;
    is_active: boolean;
    supermarkets: {
      id: string;
      name: string;
      status: string;
      address_line: string | null;
      city: string;
      delivery_fee: number | string;
      minimum_order_amount: number | string;
    };
  }>>(
    `/rest/v1/products?id=in.(${productIds.map(encodeURIComponent).join(",")})&select=id,supermarket_id,name,sku,unit,price,stock_quantity,track_inventory,is_active,supermarkets!inner(id,name,status,address_line,city,delivery_fee,minimum_order_amount)`,
  );
  if (products.length !== productIds.length) throw new Error("One or more products are unavailable.");
  const stores = new Set(products.map((product) => product.supermarket_id));
  if (stores.size !== 1) throw new Error("Each order must contain products from one supermarket.");
  const quantityById = new Map(input.items.map((item) => [item.productId, item.quantity]));
  for (const product of products) {
    const quantity = quantityById.get(product.id) ?? 0;
    if (!product.is_active || product.supermarkets.status !== "active") throw new Error(`${product.name} is unavailable.`);
    if (product.track_inventory && product.stock_quantity < quantity) throw new Error(`${product.name} does not have enough stock.`);
  }
  const store = products[0].supermarkets;
  const subtotal = products.reduce(
    (sum, product) => sum + Number(product.price) * (quantityById.get(product.id) ?? 0),
    0,
  );
  if (subtotal < Number(store.minimum_order_amount)) {
    throw new Error(`This supermarket requires a minimum order of SLE ${Number(store.minimum_order_amount).toFixed(2)}.`);
  }

  let discount = 0;
  let deliveryFee = Number(store.delivery_fee);
  let promotionId: string | null = null;
  if (input.coupon) {
    const promotions = await admin.request<Array<{
      id: string;
      discount_type: "percentage" | "fixed_amount" | "free_delivery";
      discount_value: number | string;
      maximum_discount_amount: number | string | null;
      minimum_order_amount: number | string;
      usage_limit: number | null;
      usage_count: number;
    }>>(
      `/rest/v1/promotions?code=eq.${encodeURIComponent(input.coupon.toUpperCase())}&supermarket_id=eq.${store.id}&is_active=eq.true&starts_at=lte.${encodeURIComponent(new Date().toISOString())}&ends_at=gte.${encodeURIComponent(new Date().toISOString())}&select=id,discount_type,discount_value,maximum_discount_amount,minimum_order_amount,usage_limit,usage_count&limit=1`,
    );
    const promotion = promotions[0];
    if (
      !promotion ||
      subtotal < Number(promotion.minimum_order_amount) ||
      (promotion.usage_limit !== null && promotion.usage_count >= promotion.usage_limit)
    ) throw new Error("That coupon is invalid or expired.");
    promotionId = promotion.id;
    if (promotion.discount_type === "fixed_amount") discount = Math.min(subtotal, Number(promotion.discount_value));
    if (promotion.discount_type === "percentage") {
      discount = subtotal * Number(promotion.discount_value) / 100;
      if (promotion.maximum_discount_amount !== null) discount = Math.min(discount, Number(promotion.maximum_discount_amount));
    }
    if (promotion.discount_type === "free_delivery") deliveryFee = 0;
  }

  const addressPayload = {
    profile_id: profile.id,
    label: input.deliveryAddress.label,
    recipient_name: input.deliveryAddress.recipientName,
    phone: input.deliveryAddress.phone,
    address_line: input.deliveryAddress.addressLine,
    city: input.deliveryAddress.city,
    district: "Western Area Urban",
    landmark: input.deliveryAddress.landmark,
    latitude: input.deliveryAddress.latitude,
    longitude: input.deliveryAddress.longitude,
  };
  let addressId: string | null = null;
  let orderId: string | null = null;
  const changedStock: Array<{ id: string; original: number }> = [];

  try {
    const addresses = await admin.request<Array<{ id: string }>>("/rest/v1/addresses?select=id", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(addressPayload),
    });
    addressId = addresses[0].id;
    const orders = await admin.request<Array<{ id: string; order_number: string }>>("/rest/v1/orders?select=id,order_number", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        customer_profile_id: profile.id,
        supermarket_id: store.id,
        address_id: addressId,
        status: "pending",
        payment_method: input.paymentMethod,
        subtotal,
        discount_amount: discount,
        delivery_fee: deliveryFee,
        delivery_address: {
          label: input.deliveryAddress.label,
          recipient_name: input.deliveryAddress.recipientName,
          phone: input.deliveryAddress.phone,
          address_line: input.deliveryAddress.addressLine,
          city: input.deliveryAddress.city,
          landmark: input.deliveryAddress.landmark,
        },
      }),
    });
    orderId = orders[0].id;
    await admin.request("/rest/v1/order_items", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(products.map((product) => ({
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        unit: product.unit,
        unit_price: Number(product.price),
        quantity: quantityById.get(product.id),
      }))),
    });
    for (const product of products.filter((item) => item.track_inventory)) {
      const next = product.stock_quantity - (quantityById.get(product.id) ?? 0);
      const updated = await admin.request<Array<{ id: string }>>(
        `/rest/v1/products?id=eq.${product.id}&stock_quantity=eq.${product.stock_quantity}&select=id`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ stock_quantity: next }),
        },
      );
      if (!updated[0]) throw new Error(`Stock changed while ordering ${product.name}. Please review your cart.`);
      changedStock.push({ id: product.id, original: product.stock_quantity });
    }
    const orderRows = await admin.request<Array<{ total_amount: number | string }>>(
      `/rest/v1/orders?id=eq.${orderId}&select=total_amount&limit=1`,
    );
    const total = Number(orderRows[0].total_amount);
    await Promise.all([
      admin.request("/rest/v1/payments", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          order_id: orderId,
          method: input.paymentMethod,
          status: input.paymentMethod === "cash_on_delivery" ? "pending" : "processing",
          amount: total,
          provider: input.paymentMethod === "orange_money"
            ? "Orange Money Demo"
            : input.paymentMethod === "afrimoney"
              ? "Afrimoney Demo"
              : input.paymentMethod === "card"
                ? "Card Demo"
                : "Cash on delivery",
          idempotency_key: `checkout-${orderId}`,
        }),
      }),
      admin.request("/rest/v1/deliveries", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          order_id: orderId,
          status: "unassigned",
          pickup_address: { name: store.name, address_line: store.address_line, city: store.city },
          delivery_address: addressPayload,
          delivery_fee: deliveryFee,
          recipient_name: input.deliveryAddress.recipientName,
        }),
      }),
      admin.request("/rest/v1/order_status_events", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          order_id: orderId,
          status: "pending",
          title: "Order placed",
          description: "Your order was sent to the supermarket.",
          created_by_profile_id: profile.id,
        }),
      }),
      admin.request("/rest/v1/notifications", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          profile_id: profile.id,
          type: "order",
          title: "Order placed",
          body: `Order ${orders[0].order_number} was sent to ${store.name}.`,
          data: { order_id: orderId, href: "/orders" },
        }),
      }),
    ]);
    if (promotionId) {
      await admin.request("/rest/v1/promotion_redemptions", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ promotion_id: promotionId, profile_id: profile.id, order_id: orderId, discount_amount: discount }),
      });
      await admin.request(`/rest/v1/promotions?id=eq.${promotionId}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          usage_count: (await admin.request<Array<{ usage_count: number }>>(
            `/rest/v1/promotions?id=eq.${promotionId}&select=usage_count&limit=1`,
          ))[0].usage_count + 1,
        }),
      });
    }
    return {
      id: orderId,
      orderNumber: orders[0].order_number,
      total,
      paymentStatus: input.paymentMethod === "cash_on_delivery" ? "pending" : "processing",
    };
  } catch (error) {
    for (const stock of changedStock) {
      await admin.request(`/rest/v1/products?id=eq.${stock.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ stock_quantity: stock.original }),
      }).catch(() => undefined);
    }
    if (orderId) {
      for (const table of [
        "promotion_redemptions",
        "notifications",
        "order_status_events",
        "deliveries",
        "payments",
        "order_items",
      ]) {
        const filter = table === "notifications"
          ? `data->>order_id=eq.${orderId}`
          : `order_id=eq.${orderId}`;
        await admin.request(`/rest/v1/${table}?${filter}`, {
          method: "DELETE",
        }).catch(() => undefined);
      }
      await admin.request(`/rest/v1/orders?id=eq.${orderId}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
    if (addressId) await admin.request(`/rest/v1/addresses?id=eq.${addressId}`, { method: "DELETE" }).catch(() => undefined);
    throw error;
  }
}
