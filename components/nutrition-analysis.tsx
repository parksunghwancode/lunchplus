"use client"

import { useMemo } from "react"
import { Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NutritionAnalyzer, type DetailedNutritionAnalysis } from "@/lib/nutrition/analyzer"

interface NutritionAnalysisProps {
  nutrition: any
  ageGroup?: string
}

const analysisCache = new Map<string, DetailedNutritionAnalysis>()

export function NutritionAnalysis({ nutrition, ageGroup = "중학생(12-14세)" }: NutritionAnalysisProps) {
  const analysis = useMemo<DetailedNutritionAnalysis>(() => {
    const cacheKey = `${JSON.stringify(nutrition)}-${ageGroup}`

    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey)!
    }

    const analyzer = new NutritionAnalyzer()
    const result = analyzer.analyzeNutrition(nutrition, ageGroup)

    analysisCache.set(cacheKey, result)

    return result
  }, [nutrition, ageGroup])

  const getRecommendedValue = (nutrient: string) => {
    const standards = {
      "초등학생(6-11세)": {
        calories: 550,
        protein: 20,
        carbohydrate: 70,
        fat: 17.5,
        calcium: 300,
        vitamin_c: 35,
      },
      "중학생(12-14세)": {
        calories: 650,
        protein: 25,
        carbohydrate: 80,
        fat: 22.5,
        calcium: 350,
        vitamin_c: 42.5,
      },
      "고등학생(15-18세)": {
        calories: 750,
        protein: 30,
        carbohydrate: 95,
        fat: 27.5,
        calcium: 400,
        vitamin_c: 50,
      },
    }
    return standards[ageGroup as keyof typeof standards]?.[nutrient as keyof (typeof standards)["중학생(12-14세)"]] || 0
  }

  const gradeColors = {
    A: "bg-green-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-yellow-500 text-white",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  }

  const nutritionItems = [
    {
      name: "칼로리",
      value: nutrition.calories || 0,
      recommended: getRecommendedValue("calories"),
      unit: "kcal",
      grade: analysis.nutrition_grades.calories,
    },
    {
      name: "단백질",
      value: nutrition.protein || 0,
      recommended: getRecommendedValue("protein"),
      unit: "g",
      grade: analysis.nutrition_grades.protein,
    },
    {
      name: "탄수화물",
      value: nutrition.carbohydrate || 0,
      recommended: getRecommendedValue("carbohydrate"),
      unit: "g",
      grade: analysis.nutrition_grades.carbohydrate,
    },
    {
      name: "지방",
      value: nutrition.fat || 0,
      recommended: getRecommendedValue("fat"),
      unit: "g",
      grade: analysis.nutrition_grades.fat,
    },
    {
      name: "칼슘",
      value: nutrition.calcium || 0,
      recommended: getRecommendedValue("calcium"),
      unit: "mg",
      grade: analysis.nutrition_grades.minerals,
    },
    {
      name: "비타민C",
      value: nutrition.vitamin_c || 0,
      recommended: getRecommendedValue("vitamin_c"),
      unit: "mg",
      grade: analysis.nutrition_grades.vitamins,
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-yellow-600" />
            영양 분석 결과
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-700 mb-2">{analysis.overall_score}점</div>
            <Progress value={analysis.overall_score} className="mb-3" />
            <div className="text-sm text-gray-600">
              균형: {analysis.balance_score}점 | 충족도: {analysis.adequacy_score}점
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">영양소별 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nutritionItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.value}
                    {item.unit} / {item.recommended}
                    {item.unit}
                  </div>
                  <Progress value={Math.min((item.value / item.recommended) * 100, 100)} className="mt-1 h-2" />
                </div>
                <Badge className={`ml-3 ${gradeColors[item.grade]}`}>{item.grade}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
