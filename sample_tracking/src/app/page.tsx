'use client'

import 'bootstrap/dist/css/bootstrap.css'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@services/firebase/config'
import { useRouter, usePathname } from 'next/navigation'

import '../i18n/config'

export default function Home() {
  const [user, loading, error] = useAuthState(auth)
  const router = useRouter()
  const pathname = usePathname()

  if (loading) {
    return <div className="initalLoadBackground"></div>
  }

  if (!user && pathname !== '/login') {
    router.push('/login')
  }

  if (user && !loading && !error && pathname === '/') {
    router.push('samples')
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return <></>
}
