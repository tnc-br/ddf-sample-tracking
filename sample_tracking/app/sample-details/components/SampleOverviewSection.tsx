import React from 'react';
import { type Sample } from '../../utils';

type Props = {
  selectedDoc: Sample;
};

const SampleOverviewSection: React.FC<Props> = ({ selectedDoc }) => {
    return (
        <div className='details'>
            <div className='section-title'>Sample overview</div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>Measuring height</span>
                    <span className='detail-value'>{selectedDoc['measureing_height'] || 'unknown'}</span>
                </div>
                <div className='detail'>
                    <span className='detail-name'>Observations</span>
                    <span className='detail-value'>{selectedDoc['observations'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>Sample type</span>
                    <span className='detail-value'>{selectedDoc['sample_type'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>Diameter</span>
                    <span className='detail-value'>{selectedDoc['diameter'] || 'unknown'}</span>
                </div>
            </div>
            <div className='detail-row'>
                <div className='detail'>
                    <span className='detail-name'>Amount of measurements</span>
                    <span className='detail-value'>{selectedDoc['points'] ? selectedDoc['points'].length : ''}</span>
                </div>
            </div>
        </div>
    );
};

export default SampleOverviewSection;