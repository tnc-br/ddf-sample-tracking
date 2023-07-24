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
import { useState } from 'react';
import {speciesList} from '../species_list';

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
    const [speciesNames, setSpeciesNames] = useState(['']);

    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();
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

    if (speciesNames.length < 2) {
        setSpeciesNames(getSpeciesNames());
    }

    function onCancleClick() {
        router.push('/samples');
    }

    function onCreateSampleClick() {
        if (!formIsValid()) return;
        const internalCode = getRanHex(20);
        const sampleTrustValue = (document.getElementById('sampleTrustSelected')! as HTMLInputElement).value;
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
        setDoc(docRef, {
            'code_lab': internalCode,
            'visibility': (document.getElementById('sampleVisibility')! as HTMLInputElement).value,
            'sample_name': (document.getElementById('sampleName')! as HTMLInputElement).value,
            'species': (document.getElementById('treeSpecies')! as HTMLInputElement).value,
            'site': (document.getElementById('collectionSite') as HTMLInputElement) ? (document.getElementById('collectionSite')! as HTMLInputElement).value : '-',
            'state': (document.getElementById('inputState') as HTMLInputElement) ? (document.getElementById('inputState')! as HTMLInputElement).value : '-',
            'lat': (document.getElementById('inputLat')! as HTMLInputElement) ? (document.getElementById('inputLat')! as HTMLInputElement).value : '-',
            'lon': (document.getElementById('inputLon')! as HTMLInputElement) ? (document.getElementById('inputLon')! as HTMLInputElement).value : '-',
            'date_of_harvest': (document.getElementById('dateOfHarvest')! as HTMLInputElement) ? (document.getElementById('dateOfHarvest')! as HTMLInputElement).value : '-',
            'created_by': user.uid,
            'current_step': '1. Drying process',
            'status': 'in_progress',
            'trusted': sampleTrustValue,
            'created_on': currentDateString,
            'last_updated_by': userData.name,
            'org': userData.org,
            'org_name': userData.org_name ? userData.org_name : '-',
            'created_by_name': userData.name,

        }).then(() => {
            const url = `./sample-details?trusted=${sampleTrustValue}&id=${internalCode}`;
            router.push(url)
        })

    }

    function formIsValid(): boolean {
        let isValid = true;
        const sampleTrustValue = (document.getElementById('sampleTrustSelected')! as HTMLInputElement).value;
        const sampleName = (document.getElementById('sampleName')! as HTMLInputElement).value;
        let docRef;
        if (sampleName.length < 1 || sampleName.length > 100) {
            document.getElementById('sampleName')!.classList.add('invalid');
            isValid = false;
        }
        if (sampleTrustValue === "trusted") {
            const sampleLat = document.getElementById('inputLat') as HTMLInputElement;
            if (sampleLat!.value.length < 1) {
                sampleLat!.classList.add('invalid');
                isValid = false;
            }
            const inputLonEl = document.getElementById('inputLon') as HTMLInputElement;
            if (inputLonEl!.value.length < 1) {
                inputLonEl!.classList.add('invalid');
                isValid = false;
            }
            const dateOfHarvestEl = document.getElementById('dateOfHarvest') as HTMLInputElement;
            if (dateOfHarvestEl!.value.length < 1) {
                dateOfHarvestEl?.classList.add('invalid');
                isValid = false;
            }
            const collectionSiteEl = document.getElementById('collectionSite') as HTMLInputElement;
            if (collectionSiteEl!.value.length < 1) {
                collectionSiteEl?.classList.add('invalid');
                isValid = false;
            }
            const collectionStateEl = document.getElementById('inputState') as HTMLInputElement;
            if (collectionStateEl!.value.length < 1) {
                collectionStateEl?.classList.add('invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    function onSampleTrustChange(evt: any) {
        setSampletrust(evt.target.value);
    }

    function onRequiredFieldChange(evt: any) {
        if (evt.target.classList.contains('invalid')) {
            evt.target.classList.remove('invalid');
        }
    }

    function getRanHex(size: number): string {
        let result = [];
        let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

        for (let n = 0; n < size; n++) {
            result.push(hexRef[Math.floor(Math.random() * 16)]);
        }
        return result.join('');
    }

    function getSpeciesNames(): string[] {
        const species = speciesList.split('\n')
        return species;

    }

    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />

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
                    <label htmlFor="sampleVisibility" defaultValue={sampleTrust}>Sample visibility</label>
                    <select className="form-select" id="sampleVisibility" aria-label="Select sample trusted status">
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
                                return (<option>{speciesName}</option>)
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

                </form>
            </div>
        </div>
    )
}