"use client"

import { useState, useEffect } from "react"
import { Utensils, Heart, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MealAnalysis } from "@/lib/types/meal"

interface MealDisplayProps {
  schoolCode?: string
  officeCode?: string
  date?: string
}

export function MealDisplay({ schoolCode, officeCode, date }: MealDisplayProps) {
  const [meals, setMeals] = useState<MealAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (schoolCode && officeCode && date) {
      fetchMealData()
    }
  }, [schoolCode, officeCode, date])

  const fetchMealData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meals?schoolCode=${schoolCode}&officeCode=${officeCode}&date=${date}`)
      const data = await response.json()

      if (data.error) {
        console.error(data.error)
        return
      }

      setMeals(data.meals || [])
    } catch (error) {
      console.error("급식 정보 조회 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>급식 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (meals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>해당 날짜의 급식 정보가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {meals.map((mealAnalysis, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                {mealAnalysis.meal.MMEAL_SC_NM}
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">건강점수: {mealAnalysis.healthScore}점</span>
                <Progress value={mealAnalysis.healthScore} className="w-20" />
              </div>
            </CardTitle>
            <CardDescription>{new Date(date || "").toLocaleDateString("ko-KR")} 급식 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 메뉴 */}
            <div>
              <h4 className="font-medium mb-2">오늘의 메뉴</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="whitespace-pre-line text-sm">{mealAnalysis.meal.DDISH_NM?.replace(/<br\/>/g, "\n")}</p>
              </div>
            </div>

            {/* 영양 정보 */}
            <div>
              <h4 className="font-medium mb-2">영양 정보</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-blue-600">칼로리</p>
                  <p className="font-semibold">{mealAnalysis.nutrition.calories}kcal</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-green-600">단백질</p>
                  <p className="font-semibold">{mealAnalysis.nutrition.protein}g</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-yellow-600">탄수화물</p>
                  <p className="font-semibold">{mealAnalysis.nutrition.carbohydrate}g</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-purple-600">지방</p>
                  <p className="font-semibold">{mealAnalysis.nutrition.fat}g</p>
                </div>
              </div>
            </div>

            {/* 알레르기 정보 */}
            {mealAnalysis.allergies.hasAllergen && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>알레르기 유발 요소:</strong>{" "}
                  {mealAnalysis.allergies.allergens.map((allergen, i) => (
                    <Badge key={i} variant="destructive" className="ml-1">
                      {allergen}
                    </Badge>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* 추천사항 */}
            {mealAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  건강 추천사항
                </h4>
                <ul className="space-y-1">
                  {mealAnalysis.recommendations.map((recommendation, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
