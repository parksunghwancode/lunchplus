"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

interface MealRatingProps {
  mealDate: string
  schoolCode?: string
}

export function MealRating({ mealDate, schoolCode }: MealRatingProps) {
  const [rating, setRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [averageRating, setAverageRating] = useState(4.2)
  const [totalRatings, setTotalRatings] = useState(127)

  useEffect(() => {
    // 로컬 스토리지에서 이전 평점 확인
    const savedRating = localStorage.getItem(`meal-rating-${mealDate}`)
    if (savedRating) {
      setRating(Number.parseInt(savedRating))
      setHasRated(true)
    }
  }, [mealDate])

  const handleRating = (stars: number) => {
    if (hasRated) return

    setRating(stars)
    setHasRated(true)
    localStorage.setItem(`meal-rating-${mealDate}`, stars.toString())

    // 평균 평점 업데이트 (실제로는 서버에서 처리)
    setTotalRatings((prev) => prev + 1)
    setAverageRating((prev) => (prev * (totalRatings - 1) + stars) / totalRatings)
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl w-10 h-10 flex items-center justify-center">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <h3 className="font-bold text-lg text-gray-900">오늘 급식 어땠어요? 🍽️</h3>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            disabled={hasRated}
            className={`transition-all duration-200 ${hasRated ? "cursor-default" : "hover:scale-110 cursor-pointer"}`}
          >
            <Star className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>

      {hasRated && (
        <div className="text-center animate-fade-in">
          <p className="text-sm text-gray-600 mb-2">평가해주셔서 감사해요! ✨</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{totalRatings}명 참여</span>
          </div>
        </div>
      )}

      {!hasRated && <p className="text-center text-sm text-gray-600">별점을 눌러서 오늘 급식을 평가해보세요!</p>}
    </div>
  )
}
