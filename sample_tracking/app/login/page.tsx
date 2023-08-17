"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation'
import './styles.css';
import { initializeAppIfNecessary, hideNavBar, hideTopBar } from '../utils';
import Login from './login';
import SignUp from './signup';

const LogInScreen = {
  logIn: 'logIn',
  signUp: 'signUp',
  forgotPassword: 'forgotPassword'
}

export default function LogInSignUpPage() {

  const router = useRouter()

  const app = initializeAppIfNecessary();
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace('/samples');
    } else {
      console.log('User not logged in');
    }
  });

  const [canSignIn, setCanSignIn] = useState(true);
  const [signInScreen, setSignInScreen] = useState(LogInScreen.logIn);

  useEffect(() => {
    hideNavBar();
    hideTopBar();
  })

  function handleSignUpClick() {
    console.log('sign up click');
    setCanSignIn(false);
  }
  function handleSignInClick() {
    console.log('sign in click');
    setCanSignIn(true);
  }
  function handleForgotPasswordClick() {
    setSignInScreen(LogInScreen.forgotPassword);
  }


  return (
    <div>
      {canSignIn ? <Login onSignUpClick={() => handleSignUpClick()} onForgotPasswordClick={() => handleForgotPasswordClick()}/> : <SignUp onLogInClick={() => handleSignInClick()} />}
    </div>

  )
}

