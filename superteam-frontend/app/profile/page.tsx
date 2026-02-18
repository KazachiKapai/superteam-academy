import type { Metadata } from "next";
import { Suspense } from "react";
import {
  HeaderSkeleton,
  ActivitySkeleton,
  CoursesSkeleton,
  SkillsSkeleton,
  BadgesSkeleton,
  CredentialsSkeleton,
} from "@/components/profile/profile-skeletons";
import {
  ProfileHeaderSection,
  ActivitySection,
  CompletedCoursesSection,
  SkillsSection,
  AchievementsSection,
  CredentialsSection,
  VisibilitySection,
} from "@/components/profile/profile-server-sections";
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter";
import { preloadProfileData } from "@/lib/server/profile-data";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "View your SuperTeam Academy profile, credentials, and learning activity.",
};

// ---------------------------------------------------------------------------
// Page shell — renders immediately, sections stream in via Suspense
// ---------------------------------------------------------------------------

export default async function Page() {
  const user = await requireAuthenticatedUser();

  // Fire all RPCs immediately — Suspense children pick up in-flight promises
  preloadProfileData(user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeaderSection user={user} />
      </Suspense>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivitySection wallet={user.walletAddress} />
          </Suspense>
          <Suspense fallback={<CoursesSkeleton />}>
            <CompletedCoursesSection wallet={user.walletAddress} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<SkillsSkeleton />}>
            <SkillsSection wallet={user.walletAddress} />
          </Suspense>
          <Suspense fallback={<BadgesSkeleton />}>
            <AchievementsSection user={user} />
          </Suspense>
          <Suspense fallback={<CredentialsSkeleton />}>
            <CredentialsSection user={user} />
          </Suspense>
          <VisibilitySection />
        </div>
      </div>
    </div>
  );
}
