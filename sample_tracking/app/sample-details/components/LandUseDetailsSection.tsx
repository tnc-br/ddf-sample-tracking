import React from 'react';
import { type Sample } from '../../utils';
import { useTranslation } from 'react-i18next';

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
                Water and land use details
            </div>
            <div className='iframe-wrapper'>
                <iframe src={mapUrl}  frameborder="0" height="300px" width="100%" marginwidth="0" marginheight="0"></iframe>
            </div>
            <div className='water-land-use-details'>
                <div className='table-title-land-use'>Water</div>
                <div className="detail-row">
                    <div className='detail'>
                        <span className="detail-name">Is lat/lon in water?</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? (selectedDoc['water_pct']['is_point_water'] ? "YES" : "NO") : "unknown"}</span>
                    </div>
                    <div className='detail'>
                        <span className="detail-name">Percentage of water in a 1km buffer zone</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? formatAsPercentage(selectedDoc['water_pct']['water_mean_in_1km_buffer']) : "unknown"}</span>
                    </div>
                    <div className='detail'>
                        <span className="detail-name">Percentage of water in a 10km buffer zone</span>
                        <span className='detail-value'>{selectedDoc['water_pct'] ? formatAsPercentage(selectedDoc['water_pct']['water_mean_in_10km_buffer']) : "unknown"}</span>
                    </div>
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        {/* TODO: read the keys in the Record instead of creating an array */}
                        <th scope="col" className='table-title-land-use'>Land use type</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <th scope="col" key={index}>{2011 + index}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row"><div className='anthropic legend'></div> Anthropic Use (Urban, agriculture, etc)</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_anthropic_pct'] ? formatAsPercentage(selectedDoc['land_use_anthropic_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row"><div className='primary-vegetation legend'></div> Primary Vegetation</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_primary_vegetation_pct'] ? formatAsPercentage(selectedDoc['land_use_primary_vegetation_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row"><div className='secondary-vegetation legend'></div> Secondary Vegetation and regrowth</th>
                        {Array.from({ length: 11 }, (_, index) => (
                            <td key={index}>{selectedDoc['land_use_secondary_vegetation_or_regrowth_pct'] ? formatAsPercentage(selectedDoc['land_use_secondary_vegetation_or_regrowth_pct']["" + (2011 + index)]) : "unknown"}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <div className='land-use-source-footer'>
                <b>Source</b>
                <p>
                    Data from <a href='http://mapbiomas.org'>MapBiomas</a> showing<br></br>
                    i) Water coverage for the inputted lat-long, and within a 1km and 1km radial buffer zone around the point, and <br></br>
                    ii) Land usage data from remote sensing broken down into Anthropic (definition), Primary Vegetation (definition) and Secondary Vegetation (definition)
                </p>
            </div>
        </div>
    );
};

export default LandUseDetailsSection;
