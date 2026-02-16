import { createHmac, randomBytes, timingSafeEqual } from "crypto"

const NONCE_TTL_MS = 5 * 60 * 1000
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const COOKIE_NAME = "st_wallet_session"
const DEV_WALLET_AUTH_SECRET = "superteam-academy-dev-wallet-secret"

type NonceRecord = {
  nonce: string
  expiresAt: number
}

type SessionPayload = {
  address: string
  exp: number
}

const nonceStore = new Map<string, NonceRecord>()

function getSecret(): string {
  return DEV_WALLET_AUTH_SECRET
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function fromBase64Url(input: string): Buffer {
  const padded = input.padEnd(Math.ceil(input.length / 4) * 4, "=").replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(padded, "base64")
}

function makeSignature(payloadB64: string): string {
  return toBase64Url(createHmac("sha256", getSecret()).update(payloadB64).digest())
}

export function getWalletSessionCookieName(): string {
  return COOKIE_NAME
}

export function createNonceForAddress(address: string): string {
  const nonce = toBase64Url(randomBytes(24))
  nonceStore.set(address, { nonce, expiresAt: Date.now() + NONCE_TTL_MS })
  return nonce
}

export function buildWalletSignInMessage(address: string, nonce: string): string {
  const issuedAt = new Date().toISOString()
  const expirationTime = new Date(Date.now() + NONCE_TTL_MS).toISOString()
  return [
    "Sign in to Superteam Academy",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    `Expiration Time: ${expirationTime}`,
  ].join("\n")
}

export function extractNonceFromMessage(message: string): string | null {
  const match = message.match(/Nonce:\s*(.+)/i)
  if (!match) return null
  const nonce = match[1].trim()
  return nonce.length > 0 ? nonce : null
}

export function consumeNonce(address: string, nonce: string): boolean {
  const record = nonceStore.get(address)
  nonceStore.delete(address)

  if (!record) return false
  if (record.expiresAt < Date.now()) return false
  return record.nonce === nonce
}

export function createSessionToken(address: string): string {
  const payload: SessionPayload = {
    address,
    exp: Date.now() + SESSION_TTL_MS,
  }

  const payloadB64 = toBase64Url(JSON.stringify(payload))
  const sig = makeSignature(payloadB64)
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null

  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return null

  const expectedSignature = makeSignature(payloadB64)
  const actualBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSignature)

  if (actualBuf.length !== expectedBuf.length) return null
  if (!timingSafeEqual(actualBuf, expectedBuf)) return null

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64).toString("utf8")) as SessionPayload
    if (payload.exp < Date.now()) return null
    if (!payload.address) return null
    return payload
  } catch {
    return null
  }
}

export function getNonceExpiryIso(): string {
  return new Date(Date.now() + NONCE_TTL_MS).toISOString()
}
