import { type NextRequest, NextResponse } from "next/server"
import { NeisApiClient } from "@/lib/api/neis"
import type { MealAnalysis } from "@/lib/types/meal"

const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const schoolCode = searchParams.get("schoolCode")
  const officeCode = searchParams.get("officeCode")
  const date = searchParams.get("date")

  if (!schoolCode || !officeCode || !date) {
    return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 })
  }

  const cacheKey = `${schoolCode}-${officeCode}-${date}`
  const cached = apiCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data)
  }

  try {
    const neisClient = new NeisApiClient()
    const meals = await neisClient.getMealInfo(schoolCode, officeCode, date)

    console.log("NEIS API 응답:", meals) // API 응답 로그 추가

    // 급식 정보 분석
    const analyzedMeals: MealAnalysis[] = meals.map((meal: any) => {
      console.log("개별 급식 데이터:", meal) // 개별 급식 데이터 로그
      console.log("NTR_INFO:", meal.NTR_INFO) // 영양 정보 로그
      console.log("CAL_INFO:", meal.CAL_INFO) // 칼로리 정보 로그

      const nutrition = neisClient.parseNutritionInfo(meal.NTR_INFO || "", meal.CAL_INFO || "")
      const allergies = neisClient.parseAllergyInfo(meal.DDISH_NM || "")

      console.log("파싱된 영양 정보:", nutrition) // 파싱 결과 로그
      console.log("파싱된 알레르기 정보:", allergies) // 알레르기 정보 로그

      // 건강 점수 계산 (간단한 예시)
      const healthScore = calculateHealthScore(nutrition)

      // 추천사항 생성
      const recommendations = generateRecommendations(nutrition, allergies)

      return {
        meal,
        nutrition,
        allergies,
        healthScore,
        recommendations,
      }
    })

    const result = { meals: analyzedMeals }

    apiCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error("급식 정보 조회 API 오류:", error)
    return NextResponse.json({ error: "급식 정보 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

function calculateHealthScore(nutrition: any): number {
  // 간단한 건강 점수 계산 로직
  let score = 70 // 기본 점수

  // 칼로리 적정성 (500-800kcal 기준)
  if (nutrition.calories >= 500 && nutrition.calories <= 800) {
    score += 10
  } else if (nutrition.calories < 400 || nutrition.calories > 900) {
    score -= 10
  }

  // 단백질 충분성 (20g 이상)
  if (nutrition.protein >= 20) {
    score += 10
  }

  // 비타민C 충분성 (30mg 이상)
  if (nutrition.vitamin_c >= 30) {
    score += 5
  }

  // 칼슘 충분성 (200mg 이상)
  if (nutrition.calcium >= 200) {
    score += 5
  }

  return Math.min(100, Math.max(0, score))
}

function generateRecommendations(nutrition: any, allergies: any): string[] {
  const recommendations: string[] = []

  if (nutrition.calories < 500) {
    recommendations.push("칼로리가 부족합니다. 간식을 추가로 섭취하세요.")
  } else if (nutrition.calories > 800) {
    recommendations.push("칼로리가 높습니다. 운동을 함께 하세요.")
  }

  if (nutrition.protein < 15) {
    recommendations.push("단백질이 부족합니다. 우유나 견과류를 추가로 섭취하세요.")
  }

  if (nutrition.vitamin_c < 20) {
    recommendations.push("비타민C가 부족합니다. 과일을 추가로 섭취하세요.")
  }

  if (allergies.hasAllergen) {
    recommendations.push(`알레르기 유발 요소가 포함되어 있습니다: ${allergies.allergens.join(", ")}`)
  }

  return recommendations
}
