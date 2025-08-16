import { type NextRequest, NextResponse } from "next/server"
import { NeisApiClient } from "@/lib/api/neis"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    const client = new NeisApiClient()

    if (action === "search-school") {
      const schoolName = searchParams.get("schoolName") || "서울고등학교"
      const schools = await client.searchSchools(schoolName)
      return NextResponse.json({ success: true, data: schools })
    }

    if (action === "get-meal") {
      const schoolCode = searchParams.get("schoolCode") || "7010569"
      const officeCode = searchParams.get("officeCode") || "B10"
      const date = searchParams.get("date") || "20241201"

      const meals = await client.getMealInfo(schoolCode, officeCode, date)
      return NextResponse.json({ success: true, data: meals })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("NEIS API 테스트 오류:", error)
    return NextResponse.json(
      {
        error: "API 호출 실패",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    )
  }
}
