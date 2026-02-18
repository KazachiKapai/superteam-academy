import "server-only";

import { PublicKey } from "@solana/web3.js";
import { fetchChainActivity } from "./academy-program";
import {
  DAILY_STREAK_BONUS,
  FIRST_COMPLETION_OF_DAY_BONUS,
} from "./academy-course-catalog";

export type RecentActivityItem = {
  type: "lesson" | "course";
  text: string;
  course: string;
  time: string;
  xp: number;
  ts: number;
};

const activityCountsByWallet = new Map<string, Map<string, number>>();
const recentActivityByWallet = new Map<string, RecentActivityItem[]>();
const totalCompletedByWallet = new Map<string, number>();
// Tracks whether a wallet has completed anything today (for first-of-day bonus)
const firstCompletionDateByWallet = new Map<string, string>();
const MAX_RECENT = 20;

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function formatTimeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / 604800)}w ago`;
}

/**
 * Check if this is the first completion of the day for a wallet.
 * Returns true only the first time per UTC day.
 */
function checkFirstCompletionOfDay(wallet: string): boolean {
  const today = toDateKey(new Date());
  const lastDate = firstCompletionDateByWallet.get(wallet);
  if (lastDate === today) return false;
  firstCompletionDateByWallet.set(wallet, today);
  return true;
}

/**
 * Compute bonus XP for a completion event.
 * Returns { streakBonus, firstOfDayBonus, totalBonus }.
 */
export function computeBonusXp(
  wallet: string,
  currentStreak: number,
): { streakBonus: number; firstOfDayBonus: number; totalBonus: number } {
  const isFirstOfDay = checkFirstCompletionOfDay(wallet);
  const firstOfDayBonus = isFirstOfDay ? FIRST_COMPLETION_OF_DAY_BONUS : 0;
  // Streak bonus applies if user has an active streak of 2+ days
  const streakBonus = currentStreak >= 2 ? DAILY_STREAK_BONUS : 0;
  // Streak bonus only applies once per day (same as first-of-day tracking)
  const effectiveStreakBonus = isFirstOfDay ? streakBonus : 0;
  return {
    streakBonus: effectiveStreakBonus,
    firstOfDayBonus,
    totalBonus: effectiveStreakBonus + firstOfDayBonus,
  };
}

export function recordLessonComplete(
  wallet: string,
  courseTitle: string,
  xpAmount: number,
  lessonTitle?: string,
): void {
  const today = toDateKey(new Date());
  let counts = activityCountsByWallet.get(wallet);
  if (!counts) {
    counts = new Map();
    activityCountsByWallet.set(wallet, counts);
  }
  counts.set(today, (counts.get(today) ?? 0) + 1);

  const items = recentActivityByWallet.get(wallet) ?? [];
  items.unshift({
    type: "lesson",
    text: lessonTitle ? `Completed '${lessonTitle}'` : "Completed a lesson",
    course: courseTitle,
    time: formatTimeAgo(Date.now()),
    xp: xpAmount,
    ts: Date.now(),
  });
  recentActivityByWallet.set(wallet, items.slice(0, MAX_RECENT));
}

export function recordCourseFinalized(
  wallet: string,
  courseTitle: string,
  xpAmount: number,
): void {
  const prev = totalCompletedByWallet.get(wallet) ?? 0;
  totalCompletedByWallet.set(wallet, prev + 1);

  const items = recentActivityByWallet.get(wallet) ?? [];
  items.unshift({
    type: "course",
    text: `Completed course: ${courseTitle}`,
    course: courseTitle,
    time: formatTimeAgo(Date.now()),
    xp: xpAmount,
    ts: Date.now(),
  });
  recentActivityByWallet.set(wallet, items.slice(0, MAX_RECENT));
}

/**
 * Fetch both heatmap days and recent activity from a single RPC call.
 */
export async function getActivityData(
  wallet: string,
  daysBack = 365,
): Promise<{
  days: Array<{ date: string; intensity: number; count: number }>;
  recentActivity: RecentActivityItem[];
}> {
  const chainData = await fetchChainActivity(
    new PublicKey(wallet),
    daysBack,
    MAX_RECENT,
  );

  // --- Heatmap days ---
  const onChainMap = new Map<string, { intensity: number; count: number }>();
  for (const day of chainData.days) {
    onChainMap.set(day.date, { intensity: day.intensity, count: day.count });
  }
  const memoryCounts = activityCountsByWallet.get(wallet);
  const days: Array<{ date: string; intensity: number; count: number }> = [];
  const today = new Date();
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = toDateKey(d);
    const chain = onChainMap.get(dateKey);
    const memoryCount = memoryCounts?.get(dateKey) ?? 0;
    const count = Math.max(chain?.count ?? 0, memoryCount);
    const intensity = Math.max(chain?.intensity ?? 0, memoryCount > 0 ? 1 : 0);
    days.push({ date: dateKey, intensity, count });
  }

  // --- Recent activity ---
  const memoryItems = recentActivityByWallet.get(wallet) ?? [];
  const merged = [...memoryItems];
  for (const ci of chainData.recent) {
    const isDuplicate = merged.some(
      (mi) => Math.abs(mi.ts - ci.ts) < 2000 && mi.type === ci.type,
    );
    if (!isDuplicate) {
      merged.push({
        ...ci,
        time: formatTimeAgo(ci.ts),
      });
    }
  }
  merged.sort((a, b) => b.ts - a.ts);
  const recentActivity = merged.slice(0, MAX_RECENT).map((item) => ({
    ...item,
    time: formatTimeAgo(item.ts),
  }));

  return { days, recentActivity };
}

/** @deprecated Use getActivityData instead */
export async function getActivityDays(
  wallet: string,
  daysBack = 365,
): Promise<Array<{ date: string; intensity: number; count: number }>> {
  const { days } = await getActivityData(wallet, daysBack);
  return days;
}

/** @deprecated Use getActivityData instead */
export async function getRecentActivity(
  wallet: string,
): Promise<RecentActivityItem[]> {
  const { recentActivity } = await getActivityData(wallet);
  return recentActivity;
}

export function getTotalCompleted(wallet: string): number {
  return totalCompletedByWallet.get(wallet) ?? 0;
}

/**
 * Compute the current streak (consecutive active days ending today or yesterday).
 */
export function computeStreakFromDays(
  days: Array<{ date: string; count: number }>,
): number {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86_400_000));

  let streak = 0;
  let started = false;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!started) {
      if (day.count > 0 && (day.date === today || day.date === yesterday)) {
        started = true;
        streak = 1;
      } else if (day.date < yesterday) {
        break;
      }
    } else {
      if (day.count > 0) {
        streak++;
      } else {
        break;
      }
    }
  }
  return streak;
}

/**
 * Get the current activity streak for a wallet from chain + in-memory data.
 */
export async function getCurrentStreak(wallet: string): Promise<number> {
  const { days } = await getActivityData(wallet);
  return computeStreakFromDays(days);
}
