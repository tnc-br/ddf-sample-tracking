'use client'

import { useRouter } from 'next/router'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import AddNewSample from '../../old_components/Sample/AddNewSample'
import {
  getRanHex,
  getPointsArrayFromSampleResults,
  type UserData,
  Sample,
} from '../../old_components/utils'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { auth, db } from '@services/firebase/config'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useUserData } from '../../hooks/useFirebaseSamples'

/**
 * Component to handle adding a complete or incomplet sample. It uses the SampleDataInput
 * subcomponent to handle the data input.
 * The type of sample being added (complete vs incomplete is passed via the search param
 * 'status' which is either 'completed' or 'in_progress').
 *
 * The user's data is fetched when rendering the component. If the user is not logged in
 * they are forwarded to the main page, if they are logged in, their data is stored in State
 * to use when adding the new sample to the Samples collection.
 *
 * Once the sample data is correctly entered, a new sample is added to the 'Samples' collection.
 *
 */
export default function AddSample() {
  const [sampleId, setSampleID] = useState('')
  const [sampleCreationFinished, setSampleCreationFinished] = useState(false)
  const [formData, setFormData] = useState<Partial<Sample>>({} as Sample)

  const router = useRouter()
  const { t } = useTranslation()

  if (sampleId.length < 1) {
    setSampleID(getRanHex(20))
  }

  const { status = '' } = router.query as {
    status: string
  }
  const [user, loadingUser, errorUser] = useAuthState(auth)

  // Usar o hook personalizado para dados do usuário
  const {
    data: userData,
    loading: loadingUserData,
    error: errorUserData,
  } = useUserData(user?.uid || null)
  /**
   * Adds a new sample to the correct collection depending on if the sample is trusted, untrusted or unknown.
   * All isotope result values are converted to an array of floats and the lat/lon are converted to floats before the data is added.
   *
   * @param sampleId The ID of the new sample
   * @param formSampleData The data of the sample being added
   */
  function onCreateSampleClick(
    sampleId: string,
    formSampleData: Partial<Sample>,
  ) {
    console.log('form sample data: ' + formSampleData)
    if (!formSampleData || !userData) return
    if (!sampleId) {
      console.log('Error: SampleId not provided when trying to create sample')
      return
    }
    const user = auth.currentUser
    if (!user) return
    const date = new Date()
    const currentDateString = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`

    const sampleData: Sample = {
      ...formSampleData,
      created_by: auth.currentUser!.uid,
      created_on: currentDateString,
      last_updated_by: userData.name,
      org: userData.org,
      org_name: userData.org_name ? userData.org_name : '',
      created_by_name: userData.name,
      code_lab: sampleId,
      visibility: 'private',
      d18O_wood: formSampleData.d18O_wood
        ? formSampleData.d18O_wood.map((value: string) => parseFloat(value))
        : [],
      d15N_wood: formSampleData.d15N_wood
        ? formSampleData.d15N_wood.map((value: string) => parseFloat(value))
        : [],
      n_wood: formSampleData.n_wood
        ? formSampleData.n_wood.map((value: string) => parseFloat(value))
        : [],
      d13C_wood: formSampleData.d13C_wood
        ? formSampleData.d13C_wood.map((value: string) => parseFloat(value))
        : [],
      c_wood: formSampleData.c_wood
        ? formSampleData.c_wood.map((value: string) => parseFloat(value))
        : [],
      c_cel: formSampleData.c_cel
        ? formSampleData.c_cel.map((value: string) => parseFloat(value))
        : [],
      d13C_cel: formSampleData.d13C_cel
        ? formSampleData.d13C_cel.map((value: string) => parseFloat(value))
        : [],
      d18O_cel: formSampleData.d18O_cel
        ? formSampleData.d18O_cel.map((value: string) => parseFloat(value))
        : [],
      lat: formSampleData.lat ? parseFloat(formSampleData.lat) : 0,
      lon: formSampleData.lon ? parseFloat(formSampleData.lon) : 0,
      points: getPointsArrayFromSampleResults(formSampleData as Sample),
    } as Sample
    // Set sample to appropriate collection
    let docRef
    if (sampleData.trusted === 'trusted') {
      docRef = doc(db, 'trusted_samples', sampleId)
    } else if (sampleData.trusted === 'untrusted') {
      docRef = doc(db, 'untrusted_samples', sampleId)
    } else {
      docRef = doc(db, 'unknown_samples', sampleId)
    }

    setDoc(docRef, sampleData)

    console.log('New sample added to collection: ')
    console.log('SampleData: ', sampleData)
    console.log(
      'Sample ID: ',
      sampleData.code_lab,
      'Trusted: ',
      sampleData.trusted,
    )

    router.push(
      `/sample-details?id=${sampleData.code_lab}&trusted=${sampleData.trusted}`,
    )

    setSampleCreationFinished(true)
    setFormData(sampleData)
  }

  function handlePrint() {
    const mywindow = window.open('', 'PRINT', 'height=400,width=600')
    if (!mywindow) return

    const qrCodeElement = document.getElementById('qr-code')
    if (!qrCodeElement) return

    mywindow.document.write('<html><head><title>' + document.title + '</title>')
    mywindow.document.write('</head><body >')
    mywindow.document.write('<h1>' + document.title + '</h1>')
    mywindow.document.write(qrCodeElement.innerHTML)
    mywindow.document.write('</body></html>')

    mywindow.document.close() // necessary for IE >= 10
    mywindow.focus() // necessary for IE >= 10*/

    mywindow.print()
    mywindow.close()

    return true
  }

  if (loadingUser || loadingUserData) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('loading')}
      </div>
    )
  }

  if (errorUser || errorUserData) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('errorLoading')}
      </div>
    )
  }

  if (!user || (!userData && !loadingUser && !loadingUserData)) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('errorLoading')}
      </div>
    )
  }

  const url = `timberid.org/sample-details?trusted=${formData.trusted}&id=${sampleId}`
  const viewSampleUrl = `/sample-details?trusted=${formData.trusted}&id=${sampleId}`

  const defaultValue = {
    ...formData,
    visibility: 'private',
    collected_by: 'supplier',
    status: 'concluded',
    trusted: status === 'originVerification' ? 'untrusted' : 'trusted',
  }

  return (
    <div className="sample-details-form-wrapper max-h-screen overflow-y-auto">
      {userData && !sampleCreationFinished && (
        <AddNewSample
          defaultValue={defaultValue}
          onActionButtonClick={(id: string, formSampleData: Partial<Sample>) =>
            onCreateSampleClick(id, formSampleData)
          }
          actionButtonTitle="Create sample"
          isNewSampleForm={true}
          sampleId={sampleId}
        />
      )}
    </div>
  )
}
