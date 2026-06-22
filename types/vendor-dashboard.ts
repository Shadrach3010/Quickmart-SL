import type { OrderStatus } from "@/types/commerce";

export interface VendorProduct {
  id: string;
  supermarketId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  unit: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  updatedAt: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  deliveryArea: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface VendorSupermarket {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  city: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryMinutes: number | null;
  status: "pending" | "active" | "suspended" | "closed";
}

export interface VendorMetrics {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  averageOrderValue: number;
  averageOrderChange: number;
  customers: number;
  customersChange: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  units: number;
  revenue: number;
  share: number;
}
