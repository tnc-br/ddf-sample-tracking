'use client'

import 'bootstrap/dist/css/bootstrap.css'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import './styles.css'
import { useState, useEffect } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '../i18n/config'
import ImportSamples from './import-samples'
import { auth, firestore } from '@services/firebase/config'

/**
 * Component for rendering the nav bar on the left of the screen. Depending on what
 * role a user has (member, admin, site_admin) they are shown slightly different options.
 *
 * Routing is done using next.js navigation.
 */
export default function Nav() {
  const [role, setRole] = useState('')
  const [showAddSampleMenu, setShowAddSampleMenu] = useState(false)

  const router = useRouter()
  const db = firestore
  const { t } = useTranslation()

  useEffect(() => {
    if (role.length < 1) {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/login')
        } else {
          const userDocRef = doc(db, 'users', user.uid)
          getDoc(userDocRef).then((docRef) => {
            if (docRef.exists()) {
              setRole(docRef.data().role)
            }
          })
        }
      })
    }

    document.addEventListener('mousedown', (event) => {
      const popupContainer = document.getElementById('add-sample-popup')
      const addSampleButton = document.getElementById('add-sample-button')
      if (addSampleButton?.contains(event.target as any)) {
        setShowAddSampleMenu(!showAddSampleMenu)
        return
      }
      if (!popupContainer?.contains(event.target as any)) {
        setShowAddSampleMenu(false)
      }
    })
  })

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
          <li className="nav-item">
            <div id="add-sample-button" className="nav-link add-sample-button">
              <span className="material-symbols-outlined">add</span>{' '}
              {t('addSample')}
            </div>
          </li>
        )}
        <li className="nav-item">
          <Link className="nav-link" href="./samples">
            {' '}
            <span className="material-symbols-outlined">lab_panel</span>{' '}
            {t('allSamples')}
          </Link>
        </li>
        <div className="admin-options">
          {isAdmin() && (
            <li className="nav-item">
              <Link className="nav-link" href="./sign-up-requests">
                <span className="material-symbols-outlined">person_add</span>{' '}
                {t('signUpRequests')}
              </Link>
            </li>
          )}
          {isAdmin() && (
            <li className="nav-item">
              <Link className="nav-link" href="./all-users">
                <span className="material-symbols-outlined">groups</span>{' '}
                {role === 'site_admin' ? t('allUsers') : t('myOrganization')}
              </Link>
            </li>
          )}
        </div>
        {showAddSampleMenu && (
          <div id="add-sample-popup" className="add-sample-options-wrapper">
            <Link
              className="nav-link add-sample-option"
              href="./add-sample?status=originVerification"
            >
              {t('originVerification')}
            </Link>
            <Link
              className="nav-link add-sample-option"
              href="./add-sample?status=singleReference"
            >
              {t('singleReferenceSample')}
            </Link>
            <div className="nav-link add-sample-option import-option">
              <ImportSamples />
            </div>
            {/* <Link className="nav-link" href="./add-sample?status=incomplete">{t('uploadMultipleSamples')}</Link> */}
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
