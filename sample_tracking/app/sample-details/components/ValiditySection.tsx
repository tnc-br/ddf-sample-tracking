import React from 'react';
import ValidityTag from './ValidityTag';
import { type Sample } from '../../utils';
import { useTranslation, Trans } from 'react-i18next';

type Props = {
  selectedDoc: Sample;
};

const ValiditySection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();

    var samplesOriginLikelihoodPct = 91;
    var likelihoodSameDistributionsPct = 1.61;
    var dateOfSampleProcessed = "9-Jun-2023";
    var referenceIsoscapeName = "USP-isoscape-oxygen--2023-09-11";
    var referenceIsotopeCreationDate = "10-Jun-2023";

    var d18OCelSampleMean = 23.55
    var d18OCelSampleVariance = 2.4
    var d18OCelReferenceMean = 23.55
    var d18OCelReferenceVariance = 2.2
    var pValue = 0.0161;
    var threshold = 0.0500;
    
    return (
        <div className='details'>
        <div className='section-title'>{t('validity')}</div>
        <div>
            <ValidityTag isTrusted={false} city={selectedDoc['city']} lat={selectedDoc['lat']} lon={selectedDoc['lon']} />
            <div className='samples-origin-pct'>
                {t('pctLikelihoodSimilarSamples', { "pct": samplesOriginLikelihoodPct })}
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