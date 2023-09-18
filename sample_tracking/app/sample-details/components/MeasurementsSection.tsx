import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
    selectedDoc: Sample;
};

const MeasurementsSection: React.FC<Props> = ({ selectedDoc }) => {
    const { t } = useTranslation();

    return (
        <div className="details">
            <div className='section-title'>
                {t('sampleMeasurements')}
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Point</th>
                        <th>δ<sup>13</sup>C Wood</th>
                        <th>δ<sup>13</sup>C Cel</th>
                        <th>δ<sup>18</sup>O Wood</th>
                        <th>δ<sup>18</sup>O Cel</th>
                        <th>δ<sup>15</sup>N Wood</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedDoc['points'] ? selectedDoc['points'].map(function(point, i){
                        return <tr key={i}>
                                <td>{i+1}</td>
                                <td>{point['d13C_wood']}</td>
                                <td>{point['d13C_cel']}</td>
                                <td>{point['d18O_wood']}</td>
                                <td>{point['d18O_cel']}</td>
                                <td>{point['d15N_wood']}</td>
                            </tr>;
                    }): ''}
                </tbody>
            </table>
        </div>
    );
};

export default MeasurementsSection;
