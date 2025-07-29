import { createSessionClient } from "@/lib/appwrite"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export const GET = async (req: NextRequest) => {
  try {
    const { account } = await createSessionClient()
    const user = await account.get()

    return NextResponse.json({
      user,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        user: null,
        message: "No active session",
      },
      {
        status: 401,
      },
    )
  }
}
