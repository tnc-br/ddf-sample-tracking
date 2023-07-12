"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { firebaseConfig } from '../firebase_config';
import { doc, setDoc, getFirestore } from "firebase/firestore";
import './styles.css';


export default function LogInSignUpPage() {

  const router = useRouter()

  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.push('/samples');
    } else {
      console.log('User not logged in');
    }
  });


  console.log('In login signup');
  const [canSignIn, setCanSignIn] = useState(true);


  function handleSignUpClick() {
    console.log('sign up click');
    setCanSignIn(false);
  }
  function handleSignInClick() {
    console.log('sign in click');
    setCanSignIn(true);
  }

  return (
    <div>
      {canSignIn ? <Login onSignUpClick={() => handleSignUpClick()} router={router} /> : <SignUp onLogInClick={() => handleSignInClick()} router={router} />}
    </div>

  )
}

export function Test() {
  return (
    <div>
      TEST
    </div>

  )
}


export function Login({
  onSignUpClick,
  router,
}) {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const auth = getAuth();

  function attemptSignIn() {
    const email = document.getElementById('email')!.value;
    const password = document.getElementById('password')!.value;
    console.log('username: ' + loginInfo.email + ' password: ' + loginInfo.password);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log('signed in');
        router.push('/tasks');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        var errorText = document.getElementById('signin-error-message');
        console.log(errorMessage);
        // errorText.innerHTML = errorMessage;

      });
    console.log('DONE');
    const user = auth.currentUser;
  }

  function signInWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      'display': 'popup',
      'prompt': "select_account"
    });
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });


  }

  function signInWithFacebook() {

    const auth = getAuth();
    const provider = new FacebookAuthProvider();


    signInWithPopup(auth, provider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;

        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        // ...
      });


  }




  return (

    <section className="vh-100 bg-grey">
      <div className="container py-5 h-100">
        <div className="card">
          <div className="card-body p-5 text-center">

            <div className="mb-md-5 mt-md-4 pb-5">

              <h2 className="sign-in-title">Sign in</h2>

              <div className="form-outline form-white mb-4">
                <input type="email" name="email" id="email" placeholder="Email address" className="form-control form-control-lg" />
              </div>

              <div className="form-outline form-white mb-4">
                <input type="password" name="password" id="password" placeholder="Password" className="form-control form-control-lg" />
              </div>



              <button type="button" onClick={attemptSignIn} className="btn btn-primary">Sign in</button>
              <p className="small"><a className="" href="#!">Forgot password</a></p>

              <p className="small">Or log in with</p>
              <div className="d-flex justify-content-center text-center mt-4 pt-1">
                <button onClick={signInWithFacebook} className="text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                </svg></button>
                <button onClick={signInWithGoogle} className="text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                </svg></button>
              </div>

            </div>

            <div>
              <p className="mb-0">Don't have an account? <button onClick={onSignUpClick} className="text-blue">Sign Up</button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export function SignUp({
  onLogInClick,
  router,
}) {

  const roles = {
    'Guest': 'guest',
    'Admin': 'admin',
    'Lab technician': 'lab_tech',
    'Law enforcement': 'law_enforcement',
  }

  const [signUpTab, setSignUpTab] = useState(0);
  const [signUpData, setSignUpData] = useState({});

  function updateSignUpData(signUpData) {
    setSignUpData(signUpData);
  }

  const auth = getAuth();

  function finishYourDetailsTab() {
    console.log('here');
    const firstName = document.getElementById('firstName')!.value;
    const lastName = document.getElementById('lastName')!.value;
    const role = document.getElementById('roleSelect')!.value;
    const lab = document.getElementById('labSelect')!.value;
    if (firstName.length > 0 && lastName.length > 0 && role.length > 0 && lab.length > 0) {
      updateSignUpData({
        firstName: firstName,
        lastName: lastName,
        role: role,
        lab: lab,
      })
      setSignUpTab(1);
    }
  }

  async function handleSignUpButtonClicked() {
    const email = document.getElementById('email')!.value;
    const password = document.getElementById('password')!.value;
    const reEnterPassword = document.getElementById('reEnterPassword')!.value;
    const name = `${signUpData.firstName} ${signUpData.lastName}`;
    if (password !== reEnterPassword) {
      console.log('Passwords dont match');
      return;
    } 
    await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(auth.currentUser, {
      displayName: name,
    });
    const db = getFirestore();
    const docRef = doc(db, "users", auth.currentUser!.uid);
    setDoc(docRef, {
      lab: signUpData.lab,
      name: name,
      role: roles[signUpData.role],
      role_approval_status: "needs_approval",
    });


    router.push('/tasks');
  }


  function yourDetailsTab() {
    return (<div className='your-details-tab'>
      <div className="form-outline mb-4">
        <input type="text" name="name" placeholder='First name'  id="firstName" className="form-control form-control-lg" />
      </div>

      <div className="form-outline mb-4">
        <input type="text" name="name" placeholder='Last name' id="lastName" className="form-control form-control-lg" />
      </div>

      <div className="form-group">
        <label htmlFor="roleSelect">Role</label>
        <select className="form-control" id="roleSelect">
          <option>Guest</option>
          <option>Admin</option>
          <option>Lab technician</option>
          <option>Law enforcement</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="labSelect">Lab</label>
        <select className="form-control" id="labSelect">
          <option>Test lab</option>
        </select>
      </div>
      <button type="button" onClick={finishYourDetailsTab} className="btn btn-primary">Next</button>
    </div>)
  }

  function accountInfo() {
    return (
      <div className='account-info-tab'>
        <div className="form-outline mb-4">
          <input type="email" name="email" placeholder='Email address'  id="email" className="form-control form-control-lg" />
        </div>

        <div className="form-outline mb-4">
          <input type="password" name="password" placeholder='Password' id="password" className="form-control form-control-lg" />
        </div>

        <div className="form-outline mb-4">
          <input type="password" name="passwordConfirmed" placeholder='Re-enter password'  id="reEnterPassword" className="form-control form-control-lg" />
        </div>

        <div className="d-flex justify-content-center">
          <button type="button" onClick={handleSignUpButtonClicked} className="btn btn-primary">Sign up</button>

        </div>
      </div>

    )
  }


  return (
    <section className="vh-100 bg-grey">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
      <div className="container py-5 h-100">

        <div className="card">
          <div className="card-body p-5">
            <h3><span onClick={onLogInClick} className="material-symbols-outlined back-arrow">
              arrow_back
            </span>Sign up</h3>

            <div className='sign-up-progress-wrapper'>
              <span><span className='sign-up-progress'><span>1</span></span>Your details</span>
              <span><span className='sign-up-progress'>2</span>Account info</span>
            </div>

            {/* <form> */}
            {signUpTab === 0 ? yourDetailsTab() : accountInfo()}
          </div>
        </div>
      </div>
    </section>
  )

}
