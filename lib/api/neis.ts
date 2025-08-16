// NEIS API 연동 유틸리티
const NEIS_BASE_URL = "https://open.neis.go.kr/hub"

interface NutritionInfo {
  calories: number
  carbohydrate: number
  protein: number
  fat: number
  vitamin_a: number
  thiamine: number
  riboflavin: number
  vitamin_c: number
  calcium: number
  iron: number
}

interface AllergyInfo {
  allergens: string[]
  hasAllergen: boolean
}

interface MenuWithAllergy {
  name: string
  allergyNumbers: string[]
  allergyNames: string[]
}

export class NeisApiClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEIS_API_KEY || ""
  }

  // 학교 정보 검색
  async searchSchools(schoolName: string, region?: string) {
    const params = new URLSearchParams({
      KEY: this.apiKey,
      Type: "json",
      pIndex: "1",
      pSize: "100",
      SCHUL_NM: schoolName,
    })

    if (region) {
      params.append("LCTN_SC_NM", region)
    }

    try {
      const response = await fetch(`${NEIS_BASE_URL}/schoolInfo?${params}`)
      const data = await response.json()

      if (data.RESULT?.CODE === "INFO-000") {
        return []
      }

      return data.schoolInfo?.[1]?.row || []
    } catch (error) {
      console.error("학교 검색 오류:", error)
      throw new Error("학교 정보를 가져오는데 실패했습니다.")
    }
  }

  // 급식 정보 조회
  async getMealInfo(schoolCode: string, officeCode: string, date: string) {
    const params = new URLSearchParams({
      KEY: this.apiKey,
      Type: "json",
      pIndex: "1",
      pSize: "100",
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_YMD: date,
    })

    try {
      const response = await fetch(`${NEIS_BASE_URL}/mealServiceDietInfo?${params}`)
      const data = await response.json()

      if (data.RESULT?.CODE === "INFO-000") {
        return []
      }

      return data.mealServiceDietInfo?.[1]?.row || []
    } catch (error) {
      console.error("급식 정보 조회 오류:", error)
      throw new Error("급식 정보를 가져오는데 실패했습니다.")
    }
  }

  // 영양 정보 파싱 - 실제 NEIS API 형식에 맞게 수정
  parseNutritionInfo(ntrInfo: string, calInfo?: string): NutritionInfo {
    console.log("[v0] 원본 영양 정보 (NTR_INFO):", ntrInfo)
    console.log("[v0] 원본 칼로리 정보 (CAL_INFO):", calInfo)

    if (!ntrInfo || ntrInfo.trim() === "") {
      console.log("[v0] 영양 정보가 비어있음")
      return this.getDefaultNutrition()
    }

    const extractValue = (text: string, nutrientName: string): number => {
      // "탄수화물(g) : 100.4" 형식에서 숫자 추출
      const patterns = [
        new RegExp(`${nutrientName}\$$[^)]+\$$\\s*:\\s*([\\d.]+)`, "i"), // 정규식 수정
        new RegExp(`${nutrientName}\\s*:\\s*([\\d.]+)`, "i"),
        new RegExp(`${nutrientName}[^\\d]*([\\d.]+)`, "i"),
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          console.log(`[v0] ${nutrientName} 추출 성공: ${match[1]}`)
          return Number.parseFloat(match[1]) || 0
        }
      }
      console.log(`[v0] ${nutrientName} 추출 실패`)
      return 0
    }

    // 칼로리는 CAL_INFO에서 추출 (예: "650.8 Kcal")
    let calories = 0
    if (calInfo) {
      const calMatch = calInfo.match(/([0-9.]+)/) // 정규식 수정
      if (calMatch) {
        calories = Number.parseFloat(calMatch[1]) || 0
        console.log("[v0] 칼로리 추출 성공:", calories)
      } else {
        console.log("[v0] 칼로리 추출 실패, CAL_INFO:", calInfo)
      }
    } else {
      console.log("[v0] CAL_INFO가 없음")
    }

    const result = {
      calories: calories,
      carbohydrate: extractValue(ntrInfo, "탄수화물"),
      protein: extractValue(ntrInfo, "단백질"),
      fat: extractValue(ntrInfo, "지방"),
      vitamin_a: extractValue(ntrInfo, "비타민A"),
      thiamine: extractValue(ntrInfo, "티아민"),
      riboflavin: extractValue(ntrInfo, "리보플라빈"),
      vitamin_c: extractValue(ntrInfo, "비타민C"),
      calcium: extractValue(ntrInfo, "칼슘"),
      iron: extractValue(ntrInfo, "철분"),
    }

    console.log("[v0] 최종 영양 정보 파싱 결과:", result)

    // 모든 값이 0인 경우에만 기본값 반환
    const hasAnyValue = Object.values(result).some((value) => value > 0)
    if (!hasAnyValue) {
      console.log("[v0] 모든 영양소가 0, 기본값 사용")
      return this.getDefaultNutrition()
    }

    return result
  }

  // 알레르기 정보 파싱
  parseAllergyInfo(dishName: string): AllergyInfo {
    const allergens = this.extractAllergyNumbers(dishName)
    return {
      allergens: allergens,
      hasAllergen: allergens.length > 0,
    }
  }

  parseMenuWithAllergies(dishName: string): MenuWithAllergy[] {
    console.log("🍽️ 메뉴별 알레르기 파싱 시작:", dishName)

    const allergenMap: { [key: string]: string } = {
      "1": "난류",
      "2": "우유",
      "3": "메밀",
      "4": "땅콩",
      "5": "대두",
      "6": "밀",
      "7": "고등어",
      "8": "게",
      "9": "새우",
      "10": "돼지고기",
      "11": "복숭아",
      "12": "토마토",
      "13": "아황산류",
      "14": "호두",
      "15": "닭고기",
      "16": "쇠고기",
      "17": "오징어",
      "18": "조개류",
      "19": "잣",
    }

    const menuItems = dishName
      .replace(/<br\/>/g, "\n")
      .split(/\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    const result: MenuWithAllergy[] = []

    for (const item of menuItems) {
      console.log("📋 개별 메뉴 분석:", item)

      const allergyNumbers: string[] = []
      const allergyNames: string[] = []

      // 다양한 패턴으로 알레르기 번호 추출
      const patterns = [
        /\$\$(\d+(?:\.\d+)*)\$\$/g, // $$1.2.5$$
        /$$(\d+(?:\.\d+)*)$$/g, // (1.2.5)
        /\[(\d+(?:\.\d+)*)\]/g, // [1.2.5]
        /(\d+(?:\.\d+)*)-\*\*/g, // 1.2.5-**
      ]

      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(item)) !== null) {
          console.log("🔍 패턴 매치:", match[1])
          const numbers = match[1].split(".")
          numbers.forEach((num) => {
            const trimmedNum = num.trim()
            console.log(`🔢 개별 번호 확인: "${trimmedNum}"`)
            if (allergenMap[trimmedNum]) {
              console.log(`✅ 알레르기 매핑 성공: ${trimmedNum} -> ${allergenMap[trimmedNum]}`)
              if (!allergyNumbers.includes(trimmedNum)) {
                allergyNumbers.push(trimmedNum)
                allergyNames.push(allergenMap[trimmedNum])
              }
            } else {
              console.log(`❌ 알레르기 매핑 실패: "${trimmedNum}" (매핑 테이블에 없음)`)
            }
          })
        }
      }

      const cleanName = item
        .replace(/\$\$[\d.]+\$\$/g, "") // $$숫자$$ 패턴 제거
        .replace(/$$[\d.]+$$/g, "") // (숫자) 패턴 제거
        .replace(/\[[\d.]+\]/g, "") // [숫자] 패턴 제거
        .replace(/[\d.]+-\*\*/g, "") // 숫자-** 패턴 제거
        .replace(/\*+/g, "") // * 기호들 제거
        .replace(/-+$/g, "") // 끝에 있는 - 기호들 제거
        .replace(/\s+/g, " ") // 연속된 공백을 하나로
        .trim() // 앞뒤 공백 제거

      console.log(`🏷️ 정리된 메뉴 이름: "${cleanName}"`)
      console.log(`🔢 추출된 알레르기 번호: [${allergyNumbers.join(", ")}]`)
      console.log(`🏥 추출된 알레르기 이름: [${allergyNames.join(", ")}]`)

      // 빈 문자열이나 숫자만 있는 경우 건너뛰기
      if (!cleanName || /^[\d.\s\-*]+$/.test(cleanName)) {
        console.log("❌ 빈 메뉴 이름 또는 숫자만 있음, 건너뛰기:", cleanName)
        continue
      }

      result.push({
        name: cleanName,
        allergyNumbers: [...new Set(allergyNumbers)],
        allergyNames: [...new Set(allergyNames)],
      })
      console.log(`📝 메뉴 추가 완료: "${cleanName}", 알레르기: [${allergyNames.join(", ")}]`)
    }

    console.log("🎯 최종 메뉴별 알레르기 결과:", result)
    return result
  }

  cleanMenuName(dishName: string): string {
    return dishName
      .replace(/\$\$[\d.]+\$\$/g, "") // $$숫자$$ 패턴 제거
      .replace(/$$[\d.]+$$/g, "") // (숫자) 패턴 제거
      .replace(/\[[\d.]+\]/g, "") // [숫자] 패턴 제거
      .replace(/[\d.]+-\*\*/g, "") // 숫자-** 패턴 제거
      .replace(/#/g, "") // # 기호 제거
      .replace(/\*+/g, "") // * 기호들 제거
      .replace(/-+/g, "") // - 기호들 제거
      .replace(/\s+/g, " ") // 연속된 공백을 하나로
      .trim() // 앞뒤 공백 제거
  }

  formatMenuItems(dishName: string): string[] {
    const cleanedName = this.cleanMenuName(dishName)

    // 메뉴들을 분리 (공백, 쉼표, 개행 등으로 구분)
    const items = cleanedName
      .split(/[\n,]+/) // 개행이나 쉼표로 분리
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    return items
  }

  extractAllergyNumbers(dishName: string): string[] {
    console.log("🔍 알레르기 분석 시작 - 원본 메뉴:", dishName) // 디버깅 로그 추가

    const allergenMap: { [key: string]: string } = {
      "1": "난류",
      "2": "우유",
      "3": "메밀",
      "4": "땅콩",
      "5": "대두",
      "6": "밀",
      "7": "고등어",
      "8": "게",
      "9": "새우",
      "10": "돼지고기",
      "11": "복숭아",
      "12": "토마토",
      "13": "아황산류",
      "14": "호두",
      "15": "닭고기",
      "16": "쇠고기",
      "17": "오징어",
      "18": "조개류",
      "19": "잣",
    }

    const allergens: string[] = []

    const dollarPattern = /\$\$(\d+(?:\.\d+)*)\$\$/g
    let match
    while ((match = dollarPattern.exec(dishName)) !== null) {
      console.log("💡 $$패턴 발견:", match[1])
      const numbers = match[1].split(".")
      numbers.forEach((num) => {
        if (allergenMap[num]) {
          console.log(`✅ 알레르기 매핑: ${num} -> ${allergenMap[num]}`)
          allergens.push(allergenMap[num])
        }
      })
    }

    const parenPattern = /$$(\d+(?:\.\d+)*)$$/g
    while ((match = parenPattern.exec(dishName)) !== null) {
      console.log("💡 ()패턴 발견:", match[1])
      const numbers = match[1].split(".")
      numbers.forEach((num) => {
        if (allergenMap[num]) {
          console.log(`✅ 알레르기 매핑: ${num} -> ${allergenMap[num]}`)
          allergens.push(allergenMap[num])
        }
      })
    }

    const bracketPattern = /\[(\d+(?:\.\d+)*)\]/g
    while ((match = bracketPattern.exec(dishName)) !== null) {
      console.log("💡 []패턴 발견:", match[1])
      const numbers = match[1].split(".")
      numbers.forEach((num) => {
        if (allergenMap[num]) {
          console.log(`✅ 알레르기 매핑: ${num} -> ${allergenMap[num]}`)
          allergens.push(allergenMap[num])
        }
      })
    }

    const dashPattern = /(\d+(?:\.\d+)*)-\*\*/g
    while ((match = dashPattern.exec(dishName)) !== null) {
      console.log("💡 숫자-**패턴 발견:", match[1])
      const numbers = match[1].split(".")
      numbers.forEach((num) => {
        if (allergenMap[num]) {
          console.log(`✅ 알레르기 매핑: ${num} -> ${allergenMap[num]}`)
          allergens.push(allergenMap[num])
        }
      })
    }

    const uniqueAllergens = [...new Set(allergens)]
    console.log("🎯 최종 추출된 알레르기:", uniqueAllergens)

    return uniqueAllergens
  }

  private getDefaultNutrition(): NutritionInfo {
    return {
      calories: 0,
      carbohydrate: 0,
      protein: 0,
      fat: 0,
      vitamin_a: 0,
      thiamine: 0,
      riboflavin: 0,
      vitamin_c: 0,
      calcium: 0,
      iron: 0,
    }
  }
}
