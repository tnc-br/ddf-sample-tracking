import React, { useState } from 'react'
import { useRouter } from 'next/router'

import clsx from 'clsx'

const ForgotPassPage = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const router = useRouter()

  const recoveryPassword = async () => {}

  // falta spinner
  return (
    <>
      <div className="h-screen w-full px-20 py-24 z-30 relative">
        <div className="g-6 flex h-full items-center justify-center">
          <div className="sm:w-8/12 md:w-8/12 lg:w-6/12 justify-center items-center text-center content-center">
            <img className="mb-4 mx-auto" src="/assets/gm-logo-new.svg" />
            <h1 className="mb-4">Recuperar Senha</h1>
            <form onSubmit={(e) => e.preventDefault()}>
              <div
                className="flex mb-6 items-center justify-center"
                data-te-input-wrapper-init
              >
                <input
                  className={clsx(
                    'flex items-center w-96 gap-2 h-8 py-4 px-3 border-[0.5px] focus: outline-none focus-within:ring-[3px] ring-growth-lighter rounded-sm',
                    { 'border-neutral-400': email.length == 0 },
                    { 'border-neutral-600': email.length > 0 },
                  )}
                  placeholder="Digite o seu e-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && recoveryPassword()}
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="min-w-[314px] lg:w-[362px]"
                  onClick={recoveryPassword}
                  disabled={loading}
                >
                  Enviar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassPage
