
"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import './styles.css';
import { useState, useEffect } from 'react';
import { firebaseConfig } from './firebase_config';
import { getFirestore, getDoc, doc } from "firebase/firestore";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import './i18n/config';

export default function Nav() {
    const [role, setRole] = useState('');
    const [showAddSampleMenu, setShowAddSampleMenu] = useState(false);
    // const [userData, setUserData] = useState({});


    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    useEffect(() => {
        if (role.length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            setRole(docRef.data().role);
                        }
                    })
                }
            });
        }

    })


    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         user.getIdTokenResult(true).then((token) => {
    //             // setIsAdmin(token.claims.role === 'admin');
    //             setRole(token.claims.role);
    //         })
    //     }
    // });


    function onLogOutClick() {
        signOut(auth).then(() => {
            router.replace('/login');
        }).catch((error) => {
            console.log('Unable to log out: ' + error);
        });
    }

    function canAddSample() {
        return role === 'admin' || role === 'member' || role === 'site_admin';
    }

    function isAdmin() {
        return role === 'admin' || role === 'site_admin';
    }

    return (
        <div id="nav-wrapper" className='nav-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <ul className="nav flex-column">
                {/* {canAddSample() && <li className="nav-item">
                    <Link className="nav-link add-sample-button" href="./add-sample"><span className="material-symbols-outlined">
                        add
                    </span> {t('addSample')}</Link>
                </li>} */}
                {canAddSample() && <li className="nav-item">
                    <div className="nav-link add-sample-button" onClick={() => setShowAddSampleMenu(!showAddSampleMenu)}><span className="material-symbols-outlined">
                        add
                    </span> {t('addSample')}</div>
                </li>}
                {canAddSample() && <li className="nav-item">
                    <Link className="nav-link" href="./import-samples">
                        <span className="material-symbols-outlined">cloud_upload</span>
                        {t('importSamples')}</Link>
                </li>}
                {/* {canAddSample() && <li className="nav-item">
                    <Link className="nav-link" href="./my-samples"> <span className="material-symbols-outlined">
                        labs
                    </span>{t('mySamples')}</Link>
                </li>} */}
                <li className="nav-item">
                    <Link className="nav-link" href="./samples"> <span className="material-symbols-outlined">
                        lab_panel
                    </span> {t('allSamples')}</Link>
                </li>
                <div className="admin-options">
                    {isAdmin() && <li className="nav-item">
                        <Link className="nav-link" href="./sign-up-requests"><span className="material-symbols-outlined">
                            person_add
                        </span> {t('signUpRequests')}</Link>
                    </li>}
                    {isAdmin() && <li className="nav-item">
                        <Link className="nav-link" href="./all-users"><span className="material-symbols-outlined">
                            groups
                        </span> {role === 'site_admin' ? t('allUsers') : t('myOrganization')}</Link>
                    </li>}

                </div>

                {/* <li className="nav-item">
                    <button className="nav-link" onClick={onLogOutClick}> <span className="material-symbols-outlined">
                        logout
                    </span> {t('logOut')}</button>
                </li> */}

                {showAddSampleMenu && <div className="add-sample-options-wrapper">
                    <Link className="nav-link" href="./add-sample?status=completed">Completed sample</Link>
                    <Link className="nav-link" href="./add-sample?status=incomplete">Incomplete sample</Link>
                    {/* <div><Link href="./add-sample?status=complete" className='add-sample-option'>Completed sample</Link></div>
                <div><Link href="./add-sample?status=incomplete" className='add-sample-option'>Uncompleted sample</Link></div> */}
                </div>}

            </ul>
            <div>
                <a href="https://docs.google.com/forms/d/1Wu9vsMlMMnCc-fCGEW5_lwKSr8y7hDPhaZonC1AoP6Q/">
                    <span className="material-symbols-outlined feedback-icon">
                        help
                    </span>
                </a>

            </div>
            {/* <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <a className="nav-link" href="/add-sample">Add samples <span className="sr-only">(current)</span></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/samples">Samples</a>
                    </li>
                </ul>
                <button className="my-2 my-lg-0 btn btn-outline-primary my-2 my-sm-0" type="submit" onClick={onLogOutClick}>Log out</button>
            </nav> */}

        </div>

    )

}