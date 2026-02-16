"use client"

import Link from "next/link"
import { leaderboardUsers } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function LeaderboardWidget() {
  const topUsers = leaderboardUsers.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leaderboard</CardTitle>
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topUsers.map(user => (
            <div key={user.username} className="flex items-center">
              <div className="font-bold w-8 text-center">{user.rank}</div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
