
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

export default function TopBar() {
    const [userData, setUserData] = useState({});
    const [showMenu, setShowMenu] = useState(false);


    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    useEffect(() => {
        if (Object.keys(userData).length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            setUserData({
                                ...docRef.data(),
                                photoUrl: user.photoURL,
                            });
                        }
                    })
                }
            });
        }

    })

    if (!showMenu) {
        document.body.addEventListener('click', () => setShowMenu(false)); 
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

    function handleProfileClick() {
        setShowMenu(!showMenu);
    }

    return (
        <div className='top-bar-wrapper'>
            <div className="page-title">Timber ID</div>
            {userData.photoUrl && <img onClick={handleProfileClick} className="profile-photo" src={userData.photoUrl} alt="Trulli" width="32" height="32" />}
            {!userData.photoUrl && <div onClick={handleProfileClick} className="letter-profile profile-photo">{userData.name ? userData.name.charAt(0) : ''}</div>}
            {showMenu && <div className='profile-menu'>
                <div>
                    <span className="language-label">Portugales</span>
                    <input type="checkbox" id="portugales" name="portugales" value="portugales"></input>
                </div>
                <div className="nav-item">
                    <button className="nav-link" onClick={onLogOutClick}> <span className="material-symbols-outlined">
                        logout
                    </span> {t('logOut')}</button></div>
            </div>}
        </div>

    )

}