"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { type DartTarget, DARTBOARD_NUMBERS } from "@/lib/darts-config"

interface DartboardSelectorProps {
  onSelectTarget: (target: DartTarget) => void
  disabled?: boolean
  size?: number
}

// Helper function to round numbers to avoid floating-point precision issues
const roundTo = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function DartboardSelector({ onSelectTarget, disabled, size = 100 }: DartboardSelectorProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSegmentClick = (zone: "T" | "D" | "S", number: number) => {
    if (disabled) return
    const value = zone === "T" ? number * 3 : zone === "D" ? number * 2 : number
    onSelectTarget({ zone, number, label: `${zone}${number}`, value })
  }

  const handleBullClick = (isBull: boolean) => {
    if (disabled) return
    if (isBull) {
      onSelectTarget({ zone: "BULL", number: 50, label: "Bull", value: 50 })
    } else {
      onSelectTarget({ zone: "OUTER_BULL", number: 25, label: "25", value: 25 })
    }
  }

  const segments = DARTBOARD_NUMBERS.map((number, index) => {
    const segmentAngle = 360 / 20
    const angle = segmentAngle * index - segmentAngle / 2

    // Black segments: 20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5 (alternating)
    const isBlackSegment = index % 2 === 0
    const singleColor = isBlackSegment ? "#1a1a1a" : "#f5f5dc" // black or cream
    const doubleTripleColor = isBlackSegment ? "#dc2626" : "#16a34a" // red or green

    return { number, angle, segmentAngle, singleColor, doubleTripleColor }
  })

  const createArc = (innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(170, 170, outerRadius, endAngle)
    const end = polarToCartesian(170, 170, outerRadius, startAngle)
    const innerStart = polarToCartesian(170, 170, innerRadius, endAngle)
    const innerEnd = polarToCartesian(170, 170, innerRadius, startAngle)
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1"

    return `M ${roundTo(start.x)} ${roundTo(start.y)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${roundTo(end.x)} ${roundTo(end.y)} L ${roundTo(innerEnd.x)} ${roundTo(innerEnd.y)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${roundTo(innerStart.x)} ${roundTo(innerStart.y)} Z`
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
    return {
      x: roundTo(centerX + radius * Math.cos(angleInRadians)),
      y: roundTo(centerY + radius * Math.sin(angleInRadians)),
    }
  }

  const getTextPosition = (radius: number, angle: number) => {
    const pos = polarToCartesian(170, 170, radius, angle)
    return {
      x: pos.x,
      y: pos.y,
    }
  }

  // Use consistent size during SSR to avoid hydration mismatch
  const displaySize = mounted ? size : 100
  const maxWidth = roundTo((400 * displaySize) / 100)

  return (
    <Card className="p-2 sm:p-3 flex items-center justify-center">
      <svg
        viewBox="0 0 340 340"
        className="w-full max-w-[400px] touch-none select-none"
        style={{
          filter: disabled ? "opacity(0.5)" : "none",
          width: `${displaySize}%`,
          maxWidth: `${maxWidth}px`,
        }}
      >
        {/* Outer border */}
        <circle cx="170" cy="170" r="148" fill="none" stroke="#888" strokeWidth="2" />

        {/* Segments */}
        {segments.map(({ number, angle, segmentAngle, singleColor, doubleTripleColor }) => {
          const startAngle = angle
          const endAngle = angle + segmentAngle
          const midAngle = angle + segmentAngle / 2
          const textPos = getTextPosition(160, midAngle)

          return (
            <g key={number}>
              <path
                d={createArc(130, 145, startAngle, endAngle)}
                fill={hoveredSegment === `D${number}` ? "#fbbf24" : doubleTripleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer transition-all"
                onClick={() => handleSegmentClick("D", number)}
                onMouseEnter={() => setHoveredSegment(`D${number}`)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ opacity: hoveredSegment === `D${number}` ? 1 : 0.9 }}
              />

              <path
                d={createArc(95, 130, startAngle, endAngle)}
                fill={hoveredSegment === `S${number}` ? "#fbbf24" : singleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer transition-all"
                onClick={() => handleSegmentClick("S", number)}
                onMouseEnter={() => setHoveredSegment(`S${number}`)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ opacity: hoveredSegment === `S${number}` ? 1 : 0.9 }}
              />

              <path
                d={createArc(75, 95, startAngle, endAngle)}
                fill={hoveredSegment === `T${number}` ? "#fbbf24" : doubleTripleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer transition-all"
                onClick={() => handleSegmentClick("T", number)}
                onMouseEnter={() => setHoveredSegment(`T${number}`)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ opacity: hoveredSegment === `T${number}` ? 1 : 0.9 }}
              />

              <path
                d={createArc(20, 75, startAngle, endAngle)}
                fill={hoveredSegment === `S${number}` ? "#fbbf24" : singleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer transition-all"
                onClick={() => handleSegmentClick("S", number)}
                onMouseEnter={() => setHoveredSegment(`S${number}`)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ opacity: hoveredSegment === `S${number}` ? 1 : 0.9 }}
              />

              {/* Number labels outside dartboard */}
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs sm:text-sm font-bold fill-foreground pointer-events-none"
              >
                {number}
              </text>
            </g>
          )
        })}

        {/* Outer Bull (25) */}
        <circle
          cx="170"
          cy="170"
          r="20"
          fill={hoveredSegment === "25" ? "#fbbf24" : "#16a34a"}
          stroke="#000"
          strokeWidth="0.5"
          className="cursor-pointer transition-all"
          onClick={() => handleBullClick(false)}
          onMouseEnter={() => setHoveredSegment("25")}
          onMouseLeave={() => setHoveredSegment(null)}
        />

        {/* Bull (50) */}
        <circle
          cx="170"
          cy="170"
          r="10"
          fill={hoveredSegment === "BULL" ? "#fbbf24" : "#dc2626"}
          stroke="#000"
          strokeWidth="0.5"
          className="cursor-pointer transition-all"
          onClick={() => handleBullClick(true)}
          onMouseEnter={() => setHoveredSegment("BULL")}
          onMouseLeave={() => setHoveredSegment(null)}
        />
      </svg>

      <div className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
        {hoveredSegment && (
          <span className="font-medium">
            {hoveredSegment === "BULL" ? "Bull (50)" : hoveredSegment === "25" ? "Outer Bull (25)" : hoveredSegment}
          </span>
        )}
      </div>
    </Card>
  )
}
