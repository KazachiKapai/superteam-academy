"use client"

import bs58 from "bs58"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type WalletSessionResponse = {
  authenticated: boolean
  address: string | null
}

type WalletAuthContextValue = {
  isLoading: boolean
  isAuthenticated: boolean
  address: string | null
  authError: string | null
  loginWithWallet: () => Promise<void>
  logout: () => Promise<void>
}

const WalletAuthContext = createContext<WalletAuthContextValue | undefined>(undefined)

type WalletAuthProviderProps = {
  children: ReactNode
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const { publicKey, signMessage, connected, disconnect } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const lastAutoAuthAddress = useRef<string | null>(null)

  const syncSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/wallet/session", { method: "GET" })
      const data = (await response.json()) as WalletSessionResponse
      setIsAuthenticated(Boolean(data.authenticated))
      setAddress(data.address ?? null)
      setAuthError(null)
    } catch {
      setIsAuthenticated(false)
      setAddress(null)
      setAuthError("Unable to check wallet session.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void syncSession()
  }, [syncSession])

  const loginWithWallet = useCallback(async () => {
    if (!publicKey || !connected) {
      throw new Error("Connect a wallet before signing in.")
    }
    if (!signMessage) {
      throw new Error("This wallet does not support message signing.")
    }

    setIsLoading(true)
    setAuthError(null)
    try {
      const walletAddress = publicKey.toBase58()

      const nonceResponse = await fetch("/api/auth/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      })
      if (!nonceResponse.ok) {
        throw new Error("Failed to generate wallet nonce.")
      }

      const { message } = (await nonceResponse.json()) as { message: string }
      const messageBytes = new TextEncoder().encode(message)
      const signedMessage = await signMessage(messageBytes)
      const signature = bs58.encode(signedMessage)

      const verifyResponse = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
          message,
          signature,
        }),
      })
      if (!verifyResponse.ok) {
        throw new Error("Wallet signature verification failed.")
      }

      setIsAuthenticated(true)
      setAddress(walletAddress)
      setAuthError(null)
      lastAutoAuthAddress.current = walletAddress
    } catch (error) {
      setIsAuthenticated(false)
      setAddress(null)
      setAuthError(error instanceof Error ? error.message : "Wallet authentication failed.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [connected, publicKey, signMessage])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/wallet/logout", { method: "POST" })
      setIsAuthenticated(false)
      setAddress(null)
      setAuthError(null)
      lastAutoAuthAddress.current = null
      if (connected) {
        await disconnect()
      }
    } finally {
      setIsLoading(false)
    }
  }, [connected, disconnect])

  useEffect(() => {
    if (!connected) {
      setIsAuthenticated(false)
      setAddress(null)
      setAuthError(null)
      lastAutoAuthAddress.current = null
      return
    }

    const connectedAddress = publicKey?.toBase58() ?? null
    if (address && connectedAddress && address !== connectedAddress) {
      setIsAuthenticated(false)
      setAddress(null)
      setAuthError(null)
      lastAutoAuthAddress.current = null
    }
  }, [address, connected, publicKey])

  useEffect(() => {
    if (!connected || !publicKey) return
    if (isAuthenticated) return
    if (isLoading) return

    const connectedAddress = publicKey.toBase58()
    if (lastAutoAuthAddress.current === connectedAddress) return

    lastAutoAuthAddress.current = connectedAddress
    void loginWithWallet().catch(() => undefined)
  }, [connected, publicKey, isAuthenticated, isLoading, loginWithWallet])

  const retryAuthentication = useCallback(() => {
    lastAutoAuthAddress.current = null
    return loginWithWallet()
  }, [loginWithWallet])

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      address,
      authError,
      loginWithWallet: retryAuthentication,
      logout,
    }),
    [address, authError, isAuthenticated, isLoading, retryAuthentication, logout],
  )

  return <WalletAuthContext.Provider value={value}>{children}</WalletAuthContext.Provider>
}

export function useWalletAuth(): WalletAuthContextValue {
  const context = useContext(WalletAuthContext)
  if (!context) {
    throw new Error("useWalletAuth must be used within WalletAuthProvider.")
  }
  return context
}
