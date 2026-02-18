import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import {
  DashboardWelcome,
  ContinueLearningList,
  DashboardHeatmap,
  RecommendedCourseCards,
  DashboardAchievements,
  DashboardRecentActivity,
} from "@/components/dashboard/dashboard-sections";
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget";
import {
  StatsRowSkeleton,
  CoursesListSkeleton,
  HeatmapSkeleton,
  RecommendedSkeleton,
  SidebarSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter";
import type { AuthenticatedUser } from "@/lib/server/auth-adapter";
import {
  getDashboardIdentity,
  getDashboardCourses,
  getDashboardActivity,
  getDashboardLeaderboard,
  preloadDashboardData,
} from "@/lib/server/dashboard-data";
import { courseService } from "@/lib/cms/course-service";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your learning progress, streaks, and XP on SuperTeam Academy.",
};

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  // Fire all RPCs immediately — Suspense children pick up in-flight promises
  preloadDashboardData(user);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
        <Suspense fallback={<StatsRowSkeleton />}>
          <WelcomeAndStats user={user} />
        </Suspense>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<CoursesListSkeleton />}>
              <ContinueLearningSection wallet={user.walletAddress} />
            </Suspense>
            <Suspense fallback={<HeatmapSkeleton />}>
              <ActivityHeatmapSection wallet={user.walletAddress} />
            </Suspense>
            <Suspense fallback={<RecommendedSkeleton />}>
              <RecommendedCoursesSection wallet={user.walletAddress} />
            </Suspense>
          </div>
          <div className="space-y-6">
            <Suspense fallback={<SidebarSkeleton />}>
              <SidebarContent user={user} wallet={user.walletAddress} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Async server components — each fetches its own data independently
// ---------------------------------------------------------------------------

async function WelcomeAndStats({ user }: { user: AuthenticatedUser }) {
  const identity = await getDashboardIdentity(user);
  return <DashboardWelcome identity={identity} />;
}

async function resolveCourses(wallet: string) {
  const courseSnapshots = await getDashboardCourses(wallet);
  if (courseSnapshots.length > 0) {
    return courseSnapshots.map((item) => item.course);
  }
  return (await courseService.getAllCourses()).map((c) => ({
    ...c,
    progress: 0,
  }));
}

async function ContinueLearningSection({ wallet }: { wallet: string }) {
  const courses = await resolveCourses(wallet);
  return <ContinueLearningList courses={courses} />;
}

async function ActivityHeatmapSection({ wallet }: { wallet: string }) {
  const activityData = await getDashboardActivity(wallet);
  return <DashboardHeatmap activityDays={activityData.days} />;
}

async function RecommendedCoursesSection({ wallet }: { wallet: string }) {
  const courses = await resolveCourses(wallet);
  return <RecommendedCourseCards courses={courses} />;
}

async function SidebarContent({
  user,
  wallet,
}: {
  user: AuthenticatedUser;
  wallet: string;
}) {
  const [identity, activityData, leaderboardEntries] = await Promise.all([
    getDashboardIdentity(user),
    getDashboardActivity(wallet),
    getDashboardLeaderboard(),
  ]);

  return (
    <>
      <LeaderboardWidget entries={leaderboardEntries.slice(0, 5)} />
      <DashboardAchievements identity={identity} />
      <DashboardRecentActivity recentActivity={activityData.recentActivity} />
    </>
  );
}
