"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, getDocFromCache, doc, setDoc } from "firebase/firestore";
import { useState } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import Nav from '../nav';
import * as csv from 'jquery-csv';

import { firebaseConfig } from '../firebase_config';

export default function Samples() {

    const [data, setData] = useState({});
    const [selectedSample, setSelectedSample] = useState('');

    function updateData(data: {}) {
        setData(data);
    }

    function updateSelectedSample(selectedSample: string) {
        setSelectedSample(selectedSample);
    }

    const app = initializeApp(firebaseConfig);
    const router = useRouter();

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            router.push('/login');
        }
    });

    console.log('In login signup');
    const db = getFirestore();

    if (Object.keys(data).length === 0) {
        const samples = {};
        console.log('got here');
        getDocs(collection(db, "verified_samples")).then((querySnapshot) => {
            console.log('made request');
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                samples[doc.id] = doc.data();

            });
            updateData(samples);

        });
    }

    function onSampleClick(evt) {
        const url = `./sample-details?id=${evt.target.parentElement.id}`;
        router.push(url)
    }

    function onDowloadClick(evt) {
        const selectedElements = document.getElementsByClassName('select-sample-checkbox');
        const selectedSamples = [];
        for (let i = 0; i < selectedElements.length; i++) {
            if (selectedElements[i].checked) {
                selectedSamples.push(selectedElements[i].parentElement!.parentElement!.id);
            }
        }
        let headers = Object.keys(data[selectedSamples[0]]);
        let csv = headers.toString() + '\n';
        let isFirst = true;
        selectedSamples.forEach((sample) => {
            headers.forEach((header) => {
                csv += (isFirst ? data[sample][header].toString() : ',' + data[sample][header].toString()); 
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


    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />

            <div>
                <Nav />
            </div>
            <div id="samplesTable" className='samples-wrapper'>
                <p className='header'>All samples</p>
                <button type="button" onClick={onDowloadClick} className="btn btn-primary">Download</button>
                <table className="table table-hover">
                    <thead>
                        <tr id="table-header">
                            <th className="w-5"><input type="checkbox" id="allSamples" name="allSamples" /></th>
                            <th className="w-20">Internal code</th>
                            <th className="w-30">Name</th>
                            <th className="w-10">Status</th>
                            <th className="w-10">Trusted</th>
                            <th className="w-10">Current step</th>
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
                                        <td onClick={onSampleClick} className="sample-link">Sample {i}</td>
                                        <td>{data[key].status === 'in_progress' ? <span>In progress</span> : <span className="badge bg-success">Completed</span>}</td>
                                        <td> <span className="badge bg-success"><span className="material-symbols-outlined">
                                            done
                                        </span>Trusted</span></td>
                                        <td>{data[key].current_step ? <span>{data[key].current_step}</span> : <span>-</span>}</td>
                                        <td>{data[key].created_by ? <span>{data[key].created_by}</span> : <span>-</span>}</td>
                                    </tr>
                                )

                            })
                        }
                    </tbody>
                </table>

            </div>
        </div>
    )
}

