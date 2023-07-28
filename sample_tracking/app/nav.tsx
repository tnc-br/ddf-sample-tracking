
"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import './styles.css';
import { useState } from 'react';
import { firebaseConfig } from './firebase_config';
import { getFirestore, getDoc, doc } from "firebase/firestore";

export default function Nav() {
    const [role, setRole] = useState('');
    // const [userData, setUserData] = useState({});


    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();

    if (role.length < 1) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace('/login');
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
        <div className='nav-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <ul className="nav flex-column">
                {canAddSample() && <li className="nav-item">
                    <a className="nav-link add-sample-button" href="./add-sample"><span className="material-symbols-outlined">
                        add
                    </span> Add sample</a>
                </li>}
                {canAddSample() && <li className="nav-item">
                    <a className="nav-link" href="./import-samples">
                        <span className="material-symbols-outlined">cloud_upload</span>
                        Import samples</a>
                </li>}
                {canAddSample() && <li className="nav-item">
                    <a className="nav-link" href="./tasks"><span className="material-symbols-outlined">
                        list_alt
                    </span> My tasks</a>
                </li>}
                {canAddSample() && <li className="nav-item">
                    <a className="nav-link" href="./my-samples"> <span className="material-symbols-outlined">
                        labs
                    </span>My samples</a>
                </li>}
                <li className="nav-item">
                    <a className="nav-link" href="./samples"> <span className="material-symbols-outlined">
                        lab_panel
                    </span> All samples</a>
                </li>
                <div className="admin-options">
                    {isAdmin() && <li className="nav-item">
                        <a className="nav-link" href="./sign-up-requests"><span className="material-symbols-outlined">
                            person_add
                        </span> Sign up requests</a>
                    </li>}
                    {isAdmin() && <li className="nav-item">
                        <a className="nav-link" href="./all-users"><span className="material-symbols-outlined">
                            groups
                        </span> {role === 'site_admin' ? 'All users' : 'My organization'}</a>
                    </li>}

                </div>

                <li className="nav-item">
                    <button className="nav-link" onClick={onLogOutClick}> <span className="material-symbols-outlined">
                        logout
                    </span> Log out</button>
                </li>

            </ul>
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