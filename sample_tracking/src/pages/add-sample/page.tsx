'use client'

import 'bootstrap/dist/css/bootstrap.css'
import { useRouter } from 'next/router'
import { doc, getDoc } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import AddNewSample from '../../old_components/Sample/AddNewSample'
import {
  getRanHex,
  getPointsArrayFromSampleResults,
  type UserData,
  Sample,
} from '../../old_components/utils'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { setSample } from '../../old_components/firebase_utils'
import { auth, db } from '@services/firebase/config'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocument } from 'react-firebase-hooks/firestore'

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

  const userRef = user ? doc(db, 'users', user?.uid || '') : null
  const [userData, loadingUserData, errorUserData] = useDocument(userRef)

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
    if (!formSampleData) return
    if (!sampleId) {
      console.log('Error: SampleId not provided when trying to create sample')
    }
    const user = auth.currentUser
    if (!user) return
    const date = new Date()
    const currentDateString = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`

    const sampleData = {
      ...formSampleData,
      created_by: auth.currentUser!.uid,
      created_on: currentDateString,
      last_updated_by: userData!.name,
      org: userData!.org,
      org_name: userData!.org_name ? userData!.org_name : '',
      created_by_name: userData!.name,
      createdAt: date,
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
      lat: formSampleData.lat ? parseFloat(formSampleData.lat) : '',
      lon: formSampleData.lon ? parseFloat(formSampleData.lon) : '',
      points: getPointsArrayFromSampleResults(formSampleData),
    }
    setSample(sampleData.trusted, sampleId, sampleData)
    setSampleCreationFinished(true)
    setFormData(sampleData)
  }

  function handlePrint() {
    const mywindow = window.open('', 'PRINT', 'height=400,width=600')
    if (!mywindow) return
    mywindow.document.write('<html><head><title>' + document.title + '</title>')
    mywindow.document.write('</head><body >')
    mywindow.document.write('<h1>' + document.title + '</h1>')
    mywindow.document.write(document.getElementById('qr-code').innerHTML)
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
        <div className="page-title-text">{t('addNewSample')}</div>
      </div>
      <div>
        <div className="sample-details-form-wrapper">
          {!sampleCreationFinished && (
            <div>
              {formData.status !== 'concluded' && (
                <p className="sample-details-section-title">
                  {t('addDetails')}
                </p>
              )}
              <p className="sample-details-requirements">
                {t('requiredFields')}
              </p>
            </div>
          )}
          {sampleCreationFinished && (
            <div>
              <div className="sample-added-title">{t('newSampleAdded')}</div>
              <div className="qr-instructions">{t('qrPrintInstructions')}</div>
              <div className="qr-code" id="qr-code">
                <QRCodeSVG value={url} />
              </div>
              <div className="buttons-wrapper">
                <Link className="view-sample-link" href={viewSampleUrl}>
                  View sample
                </Link>
                <div
                  onClick={handlePrint}
                  id="print-button"
                  className="add-sample-print-button"
                >
                  <span className="material-symbols-outlined">print</span>
                  {t('print')}
                </div>
              </div>
            </div>
          )}

          {userData && !sampleCreationFinished && (
            <div id="sample-form">
              <AddNewSample
                defaultValue={defaultValue}
                onActionButtonClick={(
                  id: string,
                  formSampleData: Partial<Sample>,
                ) => onCreateSampleClick(id, formSampleData)}
                actionButtonTitle="Create sample"
                isNewSampleForm={true}
                sampleId={sampleId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
