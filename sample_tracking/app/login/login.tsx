
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { doc, collection, getFirestore, addDoc, getDoc, setDoc } from "firebase/firestore";
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';
import Image from 'next/image'
import { useTranslation } from 'react-i18next';

interface LogInProps {
    onSignUpClick: any,
    onForgotPasswordClick: any,
}

/**
 * Component to handle logging a user in using Firebase auth.
 * 
 * If a user signs in for the first time with google and they are not already a member, they will be forwarded to the SelectOrg component. 
 * They MUST complete that form to be able to be approved by an admin. They will be stuck in limbo until they fill out that form. 
 */
export default function Login(props: LogInProps) {
    const auth = getAuth();
    const router = useRouter()

    const [submitIsLoading, setSubmitIsLoading] = useState(false);
    const [errorText, setErrorText] = useState({email: '', password: ''});

    const { t } = useTranslation();

    function attemptSignIn() {
        setErrorText({email: '', password: ''})
        setSubmitIsLoading(true);
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        console.log('username: ' + email + ' password: ' + password);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log('signed in');
                router.push('/samples');
            })
            .catch((error) => {
                if (error.code === 'auth/invalid-email') {
                    setErrorText({email: t('invalidEmail'), password: ''})
                } else {
                    setErrorText({password: t('incorrectLogin'), email: ''})
                }
                
                setSubmitIsLoading(false);
                const errorCode = error.code;
                const errorMessage = error.message;
                var errorText = document.getElementById('signin-error-message');
                console.log(errorMessage);

            });
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
                        const newUserDocRef = doc(db, "new_users", user.uid);
                        setDoc(newUserDocRef, {
                            name: user.displayName,
                            email: user.email,
                            date_requested: dateString,
                            uid: user.uid,
                        })
                        router.push('/select-org');
                    }
                });
            }).catch((error) => {
                console.log(error);
            });


    }

    return (
        <div className="login-wrapper">
            <div>
                <p className="forgot-password-header">Sign in</p>
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        id="email"
                        name="email"
                        label="Email address"
                        helperText={errorText.email}
                    />
                </div>

                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        type="password"
                        id="password"
                        name="password"
                        label="Password"
                        helperText={errorText.password}
                    />

                </div>

                <div className="login-forgot-password-button" onClick={props.onForgotPasswordClick ? props.onForgotPasswordClick : console.log('Could not find method to handle forgo password')}><p>Forgot password</p></div>
                <div className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div onClick={attemptSignIn} className='forgot-password-button-text' id="signInButton">
                            Submit
                        </div>
                    </div>
                </div>
                <div className="login-divider-line-wrapper">
                    <div className="login-divider">

                    </div>

                </div>
                <p className="login-or-label">Or</p>
                <div onClick={signInWithGoogle} className="login-with-google-wrapper" id="googleSignInButton">
                    <div className="login-google-icon-wrapper">
                        <Image src="/google-icon.svg" alt="google" width="22" height="22" />
                    </div>
                    <div className="login-google-text-wrapper">
                        <div className="login-google-text">
                            Sign in with Google

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}