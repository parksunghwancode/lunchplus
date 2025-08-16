"use client"

import { useState, useEffect } from "react"
import Onboarding from "@/components/onboarding"
import MainApp from "@/components/main-app"
import type { AllergyProfile } from "@/lib/allergy/manager"

export const dynamic = "force-dynamic"

export default function GuestPage() {
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const checkGuestSetup = () => {
      try {
        const savedProfile = localStorage.getItem("guest-profile")
        const savedSchool = localStorage.getItem("guest-school")

        if (savedProfile && savedSchool) {
          setIsFirstTime(false)
        }
      } catch (error) {
        console.error("Failed to load guest data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkGuestSetup()
  }, [])

  const handleOnboardingComplete = (profile: AllergyProfile, school: any) => {
    try {
      localStorage.setItem("guest-profile", JSON.stringify(profile))
      localStorage.setItem("guest-school", JSON.stringify(school))
      setIsFirstTime(false)
    } catch (error) {
      console.error("Failed to save guest data:", error)
    }
  }

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isFirstTime) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <MainApp user={null} isGuest={true} />
}
