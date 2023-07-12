"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState } from 'react';

export default function AddSample() {
    const [user, setUser] = useState({});

    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(user);
            setUser(user);
        }
        if (!user) {
            router.push('/login');
        }
    });


    function onCancleClick() {
        router.push('/samples');
    }
    function onCreateSampleClick() {

        const db = getFirestore();
        const internalCode = document.getElementById('internalCode')!.value;
        const docRef = doc(db, "verified_samples", internalCode);
        const date = new Date();
        const currentDateString = `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
        setDoc(docRef, {
            'code lab': internalCode,
            'Species': document.getElementById('scientificName')!.value,
            'Popular name': document.getElementById('popularName')!.value,
            'Site': document.getElementById('collectionSite')!.value,
            'State': document.getElementById('inputState')!.value,
            'lat': document.getElementById('inputLat')!.value,
            'long': document.getElementById('inputLon')!.value,
            'created_by': user.displayName,
            'current_step': '1. Drying process',
            'status': 'in_progress',
            'date_created': currentDateString,

        }).then(() => {
            const url = `./sample-details?id=${internalCode}`;
            router.push(url)
        })

    }

    function onUploadSamplesClick() {

    }

    function onFileChanged() {

    }

    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            
            <label htmlFor="formFile" className="form-label">Upload CSV file</label>
            <input capture onChange={onFileChanged} accept=".csv" className="form-control" type="file" id="formFile" />
            <button type="button" className="btn btn-primary">Upload samples</button>
            <p className="title">Create a new sample</p>
            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <form>
                    <div className="form-group">
                        <label htmlFor="internalCode">Internal code</label>
                        <input type="text" className="form-control" id="internalCode" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="scientificName">Scientific name</label>
                        <input type="text" className="form-control" id="scientificName" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="popularName">Popular name</label>
                        <input type="text" className="form-control" id="popularName" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="collectionSite">Collection site</label>
                        <input type="text" className="form-control" id="collectionSite" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputState">State</label>
                        <input type="text" className="form-control" id="inputState" />
                    </div>
                    <div className="form-row">

                        <div className="form-group latlon-input">
                            <label htmlFor="inputLat">Latitude</label>
                            <input type="text" className="form-control" id="inputLat" />
                        </div>
                        <div className="form-group latlon-input">
                            <label htmlFor="inputLon">Longitude</label>
                            <input type="text" className="form-control" id="inputLon" />
                        </div>
                    </div>
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