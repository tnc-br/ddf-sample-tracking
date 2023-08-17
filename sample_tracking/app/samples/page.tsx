"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where } from "firebase/firestore";
import { useState, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import SamplesTable from '../samples_table';
import { initializeAppIfNecessary, showNavBar, showTopBar, confirmUserLoggedIn, UserRole, type UserData, type Sample } from '../utils';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function Samples() {

    const [userData, setUserData] = useState({} as UserData);
    const [allSamples, setAllSamples] = useState({
        completed: [] as Sample[],
        inProgress: [] as Sample[]

    });

    const app = initializeAppIfNecessary();
    const router = useRouter();
    const auth = getAuth();
    const { t } = useTranslation();
    const db = getFirestore();

    useEffect(() => {
        showNavBar();
        showTopBar();
        if (!userData.role || userData.role.length < 1) {
            onAuthStateChanged(auth, (user) => {
                setUserData(confirmUserLoggedIn(user, db, router))
            })   
        }
    });

    
    if (!allSamples.inProgress && !allSamples.completed) {
        addSamplesToDataList();
    }

    async function getSamplesFromCollection(collectionName: string): Promise<Map<string, Map<string, string>>[]> {
        const user = auth.currentUser;
        const samples: any = {};
        const samplesStateArray: any = [];
        console.log('got here');
        const verifiedSamplesRef = collection(db, collectionName);
        let samplesQuery;
        if (userData.role == UserRole.SITE_ADMIN) {
            const querySnapshot = await getDocs(collection(db, collectionName)).catch((error) => {
                console.log("Error: Unable to fetch samples: " + error);
            });
            if (querySnapshot) {
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    samples[doc.id as unknown as number] = doc.data();
                    samplesStateArray.push({
                        ...docData,
                        code_lab: doc.id,
                    });
                });
            }
            return samplesStateArray;
        } else if (userData.role == UserRole.ORG_ADMIN) {
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
                    where("created_by", "==", user!.uid),
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
                    code_lab: doc.id,
                });
            });

        }

        return samplesStateArray;
    }

    async function addSamplesToDataList() {
        if (allSamples.inProgress.length < 1 && allSamples.completed.length < 1) {
            let allSamples: any = [{}];
            const trustedSamples = await getSamplesFromCollection('trusted_samples');
            const untrustedSamples = await getSamplesFromCollection('untrusted_samples');
            const unknownSamples = await getSamplesFromCollection('unknown_samples');
            if (trustedSamples.length + untrustedSamples.length + unknownSamples.length < 1) {
                return;
            }

            let inProgressSamples: any = [];
            let completedSamples: any = [];
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
                        trusted: 'untrusted',
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
                        trusted: 'unknown',
                    })
                }
            });

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
        return userData.role === UserRole.ORG_ADMIN || userData.role === UserRole.SITE_ADMIN;
    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            {(allSamples.inProgress.length > 0 || allSamples.completed.length > 0) ? <div id="samplesTable" className='samples-wrapper'>
                <div className='samples-summary'>
                    {allSamples.inProgress && <div className='samples-summary-box'>
                        <div className='samples-size-label'>{allSamples.inProgress.length}</div>
                        <span className="samples-badge samples-in-progress">{t('inProgress')}</span>
                    </div>}

                    {allSamples.completed && <div className='samples-summary-box'>
                        <div className='samples-size-label'>{allSamples.completed.length}</div>
                        <span className="samples-badge samples-completed">{t('completed')}</span>
                    </div>}
                </div>

                <div className="samples-sample-table">
                    <p className='samples-header'>{t('inProgress')}</p>
                    {allSamples.inProgress && <SamplesTable samplesData={allSamples.inProgress as Sample[]} canDeleteSamples={isAdmin()} />}
                </div>

                <div className="samples-sample-table">
                    <p className='samples-header'>{t('completed')}</p>
                    {allSamples.completed && <SamplesTable samplesData={allSamples.completed as Sample[]} canDeleteSamples={isAdmin()} />}
                </div>
                {!allSamples.inProgress && !allSamples.completed && <div>No samples to show. Wait to be accepted to an organization to view samples.</div>}

            </div> :
                <div className="spinner-grow text-success" role="status">
                    <span className="sr-only"></span>
                </div>
            }
        </div>
    )
}



