import type { AppRole } from "@/types/auth";

export type SupermarketStatus = "pending" | "active" | "suspended" | "closed";
export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type AdminPaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";
export type AdminDeliveryStatus =
  | "unassigned"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

export interface AdminUser {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSupermarket {
  id: string;
  name: string;
  ownerName: string;
  ownerProfileId: string | null;
  city: string;
  status: SupermarketStatus;
  productCount: number;
  orderCount: number;
  revenue: number;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string | null;
  supermarket: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  supermarket: string;
  status: AdminOrderStatus;
  paymentMethod: string;
  total: number;
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  orderNumber: string;
  provider: string;
  method: string;
  status: AdminPaymentStatus;
  amount: number;
  providerReference: string | null;
  createdAt: string;
}

export interface AdminDelivery {
  id: string;
  orderNumber: string;
  customer: string;
  area: string;
  status: AdminDeliveryStatus;
  agentId: string | null;
  agentName: string | null;
  createdAt: string;
}

export interface AdminDeliveryAgent {
  id: string;
  profileId: string;
  name: string;
  phone: string | null;
  status: "pending" | "available" | "busy" | "offline" | "suspended";
  activeDeliveries: number;
}

export interface AdminMetrics {
  totalUsers: number;
  totalSupermarkets: number;
  totalOrders: number;
  revenue: number;
  commissions: number;
  userChange: number;
  supermarketChange: number;
  orderChange: number;
  revenueChange: number;
}

export interface AdminTrendPoint {
  label: string;
  revenue: number;
  commissions: number;
  orders: number;
}

export interface AdminAnalytics {
  trend: AdminTrendPoint[];
  orderStatus: Array<{ name: string; value: number }>;
  supermarketRevenue: Array<{ name: string; revenue: number }>;
}

export interface PlatformSettings {
  commissionRate: number;
  serviceFee: number;
  minimumOrderAmount: number;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}
