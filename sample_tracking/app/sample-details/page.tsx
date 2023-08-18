"use client";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import { doc, getDoc, getFirestore, updateDoc, DocumentReference } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { useSearchParams, usePathname } from 'next/navigation'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { showNavBar, showTopBar } from '../utils';
import 'jquery';
import 'popper.js';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useRouter } from 'next/navigation'
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from 'react-i18next';

type Sample = {
    last_updated_by: string,
    site: string,
    state: string,
    org_name: string,
    lon: string,
    lat: string,
    species: string,
    created_by: string,
    date_completed: string,
    created_by_name: string,
    current_step: string,
    created_on: string,
    org: string,
    water_pct: WaterPercentageResults,
    land_use_anthropic_pct: Record<string, number>,
    land_use_primary_vegetation_pct: Record<string, number>,
    land_use_secondary_vegetation_or_regrowth_pct: Record<string, number>,
}

type WaterPercentageResults = {
    is_point_water: boolean,
    water_mean_in_1km_buffer: number,
    water_mean_in_10km_buffer: number,
}

type UserData = {
    role: string,
    org: string,
}


export default function SampleDetails() {

    const [selectedDoc, setDoc] = useState({} as Sample);
    const [hasStartedRequest, setHasStartedRequest] = useState(false);
    const [tabShown, setTabShown] = useState(0);
    const [userData, setUserData] = useState({} as UserData);

    function updateStateDoc(data: Sample) {
        setDoc(data);
    }
    function setHasStartedRequestTrue() {
        setHasStartedRequest(true);
    }
    function updateTabShown(tab: number) {
        setTabShown(tab);
    }
    function updateCurrentStep(newStep: string) {
        updateStateDoc({ ...selectedDoc, 'current_step': newStep });

    }


    const processSteps = ['1. Drying process', '2. Lamination', '3. Chopping & homogenization', '4. Chemical preparation', '5. Weighing', '6. Encapsulation', '7. Mass spectrometer & data return'];

    const router = useRouter();

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


    const app = initializeApp(firebaseConfig);
    const db = getFirestore();
    const { t } = useTranslation();


    const auth = getAuth();


    useEffect(() => {
        showNavBar();
        showTopBar();

        if (!userData.role) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((user) => {
                        if (user.exists()) {
                            const docData = user.data();
                            if (!docData.role) {
                                router.push('/tasks');
                            } else {
                                setUserData(docData as UserData);
                            }
                        }
                    })
                }
            });
        }
    });

    let docRef = doc(db, "trusted_samples", sampleId!);
    if (trusted === 'untrusted') {
        docRef = doc(db, "untrusted_samples", sampleId!);
    } else if (trusted === 'unknown') {
        docRef = doc(db, "unknown_samples", sampleId!);
    }
    if (Object.keys(selectedDoc).length < 1 && !hasStartedRequest && !userData.role && docRef) {
        // setHasStartedRequestTrue();	
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
    function processCompletedButtonPressed() {
        const nextStep = processSteps[processSteps.indexOf(selectedDoc.current_step) + 1];
        updateDoc(docRef, {
            'current_step': nextStep,
        });
        updateCurrentStep(nextStep);
    }

    function showDetails() {
        updateTabShown(0);
    }

    function showProcess() {
        updateTabShown(1);
    }

    function showResults() {
        updateTabShown(2);
    }

    function formatAsPercentage(num: number) {
        return new Intl.NumberFormat('default', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    }

    function processStep(title: string, stepNumber: number, headingId: string, collapseId: string) {
        let buttonClassName;
        let detailsPanelClassName;
        let processCompletedButtonClassName;
        if (processSteps.indexOf(selectedDoc.current_step) === stepNumber) {
            buttonClassName = 'accordion-button';
            detailsPanelClassName = ' accordion-collapse collapse show';
            processCompletedButtonClassName = 'btn btn-primary';
        } else {
            buttonClassName = 'accordion-button collapsed';
            detailsPanelClassName = 'accordion-collapse collapse';
            processCompletedButtonClassName = 'btn btn-primary disabled';
        }
        const fullHeadingId = 'panelsStayOpen' + headingId;
        const fullCollapseId = 'panelsStayOpen' + collapseId;
        const dataBsTarget = '#' + fullCollapseId;

        return <div className="accordion-item">
            <h2 className="accordion-header" id={fullHeadingId}>
                <button className={buttonClassName} type="button" data-bs-toggle="collapse" data-bs-target={dataBsTarget} aria-expanded="false" aria-controls={fullCollapseId}>
                    {selectedDoc.current_step && processSteps.indexOf(selectedDoc.current_step) > stepNumber ? <span className='process-number completed'><span className="material-symbols-outlined">
                        done
                    </span></span> : <span className='process-number incomplete'>{stepNumber + 1}</span>}
                    {title}
                </button>
            </h2>
            <div id={fullCollapseId} className={detailsPanelClassName} aria-labelledby={fullCollapseId}>
                <div className="accordion-body">
                    Placeholder
                    <div>
                        <button type="button" className={processCompletedButtonClassName} onClick={processCompletedButtonPressed}>Mark as completed</button>
                    </div>
                </div>
            </div>
        </div>
    }

    function ResultsTab() {
        return (<div>Results</div>)

    }

    function DetailsTab() {

        const url = `timberid.org/sample-details?trusted=${trusted}&id=${sampleId}`;
        const mapUrl = `https://storage.googleapis.com/timberid-maps/${sampleId}`;

        return (
            <div>
                <div className="details">
                    <div className='section-title'>
                        Details
                    </div>
                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('visibility')}</span>
                            <span className='detail-value'>{selectedDoc['visibility'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('collectionSite')}</span>
                            <span className='detail-value'>{selectedDoc['site'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('supplierName')}</span>
                            <span className='detail-value'>{selectedDoc['supplier'] || "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('sampleName')}</span>
                            <span className='detail-value'>{selectedDoc['sample_name'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('latitude')}</span>
                            <span className='detail-value'>{selectedDoc['lat'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('city')}</span>
                            <span className='detail-value'>{selectedDoc['city'] || "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('treeSpecies')}</span>
                            <span className='detail-value'>{selectedDoc['species'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('longitude')}</span>
                            <span className='detail-value'>{selectedDoc['lon'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('collectedBy')}</span>
                            <span className='detail-value'>{selectedDoc['collected_by']}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('origin')}</span>
                            <span className='detail-value'>{selectedDoc['trusted']}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('validity')}</span>
                            <span className='detail-value'>{selectedDoc['validity']}</span>
                        </div>
                    </div>
                </div>


                <div className='details'>
                    <div className='section-title'>
                        Result values
                    </div>
                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">d18O_cel</span>
                            <span className='detail-value'>{selectedDoc['d18O_cel'] ? selectedDoc['d18O_cel'].toString() : "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">d18O_wood</span>
                            <span className='detail-value'>{selectedDoc['oxygen'] ? selectedDoc['oxygen'].toString() : "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">d15N_wood</span>
                            <span className='detail-value'>{selectedDoc['nitrogen'] ? selectedDoc['nitrogen'].toString() : "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">%N_wood</span>
                            <span className='detail-value'>{selectedDoc['n_wood'] ? selectedDoc['n_wood'].toString() : "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">d13C_wood</span>
                            <span className='detail-value'>{selectedDoc['carbon'] ? selectedDoc['carbon'].toString() : "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">%C_wood</span>
                            <span className='detail-value'>{selectedDoc['c_wood'] ? selectedDoc['c_wood'].toString() : "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">d13C_cel</span>
                            <span className='detail-value'>{selectedDoc['d13C_cel'] ? selectedDoc['d13C_cel'].toString() : "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">%C_cel</span>
                            <span className='detail-value'>{selectedDoc['c_cel'] ? selectedDoc['c_cel'].toString() : "unknown"}</span>
                        </div>
                    </div>

                </div>

                <div className='details'>
                    <div className='section-title'>
                        Water details
                    </div>
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
                    <div className='mapbiomas-footer'>Data from MapBiomas, 2021</div>
                </div>

                <div className='details'>
                    <div className='section-title'>
                        Land use details in a 10km buffer radius zone
                    </div>
                    {selectedDoc['validity'] ? <iframe src={mapUrl} frameborder="0" height="300px" width="100%"></iframe> : ''} 
                    <table className="table">
                        <thead>
                            <tr>
                                {/* TODO: read the keys in the Record instead of creating an array */}
                                <th scope="col">Type</th>
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
                    <div className='mapbiomas-footer'>Data from MapBiomas, 2021</div>
                </div>

                <div id='qr-code'>
                    <div className="section-title">
                        Sample QR code
                    </div>
                    <QRCodeSVG value={url} />
                </div>

            </div>
        )
    }



    return (

        <div>
            <div className='sample-details-wrapper'>
                <p className='title'>{selectedDoc['sample_name'] || "Sample details"}</p>
                <div>
                    {/* <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={tabShown === 0 ? 'nav-link active' : 'nav-link'} onClick={showDetails} id="details-tab" data-toggle="tab" href="#details" role="tab" aria-controls="details" aria-selected="true">Details</a>
                        </li>
                        <li className="nav-item">
                            <a className={tabShown === 2 ? 'nav-link active' : 'nav-link'} onClick={showResults} id="results-tab" data-toggle="tab" href="#results" role="tab" aria-controls="results" aria-selected="false">Results</a>
                        </li>
                    </ul> */}
                    <div className="tab-content" id="myTabContent">
                        <DetailsTab />
                        {/* <div className={tabShown === 2 ? 'tab-pane fade show active' : 'tab-pane fade'} id="results" role="tabpanel" aria-labelledby="results-tab"><ResultsTab /></div> */}
                    </div>
                </div>

            </div>
        </div>)
}