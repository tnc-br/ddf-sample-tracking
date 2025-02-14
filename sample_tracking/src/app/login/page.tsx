'use client'

import React, { useState, useEffect } from 'react'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

import './styles.css'
import {
  initializeAppIfNecessary,
  hideNavBar,
} from '../../old_components/utils'
import Login from './login'
import SignUp from './signup'
import ForgotPassword from './forgot-password'

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
  initializeAppIfNecessary()
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace('/samples')
    }
  })

  const [canSignIn, setCanSignIn] = useState(true)
  const [signInScreen, setSignInScreen] = useState(LogInScreen.LOG_IN)

  useEffect(() => {
    hideNavBar()
  })

  function handleSignUpClick() {
    setSignInScreen(LogInScreen.SIGN_UP)
    setCanSignIn(false)
  }
  function handleSignInClick() {
    setCanSignIn(true)
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
        <div className="flex flex-col gap-4 my-auto justify-center h-full">
          <div className="flex justify-center gap-8">
            <Login
              onSignUpClick={() => handleSignUpClick()}
              onForgotPasswordClick={() => handleForgotPasswordClick()}
            />
            <SignUp onLogInClick={() => handleSignInClick()} />
          </div>
          <div className="text-center">
            <a
              className="text-blue-400 hover:text-blue-300 disabled:text-neutral-500 active:text-blue-500"
              href="https://timberid.gitbook.io/timberid/"
            >
              Clique aqui
            </a>{' '}
            e veja mais sobre a nossa documentação
          </div>
        </div>
      )}
    </>
  )
}
