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

type UserData = {
    name: string,
    org: string,
    org_name: string,
    role: string,
}

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

export default function Edit() {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampletrust] = useState('untrusted');
    // const [isMember, setIsMember] = useState(false);
    const [userData, setUserdata] = useState({} as UserData);
    const [currentTab, setCurrentTab] = useState(1);
    const [selectedDoc, setDoc] = useState({} as Sample);

    const [formData, setFormData] = useState({
        visibility: 'public',
        collected_by: 'supplier'
    });

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

    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();

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

    let docRef =  doc(db, "trusted_samples", sampleId!);	
    if (trusted === 'untrusted') {	
        docRef = doc(db, "untrusted_samples", sampleId!);	
    } else if (trusted === 'unknown') {	
        docRef = doc(db, "unknown_samples", sampleId!);	
    }	
    if (Object.keys(selectedDoc).length < 1 && !userData.role && docRef) {	
        // setHasStartedRequestTrue();	
        getDoc(docRef).then((docRef) => {	
            if (docRef.exists()) {	
                console.log('updated data');	
                setFormData(docRef.data() as Sample);	
            } else {	
                console.log('couldnt find data');	
            }	
            console.log(docRef);	
        }).catch((error) => {	
            console.log(error);	
        })	
    }	

    function onCancleClick() {
        router.push('/samples');
    }

    function onUpdateSampleClick() {
        const internalCode = formData.code_lab;
        const sampleTrustValue = formData.trusted;
        let docRef;
        if (sampleTrustValue === "trusted") {
            docRef = doc(db, "trusted_samples", internalCode);
        } else if (sampleTrustValue === "untrusted") {
            docRef = doc(db, "untrusted_samples", internalCode);
        } else {
            docRef = doc(db, "unknown_samples", internalCode);
        }
        const date = new Date();
        const currentDateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
        const user = auth.currentUser;
        if (!user) return;
        updateDoc(docRef, formData).then(() => {
            const url = `./sample-details?trusted=${sampleTrustValue}&id=${internalCode}`;
            router.push(url)
        })

    }

    function getRanHex(size: number): string {
        let result = [];
        let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

        for (let n = 0; n < size; n++) {
            result.push(hexRef[Math.floor(Math.random() * 16)]);
        }
        return result.join('');
    }

    function handleChange(formState: {}) {
        setFormData(formState);
      }


    return (
        <div className="add-sample-page-wrapper">
            <p className="title">Edit sample</p>
            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <div>
                <SampleDataInput baseState={formData}
                        onStateUpdate={(state) => handleChange(state)}
                        onActionButtonClick={(evt: any) => onUpdateSampleClick()}
                        actionButtonTitle="Update sample" />
                </div>
            </div>
        </div>
    )
}