
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { doc, collection, getFirestore, addDoc, getDoc } from "firebase/firestore";
import Image from 'next/image'

interface LogInProps {
    onSignUpClick: any,
    onForgotPasswordClick: any,
}

export default function Login(props: LogInProps) {
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
        <div className="login-wrapper">
            <div>
                <p className="forgot-password-header">Sign in</p>
                <div className="forgot-password-entry-wrapper">
                    <div className="forgot-password-entry">
                        <div className="forgot-password-slate-entry">
                            <div className="forgot-password-content-wrapper">
                                <div className="forgot-password-input-text">
                                    <form id="email-form">
                                        <input required className="forgot-password-text form-control" name='email' type="text" id="email" />
                                    </form>
                                </div>
                                <div className="forgot-passowrd-label-text-wrapper">
                                    <div className="forgot-password-label-text">
                                        Email address
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div className="forgot-password-entry-wrapper">
                    <div className="forgot-password-entry">
                        <div className="forgot-password-slate-entry">
                            <div className="forgot-password-content-wrapper">
                                <div className="forgot-password-input-text">
                                    <form id="email-form">
                                        <input required className="forgot-password-text form-control" name='email' type="text" id="email" />
                                    </form>
                                </div>
                                <div className="forgot-passowrd-label-text-wrapper">
                                    <div className="forgot-password-label-text">
                                        Password
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <p className="small"><div className="login-forgot-password-button" onClick={props.onForgotPasswordClick ? props.onForgotPasswordClick : console.log('Could not find method to handle forgo password')}>Forgot password</div></p>
                <div className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div onClick={attemptSignIn} className='forgot-password-button-text'>
                            Submit
                        </div>
                    </div>
                </div>
                <div className="login-divider-line-wrapper">
                    <div className="login-divider">

                    </div>

                </div>
                <p className="login-or-label">Or</p>
                <div onClick={signInWithGoogle} className="login-with-google-wrapper">
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

        //   <section className="vh-100 bg-grey">
        //     <div className="container py-5 h-100">
        //       <div className="card">
        //         <div className="card-body p-5 text-center">

        //           <div className="mb-md-5 mt-md-4 pb-5">

        //             <h2 className="sign-in-title">Sign in</h2>

        //             <div className="form-outline form-white mb-4">
        //               <input type="email" name="email" id="email" placeholder="Email address" className="form-control form-control-lg" />
        //             </div>

        //             <div className="form-outline form-white mb-4">
        //               <input type="password" name="password" id="password" placeholder="Password" className="form-control form-control-lg" />
        //             </div>



        //             <button type="button" onClick={attemptSignIn} className="btn btn-primary">Sign in</button>
        //             <p className="small"><div className="" onClick={props.onForgotPasswordClick ? props.onForgotPasswordClick : console.log('Could not find method to handle forgo password')}>Forgot password</div></p>

        //             <p className="small">Or log in with <button className="btn btn-primary" onClick={signInWithGoogle}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
        //               <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
        //             </svg></button></p>

        //           </div>

        //           <div>
        //             <p className="mb-0">Dont have an account? 
        //             <button onClick={props.onSignUpClick} type="button" className="btn btn-info">Sign up</button>
        //             </p>
        //           </div>

        //         </div>
        //       </div>
        //     </div>
        //   </section>
    )
}