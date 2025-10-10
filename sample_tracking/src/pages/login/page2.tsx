import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import TextInput from '@components/ui/TextInput'
import { auth, db } from '@services/firebase/config'

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>
interface LogInProps {
  onSignUpClick: any
  onForgotPasswordClick: any
}

export default function Login(props: LogInProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const [submitIsLoading, setSubmitIsLoading] = useState(false)

  // Configuração do React Hook Form com Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setSubmitIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      )

      // Signed in
      const user = userCredential.user
      console.log('signed in')
      router.push('/samples')
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setError('email', {
          type: 'manual',
          message: t('invalidEmail'),
        })
      } else if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        setError('password', {
          type: 'manual',
          message: t('incorrectLogin'),
        })
      } else {
        setError('password', {
          type: 'manual',
          message: 'Erro ao fazer login. Tente novamente.',
        })
      }
      console.log(error.message)
    } finally {
      setSubmitIsLoading(false)
    }
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      display: 'popup',
      prompt: 'select_account',
    })
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (!credential) return
        const token = credential.accessToken
        // The signed-in user info.
        const user = result.user
        const userDocRef = doc(db, 'users', user.uid)
        getDoc(userDocRef).then((docRef) => {
          if (docRef.exists()) {
            const docData = docRef.data()
            if (docData.role && docData.org) {
              router.push('/samples')
            } else {
              router.push('/select-org')
            }
          } else {
            const date = new Date()
            const dateString = `${
              date.getMonth() + 1
            } ${date.getDate()} ${date.getFullYear()}`
            // This is a new user.
            const newUserDocRef = doc(db, 'new_users', user.uid)
            setDoc(newUserDocRef, {
              name: user.displayName,
              email: user.email,
              date_requested: dateString,
              uid: user.uid,
            })
            router.push('/select-org')
          }
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div className="rounded-3xl border border-neutral-600 px-4 py-5 w-full max-w-xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <span className="text-lg">Login</span>

        <div className="login-input-wrapper">
          <TextInput
            className="w-full"
            placeholder="E-mail"
            shape="square"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="login-input-wrapper">
          <TextInput
            className="w-full"
            shape="square"
            placeholder="Senha"
            type="password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            type="submit"
            disabled={isSubmitting || submitIsLoading}
            className="bg-blue-500 text-white rounded-full px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || submitIsLoading ? 'Entrando...' : 'Entrar'}
          </button>
          <div
            className="text-blue-400 hover:text-blue-300 disabled:text-neutral-500 active:text-blue-500 cursor-pointer"
            onClick={
              props.onForgotPasswordClick
                ? props.onForgotPasswordClick
                : () =>
                    console.log(
                      'Could not find method to handle forgot password',
                    )
            }
          >
            <p>Esqueci a senha</p>
          </div>
        </div>
      </form>

      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-400 w-full h-px"></div>
        <p className="text-sm">Ou</p>
        <div
          onClick={signInWithGoogle}
          className="cursor-pointer bg-white rounded-sm border border-[%C5C6D0] flex"
          id="googleSignInButton"
        >
          <div className="login-google-icon-wrapper">
            <img src="/google-icon.svg" alt="google" width="22" height="22" />
          </div>
          <div className="login-google-text-wrapper">
            <div className="login-google-text">Google</div>
          </div>
        </div>
      </div>
    </div>
  )
}
