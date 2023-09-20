import React from 'react';
import ValidityTag from './ValidityTag';
import { type Sample } from '../../utils';
import { useTranslation, Trans } from 'react-i18next';

type Props = {
  selectedDoc: Sample;
};

const ValiditySection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();

    // Isoscape Metadata
    var referenceIsoscapeName = selectedDoc['reference_oxygen_isoscape_name'];
    var referenceIsotopeCreationDate = selectedDoc['reference_oxygen_isoscape_creation_date'];
    if (referenceIsotopeCreationDate) {
        const dateObj = new Date(referenceIsotopeCreationDate);
        referenceIsotopeCreationDate = dateObj.toISOString().split('T')[0]
    }
    var referenceIsotopePrecision = selectedDoc['reference_oxygen_isoscape_precision'];
    var referenceIsotopePrecisionPctString = t("unknown");
    if (referenceIsotopePrecision) {
        referenceIsotopePrecisionPctString = referenceIsotopePrecision ? (referenceIsotopePrecision * 100).toFixed(2) : t("unknown");
    }

    // Sample Processing Metadata
    var dateOfSampleProcessed = selectedDoc['created_on'];

    // T-Test Results
    var validityLabel = selectedDoc['validity'];
    var d18OCelSampleMean = selectedDoc['d18O_cel_sample_mean']?.toFixed(5);
    var d18OCelSampleVariance = selectedDoc['d18O_cel_sample_variance']?.toFixed(5);
    var d18OCelReferenceMean = selectedDoc['d18O_cel_reference_mean']?.toFixed(5);
    var d18OCelReferenceVariance = selectedDoc['d18O_cel_reference_variance']?.toFixed(5);
    var pValue = selectedDoc['p_value']?.toFixed(10);
    var threshold = selectedDoc['p_value_threshold']?.toFixed(10);
    var likelihoodSameDistributionsPct = selectedDoc['p_value'] ? (selectedDoc['p_value'] * 100).toFixed(2) : t("unknown");
    
    return (
        <div className='details'>
        <div className='section-title'>{t('validity')}</div>
        <div>
            <ValidityTag validityLabel={validityLabel} isTrusted={false} city={selectedDoc['city']} lat={selectedDoc['lat']} lon={selectedDoc['lon']} />
            <div className='samples-origin-pct'>
                {t('pctSimilarSamplesStatedOrigin', { "pct": referenceIsotopePrecisionPctString })}
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>
                    <Trans i18nKey="d18OCelSampleMean" t={t}>
                        δ<sup>18</sup>O Cel sample mean
                    </Trans>
                </span>
                <span className='detail-value'>{d18OCelSampleMean}</span>
            </div>
            <div className='detail'>
                <span className='detail-name'>
                    <Trans i18nKey="d18OCelSampleVariance" t={t}>
                        δ<sup>18</sup>O Cel sample variance
                    </Trans>
                </span>
                <span className='detail-value'>{d18OCelSampleVariance}</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
            <span className='detail-name'>
                    <Trans i18nKey="d18OCelReferenceMean" t={t}>
                        δ<sup>18</sup>O Cel reference mean
                    </Trans>
                </span>
                <span className='detail-value'>{d18OCelReferenceMean}</span>
            </div>
            <div className='detail'>
                <span className='detail-name'>
                    <Trans i18nKey="d18OCelReferenceVariance" t={t}>
                        δ<sup>18</sup>O Cel reference variance
                    </Trans>
                </span>
                <span className='detail-value'>{d18OCelReferenceVariance}</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>{t('pValue')}</span>
                <span className='detail-value'>{pValue}</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>{t('threshold')}</span>
                <span className='detail-value'>{threshold}</span>
            </div>
        </div>
        <div>
            <p className='likelihood-details'>
                {t('likelihoodDetailsParagraph', { "pct": likelihoodSameDistributionsPct })}
            </p>
            <p>
                {t('sampleProcessingDetailsParagraph', { "date": dateOfSampleProcessed, "isoscapeName": referenceIsoscapeName, "isotopeDate": referenceIsotopeCreationDate })}
            </p>
            <div className='methodology'>
                <div className='methodology-title'>{t('methodology')}</div>
                <p>{t('methodologyP1')}</p>
                <p>{t('methodologyP2')}</p>
                <p>
                    <Trans i18nKey="methodologyP3" t={t}>
                        Please see the <a target='_blank' href='https://timberid.gitbook.io/timberid/user-guide/glossary'>glossary</a> for further information and explanation of terms.
                    </Trans>
                </p>
            </div>
        </div>
    </div>
  );
};

export default ValiditySection;