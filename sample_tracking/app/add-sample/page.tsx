"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { speciesList } from '../species_list';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { statesList } from '../states_list';
import { municipalitiesList } from '../municipalities_list';
import SampleDataInput from '../sample_data_input';

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

    const [formData, setFormData] = useState({
        visibility: 'public',
        collected_by: 'supplier',
    });

    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();
<<<<<<< HEAD
=======
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
                            router.replace('/tasks');
                        } else {
                            setUserdata(docData as UserData);
                        }
                    }
                })
            }
            if (!user) {
                router.replace('/login');
            }
        });
    }
>>>>>>> main

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

    function onCreateSampleClick() {
        if (!sampleHasRequiredFieldsSet()) {
            alert("Not all required fields are filled out to submit a sample.");
            return;
        }
        const user = auth.currentUser;
        if (!user) return;
        const date = new Date();
        const currentDateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
        const internalCode = getRanHex(20);
        const sampleData = {
            ...formData,
            created_by: auth.currentUser!.uid,
            created_on: currentDateString,
            last_updated_by: userData.name,
            org_name: userData.org,
            created_by_name: userData.name,
            code_lab: internalCode,
        };
        // if (!formIsValid()) return;
        const sampleTrustValue = formData.trusted;
        if (!sampleTrustValue) return;
        let docRef;
        if (sampleTrustValue === "trusted") {
            docRef = doc(db, "trusted_samples", internalCode);
        } else if (sampleTrustValue === "untrusted") {
            docRef = doc(db, "untrusted_samples", internalCode);
        } else {
            docRef = doc(db, "unknown_samples", internalCode);
        }
        setDoc(docRef, sampleData).then(() => {
            const url = `./sample-details?trusted=${sampleTrustValue}&id=${internalCode}`;
            router.replace(url)
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

    function handleChange(formState: {}, currentTabRef: Element) {
        setFormData(formState);
    }


    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
<<<<<<< HEAD
            <p className="title">Create a new sample</p>
            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <form id="sample-form">
                    <SampleDataInput baseState={formData}
                        onStateUpdate={(state) => handleChange(state)}
                        onActionButtonClick={(evt: any) => onCreateSampleClick()}
                        actionButtonTitle="Create sample" />
=======

            {/* <label htmlFor="formFile" className="form-label">Upload CSV file</label>
            <input capture onChange={onFileChanged} accept=".csv" className="form-control" type="file" id="formFile" />
            <button type="button" className="btn btn-primary">Upload samples</button> */}
            <p className="title">Create a new sample</p>
            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <form>
                    <div className="form-group">
                        <label htmlFor="sampleName">Sample name</label>
                        <input type="text" className="form-control" onChange={onRequiredFieldChange} id="sampleName" />
                    </div>
                    <label htmlFor="sampleTrustSelected" defaultValue={sampleTrust}>Is this sample trusted?</label>
                    <select onChange={onSampleTrustChange} className="form-select" id="sampleTrustSelected" aria-label="Select sample trusted status">
                        <option value="untrusted">No</option>
                        <option value="trusted">Yes</option>
                        <option value="unknown">Unkown</option>
                    </select>
                    <label htmlFor="sampleVisibility">Sample visibility</label>
                    <select className="form-select" id="sampleVisibility" aria-label="Select sample visibility">
                        <option value="public">Publicly available</option>
                        <option value="logged_in">Available to any logged-in user</option>
                        <option value="organization">Available to my organization only</option>
                        <option value="private">Private to me and admins only</option>
                    </select>
                    {/* <div className="form-group">
                        <label htmlFor="internalCode">Internal code</label>
                        <input type="text" className="form-control" id="internalCode" />
                    </div> */}
                    <div className="form-group">
                        <datalist id="suggestions">
                            {speciesNames.map((speciesName: string) => {
                                return (<option key={speciesName}>{speciesName}</option>)
                            })}
                        </datalist>
                        <label htmlFor="treeSpecies">Tree species</label>
                        <input type="text" autoComplete="on" list="suggestions" className="form-control" id="treeSpecies" />
                    </div>
                    {sampleTrust !== "unknown" && <div>
                        <div className="form-group">
                            <label htmlFor="collectionSite">Collection site</label>
                            <input type="text" className="form-control" onChange={onRequiredFieldChange} id="collectionSite" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputState">State</label>
                            <input type="text" className="form-control" onChange={onRequiredFieldChange} id="inputState" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateOfHarvest">Date of harvest</label>
                            <input type="text" className="form-control" onChange={onRequiredFieldChange} id="dateOfHarvest" />
                        </div>
                        <div className="form-row">

                            <div className="form-group latlon-input" id="inputLatFormGroup">
                                <label htmlFor="inputLat">Latitude</label>
                                <input type="text" className="form-control" onChange={onRequiredFieldChange} id="inputLat" />
                                <div className="invalid-feedback">
                                    Please provide a latitude.
                                </div>
                            </div>
                            <div className="form-group latlon-input">
                                <label htmlFor="inputLon">Longitude</label>
                                <input type="text" className="form-control" onChange={onRequiredFieldChange} id="inputLon" />
                                <div className="invalid-feedback">
                                    Please provide a longitude.
                                </div>
                            </div>
                        </div>
                    </div>}

                    <p className='subtitle'>Assign a QR code</p>
                    <p className='qrcode-text'>Print and paste this QR code on the sample to be analyzed</p>
                    <QRCodeSVG value="http://timberid.org" />
                    <div className='print-button'><span className="material-symbols-outlined">
                        print
                    </span> Print</div>
                    <div className='submit-buttons'>
                        <button type="button" onClick={onCancleClick} className="btn btn-outline-primary">Cancel</button>
                        <button type="button" onClick={onCreateSampleClick} className="btn btn-primary">Create sample</button>
                    </div>

>>>>>>> main
                </form>
            </div>
        </div>
    )
}