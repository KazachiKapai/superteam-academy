import { Footer } from "@/components/footer";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <DashboardSkeleton />
      </main>
      <Footer />
    </div>
  );
}
