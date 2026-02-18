import "server-only";

import { cache } from "react";
import type { AuthenticatedUser } from "@/lib/server/auth-adapter";
import {
  getIdentitySnapshotForUser,
  getIdentitySnapshotForWallet,
} from "@/lib/server/solana-identity-adapter";
import { getAllCourseProgressSnapshots } from "@/lib/server/academy-progress-adapter";
import { getActivityData } from "@/lib/server/activity-store";

export const getProfileIdentity = cache((user: AuthenticatedUser) =>
  getIdentitySnapshotForUser(user),
);

export const getProfileCourses = cache((wallet: string) =>
  getAllCourseProgressSnapshots(wallet),
);

export const getProfileActivity = cache((wallet: string) =>
  getActivityData(wallet, 365),
);

/**
 * Fire all profile data fetches immediately (void — don't await).
 * React.cache deduplicates so the Suspense children pick up
 * the already-in-flight promises instead of starting new ones.
 */
export function preloadProfileData(user: AuthenticatedUser) {
  void getProfileIdentity(user);
  void getProfileCourses(user.walletAddress);
  void getProfileActivity(user.walletAddress);
}

export const getProfileIdentityByWallet = cache((wallet: string) =>
  getIdentitySnapshotForWallet(wallet),
);

export function preloadPublicProfileData(wallet: string) {
  void getProfileIdentityByWallet(wallet);
  void getProfileCourses(wallet);
  void getProfileActivity(wallet);
}
