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
import {
  preloadProfileData,
  preloadPublicProfileData,
} from "@/lib/server/profile-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await requireAuthenticatedUser();

  const isOwnProfile =
    username === currentUser.walletAddress ||
    username === currentUser.username ||
    username === `user_${currentUser.walletAddress.slice(0, 6).toLowerCase()}`;

  const targetWallet = isOwnProfile ? currentUser.walletAddress : username;

  // Fire all RPCs immediately — Suspense children pick up in-flight promises
  if (isOwnProfile) {
    preloadProfileData(currentUser);
  } else {
    preloadPublicProfileData(targetWallet);
  }

  // For own profile, pass user (uses getProfileIdentity); for others, pass wallet
  const identityProps = isOwnProfile
    ? { user: currentUser }
    : { wallet: targetWallet };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeaderSection {...identityProps} isOwnProfile={isOwnProfile} />
      </Suspense>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivitySection wallet={targetWallet} />
          </Suspense>
          <Suspense fallback={<CoursesSkeleton />}>
            <CompletedCoursesSection wallet={targetWallet} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<SkillsSkeleton />}>
            <SkillsSection wallet={targetWallet} />
          </Suspense>
          <Suspense fallback={<BadgesSkeleton />}>
            <AchievementsSection {...identityProps} />
          </Suspense>
          <Suspense fallback={<CredentialsSkeleton />}>
            <CredentialsSection {...identityProps} />
          </Suspense>
          {isOwnProfile && <VisibilitySection />}
        </div>
      </div>
    </div>
  );
}
