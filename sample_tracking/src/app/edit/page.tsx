'use client'

// import './styles.css';
import '../add-sample/styles.css'
import 'bootstrap/dist/css/bootstrap.css'
import { useRouter } from 'next/navigation'
import { doc, updateDoc, getFirestore, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  type Sample,
  type UserData,
  confirmUserLoggedIn,
  initializeAppIfNecessary,
  getDocRefForTrustedValue,
  getPointsArrayFromSampleResults,
} from '../../old_components/utils'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import AddNewSample from '../../old_components/Sample/AddNewSample'

/**
 * Component to handle editing a sample. It uses the SampleDataInput subcomponent to handle data input.
 * The sample being edited is passed in using the following search params:
 *  - 'id': the 20 character hex string for a specific sample.
 *  - 'trusted': has a value of either 'trusted', 'untrusted', or 'unknown' to specify the collection to fetch the sample from.
 *
 * Once the sample is fetched from the correct collection, it's data is passed to SampleDataComponent to pre-fill the input fields.
 */
export default function Edit() {
  const [userData, setUserdata] = useState({} as UserData)
  const [currentTab, setCurrentTab] = useState(1)
  const [selectedDoc, setDoc] = useState({} as Sample)

  const [formData, setFormData] = useState({
    visibility: 'public',
    collected_by: 'supplier',
  })

  const router = useRouter()
  initializeAppIfNecessary()
  const auth = getAuth()
  const db = getFirestore()
  const { t } = useTranslation()

  let sampleId = '12345'
  let trusted = 'trusted'

  const searchParams = useSearchParams()
  if (typeof window !== 'undefined') {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    sampleId = urlParams.get('id')
      ? urlParams.get('id')
      : searchParams.get('id')
    trusted = urlParams.get('trusted')
      ? urlParams.get('trusted')
      : searchParams.get('trusted')
  }

  useEffect(() => {
    if (!userData.role) {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/login')
        } else {
          const userDocRef = doc(db, 'users', user.uid)
          getDoc(userDocRef).then((docRef) => {
            if (docRef.exists()) {
              const docData = docRef.data()
              if (!docData.org) {
                router.push('/samples')
              } else {
                setUserdata(docData as UserData)
              }
            }
          })
        }
        if (!user) {
          router.push('/login')
        }
      })
    }
  }, [])

  let docRef = doc(db, 'trusted_samples', sampleId!)
  if (trusted === 'untrusted') {
    docRef = doc(db, 'untrusted_samples', sampleId!)
  } else if (trusted === 'unknown') {
    docRef = doc(db, 'unknown_samples', sampleId!)
  }
  if (Object.keys(selectedDoc).length < 1 && !userData.role && docRef) {
    getDoc(docRef)
      .then((docRef) => {
        if (docRef.exists()) {
          setFormData({
            ...docRef.data(),
            trusted: trusted,
          } as Sample)
        } else {
          console.log('Error: Unable to find data for specified sample')
          alert(
            'There was an internal error and the requested sample could not be found.',
          )
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function onUpdateSampleClick(updatedFormData: Sample) {
    if (!updatedFormData) return
    let docRef = doc(db, 'trusted_samples', sampleId!)
    if (trusted === 'untrusted') {
      docRef = doc(db, 'untrusted_samples', sampleId!)
    } else if (trusted === 'unknown') {
      docRef = doc(db, 'unknown_samples', sampleId!)
    }
    const date = new Date()
    const currentDateString = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`
    const user = auth.currentUser
    if (!user) return
    const sampleData = {
      ...updatedFormData,
      visibility: 'private',
      d18O_cel: updatedFormData.d18O_cel
        ? updatedFormData.d18O_cel.map((value: string) => parseFloat(value))
        : [],
      d18O_wood: updatedFormData.d18O_wood
        ? updatedFormData.d18O_wood.map((value: string) => parseFloat(value))
        : [],
      d15N_wood: updatedFormData.d15N_wood
        ? updatedFormData.d15N_wood.map((value: string) => parseFloat(value))
        : [],
      n_wood: updatedFormData.n_wood
        ? updatedFormData.n_wood.map((value: string) => parseFloat(value))
        : [],
      d13C_wood: updatedFormData.d13C_wood
        ? updatedFormData.d13C_wood.map((value: string) => parseFloat(value))
        : [],
      c_wood: updatedFormData.c_wood
        ? updatedFormData.c_wood.map((value: string) => parseFloat(value))
        : [],
      c_cel: updatedFormData.c_cel
        ? updatedFormData.c_cel.map((value: string) => parseFloat(value))
        : [],
      d13C_cel: updatedFormData.d13C_cel
        ? updatedFormData.d13C_cel.map((value: string) => parseFloat(value))
        : [],
      lat: updatedFormData.lat ? parseFloat(updatedFormData.lat) : '',
      lon: updatedFormData.lon ? parseFloat(updatedFormData.lon) : '',
      points: getPointsArrayFromSampleResults(updatedFormData),
    }
    const docData = {
      ...sampleData,
      last_updated_by: user.displayName,
      last_updated_by_photo: user.photoURL,
      last_updated_on: currentDateString,
    }
    updateDoc(docRef, docData).then(() => {
      const url = `./sample-details?trusted=${trusted}&id=${sampleId}`
      router.push(url)
    })
  }

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional"
      />
      <div className="page-title-wrapper">
        <Link href="./samples" className="close-icon">
          <span className="material-symbols-outlined add-sample-close-icon">
            close
          </span>
        </Link>
        <div className="page-title-text">{t('editSample')}</div>
      </div>
      <div>
        <div className="sample-details-form-wrapper">
          {userData && (
            <div id="sample-form">
              <AddNewSample
                baseState={formData}
                onActionButtonClick={(
                  sampleID: string,
                  updatedFormData: Sample,
                ) => onUpdateSampleClick(updatedFormData)}
                actionButtonTitle="Update sample"
                sampleId={sampleId}
                tab={currentTab}
                onTabChange={(tab) => setCurrentTab(tab)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
