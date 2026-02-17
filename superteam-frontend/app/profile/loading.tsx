import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <ProfileSkeleton />
      </main>
    </div>
  );
}
