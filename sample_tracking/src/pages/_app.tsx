import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import moment from 'moment'
import 'moment/locale/pt-br'
// import moment from 'moment-timezone'

import '../globals.css'
import queryClient from '@services/query-client'

import Nav from '../old_components/nav'
import TopBar from '../old_components/top_bar'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  moment.locale('pt-br')
  // moment.tz.setDefault('America/Sao_Paulo')

  console.log('MyApp')

  return (
    <div className="flex h-screen">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {/* <QueryClientProvider client={queryClient}> */}
      <>
        {/* <TopBar />
        <Nav /> */}
        <Component {...pageProps} />
      </>
      {/* </QueryClientProvider> */}
    </div>
  )
}
export default MyApp
