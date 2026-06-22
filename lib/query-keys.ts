export const queryKeys = {
  session: ["session"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  vendors: {
    all: ["vendors"] as const,
    detail: (vendorId: string) => ["vendors", vendorId] as const,
  },
  products: {
    all: ["products"] as const,
    detail: (productId: string) => ["products", productId] as const,
    byVendor: (vendorId: string) =>
      ["products", "vendor", vendorId] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (orderId: string) => ["orders", orderId] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    users: ["admin", "users"] as const,
    supermarkets: ["admin", "supermarkets"] as const,
    products: ["admin", "products"] as const,
    orders: ["admin", "orders"] as const,
    payments: ["admin", "payments"] as const,
    deliveries: ["admin", "deliveries"] as const,
    settings: ["admin", "settings"] as const,
  },
  delivery: {
    dashboard: ["delivery", "dashboard"] as const,
  },
};
