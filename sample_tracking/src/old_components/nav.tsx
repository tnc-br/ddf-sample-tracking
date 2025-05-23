'use client'

import 'bootstrap/dist/css/bootstrap.css'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '../i18n/config'
import { auth, db } from '@services/firebase/config'
import { MdAdd, MdMenu } from 'react-icons/md'
import { FaUserPlus, FaUsers } from 'react-icons/fa'
import Dropdown from '@components/Dropdown'
import { useGlobal } from '@hooks/useGlobal'
import { useAuthState } from 'react-firebase-hooks/auth'

/**
 * Component for rendering the nav bar on the left of the screen. Depending on what
 * role a user has (member, admin, site_admin) they are shown slightly different options.
 *
 * Routing is done using next.js navigation.
 */
export default function Nav() {
  const [role, setRole] = useState('')

  const { showNavBar } = useGlobal()
  const router = useRouter()
  const { t } = useTranslation()
  const [user] = useAuthState(auth)

  if (!showNavBar) {
    return null
  }

  if (user) {
    const userDocRef = doc(db, 'users', user.uid)
    getDoc(userDocRef).then((docRef) => {
      if (docRef.exists()) {
        setRole(docRef.data().role)
      }
    })
  }

  function canAddSample() {
    return role === 'admin' || role === 'member' || role === 'site_admin'
  }

  function isAdmin() {
    return role === 'admin' || role === 'site_admin'
  }

  return (
    <div id="nav-wrapper" className="nav-wrapper">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
      />
      <ul className="nav flex-column">
        {canAddSample() && (
          <Dropdown.Root>
            <Dropdown.Trigger className="nav-item">
              <div
                id="add-sample-button"
                className="rounded-2xl border border-gray-300 w-fit flex items-center p-2 gap-2"
              >
                <MdAdd />
                <span>{t('addSample')}</span>
              </div>
            </Dropdown.Trigger>
            <Dropdown.Content
              collisionPadding={8}
              sideOffset={5}
              className="flex flex-col bg-white shadow-xl rounded-lg border border-neutral-100"
            >
              <Dropdown.Item>
                <Link
                  className="nav-link add-sample-option"
                  href="./add-sample?status=originVerification"
                >
                  {t('originVerification')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link
                  className="nav-link add-sample-option"
                  href="./add-sample?status=singleReference"
                >
                  {t('singleReferenceSample')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link
                  className="nav-link add-sample-option"
                  href="./AddCSVSample"
                >
                  {t('importSamples')}
                </Link>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        )}
        <li className="nav-item mt-4">
          <Link
            className="flex gap-2 items-center text-decoration-none text-sm mb-2 text-gray-600 hover:text-blue-400 transition-all"
            href="./samples"
          >
            {' '}
            <MdMenu /> {t('allSamples')}
          </Link>
        </li>
        {isAdmin() && (
          <div className="admin-options flex flex-col gap-2 pt-3">
            <li className="nav-item">
              <Link
                className="flex gap-2 items-center text-decoration-none text-sm text-gray-600 hover:text-blue-400 transition-all"
                href="./sign-up-requests"
              >
                <FaUserPlus /> {t('signUpRequests')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="flex gap-2 items-center text-decoration-none text-sm text-gray-600 hover:text-blue-400 transition-all"
                href="./all-users"
              >
                <FaUsers />{' '}
                {role === 'site_admin' ? t('allUsers') : t('myOrganization')}
              </Link>
            </li>
          </div>
        )}
      </ul>
      <div>
        <a href="https://docs.google.com/forms/d/1Wu9vsMlMMnCc-fCGEW5_lwKSr8y7hDPhaZonC1AoP6Q/">
          <span className="material-symbols-outlined feedback-icon">help</span>
        </a>
      </div>
    </div>
  )
}
