"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TargetIcon, TrendingUp } from "lucide-react"

interface DecisionQualityMeterProps {
  accuracy: number
  optimalDecisions: number
  totalDecisions: number
  averageDartsToFinish: number | null
}

export function DecisionQualityMeter({
  accuracy,
  optimalDecisions,
  totalDecisions,
  averageDartsToFinish,
}: DecisionQualityMeterProps) {
  const decisionQuality = totalDecisions > 0 ? (optimalDecisions / totalDecisions) * 100 : 0

  const getQualityRating = (quality: number) => {
    if (quality >= 80) return { label: "Excellent", color: "text-accent" }
    if (quality >= 60) return { label: "Good", color: "text-primary" }
    if (quality >= 40) return { label: "Fair", color: "text-yellow-600" }
    return { label: "Needs Work", color: "text-destructive" }
  }

  const rating = getQualityRating(decisionQuality)

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
        <Brain className="size-3.5 sm:size-4 text-muted-foreground" />
        <h3 className="text-xs sm:text-sm font-semibold">Session Performance</h3>
      </div>

      <div className="grid gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TargetIcon className="size-3 sm:size-3.5 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">Hit Accuracy</span>
            </div>
            <span className="text-xs sm:text-sm font-bold">{accuracy.toFixed(1)}%</span>
          </div>
          <Progress value={accuracy} className="h-1.5 sm:h-2" />
        </div>

        {totalDecisions > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3 sm:size-3.5 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">Decision Quality</span>
              </div>
              <Badge variant="outline" className={`${rating.color} text-xs`}>
                {rating.label}
              </Badge>
            </div>
            <Progress value={decisionQuality} className="h-1.5 sm:h-2" />
            <p className="text-xs text-muted-foreground">
              {optimalDecisions} of {totalDecisions} throws matched optimal routes
            </p>
          </div>
        )}

        {averageDartsToFinish !== null && (
          <div className="pt-2 sm:pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Avg. Darts to Finish</span>
              <span className="text-xl sm:text-2xl font-bold">{averageDartsToFinish.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Lower is better - pros average 3-6 darts</p>
          </div>
        )}
      </div>
    </Card>
  )
}
