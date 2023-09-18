import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
    selectedDoc: Sample;
};

const LandUseDetailsSection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();
    
    return (
        <div>
            {selectedDoc['alerts'] ?
                <div className='details'>
                    <div className='section-title'>
                        Nearby Deforestation Alerts
                    </div>
                    <table className="table table-alerts">
                        <thead>
                            <tr>
                                <th scope="col">Area</th>
                                <th scope="col">Latitude</th>
                                <th scope="col">Longitude</th>
                                <th scope="col">Distance</th>
                                <th scope="col">Detected At</th>
                                <th scope="col">Before</th>
                                <th scope="col">After</th>
                                <th scope="col">Details</th>
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
                                    <td><a target="_blank" href={alert['url']}>More info</a></td>
                                </tr>
                            ))}
                            
                        </tbody>
                    </table>
                    <div className='alerts-source-footer'>Deforestation alerts are provided by <a href='https://alerta.mapbiomas.org/'>MapBiomas Alerta</a></div>
                </div>
            : ''}
        </div>
    );
};

export default LandUseDetailsSection;
