"use client";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import { doc, getDoc, getFirestore, updateDoc, DocumentReference } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { useSearchParams, usePathname } from 'next/navigation'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { type UserData, type Sample, ValidityStatus, showNavBar, showTopBar, confirmUserLoggedIn, initializeAppIfNecessary } from '../utils';
import 'jquery';
import 'popper.js';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useRouter } from 'next/navigation'
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from 'react-i18next';

import ValidityTag from "./components/ValidityTag";
import ValiditySection from './components/ValiditySection';
import SampleOverviewSection from './components/SampleOverviewSection';
import SampleDetailsSection from './components/SampleDetailsSection';
import MeasurementsSection from './components/MeasurementsSection';
import LandUseDetailsSection from './components/LandUseDetailsSection';
import DeforestationAlertsSection from './components/DeforestationAlertsSection';

type WaterPercentageResults = {
    is_point_water: boolean,
    water_mean_in_1km_buffer: number,
    water_mean_in_10km_buffer: number,
}

/**
 * Component for rendering the sample details page. The sample being displayed is passed to the component using the following search params: 
 *  - 'id': the 20 character hex string for a specific sample.
 *  - 'trusted': has a value of either 'trusted', 'untrusted', or 'unknown' to specify the collection to fetch the sample from. 
 */
export default function SampleDetails() {

    const [selectedDoc, setDoc] = useState({} as Sample);
    const [hasStartedRequest, setHasStartedRequest] = useState(false);

    function updateStateDoc(data: Sample) {
        setDoc(data);
    }

    let sampleId = '12345';
    let trusted = 'trusted';

    const searchParams = useSearchParams();
    if (typeof window !== "undefined") {
        const queryString = window.location.search;
        console.log("Querystring: " + queryString);
        const urlParams = new URLSearchParams(queryString);
        sampleId = urlParams.get('id') ? urlParams.get('id') : searchParams.get('id');
        trusted = urlParams.get('trusted') ? urlParams.get('trusted') : searchParams.get('trusted');
    }


    const app = initializeAppIfNecessary();
    const db = getFirestore();
    const { t } = useTranslation();
    const auth = getAuth();
    const router = useRouter();

    useEffect(() => {
        showNavBar();
        showTopBar();

        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login');

            }
        })
    });

    let docRef = doc(db, "trusted_samples", sampleId!);
    if (trusted === 'untrusted') {
        docRef = doc(db, "untrusted_samples", sampleId!);
    } else if (trusted === 'unknown') {
        docRef = doc(db, "unknown_samples", sampleId!);
    }
    if (Object.keys(selectedDoc).length < 1 && !hasStartedRequest && docRef) {
        getDoc(docRef).then((docRef) => {
            if (docRef.exists()) {
                console.log('updated data');
                updateStateDoc(docRef.data() as Sample);
            } else {
                console.log('couldnt find data');
            }
            console.log(docRef);
        }).catch((error) => {
            console.log(error);
        })
    }

    const handlePrint = () => {
        window.print();
    };

    const url = `timberid.org/sample-details?trusted=${trusted}&id=${sampleId}`;

    return (
        <div>
        <div className='sample-details-wrapper'>
            <button onClick={handlePrint} className='print-button'>
                <span className="material-symbols-outlined">print</span>
            </button>
            <p className='title'>{selectedDoc['sample_name'] || "Sample details"}</p>
            <div>
                <div className="tab-content" id="myTabContent">
                    <div>
                        <div className='header-validity'>
                            <ValidityTag isTrusted={trusted === 'trusted'} city={selectedDoc['city']} lat={selectedDoc['lat']} lon={selectedDoc['lon']}/>
                        </div>
                        <div>
                            {trusted != 'trusted' ? <ValiditySection selectedDoc={selectedDoc || {}} /> : ''}
                            <SampleOverviewSection selectedDoc={selectedDoc || {}} />
                            <SampleDetailsSection selectedDoc={selectedDoc || {}} sampleId={sampleId} />
                            <MeasurementsSection selectedDoc={selectedDoc || {}} />
                            {trusted != 'trusted' ? <LandUseDetailsSection selectedDoc={selectedDoc || {}} sampleId={sampleId} /> : ''}
                            {trusted != 'trusted' ? <DeforestationAlertsSection selectedDoc={selectedDoc || {}}  /> : ''}
                            <div className='details page-legend'>
                                <div className='section-title'>{t('legend')}:</div>
                                <div className='page-legend-content'>
                                    <p>{t('legendP1')}</p>
                                    <p>{t('legendP2')}</p>
                                    <p>{t('legendP3')}</p>
                                    <p>{t('legendP4')}</p>
                                    <p>{t('legendP5')}</p>
                                    <p>{t('legendP6')}</p>
                                </div>
                            </div>
                        </div>
                        <div id='qr-code'>
                            <div className="section-title">
                                {t('sampleQrCode')}
                            </div>
                            <QRCodeSVG value={url} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}