import React from 'react'
import Head from 'next/head'
import moment from 'moment'
import { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'

import 'moment/locale/pt-br'
import '../globals.css'

import queryClient from '@services/query-client'

import { GlobalProvider } from '@hooks/useGlobal'

import Navbar from '@components/layout/shared/navbar'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  moment.locale('pt-br')

  return (
    <div className="flex h-screen bg-[#f8fafa]">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <GlobalProvider>
          <div className="flex flex-1 w-full">
            <Navbar />
            <main className="flex-1 p-4 overflow-auto">
              <Component {...pageProps} />
            </main>
          </div>
        </GlobalProvider>
      </QueryClientProvider>
    </div>
  )
}
export default MyApp
