"use client"
import { useState } from "react"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div>
      <h1>Onboarding Page</h1>
      <p>Step {currentStep}</p>
    </div>
  )
}
