"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where, getDoc, doc } from "firebase/firestore";
import { useState, useMemo, useRef, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import Nav from '../nav';
import SamplesTable from '../samples_table';

import { firebaseConfig } from '../firebase_config';


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

    type UserData = {
        role: string,
        org: string,
    }

    const [data, setData] = useState({});
    const [selectedSample, setSelectedSample] = useState('');
    const [userData, setUserData] = useState({} as UserData);
    const [samplesState, setSamplesState] = useState([{}]);

    const app = initializeApp(firebaseConfig);
    const router = useRouter();

    const auth = getAuth();

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
                            if (!docData.role) {
                                router.push('/tasks');
                            } else {
                                setUserData(docData as UserData);
                            }
                        }
                    })
                }
            });
        }
    })
    

    const db = getFirestore();
    if (Object.keys(data).length < 1 && userData.role) {
        addSamplesToDataList();
    }

    async function getSamplesFromCollection(collectionName: string): Promise<[Map<string, Map<string, string>>]> {
        const user = auth.currentUser;
        const samples: any = {};
        const samplesStateArray: any = [];
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
                    samples[doc.id as unknown as number] = doc.data();
                    samplesStateArray.push(docData);
                });
            }

            return samplesStateArray;
        } else if (userData.role == "admin") {
            samplesQuery = query(verifiedSamplesRef, where("visibility", "==", "public"));
            samplesQuery = query(verifiedSamplesRef,
                or(
                    where("visibility", "==", "public"),
                    where("visibility", "==", "logged_in"),
                    where("org", "==", userData.org)
                ));
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
            let allSamples: any = [{}];
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
                <p className='header'>All samples</p>
                <SamplesTable samplesData={samplesState as Sample[]} />
            </div>
        </div>
    )
}


