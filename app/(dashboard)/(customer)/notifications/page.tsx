import { NotificationsView } from "@/features/engagement";
import { listNotifications } from "@/services/engagement";

export default async function NotificationsPage() {
  const notifications = await listNotifications();
  return <div className="marketplace-container py-8 md:py-12"><NotificationsView initialNotifications={notifications} /></div>;
}
