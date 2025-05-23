import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLargestIndex } from './SampleMeasurementTab'

interface ReviewAndSubmitTabProps {
  formData: any
  onNextClick: () => void
  onCancelClick: () => void
}

function ReviewAndSubmitTab({
  formData,
  onNextClick,
  onCancelClick,
}: ReviewAndSubmitTabProps) {
  const { t } = useTranslation()

  const numMeasurements = getLargestIndex([
    formData.d18O_cel,
    formData.d18O_wood,
    formData.d15N_wood,
    formData.n_wood,
    formData.d13C_wood,
    formData.c_wood,
    formData.c_cel,
    formData.d13C_cel,
  ])

  const [currentMeasurementsTab, setCurentMeasurementsTab] = useState(0)

  function handleMeasurementsTabClick(evt: any) {
    setCurentMeasurementsTab(parseInt(evt.target.id))
  }

  return (
    <div id="review-and-submit">
      <div className="details">
        <div className="section-title">Details</div>
        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('sampleName')}</span>
            <span className="detail-value">
              {formData['sample_name'] || 'Não preenchido'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('collectionSite')}</span>
            <span className="detail-value">
              {formData['site'] || 'Não preenchido'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('supplierName')}</span>
            <span className="detail-value">
              {formData['supplier'] || 'Não preenchido'}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">Código</span>
            <span className="detail-value">
              {formData['code_lab'] || 'Não preenchido'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('latitude')}</span>
            <span className="detail-value">
              {formData['lat'] || 'Não preenchido'}
            </span>
          </div>

          <div className="detail">
            <span className="detail-name">{t('city')}</span>
            <span className="detail-value">
              {formData['city'] || 'Não preenchido'}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('treeSpecies')}</span>
            <span className="detail-value">
              {formData['species'] || 'Não preenchido'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('longitude')}</span>
            <span className="detail-value">
              {formData['lon'] || 'Não preenchido'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('collectedBy')}</span>
            <span className="detail-value">{formData['collected_by']}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('origin')}</span>
            <span className="detail-value">{formData['trusted']}</span>
          </div>
        </div>
      </div>
      <div className="measurements-table">
        <div className="measurements-table-tabs">
          <div className="measurements-table-tabs-group">
            {numMeasurements.map((_, index) => (
              <div key={index} onClick={handleMeasurementsTabClick}>
                <div
                  className={
                    currentMeasurementsTab === index
                      ? 'selected-measurements-tab-wrapper measurements-tab-wrapper'
                      : 'measurements-tab-wrapper'
                  }
                >
                  <div className="measurements-tab-state-layer">
                    <div className="measurements-tab-contents">
                      <div
                        id={index.toString()}
                        className="measurements-tab-text"
                      >
                        Measurement {index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="measurements-entry-wrapper">
            <div className="detail-row">
              <div className="detail">
                <span className="detail-name">{t('d18O_cel')}</span>
                <span className="detail-value">
                  {formData.d18O_cel
                    ? formData.d18O_cel[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
              <div className="detail">
                <span className="detail-name">d18O_wood</span>
                <span className="detail-value">
                  {formData.d18O_wood
                    ? formData.d18O_wood[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
              <div className="detail">
                <span className="detail-name">{t('d15N_wood')}</span>
                <span className="detail-value">
                  {formData.d15N_wood
                    ? formData.d15N_wood[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail">
                <span className="detail-name">{t('n_wood')}</span>
                <span className="detail-value">
                  {formData.n_wood
                    ? formData.n_wood[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
              <div className="detail">
                <span className="detail-name">{t('d13C_wood')}</span>
                <span className="detail-value">
                  {formData.d13C_wood
                    ? formData.d13C_wood[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
              <div className="detail">
                <span className="detail-name">{t('c_wood')}</span>
                <span className="detail-value">
                  {formData.c_wood
                    ? formData.c_wood[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail">
                <span className="detail-name">{t('d13C_cel')}</span>
                <span className="detail-value">
                  {formData.d13C_cel
                    ? formData.d13C_cel[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
              <div className="detail">
                <span className="detail-name">{t('c_cel')}</span>
                <span className="detail-value">
                  {formData.c_cel
                    ? formData.c_cel[currentMeasurementsTab] || ''
                    : ''}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail">
                <span className="detail-name">{t('origin')}</span>
                <span className="detail-value">{formData['d18O_cel']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between my-10">
        <button
          onClick={onCancelClick}
          type="button"
          className="rounded border border-green-300 px-4 py-2 text-green-300 text-sm"
        >
          {t('back')}
        </button>
        <button
          id="next-button-wrapper"
          type="button"
          onClick={onNextClick}
          className="rounded border bg-green-800 px-4 py-2 text-white text-sm"
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
}

export default ReviewAndSubmitTab
