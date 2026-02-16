import bs58 from "bs58"
import nacl from "tweetnacl"
import { PublicKey } from "@solana/web3.js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  consumeNonce,
  createSessionToken,
  extractNonceFromMessage,
  getWalletSessionCookieName,
} from "@/lib/server/wallet-auth"

type VerifyRequestBody = {
  address?: string
  message?: string
  signature?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyRequestBody
    const address = body.address?.trim()
    const message = body.message
    const signature = body.signature

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Address, message, and signature are required." },
        { status: 400 },
      )
    }

    let publicKey: PublicKey
    try {
      publicKey = new PublicKey(address)
    } catch {
      return NextResponse.json({ error: "Invalid Solana address." }, { status: 400 })
    }

    const nonce = extractNonceFromMessage(message)
    if (!nonce) {
      return NextResponse.json({ error: "Nonce not found in message." }, { status: 400 })
    }

    const nonceValid = consumeNonce(address, nonce)
    if (!nonceValid) {
      return NextResponse.json(
        { error: "Nonce is invalid, expired, or belongs to another wallet." },
        { status: 401 },
      )
    }

    let signatureBytes: Uint8Array
    try {
      signatureBytes = bs58.decode(signature)
    } catch {
      return NextResponse.json({ error: "Invalid signature encoding." }, { status: 400 })
    }

    const messageBytes = new TextEncoder().encode(message)
    const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes())
    if (!verified) {
      return NextResponse.json({ error: "Signature verification failed." }, { status: 401 })
    }

    const token = createSessionToken(address)
    const cookieStore = await cookies()
    cookieStore.set(getWalletSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json(
      {
        ok: true,
        address,
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
  }
}
