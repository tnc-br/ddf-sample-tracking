
"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import './styles.css';
import { useState, useEffect } from 'react';
import { firebaseConfig } from './firebase_config';
import { getFirestore, getDoc, doc, writeBatch } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import './i18n/config';
import Papa from 'papaparse';
import { type Sample, type UserData, validateImportedEntry, getRanHex } from './utils';
import { ExportToCsv } from 'export-to-csv';

export default function ImportSamples() {
    const [userData, setUserData] = useState(null as UserData | null)

    const [errorSamples, setErrorSamples] = useState(null as Sample[] | null);

    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(csvOptions);


    const originValues = {
        unknown: 'unknown',
        known: 'trusted',
        uncertain: 'untrusted'
    }

    function onImportSuccessBar() {
        return (<div className="import-success-status-wrapper success-background-color">
            <div className='import-status-icon-wrapper'>
                <div className='import-status-icon'>
                    <span className="material-symbols-outlined import-status-icon icon-color-green">
                        check_circle
                    </span>
                </div>
            </div>
            <div className='import-status-text-wrapper'>
                <div className='import-status-text text-color-green'>
                    Successfully imported file
                </div>
            </div>
            <div className='import-status-actions-wrapper'>
                <div className='import-status-actions'>
                    <div onClick={handleCloseBarClick} className="import-success-status-button pointer">
                        <div className='import-status-button-slate-layer'>
                            <div className='import-status-button-text'>
                                Great!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    }

    function onImportErrorBar() {
        return (
            <div className="import-success-status-wrapper error-background-color">
                <div className='import-status-icon-wrapper'>
                    <div className='import-status-icon'>
                        <span className="material-symbols-outlined import-status-icon icon-color-red">
                            error
                        </span>
                    </div>
                </div>
                <div className='import-status-text-wrapper'>
                    <div className='import-status-text'>
                        File not uploaded because we noticed errors in the spreadsheet. Please download the sheet to see the errors and reupload.
                    </div>
                </div>
                <div className='import-status-actions-wrapper'>
                    <div className='import-status-actions'>
                        <div onClick={handleCloseBarClick} className="import-cancel-button pointer">
                            <div className='import-status-button-slate-layer'>
                                <div className='import-cancel-button-text'>
                                    Cancel
                                </div>
                            </div>
                        </div>
                        <div onClick={handleDownloadClick} className="import-error-status-button icon-color-red pointer">
                            <div className='import-status-button-slate-layer'>
                                <div className='import-status-button-text'>
                                    Download
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    function handleDownloadClick() {
        if (errorSamples) {
            csvExporter.generateCsv(errorSamples);
        }

    }

    function handleCloseBarClick() {
        const statusBarWrapper = document.getElementById('import-status-bar');
        if (statusBarWrapper && statusBarWrapper.hasChildNodes()) {
            statusBarWrapper.removeChild(statusBarWrapper.firstChild!)
        }
        return;
    }

    async function getCurrentUserData(user: User) {
        let currentUserData = userData;
        if (!currentUserData) {
            const userDocRef = doc(db, "users", user.uid);
            const docRef = await getDoc(userDocRef);
            if (docRef.exists()) {
                const docData = docRef.data();
                if (docData.org) {
                    currentUserData = docData as UserData;
                    setUserData(currentUserData);
                }
            }
            
        }
        return currentUserData;
    }

    function onFileChanged(event: any) {

        // TODO - add a check box if there are headers present in the CSV (or assume there are always headers?)

        if (event.target.files.length === 0) return;

        // Passing file data (event.target.files[0]) to parse using Papa.parse
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const user = auth.currentUser;
                if (!user) return;
                let currentUserData = userData;

                if (!currentUserData) {
                    currentUserData = await getCurrentUserData(user);
                }
                if (!user || !currentUserData) return;
                const rowsArray = [];
                const csvValuesArray = [];
                
                // Iterating data to get column name and their values
                results.data.map((d) => {
                    rowsArray.push(Object.keys(d));
                    csvValuesArray.push(Object.values(d));
                });
                const codeList = {};
                let foundErrors = false;
                results.data.forEach((result) => {
                    const errors = validateImportedEntry(result);
                    if (errors.length > 0) {
                        result.errors = errors;
                        foundErrors = true;
                    }
                    const code = result.Code ? result.Code : result.code;
                    if (code) {
                        if (codeList[code]) {
                            codeList[code].push(result);
                        } else {
                            codeList[code] = [result];
                        }
                    }
                });
                if (foundErrors) {
                    await router.push('./samples');
                    setErrorSamples(results.data as Sample[]);
                    const statusBarWrapper = document.getElementById('import-status-bar');
                    const errorBar = document.getElementById("import-status-bars")!.firstChild;
                    if (statusBarWrapper && errorBar) {
                        statusBarWrapper.appendChild(errorBar);
                    }
                    return;
                }
                let samples = [] as Sample[];
                const date = new Date();
                //RFC 3339 format
                const formattedDateString = date.toISOString();
                const sampleId = getRanHex(20);
                Object.keys(codeList).forEach((key: string) => {
                    const resultValues = codeList[key];
                    const newSample = {
                        points: codeList[resultValues[0].Code],
                        lat: parseFloat(resultValues[0].lat),
                        lon: parseFloat(resultValues[0].lon),
                        site: resultValues[0].site || "",
                        state: resultValues[0].state || "",
                        municipality: resultValues[0].municipality || "",
                        trusted: originValues[resultValues[0].origin],
                        species: resultValues[0].species || "",
                        created_by: user.uid,
                        created_on: formattedDateString,
                        last_updated_by: currentUserData.name,
                        org: currentUserData.org,
                        org_name: currentUserData.org_name ? currentUserData.org_name : '',
                        created_by_name: currentUserData.name,
                        code_lab: sampleId,
                        visibility: "private",
                        d18O_wood: codeList[resultValues[0].Code].filter(data => data.d18O_wood).map((data) => parseFloat(data.d18O_wood)),
                        d15N_wood: codeList[resultValues[0].Code].filter(data => data.d15N_wood).map((data) => parseFloat(data.d15N_wood)),
                        n_wood: codeList[resultValues[0].Code].filter(data => data.n_wood).map((data) => parseFloat(data.n_wood)),
                        d13C_wood: codeList[resultValues[0].Code].filter(data => data.d13C_wood).map((data) => parseFloat(data.d13C_wood)),
                        c_wood: codeList[resultValues[0].Code].filter(data => data.c_wood).map((data) => parseFloat(data.c_wood)),
                        c_cel: codeList[resultValues[0].Code].filter(data => data.c_cel).map((data) => parseFloat(data.c_cel)),
                        d13C_cel: codeList[resultValues[0].Code].filter(data => data.d13C_cel).map((data) => parseFloat(data.d13C_cel)),
                    }
                    samples.push(newSample);
                });

                const batch = writeBatch(db);
                samples.forEach((sample: Sample) => {
                    if (!sample.trusted) return;
                    const docRef = doc(db, sample.trusted! + "_samples", sampleId);
                    const completed =
                        sample.d18O_wood.length > 0 ||
                        sample.d15N_wood.length > 0 ||
                        sample.n_wood.length > 0 ||
                        sample.d13C_wood.length > 0 ||
                        sample.c_wood.length > 0 ||
                        sample.c_cel.length > 0 ||
                        sample.d13C_cel.length > 0

                    let payload = {
                        ...sample,
                        status: completed ? 'concluded' : 'in_progress',
                    };
                    batch.set(docRef, payload);
                });

                // TODO - handle errors.
                batch.commit().then(() => {
                    const url = `./samples`;
                    router.push(url);

                });
                await router.push('./samples');
                const statusBarWrapper = document.getElementById('import-status-bar');
                const errorBar = document.getElementById("import-status-bars")!.lastChild;
                if (statusBarWrapper && errorBar) {
                    statusBarWrapper.appendChild(errorBar);
                }
            }
        })
    }

    return (
        <div>
            <input id="fileInput" type="file" onChange={onFileChanged} accept=".csv" className="visibility-hidden" />
            <label htmlFor="fileInput" >
                <span className="material-symbols-outlined">cloud_upload</span>
                {t('importSamples')}
            </label>
            <div id="import-status-bars" className='display-none'>
                {onImportErrorBar()}
                {onImportSuccessBar()}
            </div>
        </div>
    )
}