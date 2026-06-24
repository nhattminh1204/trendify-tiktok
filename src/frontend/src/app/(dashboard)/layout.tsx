import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark transition-colors duration-200">
      <Sidebar />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
