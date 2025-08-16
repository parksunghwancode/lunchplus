"use client"

import { useState, useEffect } from "react"
import { Brain, CheckCircle, XCircle, Lightbulb } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "급식에서 단백질이 가장 많이 들어있는 음식은?",
    options: ["밥", "닭가슴살", "김치", "우유"],
    correctAnswer: 1,
    explanation: "닭가슴살은 고품질 단백질의 대표적인 공급원으로, 근육 성장과 회복에 필수적입니다.",
    category: "단백질",
  },
  {
    id: "q2",
    question: "비타민C가 가장 풍부한 급식 반찬은?",
    options: ["계란찜", "브로콜리", "돼지고기", "쌀밥"],
    correctAnswer: 1,
    explanation: "브로콜리는 비타민C가 매우 풍부하여 면역력 강화와 콜라겐 합성에 도움을 줍니다.",
    category: "비타민",
  },
  {
    id: "q3",
    question: "칼슘이 가장 많이 들어있는 급식 음식은?",
    options: ["우유", "사과", "감자", "당근"],
    correctAnswer: 0,
    explanation: "우유는 칼슘의 최고 공급원으로, 뼈와 치아 건강에 필수적입니다.",
    category: "미네랄",
  },
  {
    id: "q4",
    question: "급식에서 탄수화물의 주요 공급원은?",
    options: ["생선", "밥", "시금치", "치즈"],
    correctAnswer: 1,
    explanation: "밥은 탄수화물의 주요 공급원으로, 우리 몸의 주요 에너지원 역할을 합니다.",
    category: "탄수화물",
  },
  {
    id: "q5",
    question: "철분이 풍부한 급식 반찬은?",
    options: ["오이", "시금치", "배추", "양파"],
    correctAnswer: 1,
    explanation: "시금치는 철분이 풍부하여 빈혈 예방과 산소 운반에 도움을 줍니다.",
    category: "미네랄",
  },
  {
    id: "q6",
    question: "급식에서 건강한 지방을 공급하는 음식은?",
    options: ["튀김", "견과류", "사탕", "콜라"],
    correctAnswer: 1,
    explanation: "견과류는 불포화지방산이 풍부하여 심혈관 건강에 도움을 줍니다.",
    category: "지방",
  },
  {
    id: "q7",
    question: "급식에서 식이섬유가 가장 많은 음식은?",
    options: ["흰쌀밥", "현미밥", "설탕", "버터"],
    correctAnswer: 1,
    explanation: "현미밥은 식이섬유가 풍부하여 소화 건강과 포만감 유지에 도움을 줍니다.",
    category: "식이섬유",
  },
]

export function NutritionQuiz() {
  const [todayQuiz, setTodayQuiz] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    const savedQuizDate = localStorage.getItem("quiz-date")
    const savedQuizCompleted = localStorage.getItem("quiz-completed")

    if (savedQuizDate === today && savedQuizCompleted === "true") {
      setIsCompleted(true)
      return
    }

    if (savedQuizDate !== today) {
      localStorage.removeItem("quiz-completed")
      localStorage.setItem("quiz-date", today)
    }

    // 날짜 기반으로 퀴즈 선택 (매일 다른 퀴즈)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    )
    const quizIndex = dayOfYear % quizQuestions.length
    setTodayQuiz(quizQuestions[quizIndex])
  }, [])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    setShowResult(true)
    localStorage.setItem("quiz-completed", "true")

    // 3초 후 완료 상태로 변경
    setTimeout(() => {
      setIsCompleted(true)
    }, 3000)
  }

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 shadow-lg border border-green-100">
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">오늘의 퀴즈 완료!</h3>
          <p className="text-gray-600 text-sm">내일 새로운 영양소 퀴즈가 준비됩니다</p>
        </div>
      </div>
    )
  }

  if (!todayQuiz) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-8 h-8 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          오늘의 영양소 퀴즈
        </h3>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-purple-700">{todayQuiz.category}</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-800 font-medium text-base leading-relaxed mb-4">{todayQuiz.question}</p>

        <div className="space-y-3">
          {todayQuiz.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium"

            if (showResult) {
              if (index === todayQuiz.correctAnswer) {
                buttonClass += " bg-green-50 border-green-300 text-green-800"
              } else if (index === selectedAnswer && index !== todayQuiz.correctAnswer) {
                buttonClass += " bg-red-50 border-red-300 text-red-800"
              } else {
                buttonClass += " bg-gray-50 border-gray-200 text-gray-600"
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += " bg-blue-50 border-blue-300 text-blue-800"
              } else {
                buttonClass += " bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  {option}
                  {showResult && index === todayQuiz.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                  {showResult && index === selectedAnswer && index !== todayQuiz.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {showResult && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100 animate-fade-in">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">설명</h4>
              <p className="text-blue-800 text-sm leading-relaxed">{todayQuiz.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${
            selectedAnswer !== null
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          정답 확인하기
        </button>
      )}
    </div>
  )
}
