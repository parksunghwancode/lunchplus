"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Shield, Loader2, Calendar } from "lucide-react"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface DailyAllergyAlertProps {
  selectedSchool: any
  allergyProfile: AllergyProfile | null
}

export function DailyAllergyAlert({ selectedSchool, allergyProfile }: DailyAllergyAlertProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([])
  const [hasError, setHasError] = useState(false)
  const [noMealToday, setNoMealToday] = useState(false)

  useEffect(() => {
    const checkTodayAllergy = async () => {
      if (!selectedSchool || !allergyProfile?.allergies) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setHasError(false)
        setNoMealToday(false)

        const today = new Date()
        const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "")

        const response = await fetch(
          `/api/meals?schoolCode=${selectedSchool.SD_SCHUL_CODE}&officeCode=${selectedSchool.ATPT_OFCDC_SC_CODE}&date=${formattedDate}`,
        )

        if (!response.ok) {
          throw new Error("급식 정보를 가져올 수 없습니다")
        }

        const data = await response.json()

        if (!data.meals || data.meals.length === 0) {
          setNoMealToday(true)
          setAllergyWarnings([])
          setIsLoading(false)
          return
        }

        const warnings: string[] = []
        const todayMeal = data.meals[0]

        if (todayMeal?.meal?.DDISH_NM) {
          const menuText = todayMeal.meal.DDISH_NM

          // 메뉴에서 알레르기 숫자 추출
          const allergyNumbers: string[] = []
          const patterns = [/\$\$([0-9.]+)\$\$/g, /$$([0-9.]+)$$/g, /\[([0-9.]+)\]/g, /([0-9.]+)-\*\*/g]

          patterns.forEach((pattern) => {
            let match
            while ((match = pattern.exec(menuText)) !== null) {
              const numbers = match[1].split(".").filter((n) => n.length > 0)
              allergyNumbers.push(...numbers)
            }
          })

          // 알레르기 번호를 이름으로 변환
          const allergenMap: { [key: string]: string } = {
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

          const detectedAllergens = allergyNumbers
            .map((num) => allergenMap[num])
            .filter((allergen) => allergen && allergyProfile.allergies?.includes(allergen))

          setAllergyWarnings([...new Set(detectedAllergens)])
        }
      } catch (error) {
        console.error("알레르기 확인 중 오류:", error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkTodayAllergy()
  }, [selectedSchool, allergyProfile])

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">오늘 급식 알레르기 확인 중...</span>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="bg-gray-50 rounded-3xl p-6 mb-6 shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-700 mb-2">알레르기 정보 확인 불가</h3>
          <p className="text-gray-500 text-sm">급식 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  if (noMealToday) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-3xl p-6 mb-6 shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="bg-gradient-to-r from-gray-400 to-slate-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">📅 급식 없음</h3>
          <p className="text-gray-600">오늘은 급식이 제공되지 않습니다</p>
          <p className="text-gray-500 text-sm mt-1">(주말, 공휴일, 방학)</p>
        </div>
      </div>
    )
  }

  if (allergyWarnings.length > 0) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-6 mb-6 shadow-lg border border-red-200 animate-pulse">
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-red-700 text-lg mb-2">⚠️ 알레르기 주의</h3>
          <p className="text-red-600 mb-4">오늘 급식에 알레르기 유발 요소가 포함되어 있습니다</p>
          <div className="flex flex-wrap justify-center gap-2">
            {allergyWarnings.map((allergen) => (
              <span
                key={allergen}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold border border-red-300"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 mb-6 shadow-lg border border-green-200">
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-green-700 text-lg mb-2">✅ 알레르기 없음</h3>
        <p className="text-green-600">오늘 급식은 안전합니다</p>
      </div>
    </div>
  )
}
