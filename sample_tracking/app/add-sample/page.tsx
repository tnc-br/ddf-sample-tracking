"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { initializeApp, getApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { speciesList } from '../species_list';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { statesList } from '../states_list';
import { municipalitiesList } from '../municipalities_list';
import SampleDataInput from '../sample_data_input';
import { initializeAppIfNecessary, getRanHex, confirmUserLoggedIn } from '../utils';
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { TextField } from '@mui/material';



type UserData = {
    name: string,
    org: string,
    org_name: string,
    role: string,
}

export default function AddSample() {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampletrust] = useState('untrusted');
    // const [isMember, setIsMember] = useState(false);
    const [userData, setUserdata] = useState({} as UserData);
    const [currentTab, setCurrentTab] = useState(1);
    const [pageTitle, setPageTitle] = useState("Create a new sample");
    const [sampleId, setSampleID] = useState('');
    const [sampleCreationFinished, setSampleCreationFinished] = useState(false);

    const [formData, setFormData] = useState({
        visibility: 'public',
        collected_by: 'supplier',
    });

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    let status = "completed";
    const searchParams = useSearchParams();
    if (typeof window !== "undefined" && !formData.status) {
        const queryString = window.location.search;
        console.log("Querystring: " + queryString);
        const urlParams = new URLSearchParams(queryString);
        status = urlParams.get('status') ? urlParams.get('status') : searchParams.get('status');
        setFormData({
            ...formData,
            status: status === 'completed' ? 'concluded' : 'in_progress',
        });
    }

    if (sampleId.length < 1) {
        setSampleID(getRanHex(20));
    }

    useEffect(() => {
        // if (!userData.role) {
        //     onAuthStateChanged(auth, (user) => {
        //         setUserdata(confirmUserLoggedIn(user, db, router));
        //     });
        // }
        if (!userData.role || userData.role.length < 1) {
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
                                setUserdata(docData as UserData);
                            }
                        }
                    });
                }
                if (!user) {
                    router.push('/login');
                }
            })
        }
    });

    function onCancleClick() {
        router.replace('/samples');
    }

    function sampleHasRequiredFieldsSet(): boolean {
        return true;
    }

    function onCreateSampleClick(sampleId: string) {
        if (!sampleId) {
            console.log("Error: SampleId not provided when trying to create sample");
        }
        if (!sampleHasRequiredFieldsSet()) {
            alert("Not all required fields are filled out to submit a sample.");
            return;
        }
        const user = auth.currentUser;
        if (!user) return;
        const date = new Date();
        const currentDateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
        const sampleData = {
            ...formData,
            created_by: auth.currentUser!.uid,
            created_on: currentDateString,
            last_updated_by: userData.name,
            org: userData.org,
            org_name: userData.org_name,
            created_by_name: userData.name,
            code_lab: sampleId,
            oxygen: formData.oxygen ? formData.oxygen.map((value: string) => parseFloat(value)) : [],
            nitrogen: formData.nitrogen ? formData.nitrogen.map((value: string) => parseFloat(value)) : [],
            n_wood: formData.n_wood ? formData.n_wood.map((value: string) => parseFloat(value)) : [],
            carbon: formData.carbon ? formData.carbon.map((value: string) => parseFloat(value)) : [],
            c_wood: formData.c_wood ? formData.c_wood.map((value: string) => parseFloat(value)) : [],
            c_cel: formData.c_cel ? formData.c_cel.map((value: string) => parseFloat(value)) : [],
            d13C_cel: formData.d13C_cel ? formData.d13C_cel.map((value: string) => parseFloat(value)) : [],
            lat: formData.lat ? parseFloat(formData.lat) : '',
            lon: formData.lon ? parseFloat(formData.lon) : '',
        };
        // if (!formIsValid()) return;
        const sampleTrustValue = formData.trusted;
        if (!sampleTrustValue) return;
        let docRef;
        if (sampleTrustValue === "trusted") {
            docRef = doc(db, "trusted_samples", sampleId);
        } else if (sampleTrustValue === "untrusted") {
            docRef = doc(db, "untrusted_samples", sampleId);
        } else {
            docRef = doc(db, "unknown_samples", sampleId);
        }
        setDoc(docRef, sampleData);
        setSampleCreationFinished(true);

    }

    function handleChange(formState: {}, currentTab: number) {
        setFormData(formState);
    }

    function handleTabChange(newTab: number) {
        setCurrentTab(newTab);
    }

    function handlePrint() {
        const mywindow = window.open('', 'PRINT', 'height=400,width=600');
        if (!mywindow) return;
        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write('<h1>' + document.title + '</h1>');
        mywindow.document.write(document.getElementById('qr-code').innerHTML);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        mywindow.print();
        mywindow.close();

        return true;
    }

    const url = `timberid.org/sample-details?trusted=${formData.trusted}&id=${sampleId}`;
    const viewSampleUrl = `/sample-details?trusted=${formData.trusted}&id=${sampleId}`;

    return (
        <div>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <div className="page-title-wrapper">
                <Link href="./samples" className="close-icon"><span className="material-symbols-outlined add-sample-close-icon">
                    close
                </span></Link>
                <div className="page-title-text">
                    Add new sample
                </div>
            </div>
            <div >

                

                {/* <p className="title">{pageTitle}</p> */}
                <div className="sample-details-form-wrapper">
                {formData.status === 'concluded' && !sampleCreationFinished && <div className="add-sample-tab-bar">
                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab >= 1 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    1
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab >= 1 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                Add details
                                </div>
                            </div>
                        </div>
                        <div className='divider-wrapper'><div className='divider'></div></div>

                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab >= 2 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    2
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab >= 2 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                Add sample measurements
                                </div>
                            </div>
                        </div>
                        <div className='divider-wrapper'><div className='divider'></div></div>

                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab === 3 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    3
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab === 3 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                Review and create
                                </div>
                            </div>
                        </div>

                    </div>}
                    {!sampleCreationFinished && <div>
                        {formData.status !== 'concluded' && <p className="sample-details-section-title">Add details</p>}
                        <p className="sample-details-requirements">* required fields</p>
                    </div>}
                    {sampleCreationFinished && <div>
                        <div className='sample-added-title'>
                            Your new sample has been added!
                        </div>
                        <div className='qr-instructions'>
                            Print and paste this QR code on the sample to be analyzed
                        </div>
                        <div className="qr-code" id="qr-code">
                            <QRCodeSVG value={url} />
                        </div>
                        <div className='buttons-wrapper'>
                            <Link className="view-sample-link" href={viewSampleUrl}>View sample</Link>
                            <div onClick={handlePrint} id="print-button" className="add-sample-print-button">
                                <span className="material-symbols-outlined">
                                    print
                                </span>
                                Print
                            </div>
                        </div>

                    </div>}

                    {/* {formData.status === 'concluded' && <div className="tabs">
                        <div className={currentTab === 1 ? "current_tab" : "unselected_tab"}>{t('basicInfo')}</div>
                        <div className={currentTab === 2 ? "current_tab" : "unselected_tab"}>{t('sampleMeasurements')}</div>
                        {formData.status === 'concluded' && <div className={currentTab === 3 ? "current_tab" : "unselected_tab"}>{t('sampleResults')}</div>}
                        <div className={currentTab === 4 ? "current_tab" : "unselected_tab"}>{t('createSample')}</div>
                    </div>} */}
                    

                    {userData && !sampleCreationFinished && <div id="sample-form">
                        <SampleDataInput baseState={formData}
                            onStateUpdate={(state) => handleChange(state)}
                            onActionButtonClick={(id: string) => onCreateSampleClick(id)}
                            onTabChange={(tab) => handleTabChange(tab)}
                            actionButtonTitle="Create sample"
                            isNewSampleForm={true}
                            userData={userData}
                            sampleId={sampleId}
                            isCompletedSample={formData.status === 'concluded' ? true : false} />
                    </div>}
                </div>
            </div>

        </div>
    )
}