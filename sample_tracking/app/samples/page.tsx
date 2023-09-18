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

const COMPLETED_SAMPLES = 'completed_samples';
const IN_PROGRESS_SAMPLES = 'in_progress_samples'


/**
 * Component for the main page of TimberId. Renders all the samples visible to the logged in user using the SamplesTable subcomponent. 
 * If the user is a site_admin, all samples in the database are fetched, otherwise only the samples linked to the users org are fetched. 
 */
export default function Samples() {

    const [userData, setUserData] = useState({} as UserData);
    const [samplesState, setSamplesState] = useState([{}]);
    const [allSamples, setAllSamples] = useState({
        inProgress: null as Sample[] | null,
        completed: null as Sample[] | null
    });

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
                    getUserData(user.uid).then((userData: UserData) => {
                        setUserData(userData);
                    })
                }
                if (!user) {
                    router.push('/login');
                }
            })
        }
    }, [])

    if (!allSamples.inProgress && !allSamples.completed) {
        addSamplesToDataList();
    }

    async function addSamplesToDataList() {
        // We don't want to refetch the data if we already have.
        if (allSamples.inProgress || allSamples.completed) {
            return;
        }
        const trustedSamples = await getSamplesFromCollection(userData, 'trusted_samples');
        const untrustedSamples = await getSamplesFromCollection(userData, 'untrusted_samples');
        const unknownSamples = await getSamplesFromCollection(userData, 'unknown_samples');
        if (trustedSamples.length + untrustedSamples.length + unknownSamples.length < 1) {
            setAllSamples({inProgress: [], completed: []});
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
        }
    }

    function isAdmin(): boolean {
        return userData.role === 'admin' || userData.role === 'site_admin';
    }

    function viewTab(scrollToElementId: string) {
        return (
            <div onClick={() => document.getElementById(scrollToElementId)?.scrollIntoView()} className='filter-chip'>
                <div className='filter-chip-slate-layer'>
                    <div className='filter-chip-icon-wrapper'>
                        <div className='filter-chip-icon'>
                            <span className="material-symbols-outlined">
                                visibility
                            </span>
                        </div>
                    </div>
                    <div className='filter-chip-text'>{t('view')}
                    </div>
                </div>
            </div>
        )
    }

    function samplesTableHeader() {
        return (
            <div className='samples-header-wrapper'>
                <div className='samples-header'>In progress</div>
                <div className='samples-subheader'>Your tasks currently in progress</div>
            </div>
        )

    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />


            {(allSamples.inProgress || allSamples.completed) ? <div id="samplesTable" className='samples-wrapper'>
                <div id="import-status-bar"></div>
                <div className='samples-summary'>
                    {allSamples.inProgress && <div className='samples-summary-box'>
                        <div className='samples-size-label'>{allSamples.inProgress.length}</div>
                        <span className="samples-badge samples-in-progress">{t('inProgress')}</span>
                        {viewTab(IN_PROGRESS_SAMPLES)}
                    </div>}

                    {allSamples.completed && <div className='samples-summary-box'>
                        <div className='samples-size-label'>{allSamples.completed.length}</div>
                        <span className="samples-badge samples-completed">{t('completed')}</span>
                        {viewTab(COMPLETED_SAMPLES)}
                    </div>}
                </div>

                <div id={IN_PROGRESS_SAMPLES} className="samples-sample-table">
                    {/* <p className='samples-header'>{t('inProgress')}</p> */}
                    <div className='samples-header-wrapper'>
                        <div className='samples-header'>In progress ({allSamples.inProgress.length})</div>
                        <div className='samples-subheader'>Your tasks currently in progress</div>
                    </div>
                    {allSamples.inProgress && <SamplesTable samplesData={allSamples.inProgress as Sample[]} canDeleteSamples={isAdmin()} showValidity={false} allowExport={false} />}
                </div>

                <div id={COMPLETED_SAMPLES} className="samples-sample-table">
                    {/* <p className='samples-header'>{t('completed')}</p> */}
                    <div className='samples-header-wrapper'>
                        <div className='samples-header'>Completed ({allSamples.completed.length})</div>
                        <div className='samples-subheader'>Your completed tasks</div>
                    </div>
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