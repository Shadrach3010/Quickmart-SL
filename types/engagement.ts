export interface MarketplaceNotification {
  id: string;
  type: "order" | "payment" | "delivery" | "promotion" | "system";
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderTrackingEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  complete: boolean;
  current?: boolean;
}

export interface CouponResult {
  code: string;
  label: string;
  discount: number;
}

export interface ReferralSummary {
  code: string;
  successfulReferrals: number;
  pendingReferrals: number;
  rewardsEarned: number;
}
