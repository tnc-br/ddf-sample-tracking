import { useTranslation } from 'react-i18next'

interface ReviewAndSubmitTabProps {
  formData: any
  numMeasurements: number
  currentMeasurementsTab: number
  onNextClick: () => void
  onCancelClick: () => void
  handleMeasurementsTabClick: (e: any) => void
}

function ReviewAndSubmitTab({
  formData,
  numMeasurements,
  currentMeasurementsTab,
  handleMeasurementsTabClick,
  onNextClick,
  onCancelClick,
}: ReviewAndSubmitTabProps) {
  const { t } = useTranslation()

  return (
    <div id="review-and-submit">
      <div className="details">
        <div className="section-title">Details</div>
        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('sampleName')}</span>
            <span className="detail-value">
              {formData['visibility'] || 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('collectionSite')}</span>
            <span className="detail-value">
              {formData['site'] || 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('supplierName')}</span>
            <span className="detail-value">
              {formData['supplier'] || 'unknown'}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('sampleName')}</span>
            <span className="detail-value">
              {formData['code_lab'] || 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('latitude')}</span>
            <span className="detail-value">{formData['lat'] || 'unknown'}</span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('city')}</span>
            <span className="detail-value">
              {formData['city'] || 'unknown'}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('treeSpecies')}</span>
            <span className="detail-value">
              {formData['species'] || 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">{t('longitude')}</span>
            <span className="detail-value">{formData['lon'] || 'unknown'}</span>
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
            {Array.from({ length: numMeasurements }, (_, index) => (
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
          className="back-button-wrapper add-sample-button-wrapper"
        >
          <div className="add-sample-slate-layer">
            <div className="add-sample-button-text green-button-text">
              {t('back')}
            </div>
          </div>
        </button>
        <button
          id="next-button-wrapper"
          type="button"
          onClick={onNextClick}
          className="add-sample-button-wrapper next-button-wrapper"
        >
          <div className="add-sample-slate-layer">
            <div className="add-sample-button-text white-button-text">
              {t('next')}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default ReviewAndSubmitTab
