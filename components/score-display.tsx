"use client"

import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"

interface ScoreDisplayProps {
  currentScore: number
  startingScore: number
  dartsThrown: number
}

export function ScoreDisplay({ currentScore, startingScore, dartsThrown }: ScoreDisplayProps) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col items-center gap-1">
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">{currentScore}</div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <Target className="size-3 sm:size-4" />
          <span>Started {startingScore}</span>
        </div>
      </div>
    </Card>
  )
}
