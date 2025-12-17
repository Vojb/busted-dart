"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ThrowResult } from "@/lib/checkout-logic"

interface CurrentDartsDisplayProps {
  darts: ThrowResult[]
  dartsThrown: number
}

export function CurrentDartsDisplay({ darts, dartsThrown }: CurrentDartsDisplayProps) {
  // Get the last 3 darts (current round)
  const currentRoundStart = Math.floor((dartsThrown - 1) / 3) * 3
  const currentRoundDarts = darts.slice(currentRoundStart, currentRoundStart + 3)
  const dartsInCurrentRound = dartsThrown % 3 || 3

  return (
    <Card className="p-2 sm:p-3">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[0, 1, 2].map((index) => {
          const dart = currentRoundDarts[index]
          const isEmpty = index >= dartsInCurrentRound

          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-md border-2 transition-colors ${
                isEmpty
                  ? "border-dashed border-muted bg-muted/20"
                  : dart?.wasAccurate
                    ? "border-primary bg-primary/5"
                    : "border-secondary bg-secondary/5"
              }`}
            >
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">Dart {index + 1}</div>
              {dart ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold">{dart.score}</div>
                  <Badge variant={dart.wasAccurate ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                    {dart.hit.label}
                  </Badge>
                </>
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/30">-</div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
