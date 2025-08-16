import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    console.log("[v0] Auth callback error:", error, searchParams.get("error_description"))
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      console.log("[v0] Auth callback success, redirecting to home")
      return NextResponse.redirect(`${origin}/`)
    } else {
      console.log("[v0] Auth exchange error:", exchangeError)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
