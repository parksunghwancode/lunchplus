import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ehrpdtcoqcmvqzlbbymh.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocnBkdGNvcWNtdnF6bGJieW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDU5MzcsImV4cCI6MjA3MDgyMTkzN30.i5RFb-JiioQkVIaF_zPNKA1twOvSt3ZXeLCGRncV6wU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface User {
  id: string
  email: string
  name: string
  school_name?: string
  school_code?: string
  office_code?: string
  age_group?: string
  allergies: string[]
  created_at: string
}

export interface MealRating {
  id: string
  user_id: string
  school_code: string
  meal_date: string
  rating: number
  comment?: string
  created_at: string
}

export interface NutritionHistory {
  id: string
  user_id: string
  meal_date: string
  nutrition_data: any
  health_score: number
  created_at: string
}

export interface QuizProgress {
  id: string
  user_id: string
  quiz_date: string
  question_id: number
  is_correct: boolean
  created_at: string
}
