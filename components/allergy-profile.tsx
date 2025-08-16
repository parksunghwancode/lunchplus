"use client"

import { useState } from "react"
import { AlertTriangle, User, Shield, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AllergyManager, type AllergyProfile } from "@/lib/allergy/manager"

const COMMON_ALLERGENS = [
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

interface AllergyProfileComponentProps {
  onProfileSelect: (profile: AllergyProfile | null) => void
}

function AllergyProfileComponent({ onProfileSelect }: AllergyProfileComponentProps) {
  const [profile, setProfile] = useState<AllergyProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [ageGroup, setAgeGroup] = useState<string>("")
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [allergySeverity, setAllergySeverity] = useState<{ [key: string]: "mild" | "moderate" | "severe" }>({})

  const allergyManager = new AllergyManager()

  const handleSaveProfile = () => {
    if (!profileName.trim() || !ageGroup) return

    const newProfile = allergyManager.createProfile(profileName, selectedAllergies, allergySeverity, ageGroup)
    setProfile(newProfile)
    onProfileSelect(newProfile)
    setIsEditing(false)
  }

  const handleEditProfile = () => {
    if (profile) {
      setProfileName(profile.name)
      setAgeGroup(profile.ageGroup)
      setSelectedAllergies(profile.allergies)
      setAllergySeverity(profile.severity)
    }
    setIsEditing(true)
  }

  const handleAllergyToggle = (allergen: string, checked: boolean) => {
    if (checked) {
      setSelectedAllergies([...selectedAllergies, allergen])
      setAllergySeverity({ ...allergySeverity, [allergen]: "mild" })
    } else {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergen))
      const newSeverity = { ...allergySeverity }
      delete newSeverity[allergen]
      setAllergySeverity(newSeverity)
    }
  }

  const handleSeverityChange = (allergen: string, severity: "mild" | "moderate" | "severe") => {
    setAllergySeverity({ ...allergySeverity, [allergen]: severity })
  }

  const getSeverityColor = (severity: "mild" | "moderate" | "severe") => {
    switch (severity) {
      case "mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "severe":
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  const getSeverityText = (severity: "mild" | "moderate" | "severe") => {
    switch (severity) {
      case "mild":
        return "경미"
      case "moderate":
        return "보통"
      case "severe":
        return "심각"
    }
  }

  return (
    <div className="space-y-6">
      {!profile && !isEditing ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">알레르기 프로필을 설정해주세요</h3>
          <p className="text-gray-600 mb-4">개인 맞춤 급식 분석을 위해 프로필을 만들어보세요</p>
          <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
            <User className="h-4 w-4 mr-2" />
            프로필 만들기
          </Button>
        </div>
      ) : profile && !isEditing ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {profile.name}의 프로필
            </h3>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Edit3 className="h-4 w-4 mr-2" />
              수정
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">이름</span>
                  <p className="font-medium text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">연령대</span>
                  <p className="font-medium text-gray-900">{profile.ageGroup}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">알레르기 유발 요소 ({profile.allergies.length}개)</h4>
              {profile.allergies.length > 0 ? (
                <div className="grid gap-2">
                  {profile.allergies.map((allergy) => {
                    const severity = profile.severity[allergy] || "mild"
                    return (
                      <div key={allergy} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{allergy}</span>
                        <Badge className={getSeverityColor(severity)}>{getSeverityText(severity)}</Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">알레르기가 없습니다</p>
              )}
            </div>

            {profile.allergies.some((allergy) => profile.severity[allergy] === "severe") && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>주의:</strong> 심각한 알레르기가 있습니다. 급식 섭취 전 반드시 성분을 확인하세요.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{profile ? "프로필 수정" : "프로필 만들기"}</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">이름</label>
              <Input
                placeholder="예: 김철수, 우리 아이"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">연령대</label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="연령대를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초등학생">초등학생</SelectItem>
                  <SelectItem value="중학생">중학생</SelectItem>
                  <SelectItem value="고등학생">고등학생</SelectItem>
                  <SelectItem value="성인">성인</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">알레르기 유발 요소</label>
              <div className="grid grid-cols-2 gap-3">
                {COMMON_ALLERGENS.map((allergen) => (
                  <div key={allergen} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={allergen}
                        checked={selectedAllergies.includes(allergen)}
                        onCheckedChange={(checked) => handleAllergyToggle(allergen, checked as boolean)}
                      />
                      <label htmlFor={allergen} className="text-sm font-medium">
                        {allergen}
                      </label>
                    </div>
                    {selectedAllergies.includes(allergen) && (
                      <Select
                        value={allergySeverity[allergen] || "mild"}
                        onValueChange={(value) => handleSeverityChange(allergen, value as any)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">경미</SelectItem>
                          <SelectItem value="moderate">보통</SelectItem>
                          <SelectItem value="severe">심각</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                disabled={!profileName.trim() || !ageGroup}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {profile ? "수정 완료" : "프로필 저장"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllergyProfileComponent
