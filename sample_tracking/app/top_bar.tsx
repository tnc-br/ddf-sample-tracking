
"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { initializeApp } from "firebase/app";
import './styles.css';
import { useState, useEffect, useRef } from 'react';
import { firebaseConfig } from './firebase_config';
import { getFirestore, getDoc, doc } from "firebase/firestore";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import Switch from '@mui/material/Switch';
import { green } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';
import {type UserData } from './utils'

export default function TopBar() {
    const [userData, setUserData] = useState(null as UserData|null);
    const [showMenu, setShowMenu] = useState(false);


    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();
    const { t, i18n } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
        // if (Object.keys(userData).length < 1) {
        if (!userData) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    setUserData({
                        name: user.displayName!,
                        photoUrl: user.photoURL!,
                        email: user.email!,
                    } as UserData)
                }
            });
        }

        document.addEventListener("mousedown", (event) => {
            const popupContainer = document.getElementById("profile-popup-wrapper");
            const profilePhoto = document.getElementById('profile-photo');
            if (profilePhoto?.contains(event.target)) {
                setShowMenu(!showMenu)
                return;
            }
            if (popupContainer?.contains(event.target)) {
                console.log("Clicked Inside");
            } else {
                setShowMenu(false)
            }


        });

    })

    if (!userData) return;


    function onLogOutClick() {
        signOut(auth).then(() => {
            router.replace('/login');
        }).catch((error) => {
            console.log('Unable to log out: ' + error);
        });
    }

    function handlePortugalesChange(evt: any) {
        if (i18n.language === 'en') {
            i18n.changeLanguage('pt');
        } else {
            i18n.changeLanguage('en');
        }
    }

    const GreenSwitch = styled(Switch)(({ theme }) => ({
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: green[600],
            '&:hover': {
                backgroundColor: alpha(green[600], theme.palette.action.hoverOpacity),
            },
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: green[600],
        },
    }));

    function profilePopup() {
        return (
            <div className='profile-popup-wrapper' id="profile-popup-wrapper">
                <div className='prifile-wrapper'>
                    <div className='monogram-wrapper'>
                        <div>
                            {userData.photoUrl && <img className="popup-profile-photo" src={userData.photoUrl} alt="Trulli" width="32" height="32" />}
                            {!userData.photoUrl && <div className="popup-letter-profile popup-profile-photo">{userData.name ? userData.name.charAt(0) : ''}</div>}
                        </div>
                    </div>
                    <div className='popup-header-wrapper'>
                        <div className='popup-name-text'>
                            {userData.name}
                        </div>
                        <div className='popup-email-text'>
                            {userData.email}
                        </div>
                    </div>
                </div>
                <div className='manage-profile-link-wrapper'>
                    <div onClick={() => router.push('./profile')} className='manage-profile-chip'>
                        <div className='manage-profile-text'>
                            Manage profile
                        </div>
                        <div className='external-link-svg'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.33333 3.33333V12.6667H12.6667V8H14V12.6667C14 13.4 13.4 14 12.6667 14H3.33333C2.59333 14 2 13.4 2 12.6667V3.33333C2 2.6 2.59333 2 3.33333 2H8V3.33333H3.33333ZM9.33333 3.33333V2H14V6.66667H12.6667V4.27333L6.11333 10.8267L5.17333 9.88667L11.7267 3.33333H9.33333Z" fill="#5F6368" />
                            </svg>
                        </div>
                    </div>

                </div>
                <div className='popup-divider-wrapper'>
                    <div className='popup-divider'>
                    </div>
                </div>
                <div className='language-toggle-wrapper'>
                    <div className='language-toggle-slate-layer'>
                        <div className='language-text-wrapper'>
                            <div className='language-text'>
                                Português
                            </div>
                        </div>
                        <div className='toggle-wrapper'>
                            <GreenSwitch defaultChecked={i18n.language === 'pt'} onChange={handlePortugalesChange} />
                        </div>
                    </div>
                </div>
                <div className='popup-divider-wrapper'>
                    <div className='popup-divider'>
                    </div>
                </div>
                <div className='logout-button-container-wrapper'>
                    <div onClick={onLogOutClick} className='logout-button-wrapper'>
                        <div className='logout-button'>
                            <div className='logout-button-text'>
                                Log out
                            </div>

                        </div>
                    </div>

                </div>



            </div>
        )
    }

    return (
        <div id="top-bar" className='top-bar-wrapper'>
            <div onClick={() => router.push('/samples')} className="page-title">Timber ID</div>
            {userData.photoUrl && <img id="profile-photo"  className="profile-photo" src={userData.photoUrl} width="32" height="32" />}
            {!userData.photoUrl && <div id="profile-photo"  className="letter-profile profile-photo">{userData.name ? userData.name.charAt(0) : ''}</div>}
            {showMenu && profilePopup()}
        </div>

    )

}