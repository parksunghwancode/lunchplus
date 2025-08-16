"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MealCalendarProps {
  onDateSelect?: (date: Date | null) => void
  selectedSchool?: any
}

export function MealCalendar({ onDateSelect, selectedSchool }: MealCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}${month}${day}`
  }

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      timeZone: "Asia/Seoul",
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isWeekday = (date: Date | null) => {
    if (!date) return false
    const dayOfWeek = date.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5 // 월요일(1) ~ 금요일(5)
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          급식 일정
        </CardTitle>
        <CardDescription>날짜를 선택하여 해당일의 급식 정보를 확인하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date && (
                <Button
                  variant={isSelected(date) ? "default" : isToday(date) ? "secondary" : "ghost"}
                  className={`w-full h-full p-1 text-sm ${isToday(date) ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span>{date.getDate()}</span>
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* 선택된 날짜 정보 */}
        {selectedDate && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{formatDisplayDate(selectedDate)}</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">선택한 날짜의 급식 정보를 분석해보세요!</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {formatDate(selectedDate)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedDate && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>날짜를 선택해주세요.</p>
            <p className="text-sm">급식 정보를 확인할 날짜를 클릭하세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
