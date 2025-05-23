import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import moment from 'moment'
import 'moment/locale/pt-br'

import '../globals.css'
import queryClient from '@services/query-client'

import Nav from '../old_components/nav'
import TopBar from '../old_components/top_bar'
import { GlobalProvider } from '@hooks/useGlobal'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  moment.locale('pt-br')
  // moment.tz.setDefault('America/Sao_Paulo')

  return (
    <div className="flex h-screen">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <GlobalProvider>
          <TopBar />
          <Nav />
          <Component {...pageProps} />
        </GlobalProvider>
      </QueryClientProvider>
    </div>
  )
}
export default MyApp
