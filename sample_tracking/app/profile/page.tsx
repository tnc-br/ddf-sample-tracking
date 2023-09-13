"use client";

import './styles.css';
import InputTopBar from "../input-top-bar"
import { type UserData, hideNavBar, hideTopBar, initializeAppIfNecessary } from '../utils';
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { getFirestore, getDoc, doc, deleteDoc } from "firebase/firestore";
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Page to display user account info and the option to delete an account. 
 * - Fetches user data from the "users" collection to render on the page. 
 * - If a user is not logged in they are forwarded to the login page.
 * - If a user deletes their account, their account is deleted in firebase
 *   auth and their document in the "users" collection is deleted.
 */
export default function Profile() {
    const [userData, setUserData] = useState(null as UserData | null)


    const router = useRouter();
    initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();
    const { t } = useTranslation();

    useEffect(() => {
        hideNavBar();
        hideTopBar();
        if (!userData) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            setUserData(docRef.data() as UserData);
                        }
                    });
                }
            });
        }
    }, []);

    if (!userData) return;

    function handleDeleteButton() {
        const user = auth.currentUser;
        if (!user) return;
        if (confirm(t('deleteActConfirmation'))) {
            deleteUser(user).then(async () => {
                const deletedUserDoc = doc(db, 'users', userData!.user_id);
                await deleteDoc(deletedUserDoc);
                router.push('./login');
            }).catch((error) => {
                console.log("Error: unable to delete act: " + userData?.user_id);
                console.log(error);
            })
        }

    }

    return (
        <div>
            <InputTopBar title={t('profile')} />
            <div className='profile-info-wrapper'>
                <div className='profile-info-input-wrapper'>
                    <div className='profile-personal-information-wrapper'>
                        <div className='profile-personal-information-text'>
                            {t('personalInformation')}
                        </div>

                    </div>
                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            {t('name')}
                        </span>
                        <span id="profile-name" className='profile-data-point-wrapper'>
                            {userData.name}
                        </span>
                    </div>

                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            {t('email')}
                        </span>
                        <span className='profile-data-point-wrapper'>
                            {userData.email}
                        </span>
                    </div>
                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            {t('organization')}
                        </span>
                        <span className='profile-data-point-wrapper'>
                            {userData.org_name}
                        </span>
                    </div>
                </div>
                <div className='delete-section'>
                    <div className='profile-delete-wrapper'>
                        <div className='profile-personal-information-text'>
                            {t('delete')}
                        </div>
                    </div>
                    <div className='profile-delete-subtitle'>
                        <div className='profile-delete-subtitle-text'>
                            {t('deleteMyAccount')}
                        </div>
                    </div>
                    <div id="delete-button" onClick={handleDeleteButton} className='button-wrapper delete-button-wrapper'>
                        <div className='save-button-layer'>
                            <div className='button-text delete-button-text'>
                                {t('delete')}
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}