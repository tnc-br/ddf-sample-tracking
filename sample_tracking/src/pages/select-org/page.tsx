'use client'

import { useRouter } from 'next/navigation'
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { auth, db } from '@services/firebase/config'
import { useGlobal } from '@hooks/useGlobal'

interface OrgsSchemas {
  [key: string]: string
}

/**
 * Form to let users who signed up through google to select the organization they are associated with. They must fill out this form to set the
 * 'org' and 'org_name' fields in the user's document in the 'new_users' collection. They can't be approved as TimberId members before this happens.
 */
export default function SelectOrg() {
  const [availableOrgs, setAvailableOrgs] = useState({} as OrgsSchemas)
  const [userDocId, setNewUserDocId] = useState('')

  const router = useRouter()

  const { setShowNavBar, setShowTopBar } = useGlobal()

  useEffect(() => {
    setShowNavBar(false)
    setShowTopBar(false)

    if (userDocId.length < 1) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log(user)
          const userDocRef = doc(db, 'users', user.uid)
          getDoc(userDocRef).then((docRef) => {
            if (docRef.exists() && docRef.data().org.length > 0) {
              // User exists in users collection already, they should not be here to select a new organization.
              console.log(
                'Error: user already exists. Forwarding to samples page',
              )
              router.push('/samples')
            }
          })
          getDoc(doc(db, 'new_users', user.uid)).then((docRef) => {
            if (docRef.exists()) {
              const data = docRef.data()
              if (data.org) {
                console.log(
                  'Error: this new user already has a pending org request. Forwarding to samples.',
                )
                router.push('/samples')
              }
              setNewUserDocId(docRef.id)
            }
          })
        }
      })
    }
  })

  if (Object.keys(availableOrgs).length < 1) {
    const orgs: OrgsSchemas = {}
    getDocs(collection(db, 'organizations')).then((querySnapshot) => {
      console.log('made request to organizations')
      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        orgs[docData['org_name']] = doc.id
      })
      setAvailableOrgs(orgs as OrgsSchemas)
    })
  }

  async function handleOrgSelectButtonClick(evt: any) {
    console.log(evt)
    const orgName = (document.getElementById('orgSelect') as HTMLInputElement)
      .value
    const orgId = availableOrgs[orgName]
    const newUserDocRef = doc(db, 'new_users', userDocId)
    updateDoc(newUserDocRef, {
      org: orgId,
      org_name: orgName,
    }).catch((error) => {
      console.log(error)
    })

    router.push('/samples')
  }

  return (
    <div>
      {' '}
      <div className="space-y-4">
        <p className="title">Which organization are you a part of?</p>
        <label htmlFor="orgSelect">Organization</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          id="orgSelect"
        >
          <option key="newOrgOption" id="newOrgOption">
            Create new organization
          </option>
          {Object.keys(availableOrgs).map((key, i) => {
            return (
              <option key={key} className={availableOrgs[key]} id={key}>
                {key}
              </option>
            )
          })}
        </select>
        <button
          onClick={handleOrgSelectButtonClick}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Request to join organization
        </button>
      </div>
    </div>
  )
}
