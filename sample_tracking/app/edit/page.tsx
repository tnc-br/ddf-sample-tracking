"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, updateDoc, getFirestore, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { speciesList } from '../species_list';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { statesList } from '../states_list';
import { municipalitiesList } from '../municipalities_list';
import SampleDataInput from '../sample_data_input';
import { useSearchParams } from 'next/navigation'
import { type Sample, type UserData, confirmUserLoggedIn, initializeAppIfNecessary } from '../utils';


export default function Edit() {
    const [userData, setUserdata] = useState({} as UserData);
    const [currentTab, setCurrentTab] = useState(1);
    const [selectedDoc, setDoc] = useState({} as Sample);

    const [formData, setFormData] = useState({
        visibility: 'public',
        collected_by: 'supplier'
    });

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();

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

    useEffect(() => {
        if (!userData.role) {
            onAuthStateChanged(auth, (user) => {
                setUserdata(confirmUserLoggedIn(user, db, router));
            });
        }
    });

    let docRef = getDocRefForTrustedValue(trusted!, db, sampleId!);
    if (Object.keys(selectedDoc).length < 1 && !userData.role && docRef) {
        getDoc(docRef).then((docRef) => {
            if (docRef.exists()) {
                setFormData({
                    ...docRef.data(),
                    trusted: trusted,
                } as Sample);
            } else {
                console.log('Error: Unable to find data for specified sample');
                alert("There was an internal error and the requested sample could not be found.");
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    function onUpdateSampleClick() {
        let docRef = getDocRefForTrustedValue(trusted!, db, sampleId!);
        const date = new Date();
        const currentDateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
        const user = auth.currentUser;
        if (!user) return;
        const docData = {
            ...formData,
            last_updated_by: user.displayName,
            last_updated_on: currentDateString,
        }
        updateDoc(docRef, docData).then(() => {
            const url = `./sample-details?trusted=${trusted}&id=${sampleId}`;
            router.push(url)
        })

    }

    function handleChange(formState: Sample) {
        setFormData(formState);
    }


    return (
        <div className="add-sample-page-wrapper">
            <p className="title">Edit sample</p>


            <div className="edit-tabs-wrapper">
                <div className="edit-tab-group">
                    <div className={currentTab === 1 ? "edit-tab-wrapper edit-current-tab" : "edit-tab-wrapper"}>
                        <div className="edit-slate-layer">
                            <div className="edit-tab-content">
                                <div className='edit-tab-text'>
                                    Basic info
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={currentTab === 2 ? "edit-tab-wrapper edit-current-tab" : "edit-tab-wrapper"}>
                        <div className="edit-slate-layer">
                            <div className="edit-tab-content">
                                <div className='edit-tab-text'>
                                    Sample measurements
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={currentTab === 3 ? "edit-tab-wrapper edit-current-tab" : "edit-tab-wrapper"}>
                        <div className="edit-slate-layer">
                            <div className="edit-tab-content">
                                <div className='edit-tab-text'>
                                    Results
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <div>
                    <SampleDataInput baseState={formData}
                        onStateUpdate={(state) => handleChange(state)}
                        onActionButtonClick={(evt: any) => onUpdateSampleClick()}
                        actionButtonTitle="Update sample"
                        userData={userData}
                        sampleId={sampleId}
                        isCompletedSample={true} 
                        onTabChange={(tab) => setCurrentTab(tab)} />
                </div>
            </div>
        </div>
    )
}