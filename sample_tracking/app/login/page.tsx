"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState, useEffect } from 'react';

import { getAuth, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { firebaseConfig } from '../firebase_config';
import { doc, setDoc, getDocs, collection, getFirestore, updateDoc, arrayUnion, addDoc, getDoc } from "firebase/firestore";
import './styles.css';
import { initializeAppIfNecessary, hideNavBar, hideTopBar } from '../utils';
import Link from 'next/link';
import Login from './login';
import SignUp from './signup';
import ForgotPassword from './forgot-password';

type SignUpData = {
  firstName: string,
  lastName: string,
  lab: string,
  labName: string,
}

interface LogInProps {
  onSignUpClick: any,
  onForgotPasswordClick: any,
}

interface SignUpProps {
  onLogInClick: any,
}

interface NestedSchemas {
  [key: string]: NestedSchemas | string;
}

interface OrgsSchemas {
  [key: string]: string;
}

type NewUser = {
  name: string,
  email: string,
  date_requested: string,
  org: string,
  uid: string,
  org_name: string
}

const LogInScreen = {
  LOG_IN: 'logIn',
  SIGN_UP: 'signUp',
  FORGOT_PASSWORD: 'forgotPassword'
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
  const [signInScreen, setSignInScreen] = useState(LogInScreen.LOG_IN);

  useEffect(() => {
    hideNavBar();
    hideTopBar();
  })





  function handleSignUpClick() {
    console.log('sign up click');
    setSignInScreen(LogInScreen.SIGN_UP)
    setCanSignIn(false);
  }
  function handleSignInClick() {
    console.log('sign in click');
    setCanSignIn(true);
  }
  function handleForgotPasswordClick() {
    setSignInScreen(LogInScreen.FORGOT_PASSWORD);
  }
  function handleReturnToSignInClick() {
    setSignInScreen(LogInScreen.LOG_IN);
  }


  return (
    <div>
      {
        signInScreen === LogInScreen.LOG_IN ? <Login onSignUpClick={() => handleSignUpClick()} onForgotPasswordClick={() => handleForgotPasswordClick()}/> :
        signInScreen === LogInScreen.SIGN_UP ? <SignUp onLogInClick={() => handleSignInClick()} /> :
        <ForgotPassword returnToSignInClick={() => handleReturnToSignInClick()}/>
      }
      
      {/* {canSignIn ? <Login onSignUpClick={() => handleSignUpClick()} onForgotPasswordClick={() => handleForgotPasswordClick()}/> : <SignUp onLogInClick={() => handleSignInClick()} />} */}
    </div>

  )
}