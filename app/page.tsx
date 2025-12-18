"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DartboardSelector } from "@/components/dartboard-selector"
import { ScoreDisplay } from "@/components/score-display"
import { CurrentDartsDisplay } from "@/components/current-darts-display"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { SettingsPanel } from "@/components/settings-panel"
import { GameHistory } from "@/components/game-history"
import { type DartTarget, generateRandomCheckout } from "@/lib/darts-config"
import { simulateThrow, type ThrowResult, getOptimalCheckouts } from "@/lib/checkout-logic"
import {
  loadProgress,
  addSession,
  clearProgress,
  type ProgressData,
  loadSettings,
  type HitRatioSettings,
  update3DartGameAndStreak,
  resetStreak,
} from "@/lib/storage"
import { RotateCcw, Trophy, Menu, BarChart3, Settings, History } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function DartsTrainingApp() {
  // Initialize with a consistent default value to avoid hydration mismatch
  // The actual random value will be set in useEffect on the client
  const [startingScore, setStartingScore] = useState<number>(170)
  const [currentScore, setCurrentScore] = useState<number>(170)
  const [pendingScore, setPendingScore] = useState<number>(170)
  const [dartsThrown, setDartsThrown] = useState<number>(0)
  const [dartHistory, setDartHistory] = useState<ThrowResult[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "bust">("playing")
  const [userRoute, setUserRoute] = useState<DartTarget[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [gameCompleteDialog, setGameCompleteDialog] = useState(false)
  const [hitRatioSettings, setHitRatioSettings] = useState<HitRatioSettings>(loadSettings())
  const [activeMenuTab, setActiveMenuTab] = useState<"menu" | "progress" | "settings" | "history">("menu")

  const [sessionStats, setSessionStats] = useState({
    accurateHits: 0,
    totalDarts: 0,
    optimalDecisions: 0,
    totalDecisions: 0,
  })
  const [hoveredTarget, setHoveredTarget] = useState<DartTarget | null>(null)

  useEffect(() => {
    setProgress(loadProgress())
    const settings = loadSettings()
    setHitRatioSettings(settings)
    // Generate random checkout only on client side after hydration
    const initialScore = generateRandomCheckout(settings.difficulty)
    setStartingScore(initialScore)
    setCurrentScore(initialScore)
    setPendingScore(initialScore)
  }, [])

  const handleThrow = (target: DartTarget) => {
    if (gameStatus !== "playing") return

    setHoveredTarget(null)

    // Determine hit ratio based on zone
    let hitRatio: number
    if (target.zone === "T") {
      hitRatio = hitRatioSettings.triple
    } else if (target.zone === "D") {
      hitRatio = hitRatioSettings.double
    } else {
      hitRatio = hitRatioSettings.single
    }

    const result = simulateThrow(target, pendingScore, hitRatio)
    const newScore = pendingScore - result.score

    // Show toast notification for the throw
    if (result.wasAccurate) {
      toast.success(`You hit ${target.label}!`, {
        description: `Scored ${result.score} points`,
      })
    } else {
      toast.error(`You missed ${target.label}`, {
        description: `Hit ${result.hit.label} instead (${result.score} points)`,
      })
    }

    const optimalRoutes = getOptimalCheckouts(pendingScore)
    const wasOptimal = optimalRoutes.some((route) => route.some((t) => t.label === target.label))

    setSessionStats((prev) => ({
      accurateHits: result.wasAccurate ? prev.accurateHits + 1 : prev.accurateHits,
      totalDarts: prev.totalDarts + 1,
      optimalDecisions: wasOptimal ? prev.optimalDecisions + 1 : prev.optimalDecisions,
      totalDecisions: prev.totalDecisions + 1,
    }))

    setPendingScore(newScore)
    const newDartsThrown = dartsThrown + 1

    if (newScore < 0 || newScore === 1) {
      setGameStatus("bust")
      setDartHistory((prev) => [...prev, result])
      setDartsThrown(newDartsThrown)
      setUserRoute((prev) => [...prev, target])
      setCurrentScore(newScore)
      saveGameSession(newDartsThrown, false)
      setGameCompleteDialog(true)
      return
    }

    if (newScore === 0 && (result.hit.zone === "D" || result.hit.zone === "BULL")) {
      setGameStatus("won")
      setDartHistory((prev) => [...prev, result])
      setDartsThrown(newDartsThrown)
      setUserRoute((prev) => [...prev, target])
      setCurrentScore(0)
      saveGameSession(newDartsThrown, true)
      setGameCompleteDialog(true)
      return
    }

    if (newScore === 0 && result.hit.zone !== "D" && result.hit.zone !== "BULL") {
      setGameStatus("bust")
      setDartHistory((prev) => [...prev, result])
      setDartsThrown(newDartsThrown)
      setUserRoute((prev) => [...prev, target])
      setCurrentScore(newScore)
      saveGameSession(newDartsThrown, false)
      setGameCompleteDialog(true)
      return
    }

    if (newDartsThrown % 3 === 0) {
      setCurrentScore(newScore)
    }

    setDartHistory((prev) => [...prev, result])
    setDartsThrown(newDartsThrown)
    setUserRoute((prev) => [...prev, target])
  }

  const saveGameSession = (totalDarts: number, completed: boolean) => {
    const accuracy = sessionStats.totalDarts > 0 ? (sessionStats.accurateHits / sessionStats.totalDarts) * 100 : 0
    const decisionRate =
      sessionStats.totalDecisions > 0 ? (sessionStats.optimalDecisions / sessionStats.totalDecisions) * 100 : 0

    addSession({
      id: Date.now().toString(),
      timestamp: Date.now(),
      startingScore,
      dartsThrown: totalDarts,
      completed,
      accuracy,
      optimalDecisionRate: decisionRate,
    })

    // Track 3-dart games and update streak
    update3DartGameAndStreak(completed, totalDarts)

    setProgress(loadProgress())
  }

  const handleReset = () => {
    setSheetOpen(false)
    setGameCompleteDialog(false)
    const newScore = generateRandomCheckout(hitRatioSettings.difficulty)
    setStartingScore(newScore)
    setCurrentScore(newScore)
    setPendingScore(newScore)
    setDartsThrown(0)
    setDartHistory([])
    setGameStatus("playing")
    setUserRoute([])
    setHoveredTarget(null)
    setSessionStats({
      accurateHits: 0,
      totalDarts: 0,
      optimalDecisions: 0,
      totalDecisions: 0,
    })
  }

  const handleClearProgress = () => {
    if (confirm("Are you sure you want to clear all progress data? This cannot be undone.")) {
      clearProgress()
      setProgress(loadProgress())
    }
  }

  const dartsRemaining = 3 - (dartsThrown % 3)
  const canFinish = false // Removed the "finishable with 3 darts" section

  const accuracy = sessionStats.totalDarts > 0 ? (sessionStats.accurateHits / sessionStats.totalDarts) * 100 : 0
  const averageDartsToFinish = progress && progress.totalWins > 0 ? progress.totalDarts / progress.totalWins : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-2 sm:p-3 max-w-7xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button onClick={handleReset} variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
              <RotateCcw className="size-3 sm:size-4 mr-1 sm:mr-2" />
              New Game
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm bg-transparent"
              onClick={() => {
                setSheetOpen(true)
                setActiveMenuTab("history")
                setProgress(loadProgress())
              }}
            >
              <History className="size-3 sm:size-4" />
            </Button>
          </div>

          {progress && progress.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
              <Trophy className="size-3 sm:size-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                {progress.currentStreak}{"x"}
              </span>
            </div>
          )}

          <Sheet
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open)
              if (open) {
                // Reset streak when menu is opened
                resetStreak()
                setProgress(loadProgress())
              }
            }}
          >
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                <Menu className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent className="p-3 flex flex-col overflow-hidden">
              <SheetHeader>
                <SheetTitle className="text-base">Menu</SheetTitle>
                <SheetDescription className="text-xs">Game controls and options</SheetDescription>
              </SheetHeader>

              <div className="flex gap-1 mt-4 border-b flex-shrink-0">
                <Button
                  variant={activeMenuTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMenuTab("settings")}
                  className="flex-1 text-xs h-8 rounded-b-none"
                >
                  <Settings className="size-3 mr-1" />
                  Settings
                </Button>
                <Button
                  variant={activeMenuTab === "progress" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMenuTab("progress")}
                  className="flex-1 text-xs h-8 rounded-b-none"
                >
                  <BarChart3 className="size-3 mr-1" />
                  Progress
                </Button>
                <Button
                  variant={activeMenuTab === "history" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMenuTab("history")}
                  className="flex-1 text-xs h-8 rounded-b-none"
                >
                  <History className="size-3 mr-1" />
                  History
                </Button>
              </div>

              <div className="mt-4 overflow-y-auto flex-1 min-h-0">

                {activeMenuTab === "settings" && <SettingsPanel onSettingsChange={setHitRatioSettings} />}

                {activeMenuTab === "progress" && (
                  <div>
                    {progress && <ProgressDashboard progress={progress} />}
                    <Button
                      onClick={handleClearProgress}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-transparent text-xs"
                    >
                      Clear All Progress
                    </Button>
                  </div>
                )}

                {activeMenuTab === "history" && progress && (
                  <GameHistory sessions={progress.sessions.slice().reverse()} />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Dialog open={gameCompleteDialog} onOpenChange={setGameCompleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {gameStatus === "won" ? (
                  <>
                    <Trophy className="size-5 text-primary" />
                    Checkout Complete!
                  </>
                ) : (
                  "Game Over"
                )}
              </DialogTitle>
              <DialogDescription>
                {gameStatus === "won"
                  ? `You finished ${startingScore} in ${dartsThrown} darts!`
                  : "You busted or failed to finish on a double."}
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const optimalRoutes = getOptimalCheckouts(startingScore)
              const bestRoute = optimalRoutes.length > 0 ? optimalRoutes[0] : null
              const dartCount = bestRoute ? bestRoute.length : null
              
              return bestRoute ? (
                <div className="space-y-3 py-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="mb-2 text-sm font-semibold">
                      Optimal Route ({dartCount === 2 ? "2 Dart" : dartCount === 3 ? "3 Dart" : `${dartCount} Dart`} Finish):
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {bestRoute.map((target, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                            {target.label}
                          </span>
                          {index < bestRoute.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            })()}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button onClick={handleReset} className="w-full sm:w-auto">
                New Game
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-2">
          <div className="grid lg:grid-cols-3 gap-2 sm:gap-3">
            <div className="lg:col-span-1 flex flex-col gap-2">
              <ScoreDisplay currentScore={currentScore} startingScore={startingScore} dartsThrown={dartsThrown} />
              <CurrentDartsDisplay darts={dartHistory} dartsThrown={dartsThrown} hoveredTarget={hoveredTarget} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-2 min-w-0">
              <DartboardSelector
                onSelectTarget={handleThrow}
                onHoverTarget={setHoveredTarget}
                disabled={gameStatus !== "playing"}
                size={hitRatioSettings.dartboardSize}
                tripleInnerRadius={hitRatioSettings.tripleInnerRadius}
                tripleOuterRadius={hitRatioSettings.tripleOuterRadius}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
