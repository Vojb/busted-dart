"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

interface ThrowHistoryProps {
  dartHistory: Array<{
    aimed: string
    hit: string
    score: number
    wasAccurate: boolean
  }>
}

export function ThrowHistory({ dartHistory }: ThrowHistoryProps) {
  if (dartHistory.length === 0) return null

  return (
    <Card className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <History className="size-3 sm:size-4 text-muted-foreground" />
        <h3 className="text-xs sm:text-sm font-semibold">Throw History</h3>
      </div>
      <div className="flex flex-col gap-1">
        {dartHistory
          .slice()
          .reverse()
          .map((dart, index) => (
            <div
              key={dartHistory.length - index}
              className="flex items-center justify-between p-1.5 sm:p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={dart.wasAccurate ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                  {dart.aimed}
                </Badge>
                <span className="text-muted-foreground text-xs">→</span>
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  {dart.hit}
                </Badge>
              </div>
              <div className="text-sm sm:text-base font-semibold">{dart.score}</div>
            </div>
          ))}
      </div>
    </Card>
  )
}
