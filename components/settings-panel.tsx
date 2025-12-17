"use client"

import { useState, useEffect } from "react"
import { loadSettings, saveSettings, type HitRatioSettings } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

interface SettingsPanelProps {
  onSettingsChange?: (settings: HitRatioSettings) => void
}

export function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<HitRatioSettings>({ triple: 65, double: 65, single: 85, dartboardSize: 120 })

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

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

  return (
    <div className="space-y-3">
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
