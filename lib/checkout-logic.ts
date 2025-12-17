import { type DartTarget, getAdjacentNumbers, HIT_PROBABILITIES } from "./darts-config"

export interface ThrowResult {
  aimed: DartTarget
  hit: DartTarget
  score: number
  wasAccurate: boolean
}

export interface CheckoutRoute {
  targets: DartTarget[]
  totalScore: number
  isValid: boolean
  finishesOnDouble: boolean
}

// Simulate a realistic dart throw with miss probability
export function simulateThrow(aimedTarget: DartTarget, remainingScore: number, customHitRatio?: number): ThrowResult {
  if (aimedTarget.zone === "D" && aimedTarget.value === remainingScore) {
    return {
      aimed: aimedTarget,
      hit: aimedTarget,
      score: aimedTarget.value,
      wasAccurate: true,
    }
  }

  if (aimedTarget.zone === "BULL" && aimedTarget.value === remainingScore) {
    return {
      aimed: aimedTarget,
      hit: aimedTarget,
      score: aimedTarget.value,
      wasAccurate: true,
    }
  }

  const hitProbability = customHitRatio ? customHitRatio / 100 : HIT_PROBABILITIES.PERFECT_HIT
  const rand = Math.random()

  // Perfect hit
  if (rand < hitProbability) {
    return {
      aimed: aimedTarget,
      hit: aimedTarget,
      score: aimedTarget.value,
      wasAccurate: true,
    }
  }

  // Adjacent number hit
  if (rand < hitProbability + HIT_PROBABILITIES.ADJACENT_NUMBER) {
    if (aimedTarget.zone === "BULL" || aimedTarget.zone === "OUTER_BULL") {
      // Bulls can drop to outer bull or miss
      if (aimedTarget.zone === "BULL") {
        const hitTarget: DartTarget = { zone: "OUTER_BULL", number: 25, label: "25", value: 25 }
        return { aimed: aimedTarget, hit: hitTarget, score: 25, wasAccurate: false }
      } else {
        // Random single
        const randomNum = Math.floor(Math.random() * 20) + 1
        const hitTarget: DartTarget = { zone: "S", number: randomNum, label: `S${randomNum}`, value: randomNum }
        return { aimed: aimedTarget, hit: hitTarget, score: randomNum, wasAccurate: false }
      }
    }

    const adjacentNumbers = getAdjacentNumbers(aimedTarget.number)
    const adjacentNumber = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)]
    const hitTarget: DartTarget = {
      zone: aimedTarget.zone,
      number: adjacentNumber,
      label: `${aimedTarget.zone}${adjacentNumber}`,
      value:
        aimedTarget.zone === "T" ? adjacentNumber * 3 : aimedTarget.zone === "D" ? adjacentNumber * 2 : adjacentNumber,
    }
    return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
  }

  // Wrong zone, same number OR adjacent number miss
  if (rand < hitProbability + HIT_PROBABILITIES.ADJACENT_NUMBER + HIT_PROBABILITIES.WRONG_ZONE_SAME_NUMBER) {
    if (aimedTarget.zone === "BULL" || aimedTarget.zone === "OUTER_BULL") {
      // Drop to single random
      const randomNum = Math.floor(Math.random() * 20) + 1
      const hitTarget: DartTarget = { zone: "S", number: randomNum, label: `S${randomNum}`, value: randomNum }
      return { aimed: aimedTarget, hit: hitTarget, score: randomNum, wasAccurate: false }
    }

    if (aimedTarget.zone === "T") {
      const missType = Math.random()
      const adjacentNumbers = getAdjacentNumbers(aimedTarget.number)

      if (missType < 0.5) {
        // Hit single of same number
        const hitTarget: DartTarget = {
          zone: "S",
          number: aimedTarget.number,
          label: `S${aimedTarget.number}`,
          value: aimedTarget.number,
        }
        return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
      } else if (missType < 0.8) {
        // Hit single of adjacent number
        const adjacentNumber = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)]
        const hitTarget: DartTarget = {
          zone: "S",
          number: adjacentNumber,
          label: `S${adjacentNumber}`,
          value: adjacentNumber,
        }
        return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
      } else {
        // Hit triple of adjacent number
        const adjacentNumber = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)]
        const hitTarget: DartTarget = {
          zone: "T",
          number: adjacentNumber,
          label: `T${adjacentNumber}`,
          value: adjacentNumber * 3,
        }
        return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
      }
    }

    // For double or single, can hit other zones
    const zones: ("S" | "T" | "D")[] = ["S", "T", "D"].filter((z) => z !== aimedTarget.zone) as ("S" | "T" | "D")[]
    const newZone = zones[Math.floor(Math.random() * zones.length)]
    const hitTarget: DartTarget = {
      zone: newZone,
      number: aimedTarget.number,
      label: `${newZone}${aimedTarget.number}`,
      value: newZone === "T" ? aimedTarget.number * 3 : newZone === "D" ? aimedTarget.number * 2 : aimedTarget.number,
    }
    return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
  }

  // Complete miss for non-triples
  if (aimedTarget.zone !== "T") {
    return {
      aimed: aimedTarget,
      hit: { zone: "S", number: 0, label: "Miss", value: 0 },
      score: 0,
      wasAccurate: false,
    }
  }

  // If we got here and it's a triple, ensure we hit something
  const missType = Math.random()
  const adjacentNumbers = getAdjacentNumbers(aimedTarget.number)

  if (missType < 0.5) {
    const hitTarget: DartTarget = {
      zone: "S",
      number: aimedTarget.number,
      label: `S${aimedTarget.number}`,
      value: aimedTarget.number,
    }
    return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
  } else if (missType < 0.8) {
    const adjacentNumber = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)]
    const hitTarget: DartTarget = {
      zone: "S",
      number: adjacentNumber,
      label: `S${adjacentNumber}`,
      value: adjacentNumber,
    }
    return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
  } else {
    const adjacentNumber = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)]
    const hitTarget: DartTarget = {
      zone: "T",
      number: adjacentNumber,
      label: `T${adjacentNumber}`,
      value: adjacentNumber * 3,
    }
    return { aimed: aimedTarget, hit: hitTarget, score: hitTarget.value, wasAccurate: false }
  }
}

// Validate if a route can finish the score
export function validateCheckoutRoute(score: number, route: DartTarget[]): CheckoutRoute {
  const totalScore = route.reduce((sum, target) => sum + target.value, 0)
  const isValid = totalScore === score
  const lastTarget = route.length > 0 ? route[route.length - 1] : null
  const finishesOnDouble = lastTarget ? lastTarget.zone === "D" || lastTarget.zone === "BULL" : false

  return {
    targets: route,
    totalScore,
    isValid: isValid && finishesOnDouble,
    finishesOnDouble,
  }
}

// Get optimal checkout routes for a given score
export function getOptimalCheckouts(score: number): DartTarget[][] {
  const routes: DartTarget[][] = []

  // Common checkout routes (simplified - can be expanded)
  const commonCheckouts: { [key: number]: string[][] } = {
    170: [["T20", "T20", "D25"]],
    167: [["T20", "T19", "D25"]],
    164: [["T20", "T18", "D25"]],
    161: [["T20", "T17", "D25"]],
    160: [["T20", "T20", "D20"]],
    157: [["T20", "T19", "D20"]],
    154: [["T20", "T18", "D20"]],
    151: [["T20", "T17", "D20"]],
    150: [["T20", "T18", "D18"]],
    147: [["T20", "T17", "D18"]],
    144: [["T20", "T20", "D12"]],
    141: [["T20", "T19", "D12"]],
    138: [["T20", "T18", "D12"]],
    135: [["T20", "T15", "D15"]],
    132: [["T20", "T16", "D12"]],
    131: [["T20", "T13", "D16"]],
    130: [["T20", "T18", "D8"]],
    129: [["T19", "T16", "D12"]],
    128: [["T18", "T14", "D16"]],
    127: [["T20", "T17", "D8"]],
    126: [["T19", "T19", "D6"]],
    125: [["T18", "T13", "D16"]],
    124: [["T20", "T14", "D11"]],
    123: [["T19", "T16", "D9"]],
    122: [["T18", "T18", "D7"]],
    121: [["T20", "T11", "D14"]],
    120: [["T20", "S20", "D20"]],
    110: [["T20", "D25"]],
    107: [["T19", "D25"]],
    104: [["T18", "D25"]],
    101: [["T17", "D25"]],
    100: [["T20", "D20"]],
    97: [["T19", "D20"]],
    94: [["T18", "D20"]],
    91: [["T17", "D20"]],
    90: [["T18", "D18"]],
    87: [["T17", "D18"]],
    84: [["T20", "D12"]],
    81: [["T19", "D12"]],
    78: [["T18", "D12"]],
    75: [["T15", "D15"]],
    72: [["T16", "D12"]],
    71: [["T13", "D16"]],
    70: [["T18", "D8"]],
    69: [["T19", "D6"]],
    68: [["T20", "D4"]],
    67: [["T17", "D8"]],
    66: [["T10", "D18"]],
    65: [["T11", "D16"]],
    64: [["T16", "D8"]],
    63: [["T13", "D12"]],
    62: [["T10", "D16"]],
    61: [["T15", "D8"]],
    60: [["S20", "D20"]],
    57: [["S17", "D20"]],
    56: [["T16", "D4"]],
    55: [["S15", "D20"]],
    54: [["S14", "D20"]],
    53: [["S13", "D20"]],
    52: [["S12", "D20"]],
    51: [["S11", "D20"]],
    50: [["D25"]],
    48: [["S16", "D16"]],
    46: [["S6", "D20"]],
    44: [["S12", "D16"]],
    42: [["S10", "D16"]],
    40: [["D20"]],
    38: [["D19"]],
    36: [["D18"]],
    34: [["D17"]],
    32: [["D16"]],
    30: [["D15"]],
    28: [["D14"]],
    26: [["D13"]],
    24: [["D12"]],
    22: [["D11"]],
    20: [["D10"]],
    18: [["D9"]],
    16: [["D8"]],
    14: [["D7"]],
    12: [["D6"]],
    10: [["D5"]],
    8: [["D4"]],
    6: [["D3"]],
    4: [["D2"]],
    2: [["D1"]],
  }

  const routeLabels = commonCheckouts[score]
  if (!routeLabels) return []

  // Convert labels to targets
  return routeLabels.map((labelRoute) => {
    return labelRoute.map((label) => {
      const zone = label.charAt(0) as "T" | "D" | "S"
      const numberStr = label.slice(1)

      if (label === "D25") {
        return { zone: "BULL", number: 50, label: "Bull", value: 50 }
      }

      const number = Number.parseInt(numberStr)
      const value = zone === "T" ? number * 3 : zone === "D" ? number * 2 : number
      return { zone, number, label, value }
    })
  })
}
