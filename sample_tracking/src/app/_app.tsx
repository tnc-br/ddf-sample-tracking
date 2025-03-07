import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";

import "./globals.css";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div className="flex h-screen">
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Component {...pageProps} />
    </div>
  );
};
export default MyApp;
