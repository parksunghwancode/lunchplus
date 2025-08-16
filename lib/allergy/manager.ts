// 알레르기 정보 관리 시스템

export interface AllergyProfile {
  id: string
  name: string
  allergies: string[]
  severity: { [allergen: string]: "mild" | "moderate" | "severe" }
  created_at: Date
  updated_at: Date
}

export interface AllergyRisk {
  level: "safe" | "caution" | "warning" | "danger"
  score: number
  detected_allergens: string[]
  severity_analysis: {
    mild: string[]
    moderate: string[]
    severe: string[]
  }
  recommendations: string[]
  alternative_foods: string[]
}

export interface AllergyAnalysis {
  is_safe: boolean
  risk: AllergyRisk
  detailed_breakdown: {
    allergen: string
    found_in: string[]
    severity: "mild" | "moderate" | "severe"
    description: string
  }[]
}

// 한국 식품 알레르기 유발 요소 데이터베이스
const KOREAN_ALLERGENS = {
  "1": {
    name: "난류",
    description: "계란 및 계란이 포함된 식품",
    common_foods: ["계란", "마요네즈", "케이크", "쿠키", "빵류"],
    alternatives: ["두부", "아보카도", "바나나"],
  },
  "2": {
    name: "우유",
    description: "우유 및 유제품",
    common_foods: ["우유", "치즈", "버터", "요구르트", "아이스크림"],
    alternatives: ["두유", "아몬드우유", "오트밀크", "코코넛밀크"],
  },
  "3": {
    name: "메밀",
    description: "메밀 및 메밀이 포함된 식품",
    common_foods: ["메밀국수", "메밀전", "메밀차"],
    alternatives: ["쌀국수", "우동", "소면"],
  },
  "4": {
    name: "땅콩",
    description: "땅콩 및 땅콩이 포함된 식품",
    common_foods: ["땅콩", "땅콩버터", "땅콩과자"],
    alternatives: ["아몬드", "호두", "해바라기씨"],
  },
  "5": {
    name: "대두",
    description: "콩 및 콩이 포함된 식품",
    common_foods: ["두부", "된장", "간장", "콩나물", "두유"],
    alternatives: ["쌀", "감자", "고구마"],
  },
  "6": {
    name: "밀",
    description: "밀 및 밀이 포함된 식품",
    common_foods: ["빵", "면류", "과자", "케이크", "튀김옷"],
    alternatives: ["쌀", "옥수수", "감자", "쌀국수"],
  },
  "7": {
    name: "고등어",
    description: "고등어 및 관련 어류",
    common_foods: ["고등어", "참치", "정어리"],
    alternatives: ["닭고기", "돼지고기", "두부"],
  },
  "8": {
    name: "게",
    description: "게 및 갑각류",
    common_foods: ["게", "새우", "랍스터"],
    alternatives: ["생선", "닭고기", "두부"],
  },
  "9": {
    name: "새우",
    description: "새우 및 갑각류",
    common_foods: ["새우", "게", "랍스터", "새우젓"],
    alternatives: ["생선", "닭고기", "두부"],
  },
  "10": {
    name: "돼지고기",
    description: "돼지고기 및 관련 제품",
    common_foods: ["돼지고기", "햄", "소시지", "베이컨"],
    alternatives: ["닭고기", "쇠고기", "생선", "두부"],
  },
  "11": {
    name: "복숭아",
    description: "복숭아 및 관련 과일",
    common_foods: ["복숭아", "자두", "살구"],
    alternatives: ["사과", "배", "포도", "딸기"],
  },
  "12": {
    name: "토마토",
    description: "토마토 및 토마토 제품",
    common_foods: ["토마토", "토마토소스", "케첩"],
    alternatives: ["당근", "피망", "오이"],
  },
  "13": {
    name: "아황산류",
    description: "아황산염 및 방부제",
    common_foods: ["와인", "건과일", "가공식품"],
    alternatives: ["신선한 과일", "무첨가 식품"],
  },
  "14": {
    name: "호두",
    description: "호두 및 견과류",
    common_foods: ["호두", "호두과자", "견과류 믹스"],
    alternatives: ["해바라기씨", "호박씨"],
  },
  "15": {
    name: "닭고기",
    description: "닭고기 및 관련 제품",
    common_foods: ["닭고기", "치킨", "닭육수"],
    alternatives: ["쇠고기", "돼지고기", "생선", "두부"],
  },
  "16": {
    name: "쇠고기",
    description: "쇠고기 및 관련 제품",
    common_foods: ["쇠고기", "소고기", "우육수"],
    alternatives: ["돼지고기", "닭고기", "생선", "두부"],
  },
  "17": {
    name: "오징어",
    description: "오징어 및 연체동물",
    common_foods: ["오징어", "낙지", "문어"],
    alternatives: ["생선", "닭고기", "두부"],
  },
  "18": {
    name: "조개류",
    description: "조개 및 패류",
    common_foods: ["조개", "굴", "홍합", "전복"],
    alternatives: ["생선", "닭고기", "두부"],
  },
  "19": {
    name: "잣",
    description: "잣 및 견과류",
    common_foods: ["잣", "잣죽", "견과류"],
    alternatives: ["해바라기씨", "호박씨"],
  },
}

export class AllergyManager {
  private allergenDatabase: typeof KOREAN_ALLERGENS

  constructor() {
    this.allergenDatabase = KOREAN_ALLERGENS
  }

  // 알레르기 프로필 생성
  createProfile(
    name: string,
    allergies: string[],
    severity: { [key: string]: "mild" | "moderate" | "severe" },
  ): AllergyProfile {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      allergies,
      severity,
      created_at: new Date(),
      updated_at: new Date(),
    }
  }

  // 급식 메뉴 알레르기 분석
  analyzeMealAllergy(dishName: string, profile: AllergyProfile): AllergyAnalysis {
    const detectedAllergens = this.extractAllergensFromMenu(dishName)
    const userAllergens = profile.allergies
    const matchingAllergens = detectedAllergens.filter((allergen) => userAllergens.includes(allergen))

    if (matchingAllergens.length === 0) {
      return {
        is_safe: true,
        risk: {
          level: "safe",
          score: 0,
          detected_allergens: detectedAllergens,
          severity_analysis: { mild: [], moderate: [], severe: [] },
          recommendations: ["이 메뉴는 안전하게 드실 수 있습니다."],
          alternative_foods: [],
        },
        detailed_breakdown: [],
      }
    }

    // 위험도 분석
    const risk = this.calculateRisk(matchingAllergens, profile)
    const detailedBreakdown = this.createDetailedBreakdown(matchingAllergens, dishName)

    return {
      is_safe: false,
      risk,
      detailed_breakdown: detailedBreakdown,
    }
  }

  // 알레르기 유발 요소 추출
  private extractAllergens(dishName: string): string[] {
    const allergenPattern = /$$(\d+(?:\.\d+)*)$$/g
    const allergens: string[] = []
    let match

    while ((match = allergenPattern.exec(dishName)) !== null) {
      const numbers = match[1].split(".")
      numbers.forEach((num) => {
        if (this.allergenDatabase[num as keyof typeof KOREAN_ALLERGENS]) {
          allergens.push(this.allergenDatabase[num as keyof typeof KOREAN_ALLERGENS].name)
        }
      })
    }

    return [...new Set(allergens)]
  }

  // 알레르기 유발 요소 추출 방식 개선 - 메뉴 이름과 알레르기 번호 모두 확인
  private extractAllergensFromMenu(dishName: string): string[] {
    console.log("🔍 AllergyManager - 알레르기 분석 시작:", dishName)

    const allergens: string[] = []

    const patterns = [
      /\$\$(\d+(?:\.\d+)*)\$\$/g, // $$1.2.5$$ 형태
      /$$(\d+(?:\.\d+)*)$$/g, // (1.2.5) 형태
      /\[(\d+(?:\.\d+)*)\]/g, // [1.2.5] 형태
      /(\d+(?:\.\d+)*)-\*\*/g, // 1.2.5-** 형태
    ]

    patterns.forEach((pattern, index) => {
      let match
      while ((match = pattern.exec(dishName)) !== null) {
        console.log(`💡 패턴 ${index + 1} 발견:`, match[1])
        const numbers = match[1].split(".")
        numbers.forEach((num) => {
          if (this.allergenDatabase[num as keyof typeof KOREAN_ALLERGENS]) {
            const allergenName = this.allergenDatabase[num as keyof typeof KOREAN_ALLERGENS].name
            console.log(`✅ 알레르기 매핑: ${num} -> ${allergenName}`)
            allergens.push(allergenName)
          }
        })
      }
    })

    const menuText = dishName.toLowerCase()
    Object.values(this.allergenDatabase).forEach((allergenInfo) => {
      // 알레르기 이름이 메뉴에 포함되어 있는지 확인
      if (menuText.includes(allergenInfo.name)) {
        console.log(`🎯 메뉴명에서 직접 발견: ${allergenInfo.name}`)
        allergens.push(allergenInfo.name)
      }

      // 일반적인 식품명도 확인
      allergenInfo.common_foods.forEach((food) => {
        if (menuText.includes(food)) {
          console.log(`🎯 일반 식품명에서 발견: ${food} -> ${allergenInfo.name}`)
          allergens.push(allergenInfo.name)
        }
      })
    })

    const uniqueAllergens = [...new Set(allergens)]
    console.log("🎯 AllergyManager - 최종 추출된 알레르기:", uniqueAllergens)

    return uniqueAllergens
  }

  // 위험도 계산
  private calculateRisk(matchingAllergens: string[], profile: AllergyProfile): AllergyRisk {
    let totalScore = 0
    const severityAnalysis = { mild: [] as string[], moderate: [] as string[], severe: [] as string[] }

    matchingAllergens.forEach((allergen) => {
      const severity = profile.severity?.[allergen] || "mild"
      severityAnalysis[severity].push(allergen)

      switch (severity) {
        case "mild":
          totalScore += 25
          break
        case "moderate":
          totalScore += 50
          break
        case "severe":
          totalScore += 100
          break
      }
    })

    let level: "safe" | "caution" | "warning" | "danger"
    if (totalScore >= 100) level = "danger"
    else if (totalScore >= 50) level = "warning"
    else if (totalScore >= 25) level = "caution"
    else level = "safe"

    const recommendations = this.generateRecommendations(level, matchingAllergens, severityAnalysis)
    const alternativeFoods = this.suggestAlternatives(matchingAllergens)

    return {
      level,
      score: Math.min(100, totalScore),
      detected_allergens: matchingAllergens,
      severity_analysis: severityAnalysis,
      recommendations,
      alternative_foods: alternativeFoods,
    }
  }

  // 상세 분석 생성
  private createDetailedBreakdown(allergens: string[], dishName: string) {
    return allergens.map((allergen) => {
      const allergenInfo = Object.values(this.allergenDatabase).find((info) => info.name === allergen)
      return {
        allergen,
        found_in: [dishName],
        severity: "moderate" as const,
        description: allergenInfo?.description || "알레르기 유발 가능 성분",
      }
    })
  }

  // 추천사항 생성
  private generateRecommendations(
    level: string,
    allergens: string[],
    severityAnalysis: { mild: string[]; moderate: string[]; severe: string[] },
  ): string[] {
    const recommendations: string[] = []

    if (level === "danger") {
      recommendations.push("⚠️ 위험: 이 메뉴는 절대 드시지 마세요!")
      recommendations.push("즉시 대체 메뉴를 요청하거나 도시락을 준비하세요.")
      recommendations.push("응급상황에 대비해 알레르기 약물을 준비하세요.")
    } else if (level === "warning") {
      recommendations.push("⚠️ 주의: 이 메뉴 섭취를 피하는 것이 좋습니다.")
      recommendations.push("대체 메뉴가 있는지 확인해보세요.")
      recommendations.push("섭취 시 알레르기 증상을 주의 깊게 관찰하세요.")
    } else if (level === "caution") {
      recommendations.push("⚠️ 경고: 주의해서 섭취하세요.")
      recommendations.push("소량부터 시작하여 반응을 확인하세요.")
      recommendations.push("알레르기 증상이 나타나면 즉시 섭취를 중단하세요.")
    }

    if (severityAnalysis.severe && severityAnalysis.severe.length > 0) {
      recommendations.push(`심각한 알레르기: ${severityAnalysis.severe.join(", ")} - 절대 섭취 금지`)
    }

    return recommendations
  }

  // 대체 식품 제안
  private suggestAlternatives(allergens: string[]): string[] {
    const alternatives: string[] = []

    allergens.forEach((allergen) => {
      const allergenInfo = Object.values(this.allergenDatabase).find((info) => info.name === allergen)
      if (allergenInfo) {
        alternatives.push(...allergenInfo.alternatives)
      }
    })

    return [...new Set(alternatives)]
  }

  // 알레르기 프로필 업데이트
  updateProfile(profile: AllergyProfile, updates: Partial<AllergyProfile>): AllergyProfile {
    return {
      ...profile,
      ...updates,
      updated_at: new Date(),
    }
  }

  // 알레르기 통계 생성
  generateAllergyStats(profiles: AllergyProfile[]) {
    const allergyCount: { [key: string]: number } = {}
    const severityCount = { mild: 0, moderate: 0, severe: 0 }

    profiles.forEach((profile) => {
      profile.allergies.forEach((allergy) => {
        allergyCount[allergy] = (allergyCount[allergy] || 0) + 1
        const severity = profile.severity?.[allergy] || "mild"
        severityCount[severity]++
      })
    })

    return {
      total_profiles: profiles.length,
      most_common_allergies: Object.entries(allergyCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      severity_distribution: severityCount,
    }
  }
}
