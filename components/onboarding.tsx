"use client"

import { useState } from "react"
import { SchoolSearch } from "@/components/school-search"
import { User, School, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react"
import type { AllergyProfile } from "@/lib/allergy/manager"
import { createClient } from "@/lib/supabase/client"

interface OnboardingProps {
  onComplete: (profile: AllergyProfile, school: any) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [ageGroup, setAgeGroup] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const allergyOptions = [
    "난류",
    "우유",
    "메밀",
    "땅콩",
    "대두",
    "밀",
    "고등어",
    "게",
    "새우",
    "돼지고기",
    "복숭아",
    "토마토",
    "아황산류",
    "호두",
    "닭고기",
    "쇠고기",
    "오징어",
    "조개류",
    "잣",
  ]

  const ageGroups = ["초등학교 저학년 (6-8세)", "초등학교 고학년 (9-11세)", "중학생 (12-14세)", "고등학생 (15-17세)"]

  const handleAllergyToggle = (allergy: string) => {
    setSelectedAllergies((prev) => (prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]))
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 로그인한 사용자의 경우 Supabase에 저장
        const { error } = await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
          name: name,
          school_name: selectedSchool?.SCHUL_NM || "",
          school_code: selectedSchool?.SD_SCHUL_CODE || "",
          office_code: selectedSchool?.ATPT_OFCDC_SC_CODE || "",
          age_group: ageGroup,
          allergies: selectedAllergies,
        })

        if (error) {
          console.error("사용자 정보 저장 오류:", error)
        } else {
          console.log("사용자 정보 Supabase에 저장 완료")
        }
      } else {
        // 게스트의 경우 localStorage에 저장
        localStorage.setItem(
          "guest-profile",
          JSON.stringify({
            name,
            ageGroup,
            allergies: selectedAllergies,
          }),
        )
        localStorage.setItem("guest-school", JSON.stringify(selectedSchool))
      }

      const profile: AllergyProfile = {
        id: "main-profile",
        name,
        ageGroup,
        allergies: selectedAllergies,
        createdAt: new Date(),
      }

      onComplete(profile, selectedSchool)
    } catch (error) {
      console.error("온보딩 완료 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedStep1 = name.trim() && ageGroup
  const canProceedStep2 = selectedSchool
  const canComplete = canProceedStep1 && canProceedStep2

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 진행 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      i <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i}
                  </div>
                  {i < 3 && <div className={`w-8 h-1 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            {step === 1 && "개인 정보 입력"}
            {step === 2 && "학교 선택"}
            {step === 3 && "알레르기 정보"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          {step === 1 && (
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요!</h1>
              <p className="text-gray-600 mb-8">급식 영양 분석을 위한 기본 정보를 입력해주세요</p>

              <div className="space-y-6">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력해주세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">연령대</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">연령대를 선택해주세요</option>
                    {ageGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className={`w-full mt-8 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  canProceedStep1
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                다음 단계
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <School className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">학교를 선택해주세요</h2>
              <p className="text-gray-600 mb-8">급식 정보를 가져올 학교를 검색하고 선택해주세요</p>

              <div className="text-left mb-6">
                <SchoolSearch onSchoolSelect={setSelectedSchool} />
              </div>

              {selectedSchool && (
                <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">학교 선택 완료</span>
                  </div>
                  <p className="text-sm text-green-600">{selectedSchool.SCHUL_NM}</p>
                  <p className="text-xs text-green-500">{selectedSchool.LCTN_SC_NM}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    canProceedStep2
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  다음 단계
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">알레르기 정보</h2>
              <p className="text-gray-600 mb-8">해당하는 알레르기가 있다면 선택해주세요 (선택사항)</p>

              <div className="text-left mb-6">
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {allergyOptions.map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => handleAllergyToggle(allergy)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedAllergies.includes(allergy)
                          ? "bg-red-100 text-red-700 border-2 border-red-300"
                          : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAllergies.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-2">선택된 알레르기:</p>
                  <p className="text-sm text-red-600">{selectedAllergies.join(", ")}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  이전
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isLoading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "저장 중..." : "설정 완료"}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
