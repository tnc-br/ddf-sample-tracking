"use client";

import './styles.css';
import InputTopBar from "../input-top-bar"
import { type UserData, hideNavBar, hideTopBar, initializeAppIfNecessary } from '../utils';
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';

interface OrgsSchemas {
    [key: string]: string;
}

export default function Profile() {
    const [userData, setUserData] = useState(null as UserData | null)


    const router = useRouter();
    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const db = getFirestore();

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

    function handleSaveClick() {

    }



    return (
        <div>
            <InputTopBar title="Edit personal information" />
            <div className='profile-info-wrapper'>
                <div className='profile-info-input-wrapper'>
                    <div className='profile-personal-information-wrapper'>
                        <div className='profile-personal-information-text'>
                            Personal information
                        </div>

                    </div>
                    <div className='profile-input-wrapper'>
                        <TextField
                            size='small'
                            fullWidth
                            required
                            id="name"
                            name="name"
                            label="Name"
                            value={userData.name}
                        />
                    </div>

                    <div className='profile-input-wrapper'>
                        <TextField
                            size='small'
                            fullWidth
                            required
                            id="email"
                            name="email"
                            label="Email"
                            value={userData.email}
                        />
                    </div>
                    <div className='profile-input-wrapper'>
                        <TextField
                            size='small'
                            fullWidth
                            required
                            id="org"
                            name="org"
                            label="Org"
                            value={userData.org_name}
                        />
                    </div>

                    <div onClick={handleSaveClick} className='button-wrapper save-button-wrapper'>
                        <div className='save-button-layer'>
                            <div className='button-text save-button-text'>
                                Save
                            </div>
                        </div>
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
                <div className='button-wrapper delete-button-wrapper'>
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