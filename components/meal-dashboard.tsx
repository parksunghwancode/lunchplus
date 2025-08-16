"use client"

import { useState, useEffect, useMemo } from "react"
import { TrendingUp, Heart, Shield, Utensils } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { NutritionAnalysis } from "@/components/nutrition-analysis"
import { AllergyAnalysisComponent } from "@/components/allergy-analysis"
import type { MealAnalysis } from "@/lib/types/meal"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface MealDashboardProps {
  selectedSchool: any
  selectedDate: Date | null
  allergyProfile: AllergyProfile | null
}

const mealCache = new Map<string, { data: MealAnalysis[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export function MealDashboard({ selectedSchool, selectedDate, allergyProfile }: MealDashboardProps) {
  const [mealData, setMealData] = useState<MealAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedSchool && selectedDate) {
      fetchMealData()
    }
  }, [selectedSchool, selectedDate])

  const fetchMealData = async () => {
    if (!selectedSchool || !selectedDate) return

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const dateStr = `${year}${month}${day}`
    const cacheKey = `${selectedSchool.SD_SCHUL_CODE}-${selectedSchool.ATPT_OFCDC_SC_CODE}-${dateStr}`

    const cached = mealCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMealData(cached.data)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/meals?schoolCode=${selectedSchool.SD_SCHUL_CODE}&officeCode=${selectedSchool.ATPT_OFCDC_SC_CODE}&date=${dateStr}`,
      )

      if (!response.ok) {
        throw new Error("급식 정보를 가져올 수 없습니다")
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.meals && data.meals.length > 0) {
        mealCache.set(cacheKey, { data: data.meals, timestamp: Date.now() })
        setMealData(data.meals)
      } else {
        setMealData([])
        setError("해당 날짜의 급식 정보가 없습니다")
      }
    } catch (error) {
      console.error("급식 데이터 조회 오류:", error)
      setError("급식 정보를 불러오는 중 오류가 발생했습니다")
      setMealData([])
    } finally {
      setIsLoading(false)
    }
  }

  const getOverallHealthScore = () => {
    if (mealData.length === 0) return 0
    return Math.round(mealData.reduce((sum, meal) => sum + meal.healthScore, 0) / mealData.length)
  }

  const getTotalCalories = () => {
    return mealData.reduce((sum, meal) => sum + (meal.nutrition.calories || 0), 0)
  }

  const getNutritionBalance = useMemo(() => {
    if (mealData.length === 0) return 0

    const meal = mealData[0]
    const nutrition = meal.nutrition

    // 실제 영양소 비율을 기반으로 균형 점수 계산
    const totalMacros = (nutrition.carbohydrate || 0) + (nutrition.protein || 0) + (nutrition.fat || 0)
    if (totalMacros === 0) return 0

    const carbRatio = (nutrition.carbohydrate || 0) / totalMacros
    const proteinRatio = (nutrition.protein || 0) / totalMacros
    const fatRatio = (nutrition.fat || 0) / totalMacros

    // 이상적인 비율: 탄수화물 55-65%, 단백질 15-20%, 지방 20-30%
    const idealCarbRatio = 0.6
    const idealProteinRatio = 0.175
    const idealFatRatio = 0.225

    // 각 영양소의 편차 계산
    const carbDeviation = Math.abs(carbRatio - idealCarbRatio)
    const proteinDeviation = Math.abs(proteinRatio - idealProteinRatio)
    const fatDeviation = Math.abs(fatRatio - idealFatRatio)

    // 균형 점수 계산 (편차가 적을수록 높은 점수)
    const balanceScore = Math.max(0, 100 - (carbDeviation + proteinDeviation + fatDeviation) * 200)

    return Math.round(balanceScore)
  }, [mealData])

  if (!selectedSchool || !selectedDate) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">급식 정보를 확인해보세요</h3>
            <p>학교와 날짜를 선택하면 상세한 급식 분석 결과를 볼 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 건강점수</p>
                <p className="text-2xl font-bold text-blue-600">{getOverallHealthScore()}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={getOverallHealthScore()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 칼로리</p>
                <p className="text-2xl font-bold text-green-600">{getTotalCalories()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">영양 균형</p>
                <p className="text-2xl font-bold text-purple-600">{getNutritionBalance}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={getNutritionBalance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">오늘의 급식</TabsTrigger>
          <TabsTrigger value="nutrition">영양 분석</TabsTrigger>
          <TabsTrigger value="allergy">알레르기 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p>급식 정보를 불러오는 중...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : mealData.length > 0 ? (
            <div className="space-y-4">
              {mealData.map((meal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-orange-600" />
                        급식
                      </div>
                      <Badge variant="secondary">건강점수: {meal.healthScore}점</Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedSchool.SCHUL_NM} • {selectedDate.toLocaleDateString("ko-KR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">메뉴</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {meal.meal.DDISH_NM ? (
                          <div className="space-y-1">
                            {meal.meal.DDISH_NM.split("<br/>").map((menu, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                                <span className="text-sm">
                                  {menu
                                    .replace(/\$\$[\d.]+\$\$/g, "")
                                    .replace(/$$\d+(?:\.\d+)*$$/g, "")
                                    .trim()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">메뉴 정보 없음</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-blue-600">칼로리</p>
                        <p className="font-semibold">{meal.nutrition.calories}kcal</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-green-600">단백질</p>
                        <p className="font-semibold">{meal.nutrition.protein}g</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-yellow-600">탄수화물</p>
                        <p className="font-semibold">{meal.nutrition.carbohydrate}g</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-purple-600">지방</p>
                        <p className="font-semibold">{meal.nutrition.fat}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>해당 날짜의 급식 정보가 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          {mealData.length > 0 ? (
            <NutritionAnalysis nutrition={mealData[0].nutrition} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>영양 분석을 위한 급식 데이터가 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="allergy" className="space-y-4">
          {mealData.length > 0 ? (
            <AllergyAnalysisComponent dishName={mealData[0].meal.DDISH_NM || ""} profile={allergyProfile} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>알레르기 분석을 위한 급식 데이터가 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
