"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Trophy, Target, Brain, Calendar, Award, BarChart3 } from "lucide-react"
import { type ProgressData, getProgressTrends } from "@/lib/storage"

interface ProgressDashboardProps {
  progress: ProgressData
}

export function ProgressDashboard({ progress }: ProgressDashboardProps) {
  const trends = getProgressTrends()
  const winRate = progress.totalGames > 0 ? (progress.totalWins / progress.totalGames) * 100 : 0
  const overallAccuracy = progress.totalDarts > 0 ? (progress.totalAccurateHits / progress.totalDarts) * 100 : 0
  const overallDecisionQuality =
    progress.totalDecisions > 0 ? (progress.totalOptimalDecisions / progress.totalDecisions) * 100 : 0

  const recentSessions = progress.sessions.slice(-5).reverse()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="size-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold">{"Your Progress"}</h2>
          <p className="text-muted-foreground">{"Track your improvement over time"}</p>
        </div>
      </div>

      {/* Personal Bests */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-accent/10">
          <div className="flex items-center gap-3">
            <Award className="size-8 text-accent" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">{"Fewest Darts"}</div>
              <div className="text-3xl font-bold">{progress.personalBests.fewestDarts ?? "-"}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-primary/10">
          <div className="flex items-center gap-3">
            <Target className="size-8 text-primary" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">{"Best Accuracy"}</div>
              <div className="text-3xl font-bold">
                {progress.personalBests.bestAccuracy !== null
                  ? `${progress.personalBests.bestAccuracy.toFixed(1)}%`
                  : "-"}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-chart-2/10">
          <div className="flex items-center gap-3">
            <Brain className="size-8 text-chart-2" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">{"Best Decisions"}</div>
              <div className="text-3xl font-bold">
                {progress.personalBests.bestDecisionRate !== null
                  ? `${progress.personalBests.bestDecisionRate.toFixed(1)}%`
                  : "-"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">{"Overall Statistics"}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{"Win Rate"}</span>
                <span className="text-sm font-bold">{winRate.toFixed(1)}%</span>
              </div>
              <Progress value={winRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.totalWins} {" wins out of "} {progress.totalGames} {" games"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{"Overall Accuracy"}</span>
                <span className="text-sm font-bold">{overallAccuracy.toFixed(1)}%</span>
              </div>
              <Progress value={overallAccuracy} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.totalAccurateHits} {" hits out of "} {progress.totalDarts} {" darts"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{"Decision Quality"}</span>
                <span className="text-sm font-bold">{overallDecisionQuality.toFixed(1)}%</span>
              </div>
              <Progress value={overallDecisionQuality} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.totalOptimalDecisions} {" optimal out of "} {progress.totalDecisions}
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Trophy className="size-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{"Total Games Played"}</div>
                <div className="text-2xl font-bold">{progress.totalGames}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
              <Target className="size-5 text-primary" />
              <div>
                <div className="text-sm font-medium">{"Games with 3 Darts"}</div>
                <div className="text-2xl font-bold">{progress.gamesWith3Darts || 0}</div>
                {progress.currentStreak > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {"Current streak: "} {progress.currentStreak}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Improvement Trends */}
      {progress.sessions.length >= 10 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{"Recent Trends (Last 20 Games)"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              {trends.accuracyTrend >= 0 ? (
                <TrendingUp className="size-6 text-accent" />
              ) : (
                <TrendingDown className="size-6 text-destructive" />
              )}
              <div>
                <div className="text-sm font-medium">{"Accuracy Trend"}</div>
                <div className="text-xl font-bold">
                  {trends.accuracyTrend >= 0 ? "+" : ""}
                  {trends.accuracyTrend.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              {trends.decisionTrend >= 0 ? (
                <TrendingUp className="size-6 text-accent" />
              ) : (
                <TrendingDown className="size-6 text-destructive" />
              )}
              <div>
                <div className="text-sm font-medium">{"Decision Trend"}</div>
                <div className="text-xl font-bold">
                  {trends.decisionTrend >= 0 ? "+" : ""}
                  {trends.decisionTrend.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {trends.isImproving && (
            <p className="text-sm text-accent mt-4 flex items-center gap-2">
              <TrendingUp className="size-4" />
              {"You're improving! Keep practicing to maintain this trend."}
            </p>
          )}
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-muted-foreground" />
            <h3 className="font-semibold">{"Recent Sessions"}</h3>
          </div>
          <div className="flex flex-col gap-2">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant={session.completed ? "default" : "secondary"}>
                    {session.completed ? "Won" : "Bust"}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium">
                      {"Score:"} {session.startingScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {session.dartsThrown} {" darts"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.accuracy.toFixed(0)}% {"acc"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {progress.totalGames === 0 && (
        <Card className="p-8 text-center">
          <Trophy className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{"No Games Yet"}</h3>
          <p className="text-muted-foreground">{"Start playing to track your progress and improvement over time!"}</p>
        </Card>
      )}
    </div>
  )
}
