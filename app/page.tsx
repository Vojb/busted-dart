"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DartboardSelector } from "@/components/dartboard-selector"
import { ScoreDisplay } from "@/components/score-display"
import { CurrentDartsDisplay } from "@/components/current-darts-display"
import { ThrowHistory } from "@/components/throw-history"
import { CheckoutFeedback } from "@/components/checkout-feedback"
import { DecisionQualityMeter } from "@/components/decision-quality-meter"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

  useEffect(() => {
    setProgress(loadProgress())
    setHitRatioSettings(loadSettings())
    // Generate random checkout only on client side after hydration
    const initialScore = generateRandomCheckout()
    setStartingScore(initialScore)
    setCurrentScore(initialScore)
    setPendingScore(initialScore)
  }, [])

  const handleThrow = (target: DartTarget) => {
    if (gameStatus !== "playing") return

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

    if (newScore === 0 && result.hit.zone === "D") {
      setGameStatus("won")
      setDartHistory((prev) => [...prev, result])
      setDartsThrown(newDartsThrown)
      setUserRoute((prev) => [...prev, target])
      setCurrentScore(0)
      saveGameSession(newDartsThrown, true)
      setGameCompleteDialog(true)
      return
    }

    if (newScore === 0 && result.hit.zone !== "D") {
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

    setProgress(loadProgress())
  }

  const handleReset = () => {
    setSheetOpen(false)
    setGameCompleteDialog(false)
    const newScore = generateRandomCheckout()
    setStartingScore(newScore)
    setCurrentScore(newScore)
    setPendingScore(newScore)
    setDartsThrown(0)
    setDartHistory([])
    setGameStatus("playing")
    setUserRoute([])
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
          <Button onClick={handleReset} variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
            <RotateCcw className="size-3 sm:size-4 mr-1 sm:mr-2" />
            New Game
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                <Menu className="size-3 sm:size-4 mr-1 sm:mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent className="p-3">
              <SheetHeader>
                <SheetTitle className="text-base">Menu</SheetTitle>
                <SheetDescription className="text-xs">Game controls and options</SheetDescription>
              </SheetHeader>

              <div className="flex gap-1 mt-4 border-b">
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

              <div className="mt-4">

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
              <CurrentDartsDisplay darts={dartHistory} dartsThrown={dartsThrown} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-2">
              <DartboardSelector
                onSelectTarget={handleThrow}
                disabled={gameStatus !== "playing"}
                size={hitRatioSettings.dartboardSize}
              />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-xs py-2 hover:no-underline">
                    View Details & History
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-2">
                    <ThrowHistory
                      dartHistory={dartHistory.map((d) => ({
                        aimed: d.aimed.label,
                        hit: d.hit.label,
                        score: d.score,
                        wasAccurate: d.wasAccurate,
                      }))}
                    />

                    {gameStatus === "playing" && (
                      <CheckoutFeedback
                        currentScore={currentScore}
                        dartsRemaining={dartsRemaining}
                        lastThrow={dartHistory.length > 0 ? dartHistory[dartHistory.length - 1] : undefined}
                        userRoute={userRoute}
                      />
                    )}

                    <DecisionQualityMeter
                      accuracy={accuracy}
                      optimalDecisions={sessionStats.optimalDecisions}
                      totalDecisions={sessionStats.totalDecisions}
                      averageDartsToFinish={averageDartsToFinish}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
