"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { type DartTarget, DARTBOARD_NUMBERS } from "@/lib/darts-config"

interface DartboardSelectorProps {
  onSelectTarget: (target: DartTarget) => void
  onHoverTarget?: (target: DartTarget | null) => void
  disabled?: boolean
  size?: number
  tripleInnerRadius?: number
  tripleOuterRadius?: number
  dotOffsetY?: number
}

// Helper function to round numbers to avoid floating-point precision issues
const roundTo = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function DartboardSelector({ onSelectTarget, onHoverTarget, disabled, size = 100, tripleInnerRadius = 80, tripleOuterRadius = 95, dotOffsetY = -45 }: DartboardSelectorProps) {
  const [mounted, setMounted] = useState(false)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const [isTouching, setIsTouching] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const touchStartTimeRef = useRef<number>(0)
  const hasMovedRef = useRef<boolean>(false)
  const shouldPreventClickRef = useRef<boolean>(false)
  const isTouchingRef = useRef<boolean>(false)
  const touchPositionRef = useRef<{ x: number; y: number } | null>(null)
  const onHoverTargetRef = useRef(onHoverTarget)
  const onSelectTargetRef = useRef(onSelectTarget)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep refs in sync with props
  useEffect(() => {
    onHoverTargetRef.current = onHoverTarget
    onSelectTargetRef.current = onSelectTarget
  }, [onHoverTarget, onSelectTarget])

  // Keep refs in sync with state
  useEffect(() => {
    isTouchingRef.current = isTouching
    touchPositionRef.current = touchPosition
  }, [isTouching, touchPosition])

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

  // Convert screen coordinates to SVG viewBox coordinates
  const screenToSVG = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!svgRef.current) return null
    
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    
    const x = ((clientX - rect.left) / rect.width) * viewBox.width
    const y = ((clientY - rect.top) / rect.height) * viewBox.height
    
    return { x, y }
  }

  // Determine which target is at a given SVG coordinate
  const getTargetAtPoint = (x: number, y: number): DartTarget | null => {
    const centerX = 170
    const centerY = 170
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90 // Convert to 0-360 starting from top
    const normalizedAngle = angle < 0 ? angle + 360 : angle

    // Check for bull
    if (distance <= 10) {
      return { zone: "BULL", number: 50, label: "Bull", value: 50 }
    }
    if (distance <= 20) {
      return { zone: "OUTER_BULL", number: 25, label: "25", value: 25 }
    }

    // Determine which segment number
    const segmentAngle = 360 / 20
    let segmentIndex = Math.floor((normalizedAngle + segmentAngle / 2) / segmentAngle)
    if (segmentIndex >= 20) segmentIndex = 0
    const number = DARTBOARD_NUMBERS[segmentIndex]

    // Determine zone based on radius
    if (distance >= 130 && distance <= 145) {
      // Double ring
      return { zone: "D", number, label: `D${number}`, value: number * 2 }
    } else if (distance >= tripleInnerRadius && distance <= tripleOuterRadius) {
      // Triple ring
      return { zone: "T", number, label: `T${number}`, value: number * 3 }
    } else if (distance > 20 && distance < 145) {
      // Single zone
      return { zone: "S", number, label: `S${number}`, value: number }
    }

    return null
  }

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    touchStartTimeRef.current = Date.now()
    hasMovedRef.current = false
    shouldPreventClickRef.current = false
    
    const svgPoint = screenToSVG(touch.clientX, touch.clientY)
    
    if (svgPoint) {
      // Show dot and preview immediately
      setIsTouching(true)
      isTouchingRef.current = true
      setTouchPosition(svgPoint)
      touchPositionRef.current = svgPoint
      
      // Show preview - use dot position
      const dotY = svgPoint.y + dotOffsetY
      const target = getTargetAtPoint(svgPoint.x, dotY)
      if (target && onHoverTargetRef.current) {
        onHoverTargetRef.current(target)
      }
    }
  }, [disabled, dotOffsetY])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled) return
    
    e.preventDefault() // Prevent scrolling when dragging
    hasMovedRef.current = true
    
    const touch = e.touches[0]
    if (!touch) return
    
    const svgPoint = screenToSVG(touch.clientX, touch.clientY)
    
    if (svgPoint) {
      // Ensure dot is visible when moving
      if (!isTouchingRef.current) {
        setIsTouching(true)
        isTouchingRef.current = true
      }
      setTouchPosition(svgPoint)
      touchPositionRef.current = svgPoint
      
      // Update preview as user moves - use dot position
      const dotY = svgPoint.y + dotOffsetY
      const target = getTargetAtPoint(svgPoint.x, dotY)
      if (target && onHoverTargetRef.current) {
        onHoverTargetRef.current(target)
      } else if (onHoverTargetRef.current) {
        onHoverTargetRef.current(null)
      }
    }
  }, [disabled, dotOffsetY])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled) return
    
    const holdTime = Date.now() - touchStartTimeRef.current
    
    // If user moved or held for more than 100ms, handle selection here
    if (hasMovedRef.current || (isTouchingRef.current && holdTime > 100)) {
      e.preventDefault()
      shouldPreventClickRef.current = true
      
      const currentTouchPosition = touchPositionRef.current
      if (currentTouchPosition) {
        // Use dot position for selection
        const dotY = currentTouchPosition.y + dotOffsetY
        const target = getTargetAtPoint(currentTouchPosition.x, dotY)
        if (target && onSelectTargetRef.current) {
          onSelectTargetRef.current(target)
        }
      }
      
      // Reset flag after a short delay
      setTimeout(() => {
        shouldPreventClickRef.current = false
      }, 100)
    } else {
      // Quick tap - let click handler work
      shouldPreventClickRef.current = false
    }
    
    setIsTouching(false)
    isTouchingRef.current = false
    setTouchPosition(null)
    touchPositionRef.current = null
    
    if (onHoverTargetRef.current) {
      onHoverTargetRef.current(null)
    }
  }, [disabled, dotOffsetY])

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    setIsTouching(false)
    isTouchingRef.current = false
    setTouchPosition(null)
    touchPositionRef.current = null
    hasMovedRef.current = false
    shouldPreventClickRef.current = false
    
    if (onHoverTargetRef.current) {
      onHoverTargetRef.current(null)
    }
  }, [])

  // Attach touch event listeners directly to DOM with passive: false
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    svg.addEventListener('touchstart', handleTouchStart, { passive: true })
    svg.addEventListener('touchmove', handleTouchMove, { passive: false })
    svg.addEventListener('touchend', handleTouchEnd, { passive: false })
    svg.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      svg.removeEventListener('touchstart', handleTouchStart)
      svg.removeEventListener('touchmove', handleTouchMove)
      svg.removeEventListener('touchend', handleTouchEnd)
      svg.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel])

  // Use consistent size during SSR to avoid hydration mismatch
  const displaySize = mounted ? size : 100
  const maxWidth = roundTo((450 * displaySize) / 100)

  return (
    <Card className="p-4 sm:p-6 flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 340 340"
        className="w-full max-w-[550px] touch-none select-none"
        style={{
          filter: disabled ? "opacity(0.5)" : "none",
          width: `${displaySize}%`,
          maxWidth: `${maxWidth}px`,
        }}
      >
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
                fill={doubleTripleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleSegmentClick("D", number)}
                onMouseEnter={() => {
                  if (onHoverTarget && !disabled) {
                    const value = number * 2
                    onHoverTarget({ zone: "D", number, label: `D${number}`, value })
                  }
                }}
                onMouseLeave={() => {
                  if (onHoverTarget) {
                    onHoverTarget(null)
                  }
                }}
              />

              <path
                d={createArc(tripleOuterRadius, 130, startAngle, endAngle)}
                fill={singleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleSegmentClick("S", number)}
                onMouseEnter={() => {
                  if (onHoverTarget && !disabled) {
                    onHoverTarget({ zone: "S", number, label: `S${number}`, value: number })
                  }
                }}
                onMouseLeave={() => {
                  if (onHoverTarget) {
                    onHoverTarget(null)
                  }
                }}
              />

              <path
                d={createArc(tripleInnerRadius, tripleOuterRadius, startAngle, endAngle)}
                fill={doubleTripleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleSegmentClick("T", number)}
                onMouseEnter={() => {
                  if (onHoverTarget && !disabled) {
                    const value = number * 3
                    onHoverTarget({ zone: "T", number, label: `T${number}`, value })
                  }
                }}
                onMouseLeave={() => {
                  if (onHoverTarget) {
                    onHoverTarget(null)
                  }
                }}
              />

              <path
                d={createArc(20, tripleInnerRadius, startAngle, endAngle)}
                fill={singleColor}
                stroke="#000"
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleSegmentClick("S", number)}
                onMouseEnter={() => {
                  if (onHoverTarget && !disabled) {
                    onHoverTarget({ zone: "S", number, label: `S${number}`, value: number })
                  }
                }}
                onMouseLeave={() => {
                  if (onHoverTarget) {
                    onHoverTarget(null)
                  }
                }}
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
          fill="#16a34a"
          stroke="#000"
          strokeWidth="0.5"
          className="cursor-pointer"
          onClick={() => handleBullClick(false)}
          onMouseEnter={() => {
            if (onHoverTarget && !disabled) {
              onHoverTarget({ zone: "OUTER_BULL", number: 25, label: "25", value: 25 })
            }
          }}
          onMouseLeave={() => {
            if (onHoverTarget) {
              onHoverTarget(null)
            }
          }}
        />

        {/* Bull (50) */}
        <circle
          cx="170"
          cy="170"
          r="10"
          fill="#dc2626"
          stroke="#000"
          strokeWidth="0.5"
          className="cursor-pointer"
          onClick={() => handleBullClick(true)}
          onMouseEnter={() => {
            if (onHoverTarget && !disabled) {
              onHoverTarget({ zone: "BULL", number: 50, label: "Bull", value: 50 })
            }
          }}
          onMouseLeave={() => {
            if (onHoverTarget) {
              onHoverTarget(null)
            }
          }}
        />

        {/* Touch indicator dot */}
        {isTouching && touchPosition && (
          <g style={{ pointerEvents: "none" }}>
            {/* Glow effect */}
            <circle
              cx={touchPosition.x}
              cy={touchPosition.y + dotOffsetY}
              r="6"
              fill="#ffff00"
              opacity="0.4"
            />
            {/* Main bright dot */}
            <circle
              cx={touchPosition.x}
              cy={touchPosition.y + dotOffsetY}
              r="5"
              fill="#ffff00"
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Inner highlight */}
            <circle
              cx={touchPosition.x}
              cy={touchPosition.y + dotOffsetY}
              r="2.5"
              fill="#ffffff"
              opacity="0.8"
            />
          </g>
        )}
      </svg>

    </Card>
  )
}
