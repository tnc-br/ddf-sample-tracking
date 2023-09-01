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

interface OrgsSchemas {
    [key: string]: string;
}

export default function Profile() {
    const [userData, setUserData] = useState(null as UserData | null)


    const router = useRouter();
    const app = initializeAppIfNecessary();
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
                            const docData = docRef.data();
                            if (!docData.org) {
                                router.push('/samples');
                            } else {
                                setUserData(docData as UserData);
                            }
                        }
                    });
                }
            });
        }
    });

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
            <InputTopBar title="Profile" />
            <div className='profile-info-wrapper'>
                <div className='profile-info-input-wrapper'>
                    <div className='profile-personal-information-wrapper'>
                        <div className='profile-personal-information-text'>
                            Personal information
                        </div>

                    </div>
                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            Name
                        </span>
                        <span className='profile-data-point-wrapper'>
                            {userData.name}
                        </span>
                    </div>

                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            Email
                        </span>
                        <span className='profile-data-point-wrapper'>
                            {userData.email}
                        </span>
                    </div>
                    <div className='profile-input-wrapper'>
                        <span className='profile-data-wrapper'>
                            Organization
                        </span>
                        <span className='profile-data-point-wrapper'>
                            {userData.org_name}
                        </span>
                    </div>
                </div>
                <div className='delete-section'>
                    <div className='profile-delete-wrapper'>
                        <div className='profile-personal-information-text'>
                            Delete
                        </div>
                    </div>
                    <div className='profile-delete-subtitle'>
                        <div className='profile-delete-subtitle-text'>
                            Delete my account
                        </div>
                    </div>
                    <div onClick={handleDeleteButton} className='button-wrapper delete-button-wrapper'>
                        <div className='save-button-layer'>
                            <div className='button-text delete-button-text'>
                                Delete
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}