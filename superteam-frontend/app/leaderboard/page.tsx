import type { Metadata } from "next";
import LeaderboardPage from "@/components/leaderboard/LeaderboardPage";
import { requireAuthenticatedUser } from "@/lib/server/auth-adapter";
import {
  getCachedLeaderboard,
  getRankForWallet,
} from "@/lib/server/leaderboard-cache";
import { getLearnerProfileOnChain } from "@/lib/server/academy-chain-read";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top learners on SuperTeam Academy ranked by XP and streaks.",
};

export default async function Page() {
  const user = await requireAuthenticatedUser();
  const entries = await getCachedLeaderboard();
  const displayEntries = entries.slice(0, 100);
  let me = entries.find((e) => e.wallet === user.walletAddress) ?? null;
  if (!me) {
    const learner = await getLearnerProfileOnChain(user.walletAddress).catch(
      () => null,
    );
    if (learner) {
      const rank =
        getRankForWallet(entries, user.walletAddress) ??
        entries.filter((e) => e.xp > learner.xpTotal).length + 1;
      me = {
        wallet: user.walletAddress,
        authority: user.walletAddress,
        rank,
        xp: learner.xpTotal,
        level: learner.level,
        streak: learner.streakCurrent,
        lastActivityTs: learner.lastActivityTs,
      };
    }
  }

  return <LeaderboardPage entries={displayEntries} me={me} />;
}
