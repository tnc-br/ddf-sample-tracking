"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where, getDoc, doc } from "firebase/firestore";
import { useState, useMemo, useRef, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import SamplesTable from '../samples_table';
import { initializeAppIfNecessary, showNavBar, showTopBar } from '../utils';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

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
    const [inProgressSamples, setInProgressSamples] = useState([{}]);
    const [allSamples, setAllSamples] = useState({});

    const app = initializeAppIfNecessary();
    const router = useRouter();
    const auth = getAuth();
    const {t} = useTranslation();

    useEffect(() => {
        showNavBar();
        showTopBar();
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
    if (!allSamples.inProgress && !allSamples.completed) {
        addSamplesToDataList();
    }

    async function getSamplesFromCollection(collectionName: string): Promise<Map<string, Map<string, string>>[]> {
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
                    samplesStateArray.push({
                        ...docData,
                        doc_id: doc.id,
                    });
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
        } else if (userData.org != null) {
            samplesQuery = query(verifiedSamplesRef,
                or(
                    where("created_by", "==", user.uid),
                    where("visibility", "==", "public"),
                    where("visibility", "==", "logged_in"),
                    and(
                        where("visibility", "==", "organization"),
                        where("org", "==", userData.org)),
                ))
        } else {
            samplesQuery = query(verifiedSamplesRef, where("visibility", "==", "public"));
        }

        const querySnapshot = await getDocs(samplesQuery).catch((error) => {
            console.log("Unable to fetch samples: " + error);
        });
        if (querySnapshot) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                samples[doc.id] = doc.data();
                samplesStateArray.push({
                    ...docData,
                    doc_id: doc.id,
                });
            });

        }

        return samplesStateArray;
    }

    async function addSamplesToDataList() {
        if (Object.keys(samplesState[0]).length < 1) {
            let allSamples: any = [{}];
            const trustedSamples = await getSamplesFromCollection('trusted_samples');
            const untrustedSamples = await getSamplesFromCollection('untrusted_samples');
            const unknownSamples = await getSamplesFromCollection('unknown_samples');
            if (!trustedSamples.length || trustedSamples.length + untrustedSamples.length + unknownSamples.length < 1) {
                return;
            }

            let inProgressSamples: any = [{}];
            let completedSamples: any = [{}];
            trustedSamples.forEach((sample: Sample) => {
                if (sample.status === 'concluded') {
                    completedSamples.push({
                        ...sample,
                        trusted: 'trusted',
                    })
                } else {
                    inProgressSamples.push({
                        ...sample,
                        trusted: 'trusted',
                    })
                }
            });

            untrustedSamples.forEach((sample: Sample) => {
                if (sample.status === 'concluded') {
                    completedSamples.push({
                        ...sample,
                        trusted: 'trusted',
                    })
                } else {
                    inProgressSamples.push({
                        ...sample,
                        trusted: 'untrusted',
                    })
                }
            });

            unknownSamples.forEach((sample: Sample) => {
                if (sample.status === 'concluded') {
                    completedSamples.push({
                        ...sample,
                        trusted: 'unknown',
                    })
                } else {
                    inProgressSamples.push({
                        ...sample,
                        trusted: 'trusted',
                    })
                }
            });







            // if (trustedSamples.length > 0) {
            //     allSamples  = (trustedSamples as Array).map((sample: Sample) => {
            //         return {
            //             ...sample,
            //             trusted: 'trusted',
            //         };
            //     });
            // }

            // // let allSamples = await getSamplesFromCollection('trusted_samples');

            // if (untrustedSamples.length > 0) {
            //     const updatedSamples = untrustedSamples.map((sample: Sample) => {
            //         return {
            //             ...sample,
            //             trusted: 'untrusted',
            //         };
            //     });
            //     allSamples = allSamples.concat(updatedSamples);
            // }

            // if (unknownSamples.length > 0) {
            //     const updatedSamples = unknownSamples.map((sample: Sample) => {
            //         return {
            //             ...sample,
            //             trusted: 'unknown',
            //         };
            //     });
            //     allSamples = allSamples.concat(updatedSamples);
            // }

            // allSamples = [trustedSamples.length ? ...trustedSamples : [], ...untrustedSamples, ...unknownSamples];
            if (inProgressSamples.length > 0 || completedSamples.length > 0) {
                setAllSamples({
                    inProgress: inProgressSamples,
                    completed: completedSamples,
                })
                // setSamplesState(allSamples);
            }
        }
    }

    function isAdmin(): boolean {
        return userData.role === 'admin' || userData.role === 'site_admin';
    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            {userData.org && <div id="samplesTable" className='samples-wrapper'>
                <div className='samples-summary'>
                    {allSamples.inProgress && <div className='summary-box'>
                        <div className='samples-size-label'>{allSamples.inProgress.length}</div>
                        <span className="badge in-progress">{t('inProgress')}</span>
                        {/* <div>In progress</div> */}
                    </div>}

                    {allSamples.completed && <div className='summary-box'>
                        <div className='samples-size-label'>{allSamples.completed.length}</div>
                        <span className="badge completed">{t('completed')}</span>
                    </div>}
                </div>

                <div className="sample-table">
                    <p className='header'>{t('inProgress')}</p>
                    {allSamples.inProgress && <SamplesTable samplesData={allSamples.inProgress as Sample[]} canDeleteSamples={isAdmin()} />}
                </div>

                <div className="sample-table">
                    <p className='header'>{t('completed')}</p>
                    {allSamples.completed && <SamplesTable samplesData={allSamples.completed as Sample[]} canDeleteSamples={isAdmin()} />}
                </div>

            </div>}
        </div>
    )
}



