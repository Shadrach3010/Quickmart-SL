import { DEFAULT_CURRENCY } from "@/lib/constants/commerce";

export function formatCurrency(
  amount: number,
  currency = DEFAULT_CURRENCY,
): string {
  const normalized = Number.isFinite(amount) ? amount : 0;
  const sign = normalized < 0 ? "-" : "";
  const absolute = Math.abs(normalized);
  const [whole, decimals] = absolute.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${currency} ${grouped}.${decimals}`;
}

export function formatNumber(value: number): string {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : 0;
  const sign = normalized < 0 ? "-" : "";
  return sign + Math.abs(normalized).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "Invalid date";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = value.getUTCDate();
  const month = months[value.getUTCMonth()];
  const year = value.getUTCFullYear();
  if (options.dateStyle && !options.timeStyle) return `${day} ${month} ${year}`;

  const hours = value.getUTCHours();
  const minutes = value.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours.toString().padStart(2, "0")}:${minutes} UTC`;
}
