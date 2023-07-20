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
import { getFirestore, getDocs, collection, updateDoc, doc, setDoc } from "firebase/firestore";



export default function Admin() {
    const [pendingApprovals, setPendingApprovals] = useState({});
    const [currentUsers, setCurrentUsers] = useState({});
    const [roleAccessStatus, setRoleAccessStatus] = useState({});
    const [updateState, setUpdateState] = useState(false);

    function addPendingApproval(pendingApproval) {
        setPendingApprovals([...pendingApprovals, pendingApproval]);
    }

    function updateRoleAccessStatus(uid: string, accessPaused: boolean) {
        const updatedValueUserId = `${uid}`;
        let updatedValue = {};
        updatedValue[uid] = accessPaused;
        setRoleAccessStatus(roleAccessStatus => ({
            ...roleAccessStatus,
            ...updatedValue
        }))
    }
    // const adminApp = initializeAdminApp();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const router = useRouter();
    const db = getFirestore();
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            router.push('/login');
        } else {
            user.getIdTokenResult(true).then((token) => {
                if (token.claims.role !== 'admin' && token.claims.role !== 'site_admin') {
                    router.push('/tasks');
                }
            });
        }
    });

    if (Object.keys(pendingApprovals).length < 1 && Object.keys(currentUsers).length < 1) {
        getDocs(collection(db, "users")).then((querySnapshot) => {
            console.log('made request to get users');
            const pendingApprovalsList = {};
            const currentUsersList = {};

            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                console.log(docData);
                if (docData.role_approval_status === 'needs_approval') {
                    pendingApprovalsList[doc.id] = docData;
                } else if (docData.role_approval_status === 'approved') {
                    currentUsersList[doc.id] = docData;
                }
                // samples[doc.id] = doc.data();
            });
            if (Object.keys(pendingApprovalsList).length > 0) {
                setPendingApprovals(pendingApprovalsList);
            }
            if (Object.keys(currentUsersList).length > 0) {
                setCurrentUsers(currentUsersList);
            }

        });
    }

    if (Object.keys(roleAccessStatus).length < 1) {
        getDocs(collection(db, "roles_to_be_updated")).then((querySnapshot) => {
            console.log('made request to get roles_to_be_updated');
            const rolesToBeUpdatedList = {};

            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                rolesToBeUpdatedList[doc.id] = docData.access_paused;
            });
            if (Object.keys(rolesToBeUpdatedList).length > 0) {
                setRoleAccessStatus(rolesToBeUpdatedList);
            }
        })
    }

    function handleApproveClick(evt) {
        const userId = evt.currentTarget.parentElement.parentElement.id;
        const setDocRef = doc(db, "roles_to_be_updated", userId);
        setDoc(setDocRef, {
            role: pendingApprovals[userId].role,
        });
        const updateDocRef = doc(db, "users", userId);
        updateDoc(updateDocRef, {
            role_approval_status: 'approved',
        });
        let approvalList = pendingApprovals;
        delete approvalList[userId]
        setPendingApprovals(approvalList)
    }

    function handleRejectClick() {

    }

    function handleEnableAccessClick(evt) {
        const userId = evt.currentTarget.parentElement.parentElement.id;
        const updateDocRef = doc(db, 'roles_to_be_updated', userId);
        updateDoc(updateDocRef, {
            access_paused: false,
        });
        if (updateState) {
            console.log('test');
        }
        updateRoleAccessStatus(userId, false)
    }

    function handlePauseAccessClick(evt) {
        const userId = evt.currentTarget.parentElement.parentElement.id;
        const updateDocRef = doc(db, 'roles_to_be_updated', userId);
        updateDoc(updateDocRef, {
            access_paused: true,
        });
        updateRoleAccessStatus(userId, true);


    }



    // getAdminAuth()
    //     .setCustomUserClaims(uid, { admin: true })
    //     .then(() => {
    //         // The new custom claims will propagate to the user's ID token the
    //         // next time a new one is issued.
    //     });
    return (<div><div>
        <Nav />
    </div>
        <div className='admin-wrapper'>
            <h3>Admin page</h3>
            <div>
                <div id="pendingApprovalsTable" className='samples-wrapper'>
                    <p className='header'>Pending approval</p>
                    <table className="table">
                        <thead>
                            <tr id="table-header">
                                <th>Name</th>
                                <th>Lab</th>
                                <th>Role</th>
                                <th>Approve/reject</th>
                            </tr>
                        </thead>
                        <tbody id="samples-data">
                            {
                                Object.keys(pendingApprovals).map((key, i) => {
                                    return (
                                        <tr key={i} id={key}>
                                            <td>{pendingApprovals[key].name}</td>
                                            <td>{pendingApprovals[key].lab}</td>
                                            <td>{pendingApprovals[key].role}</td>
                                            <td><button onClick={handleApproveClick} type="button" className="btn btn-outline-primary">Approve</button>
                                                <button onClick={handleRejectClick} type="button" className="btn btn-outline-danger">Reject</button></td>
                                        </tr>
                                    )

                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div id="usersTable" className='samples-wrapper'>
                    <p className='header'>Active users</p>
                    <table className="table">
                        <thead>
                            <tr id="table-header">
                                <th>Name</th>
                                <th>Lab</th>
                                <th>Role</th>
                                <th>Control access</th>
                            </tr>
                        </thead>
                        <tbody id="samples-data">
                            {
                                Object.keys(currentUsers).map((key, i) => {
                                    return (
                                        <tr key={i} id={key}>
                                            <td>{currentUsers[key].name}</td>
                                            <td>{currentUsers[key].lab}</td>
                                            <td>{currentUsers[key].role}</td>
                                            {<td> {roleAccessStatus[key] ?
                                                <button onClick={handleEnableAccessClick} type="button" className="btn btn-outline-primary">Enable access</button> :
                                                <button onClick={handlePauseAccessClick} type="button" className="btn btn-outline-danger">Pause access</button>}
                                            </td>}

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