import type {
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/constants/commerce";
import type {
  EntityId,
  ISODateString,
  TimestampedEntity,
} from "@/types/common";

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Vendor extends TimestampedEntity {
  id: EntityId;
  ownerId: EntityId;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl?: string | null;
  deliveryTime?: string;
  deliveryFee?: number;
  rating?: number;
  tags?: string[];
  isActive: boolean;
}

export interface Product extends TimestampedEntity {
  id: EntityId;
  vendorId: EntityId;
  categoryId: EntityId;
  categoryName?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrls: string[];
  unit?: string;
  supermarketName?: string;
  rating?: number;
  badge?: string | null;
  isActive: boolean;
}

export interface CartItem {
  productId: EntityId;
  vendorId: EntityId;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  slug?: string;
  supermarketName?: string;
}

export interface DeliveryAddress {
  id: EntityId;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Order extends TimestampedEntity {
  id: EntityId;
  customerId: EntityId;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  deliveredAt: ISODateString | null;
}
