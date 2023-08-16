"use client";


import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '../firebase_config';
import { initializeApp } from "firebase/app";
import { useState, useEffect } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import 'bootstrap/dist/css/bootstrap.css';
import { getFirestore, getDocs, collection, updateDoc, doc, setDoc, addDoc, getDoc, arrayUnion, arrayRemove, deleteField, query, where, deleteDoc } from "firebase/firestore";
import { showNavBar, showTopBar, getRanHex } from '../utils';

type UserData = {
    role: string,
    org: string,
}

interface NestedSchemas {
    [key: string]: NestedSchemas;
}

export default function SignUpRequests() {
    const [pendingApprovals, setPendingApprovals] = useState({});
    const [currentUsers, setCurrentUsers] = useState({});
    const [prospectiveUsers, setProspectiveUsers] = useState({} as NestedSchemas);
    const [prospectiveOrgs, setProspectiveOrgs] = useState({} as NestedSchemas);
    const [userData, setUserData] = useState({} as UserData);

    // const adminApp = initializeAdminApp();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const router = useRouter();
    const db = getFirestore();

    useEffect(() => {
        showNavBar();
        showTopBar();
        if (Object.keys(userData).length < 1) {
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
                    })
                }
            });
        }
    })


    if (Object.keys(pendingApprovals).length < 1 && Object.keys(currentUsers).length < 1) {
        const pendingUsers: NestedSchemas = {};

        if (userData.role === 'admin' && userData.org.length > 0) {
            const q = query(collection(db, "new_users"), where("org", "==", userData.org));
            const docRef = getDocs(q).then((querySnapshot) => {
                querySnapshot.forEach((docRef) => {
                    pendingUsers[docRef.id] = docRef.data();
                })
                if (Object.keys(pendingUsers).length > 0 && Object.keys(prospectiveUsers).length < 1) {
                    setProspectiveUsers(pendingUsers);
                }
            })
        } else if (userData.role === "site_admin") {
            const pendingOrgs: NestedSchemas = {};
            getDocs(collection(db, "new_users")).then((querySnapshot) => {
                console.log('made request to get users');
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    console.log(docData);
                    if (doc.id === "new_orgs") {
                        Object.keys(docData).forEach((orgName: string) => {
                            pendingOrgs[orgName] = docData[orgName];
                        })
                    } else {
                        // orgId = doc.id;
                        const data = doc.data();
                        pendingUsers[doc.id] = data;

                    }
                });
                if (Object.keys(pendingOrgs).length > 0 && Object.keys(prospectiveOrgs).length < 1) {
                    setProspectiveOrgs(pendingOrgs);
                }
                if (Object.keys(pendingUsers).length > 0 && Object.keys(prospectiveUsers).length < 1) {
                    setProspectiveUsers(pendingUsers);
                }
            });

        }
    }

    function handleApproveOrgClick(evt: any) {
        console.log(evt);
        const orgName = evt.target.parentElement.parentElement.id;
        const adminId = prospectiveOrgs[orgName].admin_id as unknown as string;
        const date = new Date();
        const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`;

        // const adminName =         
        // addDoc(collection(db, "organizations"), { org_name: orgName });
        const orgId = getRanHex(20);
        const newOrgRef = doc(db, "organizations", orgId);
        setDoc(newOrgRef, {
            org_name: orgName,
        });
        const newUserDocRef = doc(db, "users", adminId);
        setDoc(newUserDocRef, {
            org: orgId,
            name: prospectiveOrgs[orgName].admin_name,
            email: prospectiveOrgs[orgName].email,
            role: "admin",
            date_added: dateString,
        });
        deleteOrgFromNewOrgLists(orgName);
    }

    function handleRejectOrgClick(evt: any) {
        const orgName = evt.target.parentElement.parentElement.id;
        addDoc(collection(db, "users"), {
            name: prospectiveOrgs[orgName].admin_name,
            email: prospectiveOrgs[orgName].email,
        });
        deleteOrgFromNewOrgLists(orgName);
    }

    function deleteOrgFromNewOrgLists(orgName: string) {
        const newOrgDocRef = doc(db, "new_users", "new_orgs");
        let deletedOrgDoc: any = {};
        deletedOrgDoc[orgName] = deleteField();
        updateDoc(newOrgDocRef, deletedOrgDoc);
        const newProspectiveOrgs = structuredClone(prospectiveOrgs);
        delete newProspectiveOrgs[orgName];
        setProspectiveOrgs(newProspectiveOrgs);
    }

    function handleApproveMemberClick(evt: any) {
        const memberId = evt.target.parentElement.parentElement.id;
        const orgId = prospectiveUsers[memberId].org;
        if (!orgId) {
            alert("Prospective user has not selected an organization to join. Once they select an organization, you will be able to approve their membership");
            return;
        }
        const userId = prospectiveUsers[memberId].uid

        const date = new Date();
        const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`;
        const newUserDocRef = doc(db, "users", userId as unknown as string);
        setDoc(newUserDocRef, {
            name: prospectiveUsers[memberId].name,
            org: orgId,
            date_added: dateString,
            role: "member",
            email: prospectiveUsers[memberId].email,
        });
        // const deleteDocRef = doc(db, "new_users", memberId);
        deleteMemberFromNewMemberList(memberId);

    }

    function handleRejectMemberClick(evt: any) {
        const memberId = evt.target.parentElement.parentElement.id;
        addDoc(collection(db, "users"), {
            name: prospectiveUsers[memberId].name,
            email: prospectiveUsers[memberId].email,
        });
        deleteMemberFromNewMemberList(memberId);
    }

    function deleteMemberFromNewMemberList(memberId: string) {
        deleteDoc(doc(db, "new_users", memberId));
        const newProspectiveUsersList = structuredClone(prospectiveUsers);
        delete newProspectiveUsersList[memberId];
        setProspectiveUsers(newProspectiveUsersList);
    }

    return (
        <div className='admin-wrapper'>
            <h3 className='header'>Sign up requests ({Object.keys(prospectiveUsers).length + Object.keys(prospectiveOrgs).length})</h3>
            <div className="details">
                <div className='section-title'>
                <p className='section-title'>Users ({Object.keys(prospectiveUsers).length})</p>
                </div>
                <table className="table">
                    <thead>
                        <tr id="table-header">
                            <th>Name</th>
                            <th>Organization</th>
                            <th>Email</th>
                            <th>Date requested</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(prospectiveUsers).map((key, i) => {
                                return (
                                    <tr key={i} id={key}>
                                        <td>{prospectiveUsers[key].name as unknown as string}</td>
                                        <td>{prospectiveUsers[key].org as unknown as string}</td>
                                        <td>{prospectiveUsers[key].email as unknown as string}</td>
                                        <td>{prospectiveUsers[key].date_requested as unknown as string}</td>
                                        <td className="approve-reject-wrapper"><button onClick={handleRejectMemberClick} type="button" className="btn btn-outline-danger reject-button">Decline</button>
                                            <button onClick={handleApproveMemberClick} type="button" className="btn btn-outline-primary approve-button">Approve</button>
                                        </td>

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            </div>


            <div className='details'>
                <div className='section-title'>
                <p className="section-title">Organizations ({Object.keys(prospectiveOrgs).length})</p>
                </div>
                <table className="table">
                    <thead>
                        <tr id="table-header">
                            <th>Lab name</th>
                            <th>Org Admin</th>
                            <th>Admin email</th>
                            <th>Date requested</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(prospectiveOrgs).map((key, i) => {
                                return (
                                    <tr key={i} id={key}>
                                        <td>{prospectiveOrgs[key].admin_name as unknown as string}</td>
                                        <td>{prospectiveOrgs[key].email as unknown as string}</td>
                                        <td>{prospectiveOrgs[key].date_requested as unknown as string}</td>
                                        <td>{prospectiveOrgs[key].date_requested as unknown as string}</td>
                                        <td className="approve-reject-wrapper"><button onClick={handleRejectOrgClick} type="button" className="btn btn-outline-danger reject-button">Decline</button>
                                            <button onClick={handleApproveOrgClick} type="button" className="btn btn-outline-primary approve-button">Approve</button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            </div>


        </div>
    )
}