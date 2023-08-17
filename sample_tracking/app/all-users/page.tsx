"use client";


import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '../firebase_config';
import { initializeApp } from "firebase/app";
import { useState, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import 'bootstrap/dist/css/bootstrap.css';
import { getFirestore, getDocs, collection, updateDoc, doc, setDoc, query, where, arrayRemove, getDoc, deleteDoc } from "firebase/firestore";
import { initializeAppIfNecessary } from '../utils';

interface NestedSchemas {
    [key: string]: NestedSchemas;
}

type UserData = {
    role: string,
    org: string,
}

export default function Users() {

    const [userDetails, setUserDetails] = useState({ role: '', org: '' });
    const [userData, setUserData] = useState({} as UserData);
    const [users, setUsers] = useState({} as NestedSchemas)

    const app = initializeAppIfNecessary();
    const auth = getAuth();
    const router = useRouter();
    const db = getFirestore();

    useEffect(() => {
        if (!userData.role || userData.role.length < 1) {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    router.push('/login');
                } else {
                    const userDocRef = doc(db, "users", user.uid);
                    getDoc(userDocRef).then((docRef) => {
                        if (docRef.exists()) {
                            const docData = docRef.data();
                            if (docData.role !== 'admin' && docData.role !== 'site_admin') {
                                router.push('/tasks');
                            }
                            setUserData(docRef.data() as UserData);
                        }
                    });
                }
            });
        }
    })
    

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
        const confirmString = `Are you sure you want to remove ${users[removedMemberId].name}?`
        if (!confirm(confirmString)) return;
        deleteDoc(doc(db, "users", removedMemberId));
        delete users[removedMemberId];
    }

    function handleMakeOrgAdminClick(evt: any) {
        
        const newOrgAdminId = evt.target.parentElement.parentElement.id;
        const confirmString = `Are you sure you want to make ${users[newOrgAdminId].name} an org admin?`
        if (!confirm(confirmString)) return;
        if (users[newOrgAdminId].role as unknown as string === 'site_admin') {
            // Cannot demote site_admin to org_admin
            return;
        }
        const userDocRef = doc(db, "users", newOrgAdminId);
        updateDoc(userDocRef, {
            role: "admin",
        });
    }

    function handleMakeSiteAdminClick(evt: any) {
        const newSiteAdminId = evt.target.parentElement.parentElement.id;
        const confirmString = `Are you sure you want to make ${users[newSiteAdminId].name} a site admin?`
        if (!confirm(confirmString)) return;
        const userDocRef = doc(db, "users", newSiteAdminId);
        updateDoc(userDocRef, {
            role: "site_admin",
        });
    }

    function showMakeOrgAdminButton(id: string): boolean {
        const userRole = users[id].role as unknown as string;
        return (userRole !== 'admin' && userRole !== 'site_admin');
    }

    function showMakeSiteAdminButton(id: string): boolean {
        const userRole = users[id].role as unknown as string;
        return userRole !== 'site_admin' && userData.role === 'site_admin';
    }

    function showRemoveUserButton(id: string): boolean {
        const userRole = users[id].role as unknown as string;
        return userRole !== 'site_admin';
    }

    function isSiteAdmin(id: string): boolean {
        const userRole = users[id].role as unknown as string;
        return userRole === 'site_admin';
    }



    return (<div>
        <div className='all-users-admin-wrapper'>
            <h3>{userDetails.role === 'admin' ? "My organization" : "All users"}</h3>
            <div>
                <div id="usersTable">
                    <p className='all-users-header'>Pending approval</p>
                    <table className="table">
                    <thead>
                        <tr id="table-header">
                            <th>Name</th>
                            <th>Organization</th>
                            <th>Email</th>
                            <th>Date requested</th>
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
                                        <td>
                                                {!isSiteAdmin(key) && <button onClick={handleRemoveClick} type="button" className="btn btn-sm btn-outline-danger">Remove</button>}
                                                {showMakeOrgAdminButton(key) && <button onClick={handleMakeOrgAdminClick} type="button" className="btn btn-sm btn-primary">Make org admin</button>}
                                                {showMakeSiteAdminButton(key) ? <button onClick={handleMakeSiteAdminClick} type="button" className="btn btn-sm btn-primary">Make site admin</button>
                                                : isSiteAdmin(key) ? <span>User is site admin</span> : <span>User is org admin</span>}
                                                </td>

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                    {/* <table className="all-users-table">
                        <thead>
                            <tr id="table-header">
                                <th>Name</th>
                                <th>Organization</th>
                                <th>Email</th>
                                <th>Date joined</th>
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
                                            <td>
                                                {!isSiteAdmin(key) && <button onClick={handleRemoveClick} type="button" className="all-users-btn btn-sm btn-outline-danger">Remove</button>}
                                                {showMakeOrgAdminButton(key) && <button onClick={handleMakeOrgAdminClick} type="button" className="all-users-btn btn-sm btn-primary">Make org admin</button>}
                                                {showMakeSiteAdminButton(key) ? <button onClick={handleMakeSiteAdminClick} type="button" className="all-users-btn btn-sm btn-primary">Make site admin</button>
                                                : isSiteAdmin(key) ? <span>User is site admin</span> : <span>User is org admin</span>}
                                                </td>
                                            
                                        </tr>
                                    )

                                })
                            }
                        </tbody>
                    </table> */}
                </div>
            </div>
        </div>
    </div>);
}