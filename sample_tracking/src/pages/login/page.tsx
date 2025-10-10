'use client'

import React, { useState, useEffect } from 'react'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/navigation'

import Login from './login'
import SignUp from './signup'
import ForgotPassword from './forgot-password'
import { auth } from '@services/firebase/config'
import { useGlobal } from '@hooks/useGlobal'

const LogInScreen = {
  LOG_IN: 'logIn',
  SIGN_UP: 'signUp',
  FORGOT_PASSWORD: 'forgotPassword',
}

/**
 * Component to handle logging a user in, creating an account, and updating passwords.
 * All of these features are handled using subcomponents in the same directory.
 * It does all of this using Firebase auth.
 */
export default function LogInSignUpPage() {
  const router = useRouter()

  const [user, loading, error] = useAuthState(auth)

  if (user && !loading && !error) {
    router.replace('/samples')
  }

  const [canSignIn, setCanSignIn] = useState(true)
  const [signInScreen, setSignInScreen] = useState(LogInScreen.LOG_IN)
  const { setShowNavBar } = useGlobal()

  useEffect(() => {
    setShowNavBar(false)
  }, [])

  function handleSignUpClick() {
    setSignInScreen(LogInScreen.SIGN_UP)
  }

  function handleForgotPasswordClick() {
    setSignInScreen(LogInScreen.FORGOT_PASSWORD)
  }

  function handleReturnToSignInClick() {
    setSignInScreen(LogInScreen.LOG_IN)
  }

  return (
    <>
      {signInScreen === LogInScreen.FORGOT_PASSWORD ? (
        <ForgotPassword
          returnToSignInClick={() => handleReturnToSignInClick()}
        />
      ) : (
        <Login />

        // <div className="flex flex-col gap-4 my-auto justify-center h-full">
        //   <div className="flex justify-center gap-8">
        //     <Login />
        //     {/* <SignUp /> */}
        //   </div>
        //   <div className="text-center">
        //     <a
        //       className="text-blue-400 hover:text-blue-300 disabled:text-neutral-500 active:text-blue-500"
        //       href="https://timberid.gitbook.io/timberid/"
        //     >
        //       Clique aqui
        //     </a>{' '}
        //     e veja mais sobre a nossa documentação
        //   </div>
        // </div>
      )}
    </>
  )
}
