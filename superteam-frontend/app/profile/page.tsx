import ProfilePageComponent from "@/components/profile/ProfilePageComponent"
import { Navbar } from "@/components/navbar"
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter"
import { getIdentitySnapshotForUser } from "@/lib/server/solana-identity-adapter"
import { getActivityDays } from "@/lib/server/activity-store"
import { getAllCourseProgressSnapshots } from "@/lib/server/academy-progress-adapter"

export default async function Page() {
  const user = await requireAuthenticatedUser()
  const [snapshot, activityDays, courseSnapshots] = await Promise.all([
    getIdentitySnapshotForUser(user),
    Promise.resolve(getActivityDays(user.walletAddress, 365)),
    getAllCourseProgressSnapshots(user.walletAddress),
  ])
  const completedCourses = courseSnapshots
    .filter((s) => s.course.progress >= 100)
    .map((s) => s.course)

  return (
    <div>
      <Navbar />
      <ProfilePageComponent
        identity={snapshot}
        activityDays={activityDays}
        completedCourses={completedCourses}
      />
    </div>
  )
}
