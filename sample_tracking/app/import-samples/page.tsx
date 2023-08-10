"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Papa from 'papaparse';
import {getRanHex} from '../utils';

type UserData = {
    name: string,
    org: string,
    org_name: string,
    role: string,
}

export default function ImportCsv() {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampleTrust] = useState('untrusted');
    const [userData, setUserdata] = useState({} as UserData);
    const [errors, setErrors] = useState([] as String[]);

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

    })
    

    // State to store parsed data
    const [parsedData, setParsedData] = useState([]);

    // State to store table Column name
    const [tableRows, setTableRows] = useState([]);

    // State to store the values
    const [csvValues, setCsvValues] = useState([]);

    const requiredColumns :String[] = [
        'lat',
        'lon',
        'd18O_cel',
        'd15N_wood',
        'd13C_wood',
        'd13C_cel',
    ]

    const inputColumns: String[] = [
        ...requiredColumns,
        "code_lab",
        "Species",
        "Popular name",
        "Site",
        "State",
        "created_by",
        "current_state", // TODO - should we assume completed for CSV upload?
        "date_of_harvest",
    ];

    function onSampleTrustChange(evt: any) {
        setSampleTrust(evt.target.value);
    }

    function addError(error: String) {
        setErrors(errors => [...errors, error]);
    }

    function onUploadSamplesClick() {
        setErrors([]);
        if (document.getElementById("formFile")!.value == "") {
            addError('No file to upload.');
            return;
        }

        if (parsedData.length > 500) {
            // We could support larger imports by splitting into multiple batches.
            // https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
            addError('Import has a limit of 500 entries.');
            return;
        }

        // build a counter of all the column types selected
        var selectedColumnCounts = {};
        for (var i = 0; i < tableRows.length; i++) {
            const column = document.getElementById("columnSelect_" + i)!.value;
            if (selectedColumnCounts[column] == null) {
                selectedColumnCounts[column] = {};
            }
            selectedColumnCounts[column].count =
                1 + (selectedColumnCounts[column] != null ? selectedColumnCounts[column] : 0);
            // index isn't quite right if a column appears multiple times, but either it's the 
            // ignored column or we will fail for dupe columns.
            selectedColumnCounts[column].index = i;
        }

        var columnNames = Object.keys(selectedColumnCounts);
        var columnsToUpload: String[] = [];
        for (var column in inputColumns) {
            var columnName = inputColumns[column];
            if (columnNames.indexOf(columnName) >= 0) {
                columnsToUpload.push(columnName);
            }
        }
        if (columnsToUpload.length == 0) {
            addError('No columns selected');
            return;
        }

        var missingRequiredColumns = requiredColumns.filter(col => !columnsToUpload.includes(col));
        if (missingRequiredColumns.length > 0) {
            addError('Missing required column[s]: ' + missingRequiredColumns.join(','));
            return;
        }

        columnsToUpload.forEach(function (col) {
            if (selectedColumnCounts[col] > 1) {
                addError('Each column can only be selected once.');
                return;
            }
        });

        // Create the batch write.
        const db = getFirestore();
        const batch = writeBatch(db);
        const user = auth.currentUser;
        if (!user) return;
        const sampleVisibility = (document.getElementById('sampleVisibility')! as HTMLInputElement).value;
        for (var rowIndex in csvValues) {
            // TODO - check if the checkbox is selected for the row.
            // TODO - add validation for certain fields. This should be shared between different
            //        sample collection steps.

            var row = csvValues[rowIndex];
            const internalCode = getRanHex(20);
            const docRef = doc(db, sampleTrust + "_samples", internalCode);
            batch.set(docRef, {
                'code_lab': row[selectedColumnCounts['code_lab'].index],
                'visibility': sampleVisibility,
                'species': row[selectedColumnCounts['Species'].index],
                'site': row[selectedColumnCounts['Site'].index],
                'state': row[selectedColumnCounts['State'].index],
                'lat': Number(row[selectedColumnCounts['lat'].index]),
                'lon': Number(row[selectedColumnCounts['lon'].index]),
                'd13c_cel': row[selectedColumnCounts['d13C_cel'].index],
                'd13c_wood': row[selectedColumnCounts['d13C_wood'].index],
                'd13o_cel': row[selectedColumnCounts['d18O_cel'].index],
                'd15n_wood': row[selectedColumnCounts['d15N_wood'].index],
                'created_by': user.uid,
                // 'current_step': '1. Drying process',
                'status': 'complete',
                'created_on': serverTimestamp(),
                'last_updated_by': userData.name,
                'org': userData.org,
                'org_name': userData.org_name ? userData.org_name : '-',
                'created_by_name': userData.name,
            });
        }

        // TODO - handle errors.
        batch.commit().then(() => {
            const url = `./my-samples`;
            router.push(url)
        })
    }

    function onFileChanged(event) {
        setErrors([]);

        // TODO - add a check box if there are headers present in the CSV (or assume there are always headers?)

        if (event.target.files.length === 0) {
            setParsedData([]);
            setTableRows([]);
            setCsvValues([]);
            return;
        }

        // Passing file data (event.target.files[0]) to parse using Papa.parse
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const rowsArray = [];
                const csvValuesArray = [];

                // Iterating data to get column name and their values
                results.data.map((d) => {
                    rowsArray.push(Object.keys(d));
                    csvValuesArray.push(Object.values(d));
                });

                // Parsed Data Response in array format
                setParsedData(results.data);

                // Filtered Column Names - seems poorly named
                // We prob want to drop this anyway? Or render as a regular row to help customer select the proper column?
                setTableRows(rowsArray[0]);

                // Filtered Values
                setCsvValues(csvValuesArray);
            },
        });
    }


    return (
        <div className="import-samples-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <div className="import-form-wrapper">
                <div className="errors-list">
                    <Stack sx={{ width: '100%' }} spacing={2}>
                        {errors.map((error, index) =>
                            <Alert severity="error" key={index}>
                                {error}
                            </Alert>
                        )}
                    </Stack>
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
                <label htmlFor="formFile" className="form-label">Upload CSV file</label>
                <input capture onChange={onFileChanged} accept=".csv" className="form-control" type="file" id="formFile" />
                {/* TODO - add a selector for the type of sample, untrusted, trusted, unknown */}
                {/* TODO - consider changing the initial button name to "load samples" or similar. Maybe not since we load on doc selection.*/}
                <div id="sampleReviewTable">
                    <table>
                        <tbody>
                            <tr id="reviewTableHeader">
                                {/* TODO - only render the checkbox when the file is loaded. */}
                                {/*<td><input type="checkbox" id="full-toggle" name="full-toggle" /></td>*/}
                                {/* TODO - use just a count of columns instead of the header row. */}
                                {tableRows.map((rows, index) => {
                                    return <td key={"header-" + index}><select key={index} id={"columnSelect_" + index}>
                                        <option key={"ignore-" + index}>Ignore Column</option>
                                        {inputColumns.map((opt) => <option key={index + '-' + opt}>{opt}</option>)})
                                    </select></td>;
                                })}
                            </tr>
                            {/* Render headers from CSV (if any) to aid with setting column names */}
                            <tr id="reviewTableProvidedHeaders">
                                {/*<td><input type="checkbox" id="header-toggle" name="header-toggle" key="header-toggle" /></td>*/}

                                {tableRows.map((rows, index) => {
                                    return <td key={index}>{rows}</td>;
                                })}
                            </tr>
                            {csvValues.map((value, index) => {
                                return (
                                    <tr id={"reviewTableRow_" + index} key={"row-" + index}>
                                        {/* TODO - default to selected? Prob not for the header row. */}
                                        {/*<td key={"checkbox-" + index}>
                                        <input type="checkbox" id={"checkbox_" + index} key={"checkbox_" + index} defaultChecked />
                            </td>*/}
                                        {value.map((val, i) => {
                                            return <td key={"value-" + index + "-" + i}>
                                                <input type="text" id={index + "-" + i} value={val} readOnly={true} />
                                            </td>;
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <button type="button" className="btn btn-primary" onClick={onUploadSamplesClick}>Upload samples</button>
            </div>
        </div>
    )
}