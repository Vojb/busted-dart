"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GameSession } from "@/lib/storage"
import { CheckCircle2, XCircle, Target, TrendingUp } from "lucide-react"

interface GameHistoryProps {
  sessions: GameSession[]
}

export function GameHistory({ sessions }: GameHistoryProps) {
  if (sessions.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Game History</CardTitle>
          <CardDescription className="text-xs">No games played yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Game History</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {sessions.map((session) => (
          <Card key={session.id} className="bg-card/50">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {session.completed ? (
                      <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="size-3.5 text-red-500 shrink-0" />
                    )}
                    <span className="text-xs font-medium">
                      {session.completed ? "Finished" : "Bust"} {session.startingScore}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Target className="size-3 shrink-0" />
                      <span>{session.dartsThrown} darts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="size-3 shrink-0" />
                      <span>{session.accuracy.toFixed(1)}% accuracy</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0">{formatDate(session.timestamp)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
