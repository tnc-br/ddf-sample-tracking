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

        return (<div>
            <div className="table table-borderless">
                <div className="sample-details">
                    <tr>
                        <td className='value-title'>Visibility</td>
                        <td>{selectedDoc['visibility']}</td>
                        <td className='value-title'>Collection site</td>
                        <td>{selectedDoc['site']}</td>
                        <td className='value-title'>Supplier name</td>
                        <td>{selectedDoc['supplier']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Sample name</td>
                        <td>{selectedDoc['sample_name']}</td>
                        <td className='value-title'>Latitude</td>
                        <td>{selectedDoc['lat']}</td>
                        <td className='value-title'>City</td>
                        <td>{selectedDoc['city']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Tree species</td>
                        <td>{selectedDoc['species']}</td>
                        <td className='value-title'>Longitude</td>
                        <td>{selectedDoc['lon']}</td>
                        <td className='value-title'>Collection site</td>
                        <td>{selectedDoc['site']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Origin</td>
                        <td>{selectedDoc['trusted']}</td>
                        <td className='value-title'>Last updated by</td>
                        <td>{selectedDoc['last_updated_by']}</td>
                        <td className='value-title'>Date of harvest</td>
                        <td>{selectedDoc['date_of_harvest']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Created by</td>
                        <td>{selectedDoc['created_by_name'] ? selectedDoc['created_by_name'] : selectedDoc['created_by']}</td>
                        <td className='value-title'>Date completed</td>
                        <td>{selectedDoc['date_completed']}</td>
                    </tr>
                </div>
            </div>


            <div className="table table-borderless">
                <p>Sample measurements</p>
                <div className="sample-details">
                    <tr>
                        <td className='value-title'>d18O_cel</td>
                        <td>{selectedDoc['d18O_cel']}</td>
                        <td className='value-title'>d18O_wood</td>
                        <td>{selectedDoc['oxygyen']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>d15N_wood</td>
                        <td>{selectedDoc['nitrogen']}</td>
                        <td className='value-title'>N_wood</td>
                        <td>{selectedDoc['n_wood']}</td>

                    </tr>
                    <tr>
                        <td className='value-title'>d13C_wood</td>
                        <td>{selectedDoc['carbon']}</td>
                        <td className='value-title'>%C_wood</td>
                        <td>{selectedDoc['c_wood']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>d13C_cel</td>
                        <td>{selectedDoc['d13C_cel']}</td>
                        <td className='value-title'>%C_cel</td>
                        <td>{selectedDoc['c_cel']}</td>
                    </tr>
                </div>
            </div>

            <div id='qr-code'>
                 <QRCodeSVG value={url} />
                </div>

        </div>)
    }



    return (

        <div>
            <div className='sample-details-wrapper'>
                <p className='title'>Sample details</p>
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
                        <div className={tabShown === 0 ? 'tab-pane fade show active' : 'tab-pane fade'} id="details" role="tabpanel" aria-labelledby="details-tab"><DetailsTab /></div>
                        <div className={tabShown === 2 ? 'tab-pane fade show active' : 'tab-pane fade'} id="results" role="tabpanel" aria-labelledby="results-tab"><ResultsTab /></div>
                    </div>
                </div>

            </div>
        </div>)
}