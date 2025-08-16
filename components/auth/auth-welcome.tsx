"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User, Mail, UserPlus, Users } from "lucide-react"

interface AuthWelcomeProps {
  onGuestLogin: () => void
}

export default function AuthWelcome({ onGuestLogin }: AuthWelcomeProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: "google") => {
    setLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("소셜 로그인 오류:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              급식 영양 분석
            </h1>
            <p className="text-gray-500 text-lg">건강한 급식 생활을 위한 첫 걸음</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 text-center">간편하게 시작하기</p>

            <button
              onClick={() => handleSocialLogin("google")}
              disabled={loading === "google"}
              className="w-full h-14 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">{loading === "google" ? "로그인 중..." : "Google로 시작하기"}</span>
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-500">또는</span>
            </div>
          </div>

          {/* 이메일 로그인/회원가입 */}
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              로그인
            </button>

            <button
              onClick={() => (window.location.href = "/auth/signup")}
              className="w-full h-14 bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-2xl text-blue-600 font-medium hover:bg-blue-50/80 hover:shadow-lg hover:shadow-blue-200/25 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              회원가입
            </button>
          </div>

          {/* 게스트 로그인 */}
          <div className="pt-4">
            <button
              onClick={onGuestLogin}
              className="w-full h-12 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">게스트로 체험하기</span>
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">로그인 없이 기본 기능을 체험할 수 있습니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
