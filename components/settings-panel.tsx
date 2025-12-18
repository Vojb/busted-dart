"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { loadSettings, saveSettings, type HitRatioSettings, type Difficulty, type DartboardColorTheme, type DartboardThemeColors } from "@/lib/storage"
import { getDartboardThemeColors } from "@/lib/dartboard-themes"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Target, Moon, Sun, GraduationCap, Settings, Ruler, Palette } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface SettingsPanelProps {
  onSettingsChange?: (settings: HitRatioSettings) => void
}

export function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [settings, setSettings] = useState<HitRatioSettings>({ triple: 65, double: 65, single: 85, bullseye: 60, dartboardSize: 100, difficulty: "medium", tripleInnerRadius: 80, tripleOuterRadius: 95, dotOffsetY: -45, learningMode: false, dartboardColorTheme: "classic", customThemeColors: { singleBlack: "#1a1a1a", singleCream: "#f5f5dc", doubleTripleRed: "#dc2626", doubleTripleGreen: "#16a34a", outerBull: "#16a34a", bull: "#dc2626" } })
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
    const defaultSettings = { triple: 65, double: 65, single: 85, bullseye: 60, dartboardSize: 100, difficulty: "medium" as Difficulty, tripleInnerRadius: 80, tripleOuterRadius: 95, dotOffsetY: -45, learningMode: false, dartboardColorTheme: "classic" as DartboardColorTheme, customThemeColors: { singleBlack: "#1a1a1a", singleCream: "#f5f5dc", doubleTripleRed: "#dc2626", doubleTripleGreen: "#16a34a", outerBull: "#16a34a", bull: "#dc2626" } }
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    onSettingsChange?.(defaultSettings)
  }
  
  const handleDifficultyChange = (difficulty: Difficulty) => {
    const newSettings = { ...settings, difficulty }
    setSettings(newSettings)
    saveSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleLearningModeChange = (enabled: boolean) => {
    const newSettings = { ...settings, learningMode: enabled }
    setSettings(newSettings)
    saveSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleColorThemeChange = (theme: DartboardColorTheme) => {
    // If switching to custom and no custom colors exist, initialize with default
    const customColors = theme === "custom" && !settings.customThemeColors
      ? { singleBlack: "#1a1a1a", singleCream: "#f5f5dc", doubleTripleRed: "#dc2626", doubleTripleGreen: "#16a34a", outerBull: "#16a34a", bull: "#dc2626" }
      : settings.customThemeColors
    const newSettings = { ...settings, dartboardColorTheme: theme, customThemeColors: customColors }
    setSettings(newSettings)
    saveSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleCustomColorChange = (colorKey: keyof DartboardThemeColors, value: string) => {
    const newCustomColors = {
      ...(settings.customThemeColors || { singleBlack: "#1a1a1a", singleCream: "#f5f5dc", doubleTripleRed: "#dc2626", doubleTripleGreen: "#16a34a", outerBull: "#16a34a", bull: "#dc2626" }),
      [colorKey]: value,
    }
    const newSettings = { ...settings, customThemeColors: newCustomColors }
    setSettings(newSettings)
    saveSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  // Get current theme colors for preview
  const currentThemeColors = getDartboardThemeColors(settings.dartboardColorTheme, settings.customThemeColors)

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Settings</h3>
        <Button onClick={handleReset} variant="ghost" size="sm" className="text-xs h-7">
          Reset All
        </Button>
      </div>

      <Tabs defaultValue="hit-ratio" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="hit-ratio" className="text-xs">
            <Target className="size-3.5 mr-1.5" />
            Hit Ratio
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs">
            <Settings className="size-3.5 mr-1.5" />
            System
          </TabsTrigger>
          <TabsTrigger value="sizes" className="text-xs">
            <Ruler className="size-3.5 mr-1.5" />
            Sizes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hit-ratio" className="mt-3 space-y-3">
          <Card className="p-3 space-y-4 bg-card/50">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bullseye-slider" className="text-xs font-medium">
                  Double Bullseye
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">{settings.bullseye}%</span>
              </div>
              <Slider
                id="bullseye-slider"
                min={10}
                max={100}
                step={5}
                value={[settings.bullseye]}
                onValueChange={(value) => handleSettingChange("bullseye", value[0])}
                className="w-full"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-3 space-y-3">
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

          <Card className="p-3 bg-card/50">
            <div className="space-y-2">
              <Label htmlFor="difficulty-select" className="text-xs font-medium">
                Difficulty
              </Label>
              <Select value={settings.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger id="difficulty-select" size="sm" className="w-full text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (1-40)</SelectItem>
                  <SelectItem value="medium">Medium (40-120)</SelectItem>
                  <SelectItem value="hard">Hard (120-170)</SelectItem>
                  <SelectItem value="random">Random (1-170)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only scores finishable with 3 darts will be generated
              </p>
            </div>
          </Card>

          <Card className="p-3 bg-card/50">
            <div className="flex items-center justify-between">
              <Label htmlFor="learning-mode-switch" className="text-xs font-medium flex items-center gap-2">
                <GraduationCap className="size-3.5" />
                Learning Mode
              </Label>
              <Switch
                id="learning-mode-switch"
                checked={settings.learningMode}
                onCheckedChange={handleLearningModeChange}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Show remaining checkout options after each dart. Streaks are disabled in learning mode.
            </p>
          </Card>

          <Card className="p-3 bg-card/50">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="color-theme-select" className="text-xs font-medium flex items-center gap-2">
                  <Palette className="size-3.5" />
                  Dartboard Color Theme
                </Label>
                <Select value={settings.dartboardColorTheme} onValueChange={handleColorThemeChange}>
                  <SelectTrigger id="color-theme-select" size="sm" className="w-full text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="muted">Muted</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
                </Select>
              </div>

              {/* Color Preview */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Preview</Label>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: currentThemeColors.singleBlack }}
                        title="Black Segment"
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: currentThemeColors.singleCream }}
                        title="Cream Segment"
                      />
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: currentThemeColors.doubleTripleRed }}
                        title="Red Ring"
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: currentThemeColors.doubleTripleGreen }}
                        title="Green Ring"
                      />
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: currentThemeColors.outerBull }}
                        title="Outer Bull (25)"
                      />
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: currentThemeColors.bull }}
                        title="Bull (50)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Theme Color Pickers */}
              {settings.dartboardColorTheme === "custom" && (
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-xs font-medium">Custom Colors</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="custom-black" className="text-xs text-muted-foreground">
                        Black Segment
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-black"
                          type="color"
                          value={settings.customThemeColors?.singleBlack || "#1a1a1a"}
                          onChange={(e) => handleCustomColorChange("singleBlack", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.singleBlack || "#1a1a1a"}
                          onChange={(e) => handleCustomColorChange("singleBlack", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#1a1a1a"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-cream" className="text-xs text-muted-foreground">
                        Cream Segment
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-cream"
                          type="color"
                          value={settings.customThemeColors?.singleCream || "#f5f5dc"}
                          onChange={(e) => handleCustomColorChange("singleCream", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.singleCream || "#f5f5dc"}
                          onChange={(e) => handleCustomColorChange("singleCream", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#f5f5dc"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-red" className="text-xs text-muted-foreground">
                        Red Ring
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-red"
                          type="color"
                          value={settings.customThemeColors?.doubleTripleRed || "#dc2626"}
                          onChange={(e) => handleCustomColorChange("doubleTripleRed", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.doubleTripleRed || "#dc2626"}
                          onChange={(e) => handleCustomColorChange("doubleTripleRed", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#dc2626"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-green" className="text-xs text-muted-foreground">
                        Green Ring
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-green"
                          type="color"
                          value={settings.customThemeColors?.doubleTripleGreen || "#16a34a"}
                          onChange={(e) => handleCustomColorChange("doubleTripleGreen", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.doubleTripleGreen || "#16a34a"}
                          onChange={(e) => handleCustomColorChange("doubleTripleGreen", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-outer-bull" className="text-xs text-muted-foreground">
                        Outer Bull
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-outer-bull"
                          type="color"
                          value={settings.customThemeColors?.outerBull || "#16a34a"}
                          onChange={(e) => handleCustomColorChange("outerBull", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.outerBull || "#16a34a"}
                          onChange={(e) => handleCustomColorChange("outerBull", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#16a34a"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-bull" className="text-xs text-muted-foreground">
                        Bull (50)
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="custom-bull"
                          type="color"
                          value={settings.customThemeColors?.bull || "#dc2626"}
                          onChange={(e) => handleCustomColorChange("bull", e.target.value)}
                          className="h-8 w-12 p-0 border"
                        />
                        <Input
                          type="text"
                          value={settings.customThemeColors?.bull || "#dc2626"}
                          onChange={(e) => handleCustomColorChange("bull", e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="#dc2626"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="mt-3 space-y-3">
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
                <Label htmlFor="triple-inner-radius-slider" className="text-xs font-medium">
                  Triple Inner Radius
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">{settings.tripleInnerRadius}</span>
              </div>
              <Slider
                id="triple-inner-radius-slider"
                min={50}
                max={90}
                step={1}
                value={[settings.tripleInnerRadius]}
                onValueChange={(value) => handleSettingChange("tripleInnerRadius", value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="triple-outer-radius-slider" className="text-xs font-medium">
                  Triple Outer Radius
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">{settings.tripleOuterRadius}</span>
              </div>
              <Slider
                id="triple-outer-radius-slider"
                min={90}
                max={130}
                step={1}
                value={[settings.tripleOuterRadius]}
                onValueChange={(value) => handleSettingChange("tripleOuterRadius", value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dot-offset-slider" className="text-xs font-medium">
                  Dot Position Offset
                </Label>
                <span className="text-xs font-semibold text-muted-foreground">{settings.dotOffsetY}</span>
              </div>
              <Slider
                id="dot-offset-slider"
                min={-100}
                max={0}
                step={1}
                value={[settings.dotOffsetY]}
                onValueChange={(value) => handleSettingChange("dotOffsetY", value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the vertical position of the touch indicator dot (negative values move it upward)
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
