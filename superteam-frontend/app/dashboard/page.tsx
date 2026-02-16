import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter"
import { getIdentitySnapshotForUser } from "@/lib/server/solana-identity-adapter"
import { getAllCourseProgressSnapshots } from "@/lib/server/academy-progress-adapter"
import { getActivityDays, getRecentActivity } from "@/lib/server/activity-store"
import { getCachedLeaderboard } from "@/lib/server/leaderboard-cache"

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser()
  const [snapshot, courseSnapshots, activityDays, recentActivity, leaderboardEntries] = await Promise.all([
    getIdentitySnapshotForUser(user),
    getAllCourseProgressSnapshots(user.walletAddress),
    Promise.resolve(getActivityDays(user.walletAddress, 365)),
    Promise.resolve(getRecentActivity(user.walletAddress)),
    getCachedLeaderboard(),
  ])
  const courses = courseSnapshots.map((item) => item.course)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
        <DashboardContent
          identity={snapshot}
          coursesData={courses}
          activityDays={activityDays}
          recentActivity={recentActivity}
          leaderboardEntries={leaderboardEntries.slice(0, 10)}
        />
      </main>
      <Footer />
    </div>
  )
}
