import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getWalletSessionCookieName, verifySessionToken } from "@/lib/server/wallet-auth"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getWalletSessionCookieName())?.value
  const session = verifySessionToken(token)

  if (!session) {
    return NextResponse.json({ authenticated: false, address: null }, { status: 200 })
  }

  return NextResponse.json(
    {
      authenticated: true,
      address: session.address,
    },
    { status: 200 },
  )
}
