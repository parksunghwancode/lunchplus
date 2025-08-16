"use client"

import { useState, useEffect, useMemo } from "react"
import { Shield, AlertTriangle, CheckCircle, Utensils } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface AllergyAnalysisProps {
  dishName: string
  profile: AllergyProfile | null
}

const allergyMap: { [key: string]: string } = {
  "1": "난류",
  "2": "우유",
  "3": "메밀",
  "4": "땅콩",
  "5": "대두",
  "6": "밀",
  "7": "고등어",
  "8": "게",
  "9": "새우",
  "10": "돼지고기",
  "11": "복숭아",
  "12": "토마토",
  "13": "아황산류",
  "14": "호두",
  "15": "닭고기",
  "16": "쇠고기",
  "17": "오징어",
  "18": "조개류",
  "19": "잣",
}

const supabase = createClient()

let userAllergiesCache: { data: string[]; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export function AllergyAnalysisComponent({ dishName, profile }: AllergyAnalysisProps) {
  const [actualUserAllergies, setActualUserAllergies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const menuItems = useMemo(() => {
    if (!dishName) return []

    const menuParts = dishName
      .split(/<br\s*\/?>/i)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    return menuParts.map((menuPart) => {
      const allergyMatch = menuPart.match(/$$([^)]+)$$/)
      const allergyNumbers = allergyMatch ? allergyMatch[1].split(".").map((n) => n.trim()) : []

      const name = menuPart.replace(/$$[^)]*$$/, "").trim()

      const allergyNames = allergyNumbers.filter((num) => allergyMap[num]).map((num) => allergyMap[num])

      console.log("[v0] 메뉴 파싱:", {
        원본: menuPart,
        이름: name,
        알레르기번호: allergyNumbers,
        알레르기이름: allergyNames,
      })

      return {
        name,
        allergyNumbers,
        allergyNames,
      }
    })
  }, [dishName])

  useEffect(() => {
    const loadUserAllergies = async () => {
      setIsLoading(true)

      if (userAllergiesCache && Date.now() - userAllergiesCache.timestamp < CACHE_DURATION) {
        setActualUserAllergies(userAllergiesCache.data)
        setIsLoading(false)
        return
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase.from("users").select("allergies").eq("id", user.id).single()

          if (data && data.allergies) {
            const allergies = data.allergies
            userAllergiesCache = { data: allergies, timestamp: Date.now() }
            setActualUserAllergies(allergies)
          } else {
            setActualUserAllergies([])
          }
        } else {
          const guestProfile = localStorage.getItem("guest-profile")
          if (guestProfile) {
            const parsed = JSON.parse(guestProfile)
            const allergies = parsed.allergies || []
            userAllergiesCache = { data: allergies, timestamp: Date.now() }
            setActualUserAllergies(allergies)
          } else {
            setActualUserAllergies([])
          }
        }
      } catch (error) {
        console.error("[v0] 알레르기 로딩 오류:", error)
        setActualUserAllergies([])
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAllergies()
  }, []) // 의존성 배열을 비워서 한 번만 실행

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>알레르기 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (actualUserAllergies.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>알레르기 분석을 위해 프로필에서 알레르기 정보를 설정해주세요.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasAnyRisk = menuItems.some((item) =>
    item.allergyNames.some((allergy: string) => actualUserAllergies.includes(allergy)),
  )

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${hasAnyRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            {hasAnyRisk ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            <div>
              <div className={`text-lg font-bold ${hasAnyRisk ? "text-red-800" : "text-green-800"}`}>
                {hasAnyRisk ? "⚠️ 주의 필요" : "✅ 안전"}
              </div>
              <div className="text-sm font-normal text-gray-600">
                {actualUserAllergies.length}개 알레르기 기준 분석 결과
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasAnyRisk ? (
            <div className="bg-red-100 p-3 rounded-lg">
              <h4 className="font-medium mb-1 text-sm text-red-800">⚠️ 경고</h4>
              <div className="text-sm text-red-700">
                일부 메뉴에 회원님의 알레르기 유발 요소가 포함되어 있습니다. 아래 개별 메뉴 분석을 확인해주세요.
              </div>
            </div>
          ) : (
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-sm text-green-700">모든 메뉴가 회원님께 안전합니다. 안심하고 드실 수 있습니다.</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          메뉴별 상세 분석
        </h3>

        {menuItems.map((menuItem, index) => {
          const menuHasRisk = menuItem.allergyNames.some((allergy: string) => actualUserAllergies.includes(allergy))
          const matchingUserAllergies = menuItem.allergyNames.filter((allergy: string) =>
            actualUserAllergies.includes(allergy),
          )

          return (
            <Card
              key={index}
              className={`border ${menuHasRisk ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {menuHasRisk ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <h4 className="font-medium">{menuItem.name}</h4>
                    </div>

                    {menuItem.allergyNames.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">포함된 알레르기 요소:</p>
                        <div className="flex flex-wrap gap-1">
                          {menuItem.allergyNames.map((allergy: string, allergyIdx: number) => {
                            const isUserAllergy = actualUserAllergies.includes(allergy)
                            return (
                              <Badge
                                key={allergyIdx}
                                className={
                                  isUserAllergy
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : "bg-gray-100 text-gray-600 border-gray-300"
                                }
                              >
                                {isUserAllergy && "⚠️ "}
                                {allergy}
                              </Badge>
                            )
                          })}
                        </div>

                        {menuHasRisk && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                            <strong>주의:</strong> 이 메뉴에는 {matchingUserAllergies.join(", ")} 알레르기 요소가
                            포함되어 있습니다.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                        알레르기 정보가 표시되지 않은 메뉴입니다. 안전하게 드실 수 있습니다.
                      </div>
                    )}
                  </div>

                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      menuHasRisk ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                    }`}
                  >
                    {menuHasRisk ? "위험" : "안전"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
