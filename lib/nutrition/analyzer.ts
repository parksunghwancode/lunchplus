// 고도화된 영양정보 분석 시스템

export interface NutritionStandards {
  age_group: string
  gender: "male" | "female" | "all"
  calories: { min: number; max: number }
  protein: { min: number; max: number }
  carbohydrate: { min: number; max: number }
  fat: { min: number; max: number }
  calcium: { min: number; max: number }
  iron: { min: number; max: number }
  vitamin_c: { min: number; max: number }
}

export interface DetailedNutritionAnalysis {
  overall_score: number
  balance_score: number
  adequacy_score: number
  nutrition_grades: {
    calories: "A" | "B" | "C" | "D" | "F"
    protein: "A" | "B" | "C" | "D" | "F"
    carbohydrate: "A" | "B" | "C" | "D" | "F"
    fat: "A" | "B" | "C" | "D" | "F"
    vitamins: "A" | "B" | "C" | "D" | "F"
    minerals: "A" | "B" | "C" | "D" | "F"
  }
  deficiencies: string[]
  excesses: string[]
  recommendations: {
    immediate: string[]
    long_term: string[]
    dietary_tips: string[]
  }
}

// 연령대별 영양 권장량 (한국인 영양소 섭취기준 기반)
const NUTRITION_STANDARDS: NutritionStandards[] = [
  {
    age_group: "초등학생(6-11세)",
    gender: "all",
    calories: { min: 400, max: 700 },
    protein: { min: 15, max: 25 },
    carbohydrate: { min: 50, max: 90 },
    fat: { min: 10, max: 25 },
    calcium: { min: 200, max: 400 },
    iron: { min: 3, max: 8 },
    vitamin_c: { min: 15, max: 35 },
  },
  {
    age_group: "중학생(12-14세)",
    gender: "all",
    calories: { min: 500, max: 800 },
    protein: { min: 20, max: 30 },
    carbohydrate: { min: 60, max: 100 },
    fat: { min: 15, max: 30 },
    calcium: { min: 250, max: 450 },
    iron: { min: 4, max: 10 },
    vitamin_c: { min: 18, max: 40 },
  },
  {
    age_group: "고등학생(15-18세)",
    gender: "all",
    calories: { min: 600, max: 900 },
    protein: { min: 25, max: 35 },
    carbohydrate: { min: 70, max: 120 },
    fat: { min: 20, max: 35 },
    calcium: { min: 300, max: 500 },
    iron: { min: 5, max: 12 },
    vitamin_c: { min: 20, max: 45 },
  },
]

export class NutritionAnalyzer {
  private standards: NutritionStandards[]

  constructor() {
    this.standards = NUTRITION_STANDARDS
  }

  // 상세 영양 분석 수행
  analyzeNutrition(nutrition: any, ageGroup = "중학생(12-14세)"): DetailedNutritionAnalysis {
    const standard = this.standards.find((s) => s.age_group === ageGroup) || this.standards[1]

    // 각 영양소별 점수 계산
    const caloriesGrade = this.calculateGrade(nutrition.calories, standard.calories)
    const proteinGrade = this.calculateGrade(nutrition.protein, standard.protein)
    const carbohydrateGrade = this.calculateGrade(nutrition.carbohydrate, standard.carbohydrate)
    const fatGrade = this.calculateGrade(nutrition.fat, standard.fat)
    const calciumGrade = this.calculateGrade(nutrition.calcium, standard.calcium)
    const ironGrade = this.calculateGrade(nutrition.iron, standard.iron)
    const vitaminCGrade = this.calculateGrade(nutrition.vitamin_c, standard.vitamin_c)

    // 비타민 및 미네랄 종합 등급
    const vitaminsGrade = this.getWorstGrade([vitaminCGrade])
    const mineralsGrade = this.getWorstGrade([calciumGrade, ironGrade])

    // 전체 점수 계산
    const gradeScores = {
      A: 95,
      B: 85,
      C: 75,
      D: 65,
      F: 50,
    }

    const overallScore = Math.round(
      gradeScores[caloriesGrade] * 0.25 +
        gradeScores[proteinGrade] * 0.2 +
        gradeScores[carbohydrateGrade] * 0.15 +
        gradeScores[fatGrade] * 0.15 +
        gradeScores[vitaminsGrade] * 0.15 +
        gradeScores[mineralsGrade] * 0.1,
    )

    // 균형 점수 (영양소 간 균형도)
    const balanceScore = this.calculateBalanceScore(nutrition, standard)

    // 충족도 점수 (권장량 대비 충족도)
    const adequacyScore = this.calculateAdequacyScore(nutrition, standard)

    // 부족 및 과잉 영양소 식별
    const deficiencies = this.identifyDeficiencies(nutrition, standard)
    const excesses = this.identifyExcesses(nutrition, standard)

    // 추천사항 생성
    const recommendations = this.generateRecommendations(nutrition, standard, deficiencies, excesses)

    return {
      overall_score: overallScore,
      balance_score: balanceScore,
      adequacy_score: adequacyScore,
      nutrition_grades: {
        calories: caloriesGrade,
        protein: proteinGrade,
        carbohydrate: carbohydrateGrade,
        fat: fatGrade,
        vitamins: vitaminsGrade,
        minerals: mineralsGrade,
      },
      deficiencies,
      excesses,
      recommendations,
    }
  }

  private calculateGrade(value: number, range: { min: number; max: number }): "A" | "B" | "C" | "D" | "F" {
    if (value <= 0) return "F"

    const optimal = (range.min + range.max) / 2
    const tolerance = (range.max - range.min) / 4

    // 최적 범위 내 (권장량의 중간값 ± 25%)
    if (value >= optimal - tolerance && value <= optimal + tolerance) return "A"

    // 권장 범위 내
    if (value >= range.min && value <= range.max) return "B"

    // 권장 범위의 70-130% 내 (기존 80-120%에서 완화)
    if (value >= range.min * 0.7 && value <= range.max * 1.3) return "C"

    // 권장 범위의 50-150% 내 (기존 60-140%에서 완화)
    if (value >= range.min * 0.5 && value <= range.max * 1.5) return "D"

    // 그 외
    return "F"
  }

  private getWorstGrade(grades: ("A" | "B" | "C" | "D" | "F")[]): "A" | "B" | "C" | "D" | "F" {
    const gradeOrder = ["F", "D", "C", "B", "A"]
    for (const grade of gradeOrder) {
      if (grades.includes(grade as any)) return grade as any
    }
    return "A"
  }

  private calculateBalanceScore(nutrition: any, standard: NutritionStandards): number {
    // 탄수화물:단백질:지방 비율 분석 (권장 비율: 55-65:15-20:20-30)
    const totalCalories = nutrition.calories || 1
    const carbRatio = ((nutrition.carbohydrate * 4) / totalCalories) * 100
    const proteinRatio = ((nutrition.protein * 4) / totalCalories) * 100
    const fatRatio = ((nutrition.fat * 9) / totalCalories) * 100

    let balanceScore = 100

    // 탄수화물 비율 체크 (55-65%)
    if (carbRatio < 50 || carbRatio > 70) balanceScore -= 15
    else if (carbRatio < 55 || carbRatio > 65) balanceScore -= 5

    // 단백질 비율 체크 (15-20%)
    if (proteinRatio < 10 || proteinRatio > 25) balanceScore -= 15
    else if (proteinRatio < 15 || proteinRatio > 20) balanceScore -= 5

    // 지방 비율 체크 (20-30%)
    if (fatRatio < 15 || fatRatio > 35) balanceScore -= 15
    else if (fatRatio < 20 || fatRatio > 30) balanceScore -= 5

    return Math.max(0, balanceScore)
  }

  private calculateAdequacyScore(nutrition: any, standard: NutritionStandards): number {
    const nutrients = ["calories", "protein", "calcium", "iron", "vitamin_c"]
    let totalScore = 0

    nutrients.forEach((nutrient) => {
      const value = nutrition[nutrient] || 0
      const min = (standard as any)[nutrient].min
      const adequacy = (value / min) * 100

      if (adequacy >= 100) totalScore += 20
      else if (adequacy >= 80) totalScore += 16
      else if (adequacy >= 60) totalScore += 12
      else if (adequacy >= 40) totalScore += 8
      else totalScore += 4
    })

    return totalScore
  }

  private identifyDeficiencies(nutrition: any, standard: NutritionStandards): string[] {
    const deficiencies: string[] = []

    if (nutrition.calories < standard.calories.min * 0.8) deficiencies.push("칼로리")
    if (nutrition.protein < standard.protein.min * 0.8) deficiencies.push("단백질")
    if (nutrition.calcium < standard.calcium.min * 0.8) deficiencies.push("칼슘")
    if (nutrition.iron < standard.iron.min * 0.8) deficiencies.push("철분")
    if (nutrition.vitamin_c < standard.vitamin_c.min * 0.8) deficiencies.push("비타민C")

    return deficiencies
  }

  private identifyExcesses(nutrition: any, standard: NutritionStandards): string[] {
    const excesses: string[] = []

    if (nutrition.calories > standard.calories.max * 1.2) excesses.push("칼로리")
    if (nutrition.fat > standard.fat.max * 1.2) excesses.push("지방")
    if (nutrition.carbohydrate > standard.carbohydrate.max * 1.2) excesses.push("탄수화물")

    return excesses
  }

  private generateRecommendations(
    nutrition: any,
    standard: NutritionStandards,
    deficiencies: string[],
    excesses: string[],
  ) {
    const immediate: string[] = []
    const longTerm: string[] = []
    const dietaryTips: string[] = []

    // 부족 영양소에 대한 즉시 권장사항
    if (deficiencies.includes("단백질")) {
      immediate.push("우유, 계란, 두부 등 단백질이 풍부한 간식을 추가하세요")
      dietaryTips.push("매 끼니마다 손바닥 크기만큼의 단백질 식품을 포함하세요")
    }

    if (deficiencies.includes("칼슘")) {
      immediate.push("우유나 요구르트를 하루 1-2잔 마시세요")
      dietaryTips.push("멸치, 치즈, 브로콜리 등 칼슘을 풍부한 식품을 섭취하세요")
    }

    if (deficiencies.includes("비타민C")) {
      immediate.push("신선한 과일이나 채소를 간식으로 드세요")
      dietaryTips.push("오렌지, 키위, 딸기, 피망 등을 자주 섭취하세요")
    }

    if (deficiencies.includes("철분")) {
      immediate.push("시금치, 소고기, 콩류 등 철분이 풍부한 식품을 섭취하세요")
      dietaryTips.push("비타민C가 풍부한 식품과 함께 섭취하면 철분 흡수가 향상됩니다")
    }

    // 과잉 영양소에 대한 권장사항
    if (excesses.includes("칼로리")) {
      immediate.push("적당한 운동을 통해 에너지를 소모하세요")
      longTerm.push("규칙적인 운동 습관을 만들어보세요")
    }

    if (excesses.includes("지방")) {
      immediate.push("튀김이나 기름진 음식을 줄이고 담백한 조리법을 선택하세요")
      dietaryTips.push("견과류나 올리브오일 등 건강한 지방을 선택하세요")
    }

    // 일반적인 장기 권장사항
    longTerm.push("다양한 색깔의 채소와 과일을 골고루 섭취하세요")
    longTerm.push("규칙적인 식사 시간을 유지하세요")
    longTerm.push("충분한 수분 섭취를 하세요")

    return { immediate, long_term: longTerm, dietary_tips: dietaryTips }
  }
}
