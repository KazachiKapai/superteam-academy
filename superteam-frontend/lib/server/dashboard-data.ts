import "server-only";

import { cache } from "react";
import type { AuthenticatedUser } from "@/lib/server/auth-adapter";
import { getIdentitySnapshotForUser } from "@/lib/server/solana-identity-adapter";
import { getAllCourseProgressSnapshots } from "@/lib/server/academy-progress-adapter";
import { getActivityData } from "@/lib/server/activity-store";
import { getCachedLeaderboard } from "@/lib/server/leaderboard-cache";

export const getDashboardIdentity = cache((user: AuthenticatedUser) =>
  getIdentitySnapshotForUser(user),
);

export const getDashboardCourses = cache((wallet: string) =>
  getAllCourseProgressSnapshots(wallet),
);

export const getDashboardActivity = cache((wallet: string) =>
  getActivityData(wallet, 365),
);

export const getDashboardLeaderboard = cache(() => getCachedLeaderboard());

export function preloadDashboardData(user: AuthenticatedUser) {
  void getDashboardIdentity(user);
  void getDashboardCourses(user.walletAddress);
  void getDashboardActivity(user.walletAddress);
  void getDashboardLeaderboard();
}
