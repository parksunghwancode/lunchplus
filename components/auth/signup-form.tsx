"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // 이메일 인증 비활성화
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setError("이미 가입된 이메일입니다. 로그인을 시도해주세요.")
          return
        }
        throw error
      }

      if (data.user) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">새 계정을 만들어 시작하세요</p>
        </div>
      </div>

      {/* 회원가입 폼 */}
      <Card className="p-6">
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                className="pl-10 h-12"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
            {loading ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
