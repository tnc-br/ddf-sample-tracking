"use client";
import Nav from '../nav';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { useSearchParams, usePathname } from 'next/navigation'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState } from 'react';
import 'jquery';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useRouter } from 'next/navigation'

export default function SampleDetails() {

    const [selectedDoc, setDoc] = useState({});
    const [hasStartedRequest, setHasStartedRequest] = useState(false);
    const [tabShown, setTabShown] = useState(0);
    const [userData, setUserData] = useState({ role: '', org: '' });

    function updateStateDoc(data: {}) {
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


    const searchParams = useSearchParams();
    const sampleId = searchParams.get('id');
    const trusted = searchParams.get('trusted');
    console.log("sampleId: " + sampleId);

    const app = initializeApp(firebaseConfig);
    const db = getFirestore();


    const auth = getAuth();
    if (userData.role.length < 1) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login');
            } else {
                const userDocRef = doc(db, "users", user.uid);
                getDoc(userDocRef).then((docRef) => {
                    if (docRef.exists()) {
                        const docData = docRef.data();
                        if (!docData.role) {
                            router.push('/tasks');
                        } else {
                            setUserData(docData);
                        }
                    }
                })
            }
        });
    }


    let docRef;
    if (trusted === 'trusted') {
        docRef = doc(db, "trusted_samples", sampleId!)
    } else if (trusted === 'untrusted') {
        docRef = doc(db, "untrusted_samples", sampleId!);
    } else if (trusted === 'unknown') {
        docRef = doc(db, "unknown_samples", sampleId!);
    }



    if (Object.keys(selectedDoc).length < 1 && !hasStartedRequest && userData.role.length > 0 && docRef) {

        // setHasStartedRequestTrue();
        getDoc(docRef).then((docRef) => {
            if (docRef.exists()) {
                console.log('updated data');
                updateStateDoc(docRef.data());
            } else {
                console.log('couldnt find data');
            }
            console.log(docRef);
        }).catch((error) => {
            console.log(error);
        })
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

    function processCompletedButtonPressed() {
        const nextStep = processSteps[processSteps.indexOf(selectedDoc.current_step) + 1];
        updateDoc(docRef, {
            'current_step': nextStep,
        });
        updateCurrentStep(nextStep);
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

    function ProcessTab() {
        return (<div>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <div className="accordion" id="accordionPanelsStayOpenExample">
                {processStep('Drying process', 0, 'headingOne', 'collapseOne')}
                {processStep('Lamination', 1, 'headingTwo', 'collapseTwo')}
                {processStep('Chopping & homogenization', 2, 'headingThree', 'collapseThree')}
                {processStep('Chemical preparation', 3, 'headingFour', 'collapseFour')}
                {processStep('Weighing', 4, 'headingFive', 'collapseFive')}
                {processStep('Encapsulation', 5, 'headingSix', 'collapseSix')}
                {processStep('Mass spectrometer & data return', 6, 'headingSeven', 'collapseSeven')}
            </div>
        </div>)

    }

    function ResultsTab() {
        return (<div>Results</div>)

    }

    function DetailsTab() {

        return (<div>
            <table className="table table-borderless">
                <tbody>
                    <tr>
                        <td className='value-title'>Last updated by</td>
                        <td>{selectedDoc['last_updated_by']}</td>
                        <td className='value-title'>Collection site</td>
                        <td>{selectedDoc['site']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Scientific name</td>
                        <td>{selectedDoc['species']}</td>
                        <td className='value-title'>City</td>
                        <td>{selectedDoc['state']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Date created</td>
                        <td>{selectedDoc['created_on']}</td>
                        <td className='value-title'>Latitude</td>
                        <td>{selectedDoc['lat']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Organization</td>
                        <td>{selectedDoc['org']}</td>
                        <td className='value-title'>Longitude</td>
                        <td>{selectedDoc['lon']}</td>
                    </tr>
                    <tr>
                        <td className='value-title'>Created by</td>
                        <td>{selectedDoc['created_by']}</td>
                        <td className='value-title'>Date completed</td>
                        <td>{selectedDoc['date_completed'] ? selectedDoc['date_completed'] : '-'}</td>
                    </tr>
                </tbody>

            </table>

        </div>)
    }



    return (

        <div>
            <Nav />
            <div className='sample-details-wrapper'>
                <p className='title'>Sample details</p>
                <div>
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={tabShown === 0 ? 'nav-link active' : 'nav-link'} onClick={showDetails} id="details-tab" data-toggle="tab" href="#details" role="tab" aria-controls="details" aria-selected="true">Details</a>
                        </li>
                        <li className="nav-item">
                            <a className={tabShown === 1 ? 'nav-link active' : 'nav-link'} onClick={showProcess} id="process-tab" data-toggle="tab" href="#process" role="tab" aria-controls="process" aria-selected="false">Process</a>
                        </li>
                        <li className="nav-item">
                            <a className={tabShown === 2 ? 'nav-link active' : 'nav-link'} onClick={showResults} id="results-tab" data-toggle="tab" href="#results" role="tab" aria-controls="results" aria-selected="false">Results</a>
                        </li>
                    </ul>
                    <div className="tab-content" id="myTabContent">
                        <div className={tabShown === 0 ? 'tab-pane fade show active' : 'tab-pane fade'} id="details" role="tabpanel" aria-labelledby="details-tab"><DetailsTab /></div>
                        <div className={tabShown === 1 ? 'tab-pane fade show active' : 'tab-pane fade'} id="process" role="tabpanel" aria-labelledby="process-tab"><ProcessTab /></div>
                        <div className={tabShown === 2 ? 'tab-pane fade show active' : 'tab-pane fade'} id="results" role="tabpanel" aria-labelledby="results-tab"><ResultsTab /></div>
                    </div>
                </div>

            </div>

        </div>)
}