import { type NextRequest, NextResponse } from "next/server"
import { NeisApiClient } from "@/lib/api/neis"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const schoolName = searchParams.get("name")
  const region = searchParams.get("region")

  if (!schoolName) {
    return NextResponse.json({ error: "학교명을 입력해주세요." }, { status: 400 })
  }

  try {
    const neisClient = new NeisApiClient()
    const schools = await neisClient.searchSchools(schoolName, region || undefined)

    return NextResponse.json({ schools })
  } catch (error) {
    console.error("학교 검색 API 오류:", error)
    return NextResponse.json({ error: "학교 검색 중 오류가 발생했습니다." }, { status: 500 })
  }
}
