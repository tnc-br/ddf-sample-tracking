'use client'

import { useRouter } from 'next/router'

import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { type Sample } from '../../old_components/utils'

import 'jquery'
import 'popper.js'

var QRCode = require('qrcode')
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import ValidityTag from '../../old_components/components/ValidityTag'
import ValiditySection from '../../old_components/components/ValiditySection'
import SampleOverviewSection from '../../old_components/components/SampleOverviewSection'
import SampleDetailsSection from '../../old_components/components/SampleDetailsSection'
import MeasurementsSection from '../../old_components/components/MeasurementsSection'
import LandUseDetailsSection from '../../old_components/components/LandUseDetailsSection'
// import DeforestationAlertsSection from './components/DeforestationAlertsSection'
import { auth, db } from '@services/firebase/config'
import { useGlobal } from '@hooks/useGlobal'
import DeforestationAlertsSection from '../../old_components/components/DeforestationAlertsSection'

type WaterPercentageResults = {
  is_point_water: boolean
  water_mean_in_1km_buffer: number
  water_mean_in_10km_buffer: number
}

export default function SampleDetails() {
  const [selectedDoc, setDoc] = useState({} as Sample)
  const [hasStartedRequest, setHasStartedRequest] = useState(false)

  const router = useRouter()

  const { id = '', trusted = 'trusted' } = router.query as {
    id: string
    trusted: string
  }

  const sampleId = id ?? 'Sem ID'

  const { t } = useTranslation()
  const { setShowNavBar, setShowTopBar } = useGlobal()

  useEffect(() => {
    setShowNavBar(true)
    setShowTopBar(true)

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      }
    })

    searchSample()
  }, [])

  const searchSample = () => {
    if (!sampleId) {
      console.log('sampleId is empty')
      return
    }

    let docRef = doc(db, 'trusted_samples', sampleId)

    if (trusted === 'untrusted') {
      docRef = doc(db, 'untrusted_samples', sampleId!)
      console.log('trusted', trusted)
    } else if (trusted === 'unknown') {
      docRef = doc(db, 'unknown_samples', sampleId!)
    }

    if (Object.keys(selectedDoc).length < 1 && !hasStartedRequest && docRef) {
      getDoc(docRef)
        .then((docRef) => {
          if (docRef.exists()) {
            setDoc(docRef.data() as Sample)
          } else {
            console.log('couldnt find data')
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const url = `timberid.org/sample-details?trusted=${trusted}&id=${sampleId}`

  return (
    <div>
      <div className="sample-details-wrapper">
        <button onClick={handlePrint} className="print-button">
          <span className="material-symbols-outlined">print</span>
        </button>
        <p className="title">{selectedDoc['code_lab'] || 'Sample details'}</p>
        <div>
          <div className="tab-content" id="myTabContent">
            <div>
              <div className="header-validity">
                <ValidityTag
                  validityLabel={selectedDoc['validity'] || ''}
                  isTrusted={trusted === 'trusted'}
                  city={selectedDoc['municipality'] || ''}
                  lat={selectedDoc['lat']}
                  lon={selectedDoc['lon']}
                />
              </div>
              <div>
                {trusted != 'trusted' && (
                  <ValiditySection selectedDoc={selectedDoc || {}} />
                )}
                <SampleOverviewSection selectedDoc={selectedDoc || {}} />
                <SampleDetailsSection
                  selectedDoc={selectedDoc || {}}
                  sampleId={sampleId}
                />
                <MeasurementsSection selectedDoc={selectedDoc || {}} />
                {trusted != 'trusted' && (
                  <LandUseDetailsSection
                    selectedDoc={selectedDoc || {}}
                    sampleId={sampleId}
                  />
                )}
                {trusted != 'trusted' && (
                  <DeforestationAlertsSection selectedDoc={selectedDoc || {}} />
                )}

                {/* Integration Point #3. Display your new section component in the desired order with respect to other snippets. */}

                <div className="details page-legend">
                  <div className="section-title">{t('legend')}:</div>
                  <div className="page-legend-content">
                    <p>{t('legendP1')}</p>
                    <p>{t('legendP2')}</p>
                    <p>{t('legendP3')}</p>
                    <p>{t('legendP4')}</p>
                    <p>{t('legendP5')}</p>
                    <p>{t('legendP6')}</p>
                  </div>
                </div>
              </div>
              <div id="qr-code">
                <div className="section-title">{t('sampleQrCode')}</div>
                <QRCodeSVG value={url} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
