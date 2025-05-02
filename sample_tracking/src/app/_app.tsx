import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'

import './globals.css'

import 'moment/locale/pt-br'
import moment from 'moment'
// import moment from 'moment-timezone'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  moment.locale('pt-br')
  // moment.tz.setDefault('America/Sao_Paulo')

  return (
    <div className="flex h-screen">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Component {...pageProps} />
    </div>
  )
}
export default MyApp
