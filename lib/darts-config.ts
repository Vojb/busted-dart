// Darts configuration and constants

export type DartZone = "T" | "D" | "S" | "BULL" | "OUTER_BULL"

export interface DartTarget {
  zone: DartZone
  number: number
  label: string
  value: number
}

// Standard dartboard numbers in clockwise order starting from top
export const DARTBOARD_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

// Hit percentages for different skill levels (can be adjusted)
export const HIT_PROBABILITIES = {
  PERFECT_HIT: 0.65, // Hit the exact target
  ADJACENT_NUMBER: 0.2, // Hit adjacent number segment
  WRONG_ZONE_SAME_NUMBER: 0.1, // Hit different zone on same number
  COMPLETE_MISS: 0.05, // Complete miss (no score)
}

// Generate all possible dart targets
export function getAllTargets(): DartTarget[] {
  const targets: DartTarget[] = []

  // Add bull and outer bull
  targets.push({ zone: "BULL", number: 50, label: "Bull", value: 50 })
  targets.push({ zone: "OUTER_BULL", number: 25, label: "25", value: 25 })

  // Add all numbers with different zones
  DARTBOARD_NUMBERS.forEach((num) => {
    targets.push({ zone: "S", number: num, label: `S${num}`, value: num })
    targets.push({ zone: "D", number: num, label: `D${num}`, value: num * 2 })
    targets.push({ zone: "T", number: num, label: `T${num}`, value: num * 3 })
  })

  return targets
}

// Get target by label
export function getTargetByLabel(label: string): DartTarget | undefined {
  return getAllTargets().find((t) => t.label === label)
}

// Get adjacent numbers on dartboard
export function getAdjacentNumbers(number: number): number[] {
  const index = DARTBOARD_NUMBERS.indexOf(number)
  if (index === -1) return []

  const prevIndex = (index - 1 + DARTBOARD_NUMBERS.length) % DARTBOARD_NUMBERS.length
  const nextIndex = (index + 1) % DARTBOARD_NUMBERS.length

  return [DARTBOARD_NUMBERS[prevIndex], DARTBOARD_NUMBERS[nextIndex]]
}

// Bogey numbers that cannot be finished with 3 darts
const BOGEY_NUMBERS = [159, 162, 163, 165, 166, 168, 169]

// Check if a score is finishable with darts remaining
export function isFinishable(score: number, dartsRemaining: number): boolean {
  if (score <= 0 || score > 170) return false
  if (score === 1) return false // Can't finish on 1
  if (BOGEY_NUMBERS.includes(score)) return false // Bogey numbers cannot be finished

  // Special cases for 3 darts
  if (dartsRemaining === 3) {
    return score <= 170
  }

  // For 2 darts: max is 110 (T20, Bull)
  if (dartsRemaining === 2) {
    return score <= 110
  }

  // For 1 dart: max is 50 (Bull/D25 or any double from D1 to D20), must be even
  // Note: D20 is the highest regular double (40 points), D25 is the bull (50 points)
  // There are no doubles between 20 and 25 (no D21, D22, D23, D24)
  if (dartsRemaining === 1) {
    return score <= 50 && score % 2 === 0
  }

  return false
}

// Generate a random finishable score based on difficulty
export function generateRandomCheckout(difficulty: "easy" | "medium" | "hard" | "random" = "medium"): number {
  const finishableScores = []
  
  // Define difficulty ranges
  let minScore: number
  let maxScore: number
  
  switch (difficulty) {
    case "easy":
      minScore = 2 // Can't finish on 1
      maxScore = 40
      break
    case "medium":
      minScore = 41
      maxScore = 120
      break
    case "hard":
      minScore = 121
      maxScore = 170
      break
    case "random":
      // Random selects from all finishable scores (2-170)
      minScore = 2
      maxScore = 170
      break
    default:
      minScore = 2
      maxScore = 170
  }
  
  // Only include scores that are finishable with 3 darts (excluding bogey numbers)
  for (let i = minScore; i <= maxScore; i++) {
    if (isFinishable(i, 3) && i !== 1 && !BOGEY_NUMBERS.includes(i)) {
      finishableScores.push(i)
    }
  }
  
  if (finishableScores.length === 0) {
    // Fallback to default range if no scores found in difficulty range
    for (let i = 2; i <= 170; i++) {
      if (isFinishable(i, 3) && i !== 1 && !BOGEY_NUMBERS.includes(i)) {
        finishableScores.push(i)
      }
    }
  }
  
  return finishableScores[Math.floor(Math.random() * finishableScores.length)]
}
