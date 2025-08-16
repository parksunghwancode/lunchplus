"use client"

import { useState } from "react"
import { Flame, Calendar, Award } from "lucide-react"

export function MealStreak() {
  const [currentStreak, setCurrentStreak] = useState(7)
  const [bestStreak, setBestStreak] = useState(23)
  const [weeklyAnalysis, setWeeklyAnalysis] = useState([
    { day: "월", analyzed: true },
    { day: "화", analyzed: true },
    { day: "수", analyzed: true },
    { day: "목", analyzed: true },
    { day: "금", analyzed: true },
    { day: "토", analyzed: false },
    { day: "일", analyzed: false },
  ])

  const getStreakMessage = () => {
    if (currentStreak >= 30) return "급식 분석 마스터! 🏆"
    if (currentStreak >= 14) return "꾸준함의 달인! 🔥"
    if (currentStreak >= 7) return "일주일 연속! 👏"
    if (currentStreak >= 3) return "좋은 습관! 💪"
    return "시작이 반! 🌟"
  }

  const getStreakColor = () => {
    if (currentStreak >= 14) return "from-red-500 to-orange-500"
    if (currentStreak >= 7) return "from-orange-500 to-yellow-500"
    return "from-blue-500 to-purple-500"
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className={`bg-gradient-to-r ${getStreakColor()} rounded-2xl w-10 h-10 flex items-center justify-center`}>
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">분석 스트릭 🔥</h3>
          <p className="text-sm text-gray-600">{getStreakMessage()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
          <div className="text-2xl font-bold text-gray-900 mb-1">{currentStreak}</div>
          <div className="text-sm text-gray-600">현재 연속</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
          <div className="text-2xl font-bold text-gray-900 mb-1">{bestStreak}</div>
          <div className="text-sm text-gray-600">최고 기록</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">이번 주 분석</span>
        </div>
        <div className="flex gap-1">
          {weeklyAnalysis.map((day, index) => (
            <div
              key={index}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                day.analyzed ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">매일 급식을 분석하고 건강한 습관을 만들어보세요!</p>
        {currentStreak >= 7 && (
          <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Award className="w-3 h-3" />
            일주일 달성 보상 획득!
          </div>
        )}
      </div>
    </div>
  )
}
