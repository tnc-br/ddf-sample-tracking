'use client'

import '../styles.css'
import 'bootstrap/dist/css/bootstrap.css'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  hideNavBar,
  hideTopBar,
  validateSample,
  Sample,
  SampleError,
  ErrorMessages,
} from '../utils'
import { useTranslation } from 'react-i18next'
import '../../i18n/config'

import { ActionButton, BackButton, CancelButton, NextButton } from './Actions'
import BasicInfoTab from './BasicInfoTab'
import SampleMeasurementsTab from './SampleMeasurementTab'
import ReviewAndSubmitTab from './ReviewSample'

type AddNewSampleProps = {
  onActionButtonClick: any
  onTabChange: (tab: number) => void
  baseState: Partial<Sample>
  actionButtonTitle: string
  isNewSampleForm?: boolean
  sampleId: string
  tab?: number
}

/**
 * Component used to input sample data for the AddSample and Edit components. The following data is passed in:
 * - onActionButtonClick: function to call when the action button is clicked
 * - onTabChange: function to call when the tab of the input form is changed
 * - baseState: the initial data for the input form
 * - actionButtonTitle: the label for the action button
 * - isNewSampleForm: boolean representing if this is a new sample or represents an already existing sample
 * - sampleId: 20 character hex ID for the sample
 * - currentTab: the tab of the sample form that should be shown
 *
 * This is a very large file but at its core its just a form to enter Sample data.
 */
export default function AddNewSample({
  tab,
  actionButtonTitle,
  baseState,
  isNewSampleForm,
  onActionButtonClick,
  onTabChange,
  sampleId,
}: AddNewSampleProps) {
  const [currentTab, setCurrentTab] = useState(tab ? tab : 1)
  const [formData, setFormData] = useState(baseState)
  const [numMeasurements, setNumMeasurements] = useState(2)
  const [currentMeasurementsTab, setCurentMeasurementsTab] = useState(0)
  const [errorText, setErrorText] = useState<Sample | null>(null)

  const router = useRouter()
  const { t } = useTranslation()

  const errorMessages: ErrorMessages = {
    originValueError: t('originValueError'),
    originValueRequired: t('originValueRequired'),
    latLonRequired: t('latLonRequired'),
    shouldBeWithinTheRange: t('shouldBeWithinTheRange'),
    and: t('and'),
    isRequired: t('isRequired'),
  }

  useEffect(() => {
    hideNavBar()
    hideTopBar()
  })

  if (!onActionButtonClick || !baseState || !actionButtonTitle) return

  if (Object.keys(baseState).length > Object.keys(formData).length) {
    setFormData(baseState)
  }

  function attemptToUpdateCurrentTab(newTab: number) {
    if (newTab < currentTab || checkCurrentTabFormValidity()) {
      setCurrentTab(newTab)
      if (onTabChange) onTabChange(newTab)
      setErrorText(null)
    }
  }

  function handleSelectSupplier() {
    const newFormData = {
      ...formData,
      collected_by: 'supplier',
    }
    setFormData(newFormData)
  }

  function handleSelectMyOrg() {
    const newFormData = {
      ...formData,
      collected_by: 'my_org',
    }
    setFormData(newFormData)
  }

  function handleChange(evt: any, newValue?: any) {
    let newFormData
    if (evt.$d) {
      const value = evt.$d
      newFormData = {
        ...formData,
        date_collected: value,
      }
    } else {
      let value
      let name
      if (newValue && newValue.length) {
        value = newValue
        const id = evt.target.id
        name = id.substring(0, id.indexOf('-option'))
      } else {
        value =
          evt.target.type === 'checkbox'
            ? evt.target.checked
            : evt.$d
              ? evt.$d
              : evt.target.value
        name = evt.target.name
      }

      newFormData = {
        ...formData,
        [name]: value,
      }
    }
    setFormData(newFormData)
  }

  function handleResultChange(evt: any) {
    const value = evt.target.value
    let newFormDataMeasurementsArray = structuredClone(
      formData[evt.target.name],
    )
    if (!newFormDataMeasurementsArray) {
      newFormDataMeasurementsArray = []
    }
    newFormDataMeasurementsArray[currentMeasurementsTab] = value
    const newFormData = {
      ...formData,
      [evt.target.name]: newFormDataMeasurementsArray,
    }
    setFormData(newFormData)
  }

  function onCancleClick() {
    router.push('samples')
  }

  function handleButtonClick() {
    const currentTabRef = getCurrentTabFormRef()
    if (!checkCurrentTabFormValidity()) return
    onActionButtonClick(sampleId, formData)
  }

  function getCurrentTabFormRef() {
    if (currentTab === 1) {
      return document.getElementById('info-tab')!
    } else if (currentTab === 2) {
      return document.getElementById('sample-measurements')!
    } else {
      return document.getElementById('results-tab')!
    }
  }

  function checkCurrentTabFormValidity(): boolean {
    if (currentTab === 3) return true

    const currentTabRef = getCurrentTabFormRef()
    // if (currentTab === 2 && !validateSampleResultsTab()) return false;

    if (currentTabRef.checkValidity()) {
      const possibleErrors = validateSample(
        formData,
        [currentTab],
        errorMessages,
      )
      let tempErrorText = {} as Sample
      if (possibleErrors.length > 0) {
        possibleErrors.forEach((error: SampleError) => {
          tempErrorText[error.fieldWithError] = error.errorString
        })
        setErrorText(tempErrorText)
        return false
      }
      return true
    } else {
      currentTabRef.reportValidity()
      return false
    }
  }

  function handleMeasurementsTabClick(evt: any) {
    setCurentMeasurementsTab(parseInt(evt.target.id))
  }

  function handleAddMeasurementClick() {
    setNumMeasurements(numMeasurements + 1)
  }

  const sampleTypeValues = {
    Disc: 'disk',
    Triangular: 'triangular',
    Chunk: 'chunk',
    Fiber: 'fiber',
  }

  const userIsOnLastTab = currentTab === 4

  const shouldShowNextButton = currentTab < 3

  const shouldShowBackButton = currentTab !== 1 && !userIsOnLastTab

  const shouldShowCancelButton = !userIsOnLastTab

  const shouldShowActionItemButton = currentTab === 3 || !isNewSampleForm
  const originIsKnownOrUncertain =
    formData.trusted === 'trusted' || formData.trusted === 'untrusted'

  function handleReturnToDashboard() {
    router.push('/samples')
  }

  return (
    <div className="add-sample-page-wrapper">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional"
      />
      <div>
        <div id="sample-form">
          {
            <div className="add-sample-tab-bar">
              <div className="add-sample-add-details-tab">
                <div className="add-sample-tab-number-wrapper">
                  <div className="leading-divider"></div>
                  <div
                    className={
                      currentTab >= 1
                        ? 'add-sample-current-tab-number add-sample-tab-number'
                        : 'add-sample-tab-number'
                    }
                  >
                    1
                  </div>
                  <div className="trailing-divider"></div>
                </div>
                <div className="add-sample-tab-text-wrapper">
                  <div
                    className={
                      currentTab >= 1
                        ? 'dd-sample-current-tab-text add-sample-tab-text'
                        : 'add-sample-tab-text'
                    }
                  >
                    {t('addDetails')}
                  </div>
                </div>
              </div>
              <div className="divider-wrapper">
                <div className="divider"></div>
              </div>

              <div className="add-sample-add-details-tab">
                <div className="add-sample-tab-number-wrapper">
                  <div className="leading-divider"></div>
                  <div
                    className={
                      currentTab >= 2
                        ? 'add-sample-current-tab-number add-sample-tab-number'
                        : 'add-sample-tab-number'
                    }
                  >
                    2
                  </div>
                  <div className="trailing-divider"></div>
                </div>
                <div className="add-sample-tab-text-wrapper">
                  <div
                    className={
                      currentTab >= 2
                        ? 'dd-sample-current-tab-text add-sample-tab-text'
                        : 'add-sample-tab-text'
                    }
                  >
                    {t('addSampleMeasurements')}
                  </div>
                </div>
              </div>
              <div className="divider-wrapper">
                <div className="divider"></div>
              </div>

              <div className="add-sample-add-details-tab">
                <div className="add-sample-tab-number-wrapper">
                  <div className="leading-divider"></div>
                  <div
                    className={
                      currentTab === 3
                        ? 'add-sample-current-tab-number add-sample-tab-number'
                        : 'add-sample-tab-number'
                    }
                  >
                    3
                  </div>
                  <div className="trailing-divider"></div>
                </div>
                <div className="add-sample-tab-text-wrapper">
                  <div
                    className={
                      currentTab === 3
                        ? 'dd-sample-current-tab-text add-sample-tab-text'
                        : 'add-sample-tab-text'
                    }
                  >
                    {t('reviewAndCreate')}
                  </div>
                </div>
              </div>
            </div>
          }

          <div>
            {currentTab === 1 && (
              <BasicInfoTab
                errorText={errorText}
                formData={formData}
                onChangeClick={handleChange}
                onChangeClickMyOrg={handleSelectMyOrg}
                onChangeClickSupplier={handleSelectSupplier}
                originIsKnownOrUncertain={originIsKnownOrUncertain}
              />
            )}
            {currentTab === 2 && (
              <SampleMeasurementsTab
                currentMeasurementsTab={currentMeasurementsTab}
                errorText={errorText}
                formData={formData}
                handleAddMeasurementClick={handleAddMeasurementClick}
                handleChange={handleChange}
                handleMeasurementsTabClick={handleMeasurementsTabClick}
                handleResultChange={handleResultChange}
                numMeasurements={numMeasurements}
                sampleTypeValues={sampleTypeValues}
              />
            )}
            {currentTab === 3 && (
              <ReviewAndSubmitTab
                currentMeasurementsTab={currentMeasurementsTab}
                formData={formData}
                handleMeasurementsTabClick={handleMeasurementsTabClick}
                numMeasurements={numMeasurements}
              />
            )}
            {/* {currentTab === 4 && createSampleTab()} */}
          </div>
        </div>
      </div>
      <div className="submit-buttons">
        <div>
          {shouldShowCancelButton && (
            <CancelButton onCancleClick={onCancleClick} />
          )}
        </div>
        <div className="submit-buttons-right">
          {shouldShowBackButton && (
            <BackButton
              attemptToUpdateCurrentTab={attemptToUpdateCurrentTab}
              currentTab={currentTab}
            />
          )}
          {shouldShowNextButton && (
            <NextButton
              attemptToUpdateCurrentTab={attemptToUpdateCurrentTab}
              currentTab={currentTab}
            />
          )}
          {shouldShowActionItemButton && (
            <ActionButton
              actionButtonTitle={actionButtonTitle}
              onActionButtonClick={handleButtonClick}
            />
          )}
          {userIsOnLastTab && (
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="btn btn-primary"
            >
              Return to dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
