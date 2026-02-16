"use client"

import { useState } from "react"
import Link from "next/link"
import { leaderboardUsers, currentUser, courses } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Zap, Award, Flame } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type User = (typeof leaderboardUsers)[0]
type CurrentUser = typeof currentUser

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<"all-time" | "weekly" | "monthly">("all-time")
  const [courseFilter, setCourseFilter] = useState("all")

  const weeklyUsers = [...leaderboardUsers]
    .sort(() => Math.random() - 0.5)
    .map((user, index) => ({ ...user, rank: index + 1 }))
  const monthlyUsers = [...leaderboardUsers]
    .sort(() => Math.random() - 0.5)
    .map((user, index) => ({ ...user, rank: index + 1 }))

  const usersMap = {
    "all-time": leaderboardUsers,
    weekly: weeklyUsers,
    monthly: monthlyUsers,
  }

  const filteredUsers = usersMap[timeFilter].filter(user => {
    if (courseFilter === "all") {
      return true
    }
    return user.course === courseFilter
  })

  return (
    <div className="container mx-auto py-8 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Top developers in the Superteam ecosystem
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <Tabs
          defaultValue="all-time"
          onValueChange={value =>
            setTimeFilter(value as "all-time" | "weekly" | "monthly")
          }
        >
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All-Time</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select onValueChange={setCourseFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course.slug} value={course.title}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LeaderboardTable users={filteredUsers} currentUser={currentUser} />
    </div>
  )
}

function LeaderboardTable({
  users,
  currentUser,
}: {
  users: User[]
  currentUser: CurrentUser
}) {
  const currentUserInList = users.find(u => u.username === currentUser.username)

  return (
    <Card className="bg-transparent">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-gray-800">
              <TableHead className="text-white">Rank</TableHead>
              <TableHead className="text-white">Developer</TableHead>
              <TableHead className="text-white">XP</TableHead>
              <TableHead className="text-white">Level</TableHead>
              <TableHead className="text-white">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow
                key={user.username}
                className={`border-b-gray-800 ${
                  user.username === currentUser.username
                    ? "bg-yellow-400/10"
                    : ""
                }`}
              >
                <TableCell className="font-bold">#{user.rank}</TableCell>
                <TableCell>
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-4 hover:underline"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {user.xp.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    {user.level}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {user.streak}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!currentUserInList && (
              <TableRow className="bg-yellow-400/10 border-b-gray-800">
                <TableCell className="font-bold">#{currentUser.rank}</TableCell>
                <TableCell>
                  <Link
                    href={`/profile/${currentUser.username}`}
                    className="flex items-center gap-4 hover:underline"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>
                        {currentUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{currentUser.username}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {currentUser.xp.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    {currentUser.level}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {currentUser.streak}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
