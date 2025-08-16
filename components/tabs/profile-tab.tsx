"use client"

import { useState } from "react"
import {
  User,
  Edit3,
  LogOut,
  Settings,
  School,
  AlertTriangle,
  Trophy,
  Calendar,
  ChevronRight,
  X,
  Save,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { AllergyProfile } from "@/lib/allergy/manager"

interface ProfileTabProps {
  allergyProfile: AllergyProfile | null
  selectedSchool: any
  onResetProfile: () => void
  onProfileUpdate?: (profile: AllergyProfile) => void
}

export function ProfileTab({ allergyProfile, selectedSchool, onResetProfile, onProfileUpdate }: ProfileTabProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(allergyProfile?.name || "")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showAllergyModal, setShowAllergyModal] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const supabase = createClient()

  const handleNameEdit = async () => {
    if (isEditingName) {
      if (!editedName.trim()) {
        alert("이름을 입력해주세요.")
        return
      }

      try {
        setIsSavingName(true)
        console.log("[v0] 이름 변경 시작:", editedName)

        // Supabase 사용자 메타데이터 업데이트
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError

        if (user) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { name: editedName },
          })
          if (updateError) throw updateError

          // users 테이블도 업데이트
          const { error: dbError } = await supabase.from("users").update({ name: editedName }).eq("id", user.id)

          if (dbError) console.warn("[v0] DB 업데이트 실패:", dbError)
        }

        // localStorage 업데이트
        if (allergyProfile) {
          const updatedProfile = { ...allergyProfile, name: editedName }
          localStorage.setItem("allergyProfile", JSON.stringify(updatedProfile))
          onProfileUpdate?.(updatedProfile)
        }

        console.log("[v0] 이름 변경 완료")
        alert("이름이 성공적으로 변경되었습니다.")
      } catch (error) {
        console.error("[v0] 이름 변경 오류:", error)
        alert("이름 변경 중 오류가 발생했습니다.")
        setEditedName(allergyProfile?.name || "")
      } finally {
        setIsSavingName(false)
      }
    } else {
      setEditedName(allergyProfile?.name || "")
    }
    setIsEditingName(!isEditingName)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log("[v0] 로그아웃 시작")

      localStorage.removeItem("allergyProfile")
      localStorage.removeItem("selectedSchool")
      localStorage.removeItem("analysisCount")
      localStorage.removeItem("quizStreak")
      localStorage.removeItem("joinDate")
      localStorage.setItem("isLoggedOut", "true") // 로그아웃 상태 표시

      const logoutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("로그아웃 타임아웃")), 3000))

      try {
        await Promise.race([logoutPromise, timeoutPromise])
        console.log("[v0] 로그아웃 완료")
      } catch (error) {
        console.warn("[v0] Supabase 로그아웃 실패 또는 타임아웃:", error)
        // 로컬 상태는 이미 정리했으므로 계속 진행
      }

      window.location.replace(window.location.origin)
    } catch (error) {
      console.error("[v0] 로그아웃 예외:", error)
      localStorage.setItem("isLoggedOut", "true")
      window.location.replace(window.location.origin)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userStats = {
    analysisCount: Number.parseInt(localStorage.getItem("analysisCount") || "0"),
    quizStreak: Number.parseInt(localStorage.getItem("quizStreak") || "0"),
    joinDate: localStorage.getItem("joinDate") || new Date().toLocaleDateString(),
  }

  const AllergyModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">알레르기 정보</h3>
          <button
            onClick={() => setShowAllergyModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {allergyProfile?.allergies && allergyProfile.allergies.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">현재 등록된 알레르기 정보입니다.</p>
              {allergyProfile.allergies.map((allergy) => {
                const severity = allergyProfile.severity?.[allergy] || "mild"
                const severityLabels = {
                  mild: "경미",
                  moderate: "보통",
                  severe: "심각",
                }
                const severityColors = {
                  mild: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  moderate: "bg-orange-100 text-orange-800 border-orange-200",
                  severe: "bg-red-100 text-red-800 border-red-200",
                }
                return (
                  <div key={allergy} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-900">{allergy}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[severity]}`}>
                      {severityLabels[severity]}
                    </span>
                  </div>
                )
              })}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  💡 알레르기 정보를 수정하려면 "프로필 재설정"을 통해 다시 설정해주세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 알레르기 정보가 없습니다.</p>
              <button
                onClick={() => {
                  setShowAllergyModal(false)
                  onResetProfile()
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                알레르기 정보 설정하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="pb-20 animate-fade-in">
      <div className="relative mb-8 pt-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
                      autoFocus
                      disabled={isSavingName}
                    />
                    {isSavingName && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {allergyProfile?.name || "사용자"}님
                  </h2>
                )}
                <button
                  onClick={handleNameEdit}
                  disabled={isSavingName}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isEditingName ? (
                    <Save className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-gray-600">급식 영양 분석 전문가</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{userStats.analysisCount}</p>
          <p className="text-xs text-gray-600">분석 횟수</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50">
          <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{userStats.quizStreak}</p>
          <p className="text-xs text-gray-600">퀴즈 연속</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50">
          <User className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{allergyProfile?.ageGroup || "중학생"}</p>
          <p className="text-xs text-gray-600">연령대</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              개인 정보
            </h3>
          </div>

          {selectedSchool && (
            <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedSchool.SCHUL_NM}</p>
                  <p className="text-sm text-gray-600">{selectedSchool.LCTN_SC_NM}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}

          <button
            onClick={() => setShowAllergyModal(true)}
            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-gray-900">알레르기 정보</p>
                <p className="text-sm text-gray-600">
                  {allergyProfile?.allergies?.length
                    ? `${allergyProfile.allergies.length}개 등록됨`
                    : "등록된 알레르기 없음"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">계정 관리</h3>
          </div>

          <button
            onClick={onResetProfile}
            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">프로필 재설정</p>
                <p className="text-sm text-gray-600">모든 정보를 초기화합니다</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full p-4 flex items-center justify-between transition-colors text-left ${
              isLoggingOut ? "bg-gray-100 cursor-not-allowed opacity-50" : "hover:bg-red-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-600">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</p>
                <p className="text-sm text-gray-600">계정에서 로그아웃합니다</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {showAllergyModal && <AllergyModal />}
    </div>
  )
}
