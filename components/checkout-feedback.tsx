"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import { type DartTarget, getOptimalCheckouts } from "@/lib/checkout-logic"

interface CheckoutFeedbackProps {
  currentScore: number
  dartsRemaining: number
  lastThrow?: {
    aimed: DartTarget
    hit: DartTarget
    wasAccurate: boolean
  }
  userRoute: DartTarget[]
}

export function CheckoutFeedback({ currentScore, dartsRemaining, lastThrow, userRoute }: CheckoutFeedbackProps) {
  const optimalRoutes = getOptimalCheckouts(currentScore)
  const hasOptimalRoute = optimalRoutes.length > 0

  const evaluateDecision = () => {
    if (!lastThrow || userRoute.length === 0) return null

    const aimedTarget = lastThrow.aimed
    const wasInOptimalRoute = optimalRoutes.some((route) => route.some((target) => target.label === aimedTarget.label))

    return {
      wasOptimal: wasInOptimalRoute,
      wasAccurate: lastThrow.wasAccurate,
    }
  }

  const decision = evaluateDecision()

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {decision && (
        <Alert variant={decision.wasAccurate ? "default" : "destructive"} className="py-2 sm:py-3">
          <TrendingUp className="size-3.5 sm:size-4" />
          <AlertTitle className="text-xs sm:text-sm">{decision.wasAccurate ? "Good Shot!" : "Missed"}</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {decision.wasAccurate && decision.wasOptimal && "You hit an optimal target. Keep it up!"}
            {decision.wasAccurate && !decision.wasOptimal && "Hit, but check suggestions for better routes."}
            {!decision.wasAccurate && "Missed target. Adjust your strategy based on where you landed."}
          </AlertDescription>
        </Alert>
      )}

      {hasOptimalRoute && currentScore > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
            <Lightbulb className="size-3.5 sm:size-4 text-accent" />
            <h3 className="text-xs sm:text-sm font-semibold">Optimal Routes</h3>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            {optimalRoutes.slice(0, 3).map((route, index) => (
              <div key={index} className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                <Badge variant="outline" className="shrink-0 text-xs">
                  {index + 1}
                </Badge>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {route.map((target, targetIndex) => (
                    <div key={targetIndex} className="flex items-center gap-1">
                      <Badge variant={target.zone === "D" ? "default" : "secondary"} className="font-mono text-xs">
                        {target.label}
                      </Badge>
                      {targetIndex < route.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    = {route.reduce((sum, t) => sum + t.value, 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-2 sm:mt-3">Pro routes. Must finish on double!</p>
        </Card>
      )}

      {currentScore > 0 && currentScore <= 170 && (
        <Card className="p-2.5 sm:p-3 bg-primary/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-3.5 sm:size-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-xs sm:text-sm">Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {currentScore > 100 && <li>• Focus on T20s to bring score down</li>}
                {currentScore <= 40 && currentScore > 1 && currentScore % 2 === 0 && (
                  <li>• Finishable with a double!</li>
                )}
                {currentScore === 1 && <li>• Score of 1 is bust!</li>}
                {dartsRemaining === 1 && currentScore > 50 && (
                  <li>• Not finishable with one dart. Set up next round.</li>
                )}
                {currentScore % 2 === 1 && currentScore > 50 && <li>• Odd score - hit single to make even</li>}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
