"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';

import { getAuth, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { firebaseConfig } from '../firebase_config';
import { doc, setDoc, getDocs, collection, getFirestore, updateDoc, arrayUnion, addDoc, getDoc } from "firebase/firestore";
import './styles.css';
import {initializeAppIfNecessary} from '../utils';

type SignUpData = {
  firstName: string,
  lastName: string,
  lab: string,
  labName: string,
}

interface LogInProps {
  onSignUpClick: any,
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
      {canSignIn ? <Login onSignUpClick={() => handleSignUpClick()} /> : <SignUp onLogInClick={() => handleSignInClick()} />}
    </div>

  )
}


function Login(props: LogInProps) {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const auth = getAuth();
  const router = useRouter()

  function attemptSignIn() {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    console.log('username: ' + loginInfo.email + ' password: ' + loginInfo.password);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log('signed in');
        router.push('/samples');
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
    const db = getFirestore();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      'display': 'popup',
      'prompt': "select_account"
    });
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) return;
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((docRef) => {
          if (docRef.exists()) {
            const docData = docRef.data();
            if (docData.role && docData.org) {
              router.push('/samples');
            } else {
              router.push('/select-org');
            }
          } else {
            const date = new Date();
            const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`;
            // This is a new user. 
            addDoc(collection(db, "new_users"), {
              name: user.displayName,
              email: user.email,
              date_requested: dateString,
              uid: user.uid,
            })
            router.push('/select-org');
          }
        });
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

              <p className="small">Or log in with <button onClick={signInWithGoogle}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
              </svg></button></p>

            </div>

            <div>
              <p className="mb-0">Dont have an account? <button onClick={props.onSignUpClick} className="text-blue">Sign Up</button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

function SignUp(props: SignUpProps) {

  const router = useRouter()

  const [signUpTab, setSignUpTab] = useState(0);
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    lab: '',
    labName: ''
  });
  const [availableOrgs, setAvailableOrgs] = useState({} as OrgsSchemas);

  function updateSignUpData(signUpData: SignUpData) {
    setSignUpData(signUpData);
  }

  const auth = getAuth();
  const db = getFirestore();

  if (Object.keys(availableOrgs).length < 1) {
    const orgs: OrgsSchemas = {};
    getDocs(collection(db, "organizations")).then((querySnapshot) => {
      console.log('made request to organizations');
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        orgs[docData['org_name']] = doc.id;
      });
      setAvailableOrgs(orgs as OrgsSchemas);
    });
  }

  function finishYourDetailsTab() {
    console.log('here');
    const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
    const labName = (document.getElementById('labSelect') as HTMLInputElement).value;
    const labValue = labName === 'Create new organization' ? "NEW" : availableOrgs[labName];
    if (firstName.length > 0 && lastName.length > 0 && labName.length > 0) {
      updateSignUpData({
        firstName: firstName,
        lastName: lastName,
        lab: labValue,
        labName: labName,
      })
      setSignUpTab(1);
    }
  }

  async function handleSignUpButtonClicked() {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const reEnterPassword = (document.getElementById('reEnterPassword') as HTMLInputElement).value;
    const name = `${signUpData.firstName} ${signUpData.lastName}`;
    const newOrgName = (document.getElementById('newOrgName') ? (document.getElementById('newOrgName') as HTMLInputElement).value : '');
    if (password !== reEnterPassword) {
      console.log('Passwords dont match');
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    if (!user) return;
    await updateProfile(auth.currentUser, {
      displayName: name,
    });

    // const docRef = doc(db, "users", auth.currentUser!.uid);
    // setDoc(docRef, {
    //   lab: signUpData.lab,
    //   name: name,
    //   role_approval_status: "needs_approval",
    // });

    const date = new Date();
    const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`;
    if (signUpData.lab === 'NEW') {
      const newOrgDoc = doc(db, "new_users", "new_orgs");
      let newObj: NestedSchemas = {};
      newObj[newOrgName] = {
        admin_id: auth.currentUser!.uid,
        admin_name: name,
        email: email,
        date_requested: dateString,
      }
      updateDoc(newOrgDoc, newObj);
    } else {

      addDoc(collection(db, "new_users"), {
        name: name,
        email: email,
        date_requested: dateString,
        org: signUpData.lab,
        uid: auth.currentUser!.uid,
        org_name: signUpData.labName,
      });

      const newUser = {
        name: name,
        email: email,
        date_requested: dateString,
        org: signUpData.lab,
        uid: auth.currentUser!.uid,
        org_name: signUpData.labName,
      }

      // addUserToNewUsersCollection(newUser)
      // updateDoc(newUserDocRef, {
      //   prospective_members: arrayUnion(auth.currentUser!.uid),

      // });
    }
    router.push('/samples');
  }



  function addUserToNewUsersCollection(newUserData: NewUser) {
    addDoc(collection(db, "new_users"), {
      name: newUserData.name,
      email: newUserData.email,
      date_requested: newUserData.date_requested,
      org: newUserData.org ? newUserData.org : "",
      uid: newUserData.uid,
      org_name: newUserData.org_name ? newUserData.org_name : "",
    });

  }


  function yourDetailsTab() {
    return (<div className='your-details-tab'>
      <div className="form-outline mb-4">
        <input type="text" name="name" placeholder='First name' id="firstName" className="form-control form-control-lg" />
      </div>

      <div className="form-outline mb-4">
        <input type="text" name="name" placeholder='Last name' id="lastName" className="form-control form-control-lg" />
      </div>

      <div className="form-group">
        <label htmlFor="labSelect">Organization</label>
        <select className="form-control" id="labSelect">
          <option key="newOrgOption" id="newOrgOption">Create new organization</option>
          {
            Object.keys(availableOrgs).map((key, i) => {
              return (
                <option key={key} id={key}>{key}</option>
              )
            })
          }
        </select>
      </div>
      <button type="button" onClick={finishYourDetailsTab} className="btn btn-primary">Next</button>
    </div>)
  }

  function accountInfo() {
    return (
      <div className='account-info-tab'>
        {signUpData['lab'] === "NEW" && <div className="form-outline mb-4">
          <input type="text" name="newOrgName" autoComplete="off" placeholder='New organization name' id="newOrgName" className="form-control form-control-lg" />
        </div>}

        <div className="form-outline mb-4">
          <input type="email" name="email" autoComplete="off" placeholder='Email address' id="email" className="form-control form-control-lg" />
        </div>

        <div className="form-outline mb-4">
          <input type="password" name="password" placeholder='Password' id="password" className="form-control form-control-lg" />
        </div>

        <div className="form-outline mb-4">
          <input type="password" name="passwordConfirmed" placeholder='Re-enter password' id="reEnterPassword" className="form-control form-control-lg" />
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
            <h3><span onClick={props.onLogInClick} className="material-symbols-outlined back-arrow">
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
