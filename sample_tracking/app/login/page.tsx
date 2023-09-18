"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState, useEffect } from 'react';

import { getAuth, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getDocs, collection, getFirestore, updateDoc, arrayUnion, addDoc, getDoc } from "firebase/firestore";
import './styles.css';
import { initializeAppIfNecessary, hideNavBar, hideTopBar } from '../utils';
import Link from 'next/link';
import Login from './login';
import SignUp from './signup';
import ForgotPassword from './forgot-password';

const LogInScreen = {
  LOG_IN: 'logIn',
  SIGN_UP: 'signUp',
  FORGOT_PASSWORD: 'forgotPassword'
}


/**
 * Component to handle logging a user in, creating an account, and updating passwords.
 * All of these features are handled using subcomponents in the same directory. 
 * It does all of this using Firebase auth. 
 */
export default function LogInSignUpPage() {

  const router = useRouter()
  initializeAppIfNecessary();
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace('/samples');
    }
  });

  const [canSignIn, setCanSignIn] = useState(true);
  const [signInScreen, setSignInScreen] = useState(LogInScreen.LOG_IN);

  useEffect(() => {
    hideNavBar();
    hideTopBar();
  })


  function handleSignUpClick() {
    setSignInScreen(LogInScreen.SIGN_UP)
    setCanSignIn(false);
  }
  function handleSignInClick() {
    setCanSignIn(true);
  }
  function handleForgotPasswordClick() {
    setSignInScreen(LogInScreen.FORGOT_PASSWORD);
  }
  function handleReturnToSignInClick() {
    setSignInScreen(LogInScreen.LOG_IN);
  }


  return (
    <div >
      {
        signInScreen === LogInScreen.FORGOT_PASSWORD ?
          <ForgotPassword returnToSignInClick={() => handleReturnToSignInClick()} /> :
          <div className='login-page-wrapper'>
            <Login onSignUpClick={() => handleSignUpClick()} onForgotPasswordClick={() => handleForgotPasswordClick()}  />
            <SignUp onLogInClick={() => handleSignInClick()} />
          </div>
      }
    </div>

  )
}