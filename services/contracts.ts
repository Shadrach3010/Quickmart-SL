import type {
  Order,
  PaginatedResult,
  PaginationParams,
  Product,
  UserProfile,
  Vendor,
} from "@/types";

export interface CatalogService {
  listProducts(
    params?: PaginationParams,
  ): Promise<PaginatedResult<Product>>;
  getProduct(id: string): Promise<Product | null>;
}

export interface VendorService {
  listVendors(params?: PaginationParams): Promise<PaginatedResult<Vendor>>;
  getVendor(id: string): Promise<Vendor | null>;
}

export interface OrderService {
  listOrders(params?: PaginationParams): Promise<PaginatedResult<Order>>;
  getOrder(id: string): Promise<Order | null>;
}

export interface ProfileService {
  getCurrentProfile(): Promise<UserProfile | null>;
}
