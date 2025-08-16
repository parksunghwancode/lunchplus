"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, BarChart3, User } from "lucide-react"
import type { User as SupaUser } from "@supabase/supabase-js"

import { HomeTab } from "./tabs/home-tab"
import { AnalysisTab } from "./tabs/analysis-tab"
import { ProfileTab } from "./tabs/profile-tab"

interface MainAppProps {
  user: SupaUser | null
  isGuest: boolean
  onNeedsOnboarding?: () => void
}

export default function MainApp({ user, isGuest, onNeedsOnboarding }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [loading, setLoading] = useState(true)
  const [allergyProfile, setAllergyProfile] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  const isMountedRef = useRef(true)
  const isLoggedOutRef = useRef(false)
  const isResettingRef = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (dataLoaded) return

    const loadUserData = async () => {
      try {
        if (!isMountedRef.current || isLoggedOutRef.current || isResettingRef.current) return

        if (isGuest) {
          const guestProfile = localStorage.getItem("guest-profile")
          const guestSchool = localStorage.getItem("guest-school")

          if (guestProfile) setAllergyProfile(JSON.parse(guestProfile))
          if (guestSchool) setSelectedSchool(JSON.parse(guestSchool))
        } else if (user) {
          if (!isMountedRef.current || isLoggedOutRef.current || isResettingRef.current) return

          try {
            const { data: userData, error } = await supabase.from("users").select("*").eq("id", user.id).single()

            if (!isMountedRef.current || isLoggedOutRef.current || isResettingRef.current) return

            if (error) {
              console.log("[v0] Profile fetch error:", error.message)
            } else if (userData) {
              const profile = {
                name: userData.name,
                ageGroup: userData.age_group,
                allergies: userData.allergies || [],
              }
              setAllergyProfile(profile)

              if (userData.school_name && userData.school_code && userData.office_code) {
                const school = {
                  SCHUL_NM: userData.school_name,
                  SD_SCHUL_CODE: userData.school_code,
                  ATPT_OFCDC_SC_CODE: userData.office_code,
                }
                setSelectedSchool(school)
              }
            }
          } catch (fetchError) {
            if (!isMountedRef.current || isResettingRef.current) return
            console.log("[v0] Profile fetch error:", fetchError.message)
          }
        }

        if (isMountedRef.current && !isLoggedOutRef.current && !isResettingRef.current) {
          setDataLoaded(true)
        }
      } catch (error) {
        if (isMountedRef.current && !isResettingRef.current) {
          console.log("[v0] Data loading error:", error.message)
        }
      } finally {
        if (isMountedRef.current && !isResettingRef.current) {
          setLoading(false)
        }
      }
    }

    loadUserData()
  }, [user, isGuest, dataLoaded])

  const handleResetProfile = useCallback(async () => {
    try {
      isResettingRef.current = true
      setAllergyProfile(null)
      setSelectedSchool(null)
      setDataLoaded(false)

      if (isGuest) {
        localStorage.removeItem("guest-profile")
        localStorage.removeItem("guest-school")
      } else {
        localStorage.removeItem("allergyProfile")
        localStorage.removeItem("selectedSchool")
      }

      if (onNeedsOnboarding) {
        onNeedsOnboarding()
      }

      isResettingRef.current = false
    } catch (error) {
      console.log("[v0] Profile reset error:", error.message)
      if (onNeedsOnboarding) {
        onNeedsOnboarding()
      }
      isResettingRef.current = false
    }
  }, [isGuest, onNeedsOnboarding])

  const handleProfileUpdate = useCallback((updatedProfile) => {
    setAllergyProfile(updatedProfile)
  }, [])

  const handleAnalysisClick = useCallback(() => {
    setActiveTab("analysis")
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4 pb-20">
          <TabsContent value="home" className="mt-0">
            <HomeTab
              allergyProfile={allergyProfile}
              selectedSchool={selectedSchool}
              onAnalysisClick={handleAnalysisClick}
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-0">
            <AnalysisTab selectedSchool={selectedSchool} allergyProfile={allergyProfile} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileTab
              allergyProfile={allergyProfile}
              selectedSchool={selectedSchool}
              onResetProfile={handleResetProfile}
              onProfileUpdate={handleProfileUpdate}
            />
          </TabsContent>
        </div>

        <TabsList className="fixed bottom-0 left-0 right-0 w-full h-16 bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-none shadow-lg grid grid-cols-3">
          <TabsTrigger
            value="home"
            className="flex flex-col items-center justify-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 w-full"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">홈</span>
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex flex-col items-center justify-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 w-full"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">분석</span>
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="flex flex-col items-center justify-center gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 w-full"
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">프로필</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
