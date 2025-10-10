'use client'

import { useRouter } from 'next/router'
import { doc, updateDoc } from 'firebase/firestore'
import {
  type Sample,
  getPointsArrayFromSampleResults,
} from '../../old_components/utils'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import AddNewSample from '../../old_components/Sample/AddNewSample'
import { auth, db } from '@services/firebase/config'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocument } from 'react-firebase-hooks/firestore'

const SAMPLES_COLLECTION_DICT = {
  trusted: 'trusted_samples',
  untrusted: 'untrusted_samples',
  unknown: 'unknown_samples',
}

/**
 * Component to handle editing a sample. It uses the SampleDataInput subcomponent to handle data input.
 * The sample being edited is passed in using the following search params:
 *  - 'id': the 20 character hex string for a specific sample.
 *  - 'trusted': has a value of either 'trusted', 'untrusted', or 'unknown' to specify the collection to fetch the sample from.
 *
 * Once the sample is fetched from the correct collection, it's data is passed to SampleDataComponent to pre-fill the input fields.
 */
export default function Edit() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, loadingUser, errorUser] = useAuthState(auth)

  const { id = '', trusted = 'trusted' } = router.query as {
    id: string
    trusted: string
  }

  const sampleId = id ?? 'Sem ID'

  const userRef = user ? doc(db, 'users', user?.uid || '') : null
  const [userData, loadingUserData, errorUserData] = useDocument(userRef)

  const collectionName =
    SAMPLES_COLLECTION_DICT[trusted as keyof typeof SAMPLES_COLLECTION_DICT]

  let sampleRef = sampleId ? doc(db, collectionName, sampleId || '') : null

  const [sample, loadingSample, errorSample] = useDocument(sampleRef)

  function onUpdateSampleClick(updatedFormData: Partial<Sample>) {
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

  const isLoading = loadingSample || loadingUserData || loadingUser
  const isError = errorSample || errorUserData || errorUser

  if (isLoading) {
    return <div className="bg-red-500 text-white">{t('loading')}</div>
  }

  if (isError) {
    alert('Error loading data')
  }

  if (!userData?.data() || !sample?.data()) {
    return <div className="bg-red-500 text-white">Sem Sample</div>
  }

  const defaultValue = {
    ...sample.data(),
    visibility: 'public',
    collected_by: 'supplier',
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
          <div id="sample-form">
            <AddNewSample
              defaultValue={defaultValue}
              onActionButtonClick={(
                sampleID: string,
                updatedFormData: Partial<Sample>,
              ) => onUpdateSampleClick(updatedFormData)}
              actionButtonTitle="Update sample"
              sampleId={sampleId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
