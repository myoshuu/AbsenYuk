import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <ErrorBoundary>
      <DashboardLayout session={session}>{children}</DashboardLayout>
    </ErrorBoundary>
  );
}
