import type { AdminDeliveryStatus } from "@/types/admin-dashboard";

export interface DeliveryAgentProfile {
  id: string;
  profileId: string;
  name: string;
  phone: string | null;
  status: "pending" | "available" | "busy" | "offline" | "suspended";
  vehicleType: string | null;
  vehicleRegistration: string | null;
  maxActiveDeliveries: number;
}

export interface DeliveryJob {
  id: string;
  orderNumber: string;
  supermarket: string;
  customer: string;
  customerPhone: string | null;
  area: string;
  address: string;
  status: AdminDeliveryStatus;
  fee: number;
  createdAt: string;
}

export interface DeliveryDashboardData {
  agent: DeliveryAgentProfile;
  jobs: DeliveryJob[];
}
