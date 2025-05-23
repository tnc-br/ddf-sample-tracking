import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Cookies from 'js-cookie'

import { useQueryClient } from '@tanstack/react-query'

import { clearStore, useAppDispatch } from 'common/store'
import * as userInfoReducer from 'common/reducers/userInfo'
import * as activeReducer from 'common/reducers/selected'

function Logout() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const signOut = () => {
    dispatch(userInfoReducer.clear())
    dispatch(activeReducer.clear())
    clearStore()
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    queryClient.removeQueries()

    router.replace({ pathname: '/login', query: { ...router.query } })
  }

  useEffect(() => {
    if (router.isReady) signOut()
  }, [router.isReady])

  return null
}

export default Logout
