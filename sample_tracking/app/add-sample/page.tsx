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
import {initializeAppIfNecessary, getRanHex} from '../utils';
import { useSearchParams } from 'next/navigation'



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

    const [formData, setFormData] = useState({
        visibility: 'public',
        collected_by: 'supplier',
    });

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();

    let status = "completed";
    const searchParams = useSearchParams();
    if (typeof window !== "undefined") {
        const queryString = window.location.search;
        console.log("Querystring: " + queryString);
        const urlParams = new URLSearchParams(queryString);
        status = urlParams.get('status') ? urlParams.get('status') : searchParams.get('status');
    }

    if (sampleId.length < 1) {
        setSampleID(getRanHex(20));
    }

    useEffect(() => {
        if (!userData.role) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log(user);
                    setUser(user);
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
                    })
                }
                if (!user) {
                    router.push('/login');
                }
            });
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
            org_name: userData.org,
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
        setPageTitle("Sample created!")

    }

    function handleChange(formState: {}, currentTabRef: Element) {
        setFormData(formState);
    }


    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <p className="title">{pageTitle}</p>
            <div className="sample-details-form">
                {pageTitle === "Create a new sample" && <p>Define the details of your new sample</p>}
                {userData && <form id="sample-form">
                    <SampleDataInput baseState={formData}
                        onStateUpdate={(state) => handleChange(state)}
                        onActionButtonClick={(id: string) => onCreateSampleClick(id)}
                        actionButtonTitle="Create sample"
                        isNewSampleForm={true}
                        userData={userData}
                        sampleId={sampleId} />
                </form>}
            </div>
        </div>
    )
}