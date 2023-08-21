"use client";


import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '../firebase_config';
import { initializeApp } from "firebase/app";
import { useState, useEffect, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
import 'bootstrap/dist/css/bootstrap.css';
import { getFirestore, getDocs, collection, updateDoc, doc, setDoc, query, where, arrayRemove, getDoc, deleteDoc } from "firebase/firestore";
import { type UserData } from '../utils';

import { MaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableInstance, type MRT_SortingState, type MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import '../i18n/config';
import { Box, Button, ListItemIcon, MenuItem, Typography } from '@mui/material';

interface NestedSchemas {
    [key: string]: NestedSchemas;
}

type OrgData = {
    name: string,
    admin: string,
    number_of_users: number,
}

export default function Users() {
    // const [pendingApprovals, setPendingApprovals] = useState({});
    // const [currentUsers, setCurrentUsers] = useState({});
    // const [roleAccessStatus, setRoleAccessStatus] = useState({});
    // const [updateState, setUpdateState] = useState(false);

    const [userDetails, setUserDetails] = useState({ role: '', org: '' });
    const [userData, setUserData] = useState({} as UserData);
    const [users, setUsers] = useState({} as NestedSchemas)
    const [currentTab, setCurrentTab] = useState(1);

    const [userDataArray, setUserDataArray] = useState([] as UserData[]);
    const [orgDataArray, setOrgDataArray] = useState([] as OrgData[])

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
    const { t } = useTranslation();
    const userDataTableInstanceRef = useRef<MRT_TableInstance<UserData>>(null);
    const orgDataTableInstanceRef = useRef<MRT_TableInstance<OrgData>>(null);

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


    if (userDataArray.length < 1) {
        const usersListArray: UserData[] = [];
        if (userData.role === 'site_admin') {
            getDocs(collection(db, "users")).then((querySnapshot) => {
                console.log('made request to get users');
                const usersList: NestedSchemas = {};

                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    console.log(docData);
                    if (docData.org) {
                        usersList[doc.id] = docData;
                        usersListArray.push({
                            ...docData,
                            user_id: doc.id,
                        } as UserData);
                    }

                });
                if (Object.keys(usersList).length > 0) {
                    setUsers(usersList);
                    setUserDataArray(usersListArray)
                }
            });
        } else if (userData.role === 'admin') {
            const q = query(collection(db, "users"), where("org", "==", userData.org));
            const docRef = getDocs(q).then((querySnapshot) => {
                const usersList: NestedSchemas = {};
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    usersList[doc.id] = docData;
                    usersListArray.push({
                        ...docData,
                        user_id: doc.id,
                    } as UserData);
                })
                if (Object.keys(usersList).length > 0) {
                    setUsers(usersList);
                    setUserDataArray(usersListArray);
                }
            })
        }
    }

    if (userData.role === "site_admin" && orgDataArray.length < 1) {
        getDocs(collection(db, "organizations")).then((querySnapshot) => {
            console.log('made request to get orgs');
            let orgList: OrgData[] = [];

            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                console.log(docData);
                orgList.push({
                    name: docData.org_name,
                    admin: docData.admins ? docData.admins[0].name : "",
                    number_of_users: userDataArray.length > 0 ? userDataArray.filter(user => user.org === doc.id).length : 0,
                } as OrgData)
            });
            if (orgList.length > 0) {
                setOrgDataArray(orgList);
            }
        });
    }



    const userColumns = useMemo<MRT_ColumnDef<UserData>[]>(
        () => [
            {
                accessorKey: 'name',
                header: t('name'),
                size: 150,
            },
            {
                accessorKey: 'email',
                header: t('email'),
                size: 100,
            },
            {
                accessorKey: 'org',
                header: t('organization'),
                size: 100,
            },
            {
                accessorKey: 'date_added',
                header: t('dateAdded'),
                size: 100,
            },

        ],
        [userDataArray],
    );

    const orgColumns = useMemo<MRT_ColumnDef<OrgData>[]>(
        () => [
            {
                accessorKey: 'name',
                header: t('name'),
                size: 150,
            },
            {
                accessorKey: 'admin',
                header: t('admin'),
                size: 100,
            },
            {
                accessorKey: 'number_of_users',
                header: t('numberOfUsers'),
                size: 100,
            },
        ],
        [userDataArray],
    );

    function handleRemoveClick(userData: UserData) {
        const removedMemberId = userData.user_id;
        const confirmString = `Are you sure you want to remove ${userData.name}?`
        if (!confirm(confirmString)) return;
        deleteDoc(doc(db, "users", removedMemberId));
        delete users[removedMemberId];
    }

    function handleMakeOrgAdminClick(userData: UserData) {
        const newOrgAdminId = userData.user_id;
        if (userData.role as unknown as string === 'site_admin') {
            // Cannot demote site_admin to org_admin
            return;
        }
        const confirmString = `Are you sure you want to make ${userData.name} an org admin?`
        if (!confirm(confirmString)) return;
        const userDocRef = doc(db, "users", newOrgAdminId);
        updateDoc(userDocRef, {
            role: "admin",
        });
    }

    function handleMakeSiteAdminClick(userData: UserData) {
        const newSiteAdminId =userData.user_id;
        const confirmString = `Are you sure you want to make ${userData.name} a site admin?`
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
            <h3 className='all-users-title'>{userDetails.role === 'admin' ? "My organization" : "All users"}</h3>

            <div className="all-users-tab-wrapper">
                <div className="all-users-tab-group">
                    <div onClick={() => setCurrentTab(1)} className={currentTab === 1 ? 'all-users-selected-tab all-users-tab' : 'all-users-tab'}>
                        <div className="all-users-slate-wrapper">
                            <div className="all-users-tab-contents">
                                <p className="all-users-tab-text">Individuals ({userDataArray.length})</p>
                            </div>
                        </div>
                    </div>
                    <div onClick={() => setCurrentTab(2)} className={currentTab === 2 ? 'all-users-selected-tab all-users-tab' : 'all-users-tab'}>
                        <div className="all-users-slate-wrapper">
                            <div className="all-users-tab-contents">
                                <p className="all-users-tab-text">Organizations ({orgDataArray.length})</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {currentTab === 1 && <MaterialReactTable
                    columns={userColumns}
                    data={userDataArray}
                    enableFacetedValues
                    enableRowActions
                    tableInstanceRef={userDataTableInstanceRef}
                    globalFilterFn="contains"
                    muiTablePaginationProps={{
                        rowsPerPageOptions: [5, 10],
                    }}
                    renderRowActionMenuItems={({ row, closeMenu }) => [
                        <MenuItem
                            disabled={userData.role !== "site_admin" || row.original.role === "site_admin"}
                            key={0}
                            onClick={() => {
                                handleMakeSiteAdminClick(row.original);
                                closeMenu();
                            }}
                            sx={{ m: 0 }}
                        >
                            Make site admin
                        </MenuItem>,
                        <MenuItem
                            disabled={row.original.role === "site_admin" || row.original.role === "admin"}
                            key={1}
                            onClick={() => {
                                handleMakeOrgAdminClick(row.original);
                                closeMenu();
                            }}
                            sx={{ m: 0 }}
                        >
                            Make org admin
                        </MenuItem>,
                        <MenuItem
                            disabled={row.original.role === "site_admin"}
                            key={2}
                            onClick={() => {
                                handleRemoveClick(row.original);
                                closeMenu();
                            }}
                            sx={{ m: 0 }}
                        >
                            Remove
                        </MenuItem>,
                    ]}
                />}
                {currentTab === 2 && <MaterialReactTable
                    columns={orgColumns}
                    data={orgDataArray}
                    enableFacetedValues
                    tableInstanceRef={orgDataTableInstanceRef}
                    globalFilterFn="contains"
                    muiTablePaginationProps={{
                        rowsPerPageOptions: [5, 10],
                    }}
                />}



                {/* <div id="usersTable">
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
                </div> */}

            </div>
        </div>
    </div>);
}