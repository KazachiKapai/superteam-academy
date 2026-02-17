import { Footer } from "@/components/footer";
import { CourseCatalogSkeleton } from "@/components/skeletons/course-catalog-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <CourseCatalogSkeleton />
      </main>
      <Footer />
    </div>
  );
}
