export const APP_NAME = "QuickMart SL";
export const DEFAULT_CURRENCY = "SLE";
export const DEFAULT_LOCALE = "en-SL";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_METHODS = [
  "orange_money",
  "afrimoney",
  "card",
  "cash_on_delivery",
] as const;
