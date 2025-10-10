import { useCallback } from 'react'
import { useSignOut } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/router'
import { auth } from '@services/firebase/config'

interface UseAuthReturn {
  signOut: () => Promise<void>
  isSigningOut: boolean
  signOutError: Error | undefined
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [signOutFn, isSigningOut, signOutError] = useSignOut(auth)

  const signOut = useCallback(async () => {
    try {
      const success = await signOutFn()
      if (success) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }, [signOutFn, router])

  return {
    signOut,
    isSigningOut,
    signOutError,
  }
}
