"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where, getDoc, doc } from "firebase/firestore";
import { useState, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import Nav from '../nav';
import SamplesTable from '../samples_table';

import { firebaseConfig } from '../firebase_config';


export default function MySamples() {

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
    const [userData, setUserData] = useState({ org: '', role: '' });
    const [samplesState, setSamplesState] = useState([{}]);
    const [userId, setUserId] = useState('');

    const app = initializeApp(firebaseConfig);
    const router = useRouter();

    const auth = getAuth();
    if (userId.length < 1) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login');
            } else {
                setUserId(user.uid)
            }
        });
    }

    console.log('In login signup');
    const db = getFirestore();
    if (Object.keys(data).length < 1 && userId.length > 0) {
        addSamplesToDataList();
    }

    async function getSamplesFromCollection(collectionName: string): Promise<[Map<string, Map<string, string>>]> {
        const samples = {};
        const samplesStateArray = [];
        console.log('got here');
        const verifiedSamplesRef = collection(db, collectionName);
        let samplesQuery;
        samplesQuery = query(verifiedSamplesRef,
            where("created_by", "==", userId)
            )

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
        if (Object.keys(samplesState[0]).length < 1 && userId.length > 0) {
            let allSamples: [Map<string, Map<string, string>>] = [{}];
            const trustedSamples = await getSamplesFromCollection('trusted_samples');
            const untrustedSamples = await getSamplesFromCollection('untrusted_samples');
            const unknownSamples = await getSamplesFromCollection('unknown_samples');
            allSamples = [...trustedSamples, ...untrustedSamples, ...unknownSamples];
            if (allSamples.length > 0) {
                setSamplesState(allSamples);
            }
        }
    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />

            <div>
                <Nav />
            </div>
            <div id="samplesTable" className='samples-wrapper'>
                <p className='header'>My samples</p>
                <SamplesTable samplesData={samplesState} />
            </div>
        </div>
    )
}


