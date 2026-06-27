import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNotifications } from "@/lib/queries/notifications";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata = { title: "Notifications · CoFoundr" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getNotifications(user.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <NotificationList items={items} />
      </div>
    </AppShell>
  );
}
