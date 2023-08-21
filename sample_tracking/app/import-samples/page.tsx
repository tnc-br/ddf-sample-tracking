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
import { type UserData, getRanHex, confirmUserLoggedIn, initializeAppIfNecessary } from '../utils';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

const valueRanges = {
    'd18O_cel': {
        'min': 20,
        'max': 32
    },
    'd18O_wood': {
        'min': 20,
        'max': 32
    },
    'd15N_wood': {
        'min': -5,
        'max': 15
    },
    '%N_wood': {
        'min': 0,
        'max': 1
    },
    'd13C_wood': {
        'min': -38,
        'max': 20
    },
    '%C_wood': {
        'min': 40,
        'max': 60
    },
    'd13C_cel': {
        'min': -35,
        'max': -20
    },
    '%C_cel': {
        'min': 40,
        'max': 60
    },

}

export default function ImportCsv() {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampleTrust] = useState('untrusted');
    const [userData, setUserdata] = useState({} as UserData);
    const [errors, setErrors] = useState([] as String[]);
    const [incorrectValueColumns, setIncorrectValueColumns] = useState([]);

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();
    useEffect(() => {
        if (!userData.role) {
            onAuthStateChanged(auth, (user) => {
                setUserdata(confirmUserLoggedIn(user, db, router));
            });
        }

    })


    // State to store parsed data
    const [parsedData, setParsedData] = useState([]);

    // State to store table Column name
    const [tableRows, setTableRows] = useState([]);

    // State to store the values
    const [csvValues, setCsvValues] = useState([]);

    type ColumnName = {
        display_name: string,
        database_name: string,
    }

    const resultValues: string[] = ['d18O_cel', 'nitrogen', 'carbon', 'd13C_cel', 'oxygen', 'c_cel']

    const requiredColumns: ColumnName[] = [

    ]

    const inputColumns: ColumnName[] = [
        // ...requiredColumns,
        { display_name: 'lat', database_name: 'lat' },
        { display_name: 'lon', database_name: 'lon' },
        { display_name: 'd18O_cel', database_name: 'd18O_cel' },
        { display_name: 'd15N_wood', database_name: 'nitrogen' },
        { display_name: 'd13C_wood', database_name: 'carbon' },
        { display_name: 'd13C_cel', database_name: 'd13C_cel' },
        { display_name: 'd18O_wood', database_name: 'oxygen' },
        { display_name: '%C_cel', database_name: 'c_cel' },
        { display_name: 'code_lab', database_name: 'code_lab' },
        { display_name: 'Species', database_name: 'species' },
        { display_name: 'Popular name', database_name: 'popular_name' },
        { display_name: 'Site', database_name: 'site' },
        { display_name: 'State', database_name: 'state' },
        // TODO - determine if we should not default created by to the current user.
        // { display_name: 'Created By', database_name: 'created_by' },
        // TODO - should we assume completed for CSV upload?
        { display_name: 'Current State', database_name: 'current_state' },
        { display_name: 'Date of Harvest', database_name: 'date_of_harvest' },
    ];

    function onSampleTrustChange(evt: any) {
        setSampleTrust(evt.target.value);
    }

    function addError(error: string) {
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

        if (incorrectValueColumns.length > 0 && !(confirm("Result values were found outside of the expected ranges. Are you sure you want to uplaod this data?"))) {
            return;
        }

        // build a counter of all the column types selected
        type ColumnCount = {
            index: number,
            count: number,
        }
        let selectedColumnCounts = new Map<ColumnName, ColumnCount>();
        for (var i = 0; i < tableRows.length; i++) {
            const selectedValue = (document.getElementById("columnSelect_" + i) as HTMLInputElement)!.value;
            const columnName = inputColumns.find((col: ColumnName) =>
                col.display_name == selectedValue);
            if (!columnName && selectedValue != 'Ignore Column') {
                addError('Invalid column name: ' + selectedValue + '.');
                return;
            }

            if (selectedColumnCounts.get(columnName!) == null) {
                let newColumnCount: ColumnCount = {
                    // index isn't quite right if a column appears multiple times, but either it's the 
                    // ignored column or we will fail for dupe columns.
                    index: i,
                    count: 0,
                }
                selectedColumnCounts.set(columnName!, newColumnCount);
            }
            let selectedColumn = selectedColumnCounts.get(columnName!)!;
            selectedColumn.count += 1;
        }

        var columnsToUpload: ColumnName[] = [];
        for (var column in inputColumns) {
            var columnName = inputColumns[column];
            if (selectedColumnCounts.get(columnName) != null) {
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
            if (selectedColumnCounts.get(col) && selectedColumnCounts.get(col)!.count > 1) {
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
            let payload = {
                visibility: sampleVisibility,
                status: 'concluded',
                created_by: user.uid,
                created_by_name: userData.name,
                created_on: serverTimestamp(),
                last_updated_by: userData.name,
                org: userData.org,
                org_name: userData.org_name ? userData.org_name : '-',

            };
            selectedColumnCounts.forEach((colCount, colName) => {
                if (colName != null) {
                    payload[colName.database_name] = row[colCount.index];
                }
            });
            resultValues.forEach((resultValue: string) => {
                if (payload[resultValue]) {
                    payload[resultValue] = payload[resultValue].split(',').map((value: string) => parseFloat(value));
                }

            })

            batch.set(docRef, payload);
        }

        // TODO - handle errors.
        batch.commit().then(() => {
            const url = `./samples`;
            router.push(url);
        })
    }

    function onFileChanged(event: any) {
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

    function handleHeaderChange(evt: any) {
        console.log(evt);
        const header = evt.target.value;
        const isResultHeader = Object.keys(valueRanges).includes(header);
        // if (!Object.keys(valueRanges).includes(header)) return;
        
        let foundIncorrectValue = false;
        const columnElements = document.getElementsByClassName(evt.target.id);
        const currentColumnNumber = parseInt(evt.target.id.split('_')[1]);
        for (let i = 0; i < columnElements.length; i++) {
            const value = parseFloat(columnElements[i].childNodes[0].value)
            if (isResultHeader && (value < valueRanges[header].min || value > valueRanges[header].max)) {
                columnElements[i].style.background = 'red';
                foundIncorrectValue = true;
                // newIncorrectValueColumns.push(currentColumnNumber);
            } else {
                columnElements[i].style.background = 'white';
            }
        }
        const newIncorrectValueColumns = incorrectValueColumns.slice();
        if (!foundIncorrectValue && incorrectValueColumns.includes(currentColumnNumber)) {
            newIncorrectValueColumns.splice(newIncorrectValueColumns.indexOf(currentColumnNumber), 1);
        } else if (foundIncorrectValue && !incorrectValueColumns.includes(currentColumnNumber)) {
            newIncorrectValueColumns.push(currentColumnNumber);
        }
        if (newIncorrectValueColumns.length !== incorrectValueColumns.length) setIncorrectValueColumns(newIncorrectValueColumns);
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
                <label htmlFor="sampleTrustSelected" defaultValue={sampleTrust}>What is the origin of this sample?</label>
                <select onChange={onSampleTrustChange} className="form-select" id="sampleTrustSelected" aria-label="Select sample trusted status">
                    <option value="untrusted">Uncertain</option>
                    <option value="trusted">Known</option>
                    <option value="unknown">Unkown</option>
                </select>
                <label htmlFor="sampleVisibility">Sample visibility</label>
                <select className="form-select" id="sampleVisibility" aria-label="Select sample visibility">
                    <option value="public">Publicly available</option>
                    <option value="organization">Available to only my organization</option>
                </select>
                <label htmlFor="formFile" className="form-label">Upload CSV file</label>
                <input capture onChange={onFileChanged} accept=".csv" className="form-control" type="file" id="formFile" />
                {/* TODO - add a selector for the type of sample, untrusted, trusted, unknown */}
                {/* TODO - consider changing the initial button name to "load samples" or similar. Maybe not since we load on doc selection.*/}
                <div id="sampleReviewTable">
                    <table id="importTable">
                        <tbody>
                            <tr id="reviewTableHeader">
                                {/* TODO - only render the checkbox when the file is loaded. */}
                                {/*<td><input type="checkbox" id="full-toggle" name="full-toggle" /></td>*/}
                                {/* TODO - use just a count of columns instead of the header row. */}
                                {tableRows.map((rows, index) => {
                                    return <td key={"header-" + index}><select onChange={handleHeaderChange} key={index} id={"columnSelect_" + index}>
                                        <option key={"ignore-" + index}>Ignore Column</option>
                                        {inputColumns.map((opt: ColumnName) =>
                                            <option key={index + '-' + opt.database_name}>{opt.display_name}</option>)}
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
                                            return <td key={"value-" + index + "-" + i} className={"columnSelect_" + i}>
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