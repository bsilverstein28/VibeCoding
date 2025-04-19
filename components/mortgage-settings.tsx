"use client"

import type React from "react"

import { useState } from "react"
import { Settings2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export interface MortgageSettings {
  enabled: boolean
  interestRate: number
  downPaymentPercentage: number
  loanTermYears: number
}

interface MortgageSettingsProps {
  settings: MortgageSettings
  onSettingsChange: (settings: MortgageSettings) => void
}

export function MortgageSettings({ settings, onSettingsChange }: MortgageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<MortgageSettings>(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    setIsOpen(false)
  }

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setLocalSettings({ ...localSettings, interestRate: value })
    }
  }

  const handleDownPaymentChange = (value: number[]) => {
    setLocalSettings({ ...localSettings, downPaymentPercentage: value[0] })
  }

  const handleLoanTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setLocalSettings({ ...localSettings, loanTermYears: value })
    }
  }

  const handleEnabledChange = (checked: boolean) => {
    setLocalSettings({ ...localSettings, enabled: checked })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={settings.enabled ? "default" : "outline"} size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          {settings.enabled ? "Mortgage: On" : "Mortgage: Off"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mortgage Settings</DialogTitle>
          <DialogDescription>
            Configure mortgage settings to calculate monthly payments for all properties.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="mortgage-enabled" className="text-right">
              Enable Mortgage Calculations
            </Label>
            <Switch id="mortgage-enabled" checked={localSettings.enabled} onCheckedChange={handleEnabledChange} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interest-rate" className="text-right">
              Interest Rate (%)
            </Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.125"
              min="0"
              value={localSettings.interestRate}
              onChange={handleRateChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="down-payment" className="text-right">
              Down Payment (%)
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>0%</span>
                <span>{localSettings.downPaymentPercentage}%</span>
                <span>100%</span>
              </div>
              <Slider
                id="down-payment"
                value={[localSettings.downPaymentPercentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleDownPaymentChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loan-term" className="text-right">
              Loan Term (years)
            </Label>
            <Input
              id="loan-term"
              type="number"
              min="1"
              max="50"
              value={localSettings.loanTermYears}
              onChange={handleLoanTermChange}
              className="col-span-3"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md mt-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700">Note about calculations:</p>
                <p className="text-blue-600">
                  Monthly payment calculations include mortgage principal and interest, property taxes, and estimated
                  home insurance (calculated at 0.5% of home value annually).
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
