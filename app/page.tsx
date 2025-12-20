"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DartboardSelector } from "@/components/dartboard-selector"
import { ScoreDisplay } from "@/components/score-display"
import { CurrentDartsDisplay } from "@/components/current-darts-display"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { SettingsPanel } from "@/components/settings-panel"
import { GameHistory } from "@/components/game-history"
import { CheckoutFeedback } from "@/components/checkout-feedback"
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
  hasSeenTutorial,
  markTutorialSeen,
} from "@/lib/storage"
import { RotateCcw, Trophy, Menu, BarChart3, Settings, History, Hand, Move, Target } from "lucide-react"
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
  const [scoreBeforeBust, setScoreBeforeBust] = useState<number | null>(null)
  const [hitRatioSettings, setHitRatioSettings] = useState<HitRatioSettings>(loadSettings())
  const [activeMenuTab, setActiveMenuTab] = useState<"menu" | "progress" | "settings" | "history">("settings")

  const [sessionStats, setSessionStats] = useState({
    accurateHits: 0,
    totalDarts: 0,
    optimalDecisions: 0,
    totalDecisions: 0,
  })
  const [hoveredTarget, setHoveredTarget] = useState<DartTarget | null>(null)
  const [lastThrow, setLastThrow] = useState<{ aimed: DartTarget; hit: DartTarget; wasAccurate: boolean } | undefined>(undefined)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    const settings = loadSettings()
    setHitRatioSettings(settings)
    // Generate random checkout only on client side after hydration
    const initialScore = generateRandomCheckout(settings.difficulty)
    setStartingScore(initialScore)
    setCurrentScore(initialScore)
    setPendingScore(initialScore)
    
    // Show tutorial on first visit
    if (!hasSeenTutorial()) {
      setShowTutorial(true)
    }
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
    } else if (target.zone === "BULL") {
      hitRatio = hitRatioSettings.bullseye
    } else {
      hitRatio = hitRatioSettings.single
    }

    const result = simulateThrow(target, pendingScore, hitRatio)
    const newScore = pendingScore - result.score

    // Track last throw for learning mode
    setLastThrow({
      aimed: target,
      hit: result.hit,
      wasAccurate: result.wasAccurate,
    })

    // Show toast notification for the throw
    // Use consistent toastId to replace previous toast instead of stacking
    if (result.wasAccurate) {
      toast.success(`You hit ${target.label}!`, {
        description: `Scored ${result.score} points`,
        id: "throw-result",
      })
    } else {
      toast.error(`You missed ${target.label}`, {
        description: `Hit ${result.hit.label} instead (${result.score} points)`,
        id: "throw-result",
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
      setScoreBeforeBust(pendingScore)
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
      setScoreBeforeBust(pendingScore)
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
    } else if (hitRatioSettings.learningMode) {
      // In learning mode, update current score after each dart to show remaining options
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

    // Track 3-dart games and update streak (disabled in learning mode)
    update3DartGameAndStreak(completed, totalDarts, hitRatioSettings.learningMode)

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
    setScoreBeforeBust(null)
    setLastThrow(undefined)
    setSessionStats({
      accurateHits: 0,
      totalDarts: 0,
      optimalDecisions: 0,
      totalDecisions: 0,
    })
  }

  const handleTryAgain = () => {
    setSheetOpen(false)
    setGameCompleteDialog(false)
    // Reset to the same starting score
    setCurrentScore(startingScore)
    setPendingScore(startingScore)
    setDartsThrown(0)
    setDartHistory([])
    setGameStatus("playing")
    setUserRoute([])
    setHoveredTarget(null)
    setScoreBeforeBust(null)
    setLastThrow(undefined)
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

  const dartsRemaining = hitRatioSettings.learningMode ? 3 - (dartsThrown % 3) : 3
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
           
          </div>

          {progress && progress.currentStreak > 0 && !hitRatioSettings.learningMode && (
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
                // Ensure settings tab is selected if no tab is active
                if (activeMenuTab === "menu") {
                  setActiveMenuTab("settings")
                }
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

        <Dialog open={showTutorial} onOpenChange={(open) => {
          if (!open) {
            markTutorialSeen()
          }
          setShowTutorial(open)
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Welcome to Darts Training!
              </DialogTitle>
              <DialogDescription>
                Learn how to aim and score on the dartboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                    <Hand className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold">Hold and Move to Aim</h4>
                    <p className="text-sm text-muted-foreground">
                      Press and hold on the dartboard, then move your finger to aim. A yellow dot will show where you're aiming.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                    <Move className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold">Preview Your Target</h4>
                    <p className="text-sm text-muted-foreground">
                      As you move, you'll see a preview of the target you're aiming at (like T20, D16, etc.) displayed above the dartboard.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                    <Target className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold">Release to Throw</h4>
                    <p className="text-sm text-muted-foreground">
                      Release your finger to throw the dart at the selected target. The score will be calculated based on your accuracy settings.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="size-2 rounded-full bg-yellow-500 animate-pulse" />
                  Yellow dot = Your aim point
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="size-2 rounded-full bg-primary" />
                  Preview shows target name (T20, D16, etc.)
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                markTutorialSeen()
                setShowTutorial(false)
              }} className="w-full sm:w-auto">
                Got it!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              // Show optimal route for the starting score (for wins) or what should have been thrown (for busts)
              const scoreToCheck = gameStatus === "bust" && scoreBeforeBust !== null ? scoreBeforeBust : startingScore
              const optimalRoutes = getOptimalCheckouts(scoreToCheck)
              const bestRoute = optimalRoutes.length > 0 ? optimalRoutes[0] : null
              const dartCount = bestRoute ? bestRoute.length : null
              
              if (gameStatus === "bust" && scoreBeforeBust !== null) {
                // For busts, show what the last dart should have been
                const lastDart = bestRoute ? bestRoute[bestRoute.length - 1] : null
                
                // If score is finishable with a single dart, show that
                if (scoreBeforeBust <= 50 && scoreBeforeBust % 2 === 0) {
                  const singleDartTarget = scoreBeforeBust === 50 
                    ? { zone: "BULL" as const, number: 50, label: "Bull", value: 50 }
                    : { zone: "D" as const, number: scoreBeforeBust / 2, label: `D${scoreBeforeBust / 2}`, value: scoreBeforeBust }
                  
                  return (
                    <div className="space-y-3 py-4">
                      <div className="rounded-lg border bg-destructive/10 p-4">
                        <div className="mb-2 text-sm font-semibold text-destructive">
                          Last Dart Should Have Been:
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive">
                            {singleDartTarget.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                // Otherwise show the last dart from the optimal route
                if (lastDart) {
                  return (
                    <div className="space-y-3 py-4">
                      <div className="rounded-lg border bg-destructive/10 p-4">
                        <div className="mb-2 text-sm font-semibold text-destructive">
                          Last Dart Should Have Been:
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive">
                            {lastDart.label}
                          </span>
                        </div>
                        {bestRoute && bestRoute.length > 1 && (
                          <div className="mt-3 pt-3 border-t border-destructive/20">
                            <div className="mb-2 text-xs font-medium text-muted-foreground">
                              Full Optimal Route ({dartCount === 2 ? "2 Dart" : dartCount === 3 ? "3 Dart" : `${dartCount} Dart`}):
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {bestRoute.map((target, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                    {target.label}
                                  </span>
                                  {index < bestRoute.length - 1 && (
                                    <span className="text-muted-foreground">→</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
              }
              
              // For wins, show the full optimal route
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
              {gameStatus === "bust" && (
                <Button onClick={handleTryAgain} variant="default" className="w-full sm:w-auto">
                  Try Again
                </Button>
              )}
              <Button onClick={handleReset} variant={gameStatus === "bust" ? "outline" : "default"} className="w-full sm:w-auto">
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
                dotOffsetY={hitRatioSettings.dotOffsetY}
                colorTheme={hitRatioSettings.dartboardColorTheme}
                customThemeColors={hitRatioSettings.customThemeColors}
              />
              {hitRatioSettings.learningMode && gameStatus === "playing" && (
                <CheckoutFeedback
                  currentScore={currentScore}
                  dartsRemaining={dartsRemaining}
                  lastThrow={lastThrow}
                  userRoute={userRoute}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
