'use client'

import { useState, useEffect } from 'react'
import { useGlobal } from '@hooks/useGlobal'
import { Sample } from '../utils'
import { useTranslation } from 'react-i18next'
import '../../i18n/config'

import BasicInfoTab from './BasicInfoTab'
import SampleMeasurementsTab from './SampleMeasurementTab'
import ReviewAndSubmitTab from './ReviewSample'

type AddNewSampleProps = {
  onActionButtonClick: (id: string, formSampleData: Partial<Sample>) => void
  defaultValue?: Partial<Sample>
  actionButtonTitle: string
  isNewSampleForm?: boolean
  sampleId: string
}

/**
 * Component used to input sample data for the AddSample and Edit components. The following data is passed in:
 * - onActionButtonClick: function to call when the action button is clicked
 * - onTabChange: function to call when the tab of the input form is changed
 * - baseState: the initial data for the input form
 * - actionButtonTitle: the label for the action button
 * - sampleId: 20 character hex ID for the sample
 * - currentTab: the tab of the sample form that should be shown
 *
 * This is a very large file but at its core its just a form to enter Sample data.
 */
export default function AddNewSample({
  actionButtonTitle,
  defaultValue,
  onActionButtonClick,
  sampleId,
}: AddNewSampleProps) {
  const [currentTab, setCurrentTab] = useState(1)
  const [formData, setFormData] = useState(defaultValue || ({} as Sample))

  const { t } = useTranslation()

  const { setShowNavBar, setShowTopBar } = useGlobal()

  useEffect(() => {
    setShowNavBar(false)
    setShowTopBar(false)
  })

  if (!onActionButtonClick || !actionButtonTitle) return

  const handleChangeTab = (tab: number) => {
    setCurrentTab(tab)
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

  const saveChanges = (res: any) => {
    setFormData((prev) => {
      return { ...prev, ...res }
    })
  }

  const finish = async () => {
    await onActionButtonClick(sampleId, formData)
  }

  return (
    <div className="add-sample-page-wrapper">
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
                formData={formData}
                onSave={saveChanges}
                onChangeClickMyOrg={handleSelectMyOrg}
                onChangeClickSupplier={handleSelectSupplier}
                nextTab={() => handleChangeTab(currentTab + 1)}
              />
            )}
            {currentTab === 2 && (
              <SampleMeasurementsTab
                nextTab={() => handleChangeTab(currentTab + 1)}
                onSave={saveChanges}
                onCancelClick={() => handleChangeTab(currentTab - 1)}
                formData={formData}
              />
            )}
            {currentTab === 3 && (
              <ReviewAndSubmitTab
                formData={formData}
                onCancelClick={() => handleChangeTab(currentTab - 1)}
                onNextClick={finish}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
