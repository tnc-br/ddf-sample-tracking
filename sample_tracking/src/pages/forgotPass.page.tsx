import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import { DefaultButton } from 'beyond-system'
import Cookie from 'js-cookie'
import { useRouter } from 'next/router'

import useApi from '@mentor/hooks/useApi'

import clsx from 'clsx'
import { notification } from 'common/components/organisms/notification'

const ForgotPassPage = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const router = useRouter()
  const api = useApi()

  useEffect(() => {
    if (!router.isReady) return
    const token = Cookie.get('token')

    if (token) router.replace('/growthway/chat')
  }, [router.isReady])

  const recoveryPassword = async () => {
    try {
      setLoading(true)

      const { data } = await api.forgotPass({ email })

      notification.display(data.message || '', 'success')
      setEmail('')
      setLoading(false)
    } catch (err) {
      notification.display(err?.response?.data?.message || '', 'error')
    }
  }

  // falta spinner
  return (
    <>
      <Head>
        <title>Recuperação de senha - Growth Station</title>
        <meta
          property="og:title"
          content="Recuperação de senha - Growth Station"
          key="title"
        />
      </Head>
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
                    { 'border-neutral-600': email.length > 0 }
                  )}
                  placeholder="Digite o seu e-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && recoveryPassword()}
                />
              </div>
              <div className="flex items-center justify-center">
                <DefaultButton
                  className="min-w-[314px] lg:w-[362px]"
                  onClick={recoveryPassword}
                  disabled={loading}
                  loading={loading}
                >
                  Enviar E-mail
                </DefaultButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassPage
