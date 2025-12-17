"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ThrowResult } from "@/lib/checkout-logic"
import type { DartTarget } from "@/lib/darts-config"

interface CurrentDartsDisplayProps {
  darts: ThrowResult[]
  dartsThrown: number
  hoveredTarget?: DartTarget | null
}

export function CurrentDartsDisplay({ darts, dartsThrown, hoveredTarget }: CurrentDartsDisplayProps) {
  // Get the last 3 darts (current round)
  const currentRoundStart = Math.floor((dartsThrown - 1) / 3) * 3
  const currentRoundDarts = darts.slice(currentRoundStart, currentRoundStart + 3)
  const dartsInCurrentRound = dartsThrown % 3 || 3
  const nextDartIndex = dartsThrown % 3

  return (
    <Card className="p-2 sm:p-3">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[0, 1, 2].map((index) => {
          const dart = currentRoundDarts[index]
          const isEmpty = !dart
          const isHovered = hoveredTarget && index === nextDartIndex && isEmpty

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-md border-2 transition-colors min-h-[100px] sm:min-h-[120px] ${
                isHovered
                  ? "border-dashed border-muted-foreground/50 bg-muted/30 opacity-60"
                  : isEmpty
                    ? "border-dashed border-muted bg-muted/20"
                    : dart?.wasAccurate
                      ? "border-primary bg-primary/5"
                      : "border-red-500 bg-red-500/5"
              }`}
            >
              <div className="text-[8px] sm:text-[10px] font-medium text-muted-foreground">Dart {index + 1}</div>
              {dart ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold">{dart.score}</div>
                  <Badge variant={dart.wasAccurate ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                    {dart.hit.label}
                  </Badge>
                </>
              ) : isHovered ? (
                <>
                  <div className="text-xl sm:text-2xl font-bold text-muted-foreground/60">{hoveredTarget.value}</div>
                  <Badge variant="outline" className="text-[10px] sm:text-xs opacity-60">
                    {hoveredTarget.label}
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
