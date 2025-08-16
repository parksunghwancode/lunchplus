"use client"

import { School, BarChart3, Sparkles } from "lucide-react"
import { NutritionQuiz } from "@/components/nutrition-quiz"
import { DailyAllergyAlert } from "@/components/daily-allergy-alert"
import { MealRating } from "@/components/features/meal-rating"
import { NutritionChallenge } from "@/components/features/nutrition-challenge"
import { MealStreak } from "@/components/features/meal-streak"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface HomeTabProps {
  allergyProfile: AllergyProfile | null
  selectedSchool: any
  onAnalysisClick: () => void
}

export function HomeTab({ allergyProfile, selectedSchool, onAnalysisClick }: HomeTabProps) {
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="pb-20 animate-fade-in">
      {/* 헤더 섹션 - 더 친근하고 생동감 있게 */}
      <div className="text-center mb-8 pt-6">
        <div className="relative mb-6">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-xl animate-pulse-soft">
            <School className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          안녕하세요, {allergyProfile?.name}님! 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">오늘도 건강한 급식 분석해볼까요?</p>
      </div>

      <div className="mb-6 animate-slide-up stagger-1">
        <NutritionQuiz />
      </div>

      {/* 오늘의 알레르기 경고 */}
      <div className="mb-6 animate-slide-up stagger-2">
        <DailyAllergyAlert selectedSchool={selectedSchool} allergyProfile={allergyProfile} />
      </div>

      {/* 분석 스트릭 */}
      <div className="mb-6 animate-slide-up stagger-3">
        <MealStreak />
      </div>

      {/* 급식 평점 */}
      <div className="mb-6 animate-slide-up stagger-4">
        <MealRating mealDate={today} schoolCode={selectedSchool?.SD_SCHUL_CODE} />
      </div>

      {/* 영양 챌린지 */}
      <div className="mb-6 animate-slide-up stagger-5">
        <NutritionChallenge />
      </div>

      {/* 빠른 분석 시작 - 더 눈에 띄게 */}
      <div className="relative overflow-hidden animate-scale-up">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">급식 분석 시작! 🚀</h3>
              <p className="text-sm text-gray-600">오늘 급식의 영양 정보를 확인해보세요</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-2xl backdrop-blur-sm">
              <span className="text-gray-600 font-medium flex items-center gap-2">🏫 학교</span>
              <span className="font-bold text-gray-900 truncate ml-2">{selectedSchool?.SCHUL_NM}</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-2xl backdrop-blur-sm">
              <span className="text-gray-600 font-medium flex items-center gap-2">📅 오늘 날짜</span>
              <span className="font-bold text-gray-900">{new Date().toLocaleDateString("ko-KR")}</span>
            </div>
          </div>

          <button
            onClick={onAnalysisClick}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-hover"
          >
            <span className="flex items-center justify-center gap-2">오늘 급식 분석하기 ✨</span>
          </button>
        </div>
      </div>
    </div>
  )
}
