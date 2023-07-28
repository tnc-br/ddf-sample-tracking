"use client";


import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '../firebase_config';
import { initializeApp } from "firebase/app";
import { useState } from 'react';
import Nav from '../nav';
import './styles.css';
import { useRouter } from 'next/navigation'
import 'bootstrap/dist/css/bootstrap.css';
import { getFirestore, getDocs, collection, updateDoc, doc, setDoc, query, where, arrayRemove, getDoc, deleteDoc } from "firebase/firestore";

interface NestedSchemas {
    [key: string]: NestedSchemas;
}

type UserData = {
    role: string,
    org: string,
}

export default function Users() {
    // const [pendingApprovals, setPendingApprovals] = useState({});
    // const [currentUsers, setCurrentUsers] = useState({});
    // const [roleAccessStatus, setRoleAccessStatus] = useState({});
    // const [updateState, setUpdateState] = useState(false);

    const [userDetails, setUserDetails] = useState({ role: '', org: '' });
    const [userData, setUserData] = useState({} as UserData);
    const [users, setUsers] = useState({} as NestedSchemas)

    // function addPendingApproval(pendingApproval) {
    //     setPendingApprovals([...pendingApprovals, pendingApproval]);
    // }

    // function updateRoleAccessStatus(uid: string, accessPaused: boolean) {
    //     const updatedValueUserId = `${uid}`;
    //     let updatedValue = {};
    //     updatedValue[uid] = accessPaused;
    //     setRoleAccessStatus(roleAccessStatus => ({
    //         ...roleAccessStatus,
    //         ...updatedValue
    //     }))
    // }
    // const adminApp = initializeAdminApp();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const router = useRouter();
    const db = getFirestore();
    if (!userData.role || userData.role.length < 1) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace('/login');
            } else {
                const userDocRef = doc(db, "users", user.uid);
                getDoc(userDocRef).then((docRef) => {
                    if (docRef.exists()) {
                        const docData = docRef.data();
                        if (docData.role !== 'admin' && docData.role !== 'site_admin') {
                            router.replace('/tasks');
                        }
                        setUserData(docRef.data() as UserData);
                    }
                });
                // user.getIdTokenResult(true).then((token) => {
                //     if (token.claims.role !== 'admin' && token.claims.role !== 'site_admin') {
                //         router.replace('/tasks');
                //     } else if (userDetails.role.length < 1) {
                //         // setUserDetails({role: token.claims.role, org: token.claims.org});
                //         // setUserData()
                //     }
                // });
            }
        });
    }

    if (Object.keys(users).length < 1) {
        if (userData.role === 'site_admin') {
            getDocs(collection(db, "users")).then((querySnapshot) => {
                console.log('made request to get users');
                const usersList: NestedSchemas = {};

                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    console.log(docData);
                    if (docData.org) {
                        usersList[doc.id] = docData;
                    }
                    
                });
                if (Object.keys(usersList).length > 0) {
                    setUsers(usersList);
                }
            });
        } else if (userData.role === 'admin') {
            const q = query(collection(db, "users"), where("org", "==", userData.org));
            const docRef = getDocs(q).then((querySnapshot) => {
                const usersList: NestedSchemas = {};
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    usersList[doc.id] = docData;
                })
                if (Object.keys(usersList).length > 0) {
                    setUsers(usersList);
                }
            })
        }

    }

    function handleRemoveClick(evt: any) {
        // const docRef = doc(db, "organizations", userDetails.org);
        const removedMemberId = evt.target.parentElement.parentElement.id;
        const userDocRef = doc(db, "users", removedMemberId);
        updateDoc(userDocRef, {
            org: "",
        })
        // deleteDoc(doc(db, "users", removedMemberId));
        
        delete users[removedMemberId];
        // updateDoc(docRef, {
        //     members: arrayRemove(removedMemberId),
        // });
        
    }



    return (<div><div>
        <Nav />
    </div>
        <div className='admin-wrapper'>
            <h3>{userDetails.role === 'admin' ? "My organization" : "All users"}</h3>
            <div>
                <div id="usersTable" className='samples-wrapper'>
                    <p className='header'>Pending approval</p>
                    <table className="table">
                        <thead>
                            <tr id="table-header">
                                <th>Name</th>
                                <th>Organization</th>
                                <th>Email</th>
                                <th>Date joined</th>
                                {/* <th>Approve/reject</th> */}
                            </tr>
                        </thead>
                        <tbody id="samples-data">
                            {
                                Object.keys(users).map((key, i) => {
                                    return (
                                        <tr key={i} id={key}>
                                            <td>{users[key].name as unknown as string}</td>
                                            <td>{users[key].org as unknown as string}</td>
                                            <td>{users[key].email as unknown as string}</td>
                                            <td>{users[key].date_added as unknown as string}</td>
                                            <td><button onClick={handleRemoveClick} type="button" className="btn btn-outline-danger">Remove</button></td>
                                            {/* <td><button onClick={handleApproveClick} type="button" className="btn btn-outline-primary">Approve</button>
                                                <button onClick={handleRejectClick} type="button" className="btn btn-outline-danger">Reject</button></td> */}
                                        </tr>
                                    )

                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>);
}