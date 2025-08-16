// 급식 관련 타입 정의
export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string // 시도교육청코드
  ATPT_OFCDC_SC_NM: string // 시도교육청명
  SD_SCHUL_CODE: string // 표준학교코드
  SCHUL_NM: string // 학교명
  SCHUL_KND_SC_NM: string // 학교종류명
}

export interface MealInfo {
  ATPT_OFCDC_SC_CODE: string // 시도교육청코드
  ATPT_OFCDC_SC_NM: string // 시도교육청명
  SD_SCHUL_CODE: string // 표준학교코드
  SCHUL_NM: string // 학교명
  MMEAL_SC_CODE: string // 식사코드
  MMEAL_SC_NM: string // 식사명
  MLSV_YMD: string // 급식일자
  DDISH_NM: string // 요리명
  ORPLC_INFO: string // 원산지정보
  CAL_INFO: string // 칼로리정보
  NTR_INFO: string // 영양정보
  MLSV_FROM_YMD: string // 급식시작일자
  MLSV_TO_YMD: string // 급식종료일자
}

export interface NutritionInfo {
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

export interface AllergyInfo {
  allergens: string[]
  hasAllergen: boolean
}

export interface MealAnalysis {
  meal: MealInfo
  nutrition: NutritionInfo
  allergies: AllergyInfo
  healthScore: number
  recommendations: string[]
}
