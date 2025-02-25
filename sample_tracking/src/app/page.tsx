'use client'

import 'bootstrap/dist/css/bootstrap.css'
import { useEffect } from 'react'

import { getAuth, onAuthStateChanged } from 'firebase/auth'

import { useRouter } from 'next/navigation'
import { initializeAppIfNecessary } from '../old_components/utils'

import '../i18n/config'

export default function Home() {
  return <div className="initalLoadBackground"></div>
}
