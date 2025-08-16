"use client"

import { useState } from "react"
import { BarChart3, Calendar } from "lucide-react"
import { MealCalendar } from "@/components/meal-calendar"
import { MealDashboard } from "@/components/meal-dashboard"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface AnalysisTabProps {
  selectedSchool: any
  allergyProfile: AllergyProfile | null
}

export function AnalysisTab({ selectedSchool, allergyProfile }: AnalysisTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())

  return (
    <div className="pb-20 animate-fade-in">
      <div className="text-center mb-8 pt-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          급식 분석
        </h2>
        <p className="text-gray-600 text-lg">{selectedSchool?.SCHUL_NM || "학교를 선택해주세요"} 급식 정보</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">날짜 선택</h3>
            </div>
            <div className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
              {selectedDate?.toLocaleDateString("ko-KR")}
            </div>
          </div>
          <MealCalendar onDateSelect={setSelectedDate} selectedSchool={selectedSchool} />
        </div>
      </div>

      {selectedSchool && selectedDate ? (
        <MealDashboard selectedSchool={selectedSchool} selectedDate={selectedDate} allergyProfile={allergyProfile} />
      ) : (
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {!selectedSchool ? "학교를 선택해주세요" : "날짜를 선택해주세요"}
          </h3>
          <p className="text-gray-600 text-lg">
            {!selectedSchool
              ? "프로필에서 학교를 설정한 후 급식 정보를 확인할 수 있습니다"
              : "위에서 분석할 날짜를 선택하면 급식 정보를 확인할 수 있습니다"}
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>학교: {selectedSchool ? "설정됨" : "미설정"}</p>
            <p>날짜: {selectedDate ? selectedDate.toLocaleDateString("ko-KR") : "미선택"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
