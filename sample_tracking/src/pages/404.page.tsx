import React, { useEffect } from 'react'
import Cookie from 'js-cookie'
import { useRouter } from 'next/router'

const NotFound = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const token = Cookie.get('token')
    if (token) router.replace({ pathname: '/home', query: { ...router.query } })
    else router.replace('/login')
  }, [router.isReady])

  return <h1> nao achado </h1>
}

export default NotFound
