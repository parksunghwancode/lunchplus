"use client"

import { useState } from "react"
import { Trophy, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Challenge {
  id: string
  title: string
  description: string
  target: number
  current: number
  emoji: string
  reward: string
}

export function NutritionChallenge() {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "protein",
      title: "단백질 마스터",
      description: "이번 주 단백질 목표 달성하기",
      target: 5,
      current: 3,
      emoji: "💪",
      reward: "단백질 배지",
    },
    {
      id: "vegetables",
      title: "채소 러버",
      description: "3일 연속 채소 충분히 섭취하기",
      target: 3,
      current: 2,
      emoji: "🥬",
      reward: "건강 포인트 +50",
    },
    {
      id: "balance",
      title: "영양 밸런서",
      description: "균형잡힌 식단 7일 달성",
      target: 7,
      current: 4,
      emoji: "⚖️",
      reward: "밸런스 왕 타이틀",
    },
  ])

  const [userLevel, setUserLevel] = useState(12)
  const [userExp, setUserExp] = useState(340)
  const [nextLevelExp] = useState(500)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-10 h-10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">영양 챌린지 🎯</h3>
            <p className="text-sm text-gray-600">
              레벨 {userLevel} • {userExp}/{nextLevelExp} EXP
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Lv.{userLevel}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Progress value={(userExp / nextLevelExp) * 100} className="h-2" />
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{challenge.emoji}</span>
                <span className="font-medium text-gray-900">{challenge.title}</span>
              </div>
              {challenge.current >= challenge.target && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <Progress value={(challenge.current / challenge.target) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {challenge.current}/{challenge.target}
                </p>
              </div>
              <div className="text-xs text-purple-600 font-medium">🎁 {challenge.reward}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">챌린지 완료하고 레벨업하세요! ⭐</p>
      </div>
    </div>
  )
}
