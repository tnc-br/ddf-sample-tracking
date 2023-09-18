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
import { initializeAppIfNecessary, getRanHex, getPointsArrayFromSampleResults, type UserData, Sample } from '../utils';
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { setSample } from '../firebase_utils';

/**
 * Component to handle adding a complete or incomplet sample. It uses the SampleDataInput
 * subcomponent to handle the data input. 
 * The type of sample being added (complete vs incomplete is passed via the search param
 * 'status' which is either 'completed' or 'in_progress').
 * 
 * The user's data is fetched when rendering the component. If the user is not logged in
 * they are forwarded to the main page, if they are logged in, their data is stored in State
 * to use when adding the new sample to the Samples collection. 
 * 
 * Once the sample data is correctly entered, a new sample is added to the 'Samples' collection. 
 * 
 */
export default function AddSample() {
    const [userData, setUserdata] = useState({} as UserData);
    const [currentTab, setCurrentTab] = useState(1);
    const [sampleId, setSampleID] = useState('');
    const [sampleCreationFinished, setSampleCreationFinished] = useState(false);

    const [formData, setFormData] = useState({
        visibility: 'private',
        collected_by: 'supplier',
    });

    const router = useRouter();
    initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    let status = "completed";
    const searchParams = useSearchParams();
    if (typeof window !== "undefined" && !formData.trusted) {
        const queryString = window.location.search;
        console.log("Querystring: " + queryString);
        const urlParams = new URLSearchParams(queryString);
        status = urlParams.get('status') ? urlParams.get('status') : searchParams.get('status');
        setFormData({
            ...formData,
            trusted: status === 'originVerification' ? 'untrusted' : 'trusted',
        });
    }

    if (sampleId.length < 1) {
        setSampleID(getRanHex(20));
    }

    useEffect(() => {
        if (!userData.role || userData.role.length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            const docData = docRef.data();
                            if (!docData.org) {
                                router.push('/samples');
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
    }, []);

    /**
     * Adds a new sample to the correct collection depending on if the sample is trusted, untrusted or unknown. 
     * All isotope result values are converted to an array of floats and the lat/lon are converted to floats before the data is added. 
     * 
     * @param sampleId The ID of the new sample 
     * @param formSampleData The data of the sample being added 
     */
    function onCreateSampleClick(sampleId: string, formSampleData: Sample) {
        console.log("form sample data: " + formSampleData);
        if (!formSampleData) return;
        if (!sampleId) {
            console.log("Error: SampleId not provided when trying to create sample");
        }
        const user = auth.currentUser;
        if (!user) return;
        const date = new Date();
        const currentDateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`

        const sampleData = {
            ...formSampleData,
            created_by: auth.currentUser!.uid,
            created_on: currentDateString,
            last_updated_by: userData.name,
            org: userData.org,
            org_name: userData.org_name ? userData.org_name : '',
            created_by_name: userData.name,
            code_lab: sampleId,
            visibility: 'private',
            d18O_wood: formSampleData.d18O_wood ? formSampleData.d18O_wood.map((value: string) => parseFloat(value)) : [],
            d15N_wood: formSampleData.d15N_wood ? formSampleData.d15N_wood.map((value: string) => parseFloat(value)) : [],
            n_wood: formSampleData.n_wood ? formSampleData.n_wood.map((value: string) => parseFloat(value)) : [],
            d13C_wood: formSampleData.d13C_wood ? formSampleData.d13C_wood.map((value: string) => parseFloat(value)) : [],
            c_wood: formSampleData.c_wood ? formSampleData.c_wood.map((value: string) => parseFloat(value)) : [],
            c_cel: formSampleData.c_cel ? formSampleData.c_cel.map((value: string) => parseFloat(value)) : [],
            d13C_cel: formSampleData.d13C_cel ? formSampleData.d13C_cel.map((value: string) => parseFloat(value)) : [],
            d18O_cel: formSampleData.d18O_cel ? formSampleData.d18O_cel.map((value: string) => parseFloat(value)) : [],
            lat: formSampleData.lat ? parseFloat(formSampleData.lat) : '',
            lon: formSampleData.lon ? parseFloat(formSampleData.lon) : '',
            points: getPointsArrayFromSampleResults(formSampleData)
        };
        setSample(sampleData.trusted, sampleId, sampleData);
        setSampleCreationFinished(true);
        setFormData(sampleData);
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
                    {t('addNewSample')}
                </div>
            </div>
            <div >

                <div className="sample-details-form-wrapper">
                    {!sampleCreationFinished && <div>
                        {formData.status !== 'concluded' && <p className="sample-details-section-title">{t('addDetails')}</p>}
                        <p className="sample-details-requirements">{t('requiredFields')}</p>
                    </div>}
                    {sampleCreationFinished && <div>
                        <div className='sample-added-title'>
                            {t('newSampleAdded')}
                        </div>
                        <div className='qr-instructions'>
                            {t('qrPrintInstructions')}
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
                                {t('print')}
                            </div>
                        </div>

                    </div>}

                    {userData && !sampleCreationFinished && <div id="sample-form">
                        <SampleDataInput baseState={formData}
                            onActionButtonClick={(id: string, formSampleData: Sample) => onCreateSampleClick(id, formSampleData)}
                            onTabChange={(tab) => handleTabChange(tab)}
                            actionButtonTitle="Create sample"
                            isNewSampleForm={true}
                            sampleId={sampleId}
                            isCompletedSample={formData.status === 'concluded' ? true : false} />
                    </div>}
                </div>
            </div>

        </div>
    )
}
