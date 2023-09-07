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
import { type UserData } from './utils'

/**
 * Component to render the top bar shown on most pages in TimberId. 
 * Renders website name/icon in top left of screen, and user profile photo
 * or first initial on top left to let user access profile menu.
 */
export default function TopBar() {
    const [userData, setUserData] = useState(null as UserData | null);
    const [showMenu, setShowMenu] = useState(false);


    const app = initializeApp(firebaseConfig);
    const router = useRouter();
    const auth = getAuth();
    const db = getFirestore();
    const { t, i18n } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
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
            if (!popupContainer?.contains(event.target)) {
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
        <div className='top-bar-wrapper'>
            <div className='top-bar-product-wrapper'>
                <div className='display-inline-flex-center'>
                    <div className='top-bar-icon-wrapper'></div>
                    <div onClick={() => router.push('/samples')} className='top-bar-title-text'>Timber ID</div>
                </div>

                <div className='display-inline-flex-center'>
                    <div className='top-bar-info-link-wrapper'>
                        <a href="https://timberid.gitbook.io/timberid/">
                            <div className='top-bar-info-link-button'>
                                <div className='top-bar-info-link-icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM13 16V18H11V16H13ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM8 10C8 7.79 9.79 6 12 6C14.21 6 16 7.79 16 10C16 11.2829 15.21 11.9733 14.4408 12.6455C13.711 13.2833 13 13.9046 13 15H11C11 13.1787 11.9421 12.4566 12.7704 11.8217C13.4202 11.3236 14 10.8792 14 10C14 8.9 13.1 8 12 8C10.9 8 10 8.9 10 10H8Z" fill="#5F6368" />
                                    </svg>
                                </div>
                            </div>
                        </a>

                    </div>
                    <div className='top-bar-profile-menu-wrapper'>
                        <div className='top-bar-profile-menu'>
                            {userData.photoUrl && <img id="profile-photo" className="profile-photo" src={userData.photoUrl} width="32" height="32" />}
                            {!userData.photoUrl && <div id="profile-photo" className="letter-profile profile-photo">{userData.name ? userData.name.charAt(0) : ''}</div>}
                            {showMenu && profilePopup()}
                        </div>
                    </div>
                </div>


            </div>

        </div>

    )

}