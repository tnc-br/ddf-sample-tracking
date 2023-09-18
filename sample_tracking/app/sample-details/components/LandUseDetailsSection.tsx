import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

type Props = {
    selectedDoc: Sample;
    sampleId: string;
};

const LandUseDetailsSection: React.FC<Props> = ({ selectedDoc, sampleId }) => {
    const { t } = useTranslation();
    const mapUrl = `https://storage.googleapis.com/timberid-public-to-internet/timberid-maps/${sampleId}`;

    function formatAsPercentage(num: number) {
        return new Intl.NumberFormat('default', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    }

    return (
        <div className='details'>
            <div className='section-title'>
                {t('waterAndLandUseDetails')}
            </div>
            <div className='iframe-wrapper'>
                <iframe src={mapUrl}  frameborder="0" height="300px" width="100%" marginwidth="0" marginheight="0"></iframe>
            </div>
            <div className='water-land-use-details'>
                <div className='table-title-land-use'>{t('water')}</div>
                <div className="detail-row">
                    <div className='detail'>
                        <span className="detail-name">{t('waterAndLandUseDetails')}</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? (selectedDoc['water_pct']['is_point_water'] ? "YES" : "NO") : "unknown"}</span>
                    </div>
                    <div className='detail'>
                        <span className="detail-name">{t('percentageOfWaterIn1kmBufferZone')}</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? formatAsPercentage(selectedDoc['water_pct']['water_mean_in_1km_buffer']) : "unknown"}</span>
                    </div>
                    <div className='detail'>
                        <span className="detail-name">{t('percentageOfWaterIn10kmBufferZone')}</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? formatAsPercentage(selectedDoc['water_pct']['water_mean_in_10km_buffer']) : "unknown"}</span>
                    </div>
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        {/* TODO: read the keys in the Record instead of creating an array */}
                        <th scope="col" className='table-title-land-use'>{t('landUseType')}</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <th scope="col" key={index}>{2011 + index}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row"><div className='anthropic legend'></div> {t('anthropicUse')}</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_anthropic_pct'] ? formatAsPercentage(selectedDoc['land_use_anthropic_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row"><div className='primary-vegetation legend'></div> {t('primaryVegetation')}</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_primary_vegetation_pct'] ? formatAsPercentage(selectedDoc['land_use_primary_vegetation_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row"><div className='secondary-vegetation legend'></div> {t('secondaryVegetationAndRegrowth')}</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_secondary_vegetation_or_regrowth_pct'] ? formatAsPercentage(selectedDoc['land_use_secondary_vegetation_or_regrowth_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <div className='land-use-source-footer'>
                <b>Source</b>
                <p>
                    <Trans i18nKey="landUseSourceFooterP1" t={t}>
                        Data from <a target='_blank' href='http://mapbiomas.org'>MapBiomas</a> showing
                    </Trans><br></br>
                    {t('landUseSourceFooterP2')}<br></br>
                    {t('landUseSourceFooterP3')}
                </p>
            </div>
        </div>
    );
};

export default LandUseDetailsSection;
