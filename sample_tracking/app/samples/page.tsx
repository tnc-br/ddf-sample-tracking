"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useMemo, useRef, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import SamplesTable from '../samples_table';
import { type Sample, type UserData, initializeAppIfNecessary, showNavBar, showTopBar } from '../utils';
import { getSamplesFromCollection, getUserData } from '../firebase_utils';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default async function Samples() {

    const [data, setData] = useState({});
    const [selectedSample, setSelectedSample] = useState('');
    const [userData, setUserData] = useState({} as UserData);
    const [samplesState, setSamplesState] = useState([{}]);
    const [inProgressSamples, setInProgressSamples] = useState([{}]);
    const [allSamples, setAllSamples] = useState({});

    const app = initializeAppIfNecessary();
    const router = useRouter();
    const auth = getAuth();
    const { t } = useTranslation();

    useEffect(() => {
        showNavBar();
        showTopBar();
        if (!userData.role || userData.role.length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userData = getUserData(user.uid);
                    if (userData.org) {
                        setUserData(userData);
                    } else {
                        const newUserData = getNewUserData(user.uid);
                        if (newUserData.org && newUserData.org.length < 1) {
                            router.push('./select-org');
                        }

                    }
                }
            })
        }
    })

    if (!allSamples.inProgress && !allSamples.completed) {
        addSamplesToDataList();
    }

    async function addSamplesToDataList() {
        if (Object.keys(samplesState[0]).length < 1) {
            let allSamples: any = [{}];
            const trustedSamples = await getSamplesFromCollection(userData, 'trusted_samples');
            const untrustedSamples = await getSamplesFromCollection(userData, 'untrusted_samples');
            const unknownSamples = await getSamplesFromCollection(userData, 'unknown_samples');
            if (trustedSamples.length + untrustedSamples.length + unknownSamples.length < 1) {
                console.log("returning early")
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
                console.log("samples: " + inProgressSamples)
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

    console.log("got here again: " + allSamples.completed)

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            {(allSamples.inProgress || allSamples.completed) ? <div id="samplesTable" className='samples-wrapper'>
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
                    {allSamples.inProgress && <SamplesTable samplesData={allSamples.inProgress as Sample[]} canDeleteSamples={isAdmin()} showValidity={false} allowExport={false} />}
                </div>

                <div className="samples-sample-table">
                    <p className='samples-header'>{t('completed')}</p>
                    {allSamples.completed && <SamplesTable samplesData={allSamples.completed as Sample[]} canDeleteSamples={isAdmin()} showValidity={true} allowExport={true} />}
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



