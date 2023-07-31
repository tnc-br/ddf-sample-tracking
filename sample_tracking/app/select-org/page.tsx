"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore, getDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { speciesList } from '../species_list';


type UserData = {
    name: string,
    email: string,
    date_requested: string,
    uid: string,
    org: string,
    org_name: string,
}

interface OrgsSchemas {
    [key: string]: string;
}

export default function SelectOrg() {
    const [availableOrgs, setAvailableOrgs] = useState({} as OrgsSchemas);
    const [userDocId, setNewUserDocId] = useState('');


    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        if (userDocId.length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log(user);
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            // User exists in users collection already, they should not be here to select a new organization.
                            console.log("Error: user already exists. Forwarding to samples page");
                            // router.push('/samples');
                        }
                    });
                    const newUsersCollectionRef = collection(db, "new_users");
                    const newUserQuery = query(newUsersCollectionRef,
                        where("email", "==", user.email)
                    );

                    getDocs(newUserQuery).then((querySnapshot) => {
                        if (querySnapshot.size > 1) {
                            console.log("Error: Found more than one new user with this email.");
                            return;
                        }
                        querySnapshot.forEach((docRef) => {
                            const data = docRef.data();
                            // if (data.exists()) {
                                if (data.org) {
                                    console.log("Error: this new user already has a pending org request. Forwarding to samples.");
                                    router.push('/samples');
                                }
                                setNewUserDocId(docRef.id);
                            // }
                        });

                    }).catch((error) => {
                        console.log("Unable to fetch new user in new_users collection: " + error);
                    });
                }
            });
        }
    });

    if (Object.keys(availableOrgs).length < 1) {
        const orgs: OrgsSchemas = {};
        getDocs(collection(db, "organizations")).then((querySnapshot) => {
            console.log('made request to organizations');
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                orgs[docData['org_name']] = doc.id;
            });
            setAvailableOrgs(orgs as OrgsSchemas);
        });
    }

    function handleOrgSelectButtonClick(evt: any) {
        console.log(evt);
        const orgName = (document.getElementById('orgSelect') as HTMLInputElement).value;
        const orgId = availableOrgs[orgName];
        const newUserDocRef = doc(db, "new_users", userDocId)
        updateDoc(newUserDocRef, {
            org: orgId,
            orgName: orgName,
        });
        router.push('/samples');
    }

    return (
        <div>
            <div className="form-group">
                <p className='title'>Which organization are you a part of?</p>
                <label htmlFor="orgSelect">Organization</label>
                <select className="form-control" id="orgSelect">
                    <option key="newOrgOption" id="newOrgOption">Create new organization</option>
                    {
                        Object.keys(availableOrgs).map((key, i) => {
                            return (
                                <option key={key} className={availableOrgs[key]} id={key}>{key}</option>
                            )
                        })
                    }
                </select>
                <button onClick={handleOrgSelectButtonClick} type="button" className="btn btn-primary">Request to join organization</button>
            </div>
        </div>
    )
}