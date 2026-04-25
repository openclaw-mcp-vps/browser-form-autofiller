import { AppNav } from "@/components/AppNav";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { requirePaidAccess } from "@/lib/auth";

export default async function ProfilesPage() {
  await requirePaidAccess("/profiles");

  return (
    <div className="min-h-screen">
      <AppNav />
      <DashboardWorkspace mode="profiles" />
    </div>
  );
}
