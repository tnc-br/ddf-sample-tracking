import React from 'react';
import ValidityTag from './ValidityTag';
import { type Sample } from '../../utils';

type Props = {
  selectedDoc: Sample;
};

const ValiditySection: React.FC<Props> = ({ selectedDoc }) => {
    return (
        <div className='details'>
        <div className='section-title'>Validity</div>
        <div>
            <ValidityTag validity='Possible' city={selectedDoc['city']} lat={selectedDoc['lat']} lon={selectedDoc['lon']} />
            <div className='samples-origin-pct'>
            95% of the time similar samples come from their stated origin.
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>d180 Cel sample mean</span>
                <span className='detail-value'>23.55</span>
            </div>
            <div className='detail'>
                <span className='detail-name'>d180 Cel sample variance</span>
                <span className='detail-value'>2.4</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>d180 Cel reference mean</span>
                <span className='detail-value'>23.55</span>
            </div>
            <div className='detail'>
                <span className='detail-name'>d180 Cel reference variance</span>
                <span className='detail-value'>2.2</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>p-value</span>
                <span className='detail-value'>0.0161</span>
            </div>
        </div>
        <div className='detail-row'>
            <div className='detail'>
                <span className='detail-name'>Threshold</span>
                <span className='detail-value'>0.0500</span>
            </div>
        </div>
        <div>
            <p className='likelihood-details'>
                There is a 1.61% likelihood that the measured d180 isotope values come
                from the same distribution as found in the claimed location. This is
                based on a reference isotope landscape that achieves 95% precision
                with a recall rate of 34% and a Root Mean Squared Error (RMSE) of 1.2.
            </p>
            <p>
                This sample was last processed on 9-Jun-2023 using a reference
                isoscape, “USP-isoscape-oxygen--2023-09-11" which was created on
                10-Jun-2023.
            </p>
            <div className='methodology'>
                <div className='methodology-title'>Methodology</div>
                <p>
                    To test the claimed location of a new wood sample, a hypothesis test
                    is used to compare the measured distribution of isotope ratios with
                    the reference distribution at the claimed location to produce a
                    p-value. If the p-value is below a target threshold, it is
                    considered ‘not likely’ to have come from the claimed location. The
                    threshold is chosen to achieve a precision of at least 95%.
                </p>
                <p>
                    The reference distribution of d18O is obtained from a geographical
                    mapping of isotopic measurements (i.e. an ‘isoscape’) and their
                    variability over Brazil’s geography.  This isoscape is built using a
                    variational neural network trained using the isotope measurements
                    from collected reference wood samples, their precise harvest
                    location, and various climatic factors such as temperature,
                    precipitation, vapor pressure, etc.
                </p>
                <p>Please see the glossary for further information and explanation of terms.</p>
            </div>
        </div>
    </div>
  );
};

export default ValiditySection;