import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@services/firebase/config'
import { useUserData } from './useFirebaseSamples'
import { UserData } from '../old_components/utils'

interface UseCurrentUserReturn {
  user: UserData | null
  loading: boolean
  error: Error | null | undefined
  isAuthenticated: boolean
  uid: string | null
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  // Pegar a sessão atual
  const [authUser, loadingAuth, errorAuth] = useAuthState(auth)

  // Pegar os dados do usuário no Firestore
  const {
    data: userData,
    loading: loadingUserData,
    error: errorUserData,
  } = useUserData(authUser?.uid || null)

  // Combinar os estados de loading e error
  const loading = loadingAuth || loadingUserData
  const error = errorAuth || errorUserData
  const isAuthenticated = !!authUser && !!userData

  return {
    user: userData,
    loading,
    error,
    isAuthenticated,
    uid: authUser?.uid || null,
  }
}
