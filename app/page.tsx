"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthWelcome from "@/components/auth/auth-welcome"
import MainApp from "@/components/main-app"
import Onboarding from "@/components/onboarding"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const isMountedRef = useRef(true)
  const isLoggedOutRef = useRef(false)
  const supabaseRef = useRef(createClient())
  const hasTriedAuthRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    isLoggedOutRef.current = false
    hasTriedAuthRef.current = false

    const isLoggedOut = localStorage.getItem("isLoggedOut") === "true"
    if (isLoggedOut) {
      localStorage.removeItem("isLoggedOut")
      isLoggedOutRef.current = true
      setUser(null)
      setLoading(false)
      return
    }

    const isProfileReset = localStorage.getItem("profileReset") === "true"
    if (isProfileReset) {
      localStorage.removeItem("profileReset")
      setUser(null)
      setLoading(false)
      return
    }

    const supabase = supabaseRef.current

    const checkAuthOnce = async () => {
      if (!isMountedRef.current || isLoggedOutRef.current || hasTriedAuthRef.current) {
        return
      }

      hasTriedAuthRef.current = true

      try {
        const authPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 2000))

        const {
          data: { user },
          error: authError,
        } = (await Promise.race([authPromise, timeoutPromise])) as any

        if (!isMountedRef.current || isLoggedOutRef.current) {
          return
        }

        if (authError) {
          console.log("[v0] Auth failed, going to guest mode:", authError.message)
          setUser(null)
          setLoading(false)
          return
        }

        setUser(user)

        if (user) {
          try {
            const profilePromise = supabase.from("users").select("*").eq("id", user.id).single()
            const profileTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Profile timeout")), 2000),
            )

            const { data: userProfile, error: profileError } = (await Promise.race([
              profilePromise,
              profileTimeoutPromise,
            ])) as any

            if (!isMountedRef.current || isLoggedOutRef.current) {
              return
            }

            if (profileError && profileError.code !== "PGRST116") {
              console.log("[v0] Profile not found, needs onboarding")
              setNeedsOnboarding(true)
            } else {
              setNeedsOnboarding(!userProfile || !userProfile.school_code)
            }
          } catch (profileErr: any) {
            console.log("[v0] Profile fetch failed, needs onboarding:", profileErr.message)
            setNeedsOnboarding(true)
          }
        }

        setLoading(false)
      } catch (error: any) {
        console.log("[v0] Auth completely failed, going to guest mode:", error.message)
        if (isMountedRef.current && !isLoggedOutRef.current) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    checkAuthOnce()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMountedRef.current) return

      if (event === "SIGNED_OUT") {
        isLoggedOutRef.current = true
        setUser(null)
        setNeedsOnboarding(false)
        setLoading(false)
        return
      }

      if (event === "SIGNED_IN" && !isLoggedOutRef.current && !hasTriedAuthRef.current) {
        setUser(session?.user || null)
        setNeedsOnboarding(true)
        setLoading(false)
      }
    })

    return () => {
      isMountedRef.current = false
      isLoggedOutRef.current = true
      subscription.unsubscribe()
    }
  }, [])

  const handleOnboardingComplete = async (profile: any, school: any) => {
    if (!user || isLoggedOutRef.current) return

    try {
      const { error } = await supabaseRef.current.from("users").upsert({
        id: user.id,
        email: user.email,
        name: profile.name,
        age_group: profile.ageGroup,
        allergies: profile.allergies,
        school_name: school.SCHUL_NM,
        school_code: school.SD_SCHUL_CODE,
        office_code: school.ATPT_OFCDC_SC_CODE,
      })

      if (error) {
        console.log("[v0] Profile save error:", error.message)
        return
      }

      setNeedsOnboarding(false)
    } catch (error) {
      console.log("[v0] Profile save failed:", error)
    }
  }

  const handleNeedsOnboarding = () => {
    setNeedsOnboarding(true)
  }

  const handleGuestLogin = () => {
    localStorage.setItem("guest-mode", "true")
    window.location.href = "/guest"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user && needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (user && !needsOnboarding) {
    return <MainApp user={user} isGuest={false} onNeedsOnboarding={handleNeedsOnboarding} />
  }

  return <AuthWelcome onGuestLogin={handleGuestLogin} />
}
