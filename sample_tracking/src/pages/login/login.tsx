import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@services/firebase/config'
import { IoPersonSharp } from 'react-icons/io5'
import { MdEmail, MdOutlineEmail } from 'react-icons/md'

// Schema de validação
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      )

      const user = userCredential.user
      router.push('/samples')
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setError('email', {
          type: 'manual',
          message: 'Email inválido',
        })
      } else if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setError('password', {
          type: 'manual',
          message: 'Email ou senha incorretos',
        })
      } else {
        setError('password', {
          type: 'manual',
          message: 'Erro ao fazer login. Tente novamente.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account',
    })

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const userDocRef = doc(db, 'users', user.uid)
      const docSnapshot = await getDoc(userDocRef)

      if (docSnapshot.exists()) {
        const docData = docSnapshot.data()
        if (docData.role && docData.org) {
          router.push('/samples')
        } else {
          router.push('/select-org')
        }
      } else {
        // Novo usuário
        const date = new Date()
        const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`
        const newUserDocRef = doc(db, 'new_users', user.uid)

        await setDoc(newUserDocRef, {
          name: user.displayName,
          email: user.email,
          date_requested: dateString,
          uid: user.uid,
        })

        router.push('/select-org')
      }
    } catch (error) {
      console.error('Erro no login com Google:', error)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Imagem de fundo */}
      <div
        className="w-1/2 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bg_login.png')`,
        }}
      >
        {/* Overlay com a imagem frontal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <img
              src="/bg2_login.png"
              alt="Tree identification"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header com logo */}
          <div className="text-center mb-8">
            <div className="bg-[#006E2C] w-fit py-1 size-8 rounded-md mx-auto">
              <IoPersonSharp className="size-7 text-white" />
            </div>

            <hr className="h-[2px] color-[#006E2C] w-14 my-4 mx-auto" />

            <p className="text-[#1E1E1E] text-sm mb-2">
              BEM-VINDO DE VOLTA À{' '}
              <span className="font-semibold">TIMBER ID</span> 👋
            </p>
            <h1 className="text-3xl font-bold text-[#006E2C] mb-4">Login</h1>
            <p className="text-[#1E1E1E] text-xl font-semibold">
              Preencha os campos abaixo corretamente para acessar sua conta:
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-lg mx-auto"
          >
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Seu usuário:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdOutlineEmail className="text-[#9496A1]" />
                </div>
                <input
                  type="email"
                  placeholder="Digite aqui..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo de senha */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Sua senha:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite aqui..."
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Link esqueceu senha */}
            <div className="text-right">
              <Link
                href="/forgotPass"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 text-xs hover:bg-green-700 h-fit py-4 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Entrando...' : 'Entrar na minha conta'}
              </button>

              <div className="flex items-center justify-center text-gray-500 text-sm">
                Ou
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex-1 bg-white hover:bg-gray-50 border text-xs border-gray-300 text-gray-700 font-bold h-fit py-4 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Logar pela conta Google
              </button>
            </div>
          </form>

          <hr className="h-px color-[#F1F1F1] w-full max-w-lg mx-auto my-16" />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[#1E1E1E] text-xl">
              Não tem uma conta na TimberID?{' '}
              <Link
                href="/login/signup"
                className="text-green-600 hover:text-green-700 font-medium underline"
              >
                Registre-se agora
              </Link>
            </p>
            <p className="text-[#1E1E1E] text-xs mt-2">
              Powered by Digitais da Floresta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
