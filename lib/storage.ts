// Client-side storage for progress tracking

export interface GameSession {
  id: string
  timestamp: number
  startingScore: number
  dartsThrown: number
  completed: boolean
  accuracy: number
  optimalDecisionRate: number
}

export interface ProgressData {
  totalGames: number
  totalWins: number
  totalDarts: number
  totalAccurateHits: number
  totalOptimalDecisions: number
  totalDecisions: number
  sessions: GameSession[]
  gamesWith3Darts: number
  currentStreak: number
  personalBests: {
    fewestDarts: number | null
    bestAccuracy: number | null
    bestDecisionRate: number | null
  }
}

export interface HitRatioSettings {
  triple: number
  double: number
  single: number
  dartboardSize: number
}

const STORAGE_KEY = "darts_training_progress"
const SETTINGS_KEY = "darts_training_settings"

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") {
    return getEmptyProgress()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getEmptyProgress()

    const data = JSON.parse(stored)
    return {
      ...getEmptyProgress(),
      ...data,
    }
  } catch {
    return getEmptyProgress()
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save progress:", error)
  }
}

export function addSession(session: GameSession): void {
  const progress = loadProgress()

  progress.sessions.push(session)
  progress.totalGames += 1

  if (session.completed) {
    progress.totalWins += 1

    // Update personal bests
    if (progress.personalBests.fewestDarts === null || session.dartsThrown < progress.personalBests.fewestDarts) {
      progress.personalBests.fewestDarts = session.dartsThrown
    }
  }

  if (progress.personalBests.bestAccuracy === null || session.accuracy > progress.personalBests.bestAccuracy) {
    progress.personalBests.bestAccuracy = session.accuracy
  }

  if (
    progress.personalBests.bestDecisionRate === null ||
    session.optimalDecisionRate > progress.personalBests.bestDecisionRate
  ) {
    progress.personalBests.bestDecisionRate = session.optimalDecisionRate
  }

  saveProgress(progress)
}

export function update3DartGameAndStreak(completedWith3Darts: boolean): void {
  const progress = loadProgress()

  if (completedWith3Darts) {
    progress.gamesWith3Darts += 1
    progress.currentStreak += 1
  } else {
    progress.currentStreak = 0
  }

  saveProgress(progress)
}

export function resetStreak(): void {
  const progress = loadProgress()
  progress.currentStreak = 0
  saveProgress(progress)
}

export function clearProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function loadSettings(): HitRatioSettings {
  if (typeof window === "undefined") {
    return getDefaultSettings()
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return getDefaultSettings()
    return JSON.parse(stored)
  } catch {
    return getDefaultSettings()
  }
}

export function saveSettings(settings: HitRatioSettings): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save settings:", error)
  }
}

function getEmptyProgress(): ProgressData {
  return {
    totalGames: 0,
    totalWins: 0,
    totalDarts: 0,
    totalAccurateHits: 0,
    totalOptimalDecisions: 0,
    totalDecisions: 0,
    sessions: [],
    gamesWith3Darts: 0,
    currentStreak: 0,
    personalBests: {
      fewestDarts: null,
      bestAccuracy: null,
      bestDecisionRate: null,
    },
  }
}

function getDefaultSettings(): HitRatioSettings {
  return {
    triple: 65,
    double: 65,
    single: 85,
    dartboardSize: 100,
  }
}

export function getRecentSessions(count = 10): GameSession[] {
  const progress = loadProgress()
  return progress.sessions.slice(-count).reverse()
}

export function getProgressTrends() {
  const progress = loadProgress()
  const recentSessions = progress.sessions.slice(-20)

  if (recentSessions.length === 0) {
    return {
      accuracyTrend: 0,
      decisionTrend: 0,
      isImproving: false,
    }
  }

  const midpoint = Math.floor(recentSessions.length / 2)
  const firstHalf = recentSessions.slice(0, midpoint)
  const secondHalf = recentSessions.slice(midpoint)

  const avgAccuracyFirst = firstHalf.reduce((sum, s) => sum + s.accuracy, 0) / firstHalf.length
  const avgAccuracySecond = secondHalf.reduce((sum, s) => sum + s.accuracy, 0) / secondHalf.length

  const avgDecisionFirst = firstHalf.reduce((sum, s) => sum + s.optimalDecisionRate, 0) / firstHalf.length
  const avgDecisionSecond = secondHalf.reduce((sum, s) => sum + s.optimalDecisionRate, 0) / secondHalf.length

  return {
    accuracyTrend: avgAccuracySecond - avgAccuracyFirst,
    decisionTrend: avgDecisionSecond - avgDecisionFirst,
    isImproving: avgAccuracySecond > avgAccuracyFirst || avgDecisionSecond > avgDecisionFirst,
  }
}
