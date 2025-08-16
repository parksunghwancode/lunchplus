"use client"

import type React from "react"
import { useState } from "react"
import { Search, MapPin, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SchoolInfo } from "@/lib/types/meal"

interface SchoolSearchProps {
  onSchoolSelect?: (school: SchoolInfo | null) => void
}

export function SchoolSearch({ onSchoolSelect }: SchoolSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [schools, setSchools] = useState<SchoolInfo[]>([])
  const [selectedSchool, setSelectedSchool] = useState<SchoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/schools/search?name=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (data.error) {
        console.error(data.error)
        return
      }

      setSchools(data.schools || [])
    } catch (error) {
      console.error("학교 검색 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchoolSelect = (school: SchoolInfo) => {
    setSelectedSchool(school)
    onSchoolSelect?.(school)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5 text-blue-600" />
          학교 검색
        </CardTitle>
        <CardDescription>급식 정보를 확인하고 싶은 학교를 검색해보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="학교명을 입력하세요 (예: 서울고등학교)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </div>

        {selectedSchool && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedSchool.SCHUL_NM}</h3>
                  <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {selectedSchool.ATPT_OFCDC_SC_NM}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {selectedSchool.SCHUL_KND_SC_NM}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSchool(null)
                    onSchoolSelect?.(null)
                  }}
                >
                  변경
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {schools.length > 0 && !selectedSchool && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-gray-900">검색 결과</h4>
            {schools.map((school) => (
              <Card
                key={`${school.SD_SCHUL_CODE}-${school.ATPT_OFCDC_SC_CODE}`}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSchoolSelect(school)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{school.SCHUL_NM}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.ATPT_OFCDC_SC_NM}
                      </p>
                    </div>
                    <Badge variant="outline">{school.SCHUL_KND_SC_NM}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {schools.length === 0 && searchTerm && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <School className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>검색 결과가 없습니다.</p>
            <p className="text-sm">다른 학교명으로 검색해보세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
