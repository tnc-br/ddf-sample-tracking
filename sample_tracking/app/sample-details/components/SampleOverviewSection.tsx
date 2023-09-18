import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
  selectedDoc: Sample;
};

const SampleOverviewSection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();

    return (
        <div className='details'>
            <div className='section-title'>{t('sampleOverview')}</div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>{t('measuringHeight')}</span>
                    <span className='detail-value'>{selectedDoc['measureing_height'] || 'unknown'}</span>
                </div>
                <div className='detail'>
                    <span className='detail-name'>{t('observations')}</span>
                    <span className='detail-value'>{selectedDoc['observations'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>{t('sampleType')}</span>
                    <span className='detail-value'>{selectedDoc['sample_type'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>{t('diameter')}</span>
                    <span className='detail-value'>{selectedDoc['diameter'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>{t('amountOfMeasurements')}</span>
                    <span className='detail-value'>{selectedDoc['points'] ? selectedDoc['points'].length : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default SampleOverviewSection;