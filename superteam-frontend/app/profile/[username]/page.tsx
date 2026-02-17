import ProfilePageComponent from "@/components/profile/ProfilePageComponent";
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter";
import {
  getIdentitySnapshotForUser,
  getIdentitySnapshotForWallet,
} from "@/lib/server/solana-identity-adapter";
import { getActivityDays } from "@/lib/server/activity-store";
import { getAllCourseProgressSnapshots } from "@/lib/server/academy-progress-adapter";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await requireAuthenticatedUser();

  // Determine which wallet to show: if the param looks like a Solana address
  // (32+ chars base58) and isn't the current user, show that wallet's profile.
  const isCurrentUser =
    username === currentUser.walletAddress ||
    username === currentUser.username ||
    username === `user_${currentUser.walletAddress.slice(0, 6).toLowerCase()}`;

  const targetWallet = isCurrentUser ? currentUser.walletAddress : username;

  let snapshot, activityDays, courseSnapshots;
  try {
    [snapshot, activityDays, courseSnapshots] = await Promise.all([
      isCurrentUser
        ? getIdentitySnapshotForUser(currentUser)
        : getIdentitySnapshotForWallet(targetWallet),
      getActivityDays(targetWallet, 365),
      getAllCourseProgressSnapshots(targetWallet),
    ]);
  } catch (error: any) {
    if (
      error?.message?.includes("fetch failed") ||
      error?.message?.includes("Network error") ||
      error?.message?.includes("ECONNREFUSED")
    ) {
      snapshot = isCurrentUser
        ? await getIdentitySnapshotForUser(currentUser).catch(() => null)
        : await getIdentitySnapshotForWallet(targetWallet).catch(() => null);
      activityDays = await getActivityDays(targetWallet, 365);
      courseSnapshots = [];
    } else {
      throw error;
    }
  }
  const allCourses = courseSnapshots.map((s) => s.course);

  return (
    <ProfilePageComponent
      identity={snapshot}
      activityDays={activityDays}
      allCourses={allCourses}
      isOwnProfile={isCurrentUser}
    />
  );
}
