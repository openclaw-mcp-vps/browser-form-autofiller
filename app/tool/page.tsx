import { AppNav } from "@/components/AppNav";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { requirePaidAccess } from "@/lib/auth";

export default async function ToolPage() {
  await requirePaidAccess("/tool");

  return (
    <div className="min-h-screen">
      <AppNav />
      <DashboardWorkspace mode="mapper" />
    </div>
  );
}
