import React from 'react';

type Props = {
    validity: string;
    city: string;
    lat: string;
    lon: string;
};

const ValidityTag: React.FC<Props> = ({ validity, city, lat, lon }) => {
    return (
        <div>
            <div className='validity-title'>
                <span className='validity-tag'>{validity}</span>
                <span>
                  It's possible your sample comes from the following region
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