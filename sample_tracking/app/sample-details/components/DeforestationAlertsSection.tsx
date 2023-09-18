import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

type Props = {
    selectedDoc: Sample;
};

/**
 * Component that displays a table of deforestation alerts near a selected lat,lon.
 * Data from MapBiomas Alerta (https://alerta.mapbiomas.org/)
 */
const DeforestationAlertsSection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();
    
    return (
        <div>
            {selectedDoc['alerts'] ?
                <div className='details'>
                    <div className='section-title'>
                        {t('nearbyDeforestationAlerts')}
                    </div>
                    <table className="table table-alerts">
                        <thead>
                            <tr>
                                <th scope='col'>{t('area')}</th>
                                <th scope='col'>{t('latitude')}</th>
                                <th scope='col'>{t('longitude')}</th>
                                <th scope='col'>{t('distance')}</th>
                                <th scope='col'>{t('detectedAt')}</th>
                                <th scope='col'>{t('before')}</th>
                                <th scope='col'>{t('after')}</th>
                                <th scope='col'>{t('details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedDoc['alerts'].map((alert) => (
                                <tr key={alert['alertCode']}>
                                    <td>{alert['coordinates']['latitude'].toFixed(6)}</td>
                                    <td>{alert['coordinates']['longitude'].toFixed(6)}</td>
                                    <td>{alert['areaHa'].toFixed(2)} ha</td>
                                    <td>{alert['distance_to_point'].toFixed(2)} km</td>
                                    <td>{alert['detectedAt']}</td>
                                    <td><a target="_blank" href={alert['before']['url']}><img src={alert['before']['url']} alt="Before Deforestation" height="60" width="60" /></a></td>
                                    <td><a target="_blank" href={alert['after']['url']}><img src={alert['after']['url']} alt="After Deforestation" height="60" width="60" /></a></td>
                                    <td><a target="_blank" href={alert['url']}>{t('moreInfo')}</a></td>
                                </tr>
                            ))}
                            
                        </tbody>
                    </table>
                    <div className='alerts-source-footer'>
                        <Trans i18nKey="nearbyDeforestationAlertsSource" t={t}>
                            Deforestation alerts are provided by <a target='_blank' href='https://alerta.mapbiomas.org/'>MapBiomas Alerta</a>
                        </Trans>
                    </div>
                </div>
            : ''}
        </div>
    );
};

export default DeforestationAlertsSection;
