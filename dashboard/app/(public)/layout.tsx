import { InstallPrompt } from "@/components/install-prompt";
import { NotificationOptIn } from "@/components/notification-optin";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
      <NotificationOptIn />
    </>
  );
}
