"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where, getDoc, doc } from "firebase/firestore";
import { useState, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import Nav from '../nav';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_TableInstance } from 'material-react-table';

import { firebaseConfig } from '../firebase_config';

import { useReactTable } from '@tanstack/react-table'

export default function Samples() {

    type Sample = {
        code_lab: string,
        visibility: string,
        sample_name: string,
        species: string,
        site: string,
        state: string,
        lat: string,
        lon: string,
        date_of_harvest: string,
        created_by: string,
        current_step: string,
        status: string,
        trusted: string,
        created_on: string,
        last_updated_by: string,
        org: string,
    }

    const [data, setData] = useState({});
    const [selectedSample, setSelectedSample] = useState('');
    const [userData, setUserData] = useState({ org: '', role: '' });
    const [samplesState, setSamplesState] = useState([{}]);

    const tableInstanceRef = useRef<MRT_TableInstance<Sample>>(null); 
    // const [rowSelection, setRowSelection] = useState({}); 

    function updateData(data: {}) {
        setData(data);
    }

    function updateSelectedSample(selectedSample: string) {
        setSelectedSample(selectedSample);
    }

    const app = initializeApp(firebaseConfig);
    const router = useRouter();

    const auth = getAuth();
    if (userData.role.length < 1) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login');
            } else {
                const userDocRef = doc(db, "users", user.uid);
                getDoc(userDocRef).then((docRef) => {
                    if (docRef.exists()) {
                        const docData = docRef.data();
                        if (!docData.role) {
                            router.push('/tasks');
                        } else {
                            setUserData(docData);
                        }
                    }
                })
            }
        });
    }

    console.log('In login signup');
    const db = getFirestore();
    if (Object.keys(data).length < 1 && userData.role.length > 0) {
        addSamplesToDataList();
    }

    const columns = useMemo<MRT_ColumnDef<Sample>[]>(
        () => [
            {
                accessorKey: 'code_lab',
                header: 'Internal code',
                size: 150,
            },
            {
                accessorKey: 'sample_name',
                header: 'Name',
                size: 150,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 200,
            },
            {
                accessorKey: 'trusted',
                header: 'Trusted',
                size: 150,
            },
            {
                accessorKey: 'current_step',
                header: 'Current step',
                size: 150,
            },
            {
                accessorKey: 'site',
                header: 'Collection site',
                size: 150,
            },
        ],
        [],
    );



    // const user = auth.currentUser;
    // if (!user) return;
    // const samples = {};
    // console.log('got here');
    // const verifiedSamplesRef = collection(db, "trusted_samples");
    // let samplesQuery;
    // if (userData.role == "site_admin") {
    //     getDocs(collection(db, "trusted_samples")).then((querySnapshot) => {
    //         console.log('made request');
    //         querySnapshot.forEach((doc) => {
    //             const docData = doc.data();
    //             samples[doc.id] = doc.data();

    //         });
    //         updateData(samples);

    //     });
    // } else if (userData.role == "admin") {
    //     // samplesQuery = query(verifiedSamplesRef, where("visibility", "==", "public"));
    //     samplesQuery = query(verifiedSamplesRef, 
    //         or(
    //             where("visibility", "==", "public"),
    //             where("visibility", "==", "logged_in"),
    //             where("org", "==", userData.org)
    //     ));
    // } else if (userData.role == "member") {
    //     samplesQuery = query(verifiedSamplesRef,
    //         or(
    //             where("created_by", "==", user.uid),
    //             where("visibility", "==", "public"),
    //             where("visibility", "==", "logged_in"),
    //             // and(
    //             //     where("visibility", "==", "organization"),
    //             //     where("org", "==", userData.org)),
    //         ))
    // }





    async function getSamplesFromCollection(collectionName: string): Promise<[Map<string, Map<string, string>>]> {
        const user = auth.currentUser;
        const samples = {};
        const samplesStateArray = [];
        if (!user) return samples;
        console.log('got here');
        const verifiedSamplesRef = collection(db, collectionName);
        let samplesQuery;
        if (userData.role == "site_admin") {
            const querySnapshot = await getDocs(collection(db, collectionName)).catch((error) => {
                console.log("Unable to fetch samples: " + error);
            });
            if (querySnapshot) {
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    samples[doc.id] = doc.data();
                    samplesStateArray.push(docData);
                });
            }

            return samples;
        } else if (userData.role == "admin") {
            samplesQuery = query(verifiedSamplesRef, where("visibility", "==", "public"));
            samplesQuery = query(verifiedSamplesRef,
                or(
                    where("visibility", "==", "public"),
                    where("visibility", "==", "logged_in"),
                    where("org", "==", userData.org)
                ));
            // samplesQuery = query(verifiedSamplesRef,
            //     or(
            //         where("created_by", "==", user.uid),
            //         where("visibility", "==", "public"),
            //         where("visibility", "==", "logged_in"),
            //         and(
            //             where("visibility", "==", "organization"),
            //             where("org", "==", userData.org)),
            //     ))
        } else {
            samplesQuery = query(verifiedSamplesRef,
                or(
                    where("created_by", "==", user.uid),
                    where("visibility", "==", "public"),
                    where("visibility", "==", "logged_in"),
                    and(
                        where("visibility", "==", "organization"),
                        where("org", "==", userData.org)),
                ))
        }

        const querySnapshot = await getDocs(samplesQuery).catch((error) => {
            console.log("Unable to fetch samples: " + error);
        });
        if (querySnapshot) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                samples[doc.id] = doc.data();
                samplesStateArray.push(docData);
            });

        }

        return samplesStateArray;


    }

    async function addSamplesToDataList() {
        if (Object.keys(samplesState[0]).length < 1 && userData.role.length > 0) {
            let allSamples: [Map<string, Map<string, string>>] = [{}];
            const trustedSamples = await getSamplesFromCollection('trusted_samples');
            const untrustedSamples = await getSamplesFromCollection('untrusted_samples');
            const unknownSamples = await getSamplesFromCollection('unkown_samples');
            allSamples = [...trustedSamples, ...untrustedSamples, ...unknownSamples];
            // Object.keys(trustedSamples).forEach((trustedSampleId: string) => {
            //     allSamples[trustedSampleId] = trustedSamples[trustedSampleId];
            // });
            // Object.keys(untrustedSamples).forEach((untrustedSampleId: string) => {
            //     allSamples[untrustedSampleId] = untrustedSamples[untrustedSampleId];
            // });
            // Object.keys(unknownSamples).forEach((unknownSampleId: string) => {
            //     allSamples[unknownSampleId] = unknownSamples[unknownSampleId];
            // });
            // const allSamples: Map<string, Map<string, string>> =
            //     new Map([
            //         ...Array.from(trustedSamples),
            //         ...Array.from(untrustedSamples),
            //         ...Array.from(untrustedSamples)]);
            if (allSamples.length > 0) {
                setSamplesState(allSamples);
            }

        }

    }

    function onSampleClick(evt) {
        const trustedStatus = data[evt.target.parentElement.id].trusted
        const url = `./sample-details?trusted=${trustedStatus}&id=${evt.target.parentElement.id}`;
        router.push(url)
    }

    function onDowloadClick(evt) {
        const rowSelection = tableInstanceRef.current.getState().rowSelection;
        const selectedElements = document.getElementsByClassName('select-sample-checkbox');
        const selectedSamples = [];
        Object.keys(rowSelection).forEach((index: string) => {
            selectedSamples.push(samplesState[parseInt(index)]);
        })
        // for (let i = 0; i < selectedElements.length; i++) {
        //     if (selectedElements[i].checked) {
        //         selectedSamples.push(selectedElements[i].parentElement!.parentElement!.id);
        //     }
        // }
        let headers = Object.keys(selectedSamples[0]);
        let csv = headers.toString() + '\n';
        let isFirst = true;
        selectedSamples.forEach((sample) => {
            headers.forEach((header) => {
                csv += (isFirst ? sample[header] : ',' + sample[header]);
                isFirst = false;
            });
            csv += '\n';
            isFirst = true;
        });
        console.log(csv);
        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'SampleDetails.csv'
        hiddenElement.click();
    }

    function updateRowSelection(evt) {
        console.log(evt());
    }

    function handleExportData(evt) {
        console.log(evt);
    }


    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />

            <div>
                <Nav />
            </div>
            <div id="samplesTable" className='samples-wrapper'>
                <p className='header'>All samples</p>
                {/* <button type="button" onClick={onDowloadClick} className="btn btn-primary">Download</button> */}
                {/* <table className="table table-hover" data-page-length="25">
                    <thead>
                        <tr id="table-header">
                            <th className="w-5"><input type="checkbox" id="allSamples" name="allSamples" /></th>
                            <th className="w-20">Internal code</th>
                            <th className="w-30">Name</th>
                            <th className="w-15">Status</th>
                            <th className="w-15">Trusted</th>
                            <th className="w-15">Current step</th>
                            <th className="w-20">Created by</th>
                        </tr>
                    </thead>
                    <tbody id="samples-data">
                        {
                            Object.keys(data).map((key, i) => {
                                return (
                                    <tr key={i} id={key}>
                                        <td><input type="checkbox" id={i.toString()} className="select-sample-checkbox" name="selectSample" /></td>
                                        <td>{key}</td>
                                        <td onClick={onSampleClick} className="sample-link">{data[key].sample_name}</td>
                                        <td>{data[key].status === 'in_progress' ? <span>In progress</span> : <span className="badge bg-success">Completed</span>}</td>
                                        {data[key].trusted === 'trusted' ? <td> <span className="badge bg-success"><span className="material-symbols-outlined">
                                            done
                                        </span>Trusted</span></td> : <td>-</td>}

                                        <td>{data[key].current_step ? <span>{data[key].current_step}</span> : <span>-</span>}</td>
                                        <td>{data[key].created_by ? <span>{data[key].created_by}</span> : <span>-</span>}</td>
                                    </tr>
                                )

                            })
                        }
                    </tbody>
                </table> */}
                <MaterialReactTable 
                 columns={columns}
                 data={samplesState} 
                 enableRowSelection 
                 tableInstanceRef={tableInstanceRef}
                //  onRowSelectionChange={updateRowSelection}
                 renderTopToolbarCustomActions={({ table }) => (
                    <div
                      sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
                    >
                      <button
                      type="button" className="btn btn-primary"
                        // color="primary"
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        onClick={onDowloadClick}
                        // startIcon={<FileDownloadIcon />}
                        // variant="contained"
                      >
                        Export selected
                      </button>
                    </div>
                  )}
                  />
            </div>
        </div>
    )
}


