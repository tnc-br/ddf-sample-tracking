import React from 'react';
import {ValidityStatus} from '../../utils';

type Props = {
    city: string;
    lat: string;
    lon: string;
    isTrusted: boolean;
};

const ValidityTag: React.FC<Props> = ({ city, lat, lon, isTrusted }) => {
    var validity = ValidityStatus.Undetermined;
    if (isTrusted) {
        validity = ValidityStatus.Trusted;
    }
    // TODO: Input validity through props once it's being written to Firestore

    var validityText = "";
    var validityClass = "";
    switch (validity) {
        case ValidityStatus.Possible:
            validityText = "It's possible your sample comes from the following region";
            validityClass = "possible";
            break;
        case ValidityStatus.NotLikely:
            validityText = "It's not likely your sample comes from the following region";
            validityClass = "not-likely";
            break;
        case ValidityStatus.Trusted:
            validityText = "Trusted Sample"; // Show an empty string if the sample is trusted
            break;
        case ValidityStatus.Undetermined:
            validityText = ""; // Show an empty string if the sample is undetermined
            break;
        default:
            break;
    }

    const tagClassName = ['validity-tag', validityClass].join(' ')
    
    return (
        <div>
            <div className='validity-title'>
                <span className={tagClassName}>{validity}</span>
                <span>
                    {validityText}
                </span>
            </div>
            <div className='validity-location-subtitle'>
                <span className='material-symbols-outlined'>location_on</span>
                <span>{`${city} (${lat}, ${lon})`}</span>
            </div>
        </div>
    );
};

export default ValidityTag;