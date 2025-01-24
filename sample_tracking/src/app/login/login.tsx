import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getFirestore, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import TextInput from "@components/TextInput";

interface LogInProps {
  onSignUpClick: any;
  onForgotPasswordClick: any;
}

export default function Login(props: LogInProps) {
  const auth = getAuth();
  const router = useRouter();

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [errorText, setErrorText] = useState({ email: "", password: "" });

  const { t } = useTranslation();

  function attemptSignIn() {
    setErrorText({ email: "", password: "" });
    setSubmitIsLoading(true);
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;
    console.log("username: " + email + " password: " + password);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("signed in");
        router.push("/samples");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          setErrorText({ email: t("invalidEmail"), password: "" });
        } else {
          setErrorText({ password: t("incorrectLogin"), email: "" });
        }

        setSubmitIsLoading(false);
        const errorCode = error.code;
        const errorMessage = error.message;
        var errorText = document.getElementById("signin-error-message");
        console.log(errorMessage);
      });
    const user = auth.currentUser;
  }

  function signInWithGoogle() {
    const auth = getAuth();
    const db = getFirestore();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      display: "popup",
      prompt: "select_account",
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
              router.push("/samples");
            } else {
              router.push("/select-org");
            }
          } else {
            const date = new Date();
            const dateString = `${
              date.getMonth() + 1
            } ${date.getDate()} ${date.getFullYear()}`;
            // This is a new user.
            const newUserDocRef = doc(db, "new_users", user.uid);
            setDoc(newUserDocRef, {
              name: user.displayName,
              email: user.email,
              date_requested: dateString,
              uid: user.uid,
            });
            router.push("/select-org");
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="rounded-3xl border border-neutral-600 px-4 py-5 w-full max-w-xs">
      <div>
        <span className="text-lg">Login</span>

        <div className="login-input-wrapper">
          <TextInput
            className="w-full"
            placeholder="E-mail"
            shape="square"
            id="email"
            name="email"
          />
        </div>

        <div className="login-input-wrapper">
          <TextInput
            className="w-full"
            shape="square"
            placeholder="Senha"
            type="password"
            id="password"
            name="password"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={attemptSignIn}
            className="bg-blue-500 text-white rounded-full px-4 py-2"
            id="signInButton"
          >
            Entrar
          </button>
          <div
            className="text-blue-400 hover:text-blue-300 disabled:text-neutral-500 active:text-blue-500 cursor-pointer"
            onClick={
              props.onForgotPasswordClick
                ? props.onForgotPasswordClick
                : console.log("Could not find method to handle forgo password")
            }
          >
            <p>Esqueci a senha</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="bg-neutral-400 w-full h-px"></div>
          <p className="text-sm">Ou</p>
          <div
            onClick={signInWithGoogle}
            className="cursor-pointer bg-white rounded-sm border border-[%C5C6D0] flex"
            id="googleSignInButton"
          >
            <div className="login-google-icon-wrapper">
              <Image
                src="/google-icon.svg"
                alt="google"
                width="22"
                height="22"
              />
            </div>
            <div className="login-google-text-wrapper">
              <div className="login-google-text">Google</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
