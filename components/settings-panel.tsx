"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { loadSettings, saveSettings, type HitRatioSettings } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Target, Moon, Sun } from "lucide-react"

interface SettingsPanelProps {
  onSettingsChange?: (settings: HitRatioSettings) => void
}

export function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [settings, setSettings] = useState<HitRatioSettings>({ triple: 65, double: 65, single: 85, dartboardSize: 120 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSettings(loadSettings())
  }, [])

  const currentTheme = resolvedTheme || theme || "dark"
  
  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const handleSettingChange = (key: keyof HitRatioSettings, value: number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleReset = () => {
    const defaultSettings = { triple: 65, double: 65, single: 85, dartboardSize: 120 }
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    onSettingsChange?.(defaultSettings)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-3">
      <Card className="p-3 bg-card/50">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-2">
            {currentTheme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            Theme
          </Label>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="text-xs h-7"
          >
            {currentTheme === "dark" ? (
              <>
                <Sun className="size-3 mr-1" />
                Light
              </>
            ) : (
              <>
                <Moon className="size-3 mr-1" />
                Dark
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="size-3.5" />
          Hit Ratio Settings
        </h3>
        <Button onClick={handleReset} variant="ghost" size="sm" className="text-xs h-7">
          Reset
        </Button>
      </div>

      <Card className="p-3 space-y-4 bg-card/50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="size-slider" className="text-xs font-medium">
              Dartboard Size
            </Label>
            <span className="text-xs font-semibold text-muted-foreground">{settings.dartboardSize}%</span>
          </div>
          <Slider
            id="size-slider"
            min={60}
            max={150}
            step={10}
            value={[settings.dartboardSize]}
            onValueChange={(value) => handleSettingChange("dartboardSize", value[0])}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="triple-slider" className="text-xs font-medium">
              Triple
            </Label>
            <span className="text-xs font-semibold text-muted-foreground">{settings.triple}%</span>
          </div>
          <Slider
            id="triple-slider"
            min={10}
            max={100}
            step={5}
            value={[settings.triple]}
            onValueChange={(value) => handleSettingChange("triple", value[0])}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="double-slider" className="text-xs font-medium">
              Double
            </Label>
            <span className="text-xs font-semibold text-muted-foreground">{settings.double}%</span>
          </div>
          <Slider
            id="double-slider"
            min={10}
            max={100}
            step={5}
            value={[settings.double]}
            onValueChange={(value) => handleSettingChange("double", value[0])}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="single-slider" className="text-xs font-medium">
              Single
            </Label>
            <span className="text-xs font-semibold text-muted-foreground">{settings.single}%</span>
          </div>
          <Slider
            id="single-slider"
            min={10}
            max={100}
            step={5}
            value={[settings.single]}
            onValueChange={(value) => handleSettingChange("single", value[0])}
            className="w-full"
          />
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Adjust dartboard size and hit ratios to match your skill level or practice at different difficulties.
      </p>
    </div>
  )
}
