"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useMemo, useRef } from "react";
import "./styles.css";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.css";
import {
  getFirestore,
  getDocs,
  collection,
  updateDoc,
  doc,
  setDoc,
  query,
  where,
  arrayRemove,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  type UserData,
  initializeAppIfNecessary,
} from "../../old_components/utils";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
  type MRT_SortingState,
  type MRT_PaginationState,
} from "material-react-table";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { Box, Button, ListItemIcon, MenuItem, Typography } from "@mui/material";
import {
  ConfirmationBox,
  ConfirmationProps,
} from "../../old_components/confirmation_box";

interface NestedSchemas {
  [key: string]: NestedSchemas;
}

type OrgData = {
  name: string;
  admin: string;
  number_of_users: number;
};

/**
 * Component for showing list of all users to be viewed by admins.
 * Site admins will be able to view all site users, and organization
 * admins will only be able to view members in their org.
 *
 * Data is fetched from the 'Users' collection to render. If the user
 * is a site_admin, all users are fetched, if the user is an org admin the Users collection is
 * queried to only return users in the user's org.
 *
 */
export default function Users() {
  const [userData, setUserData] = useState({} as UserData);
  const [currentTab, setCurrentTab] = useState(1);

  const [userDataArray, setUserDataArray] = useState([] as UserData[]);
  const [orgDataArray, setOrgDataArray] = useState([] as OrgData[]);
  const [confirmationBoxData, setConfirmationBoxData] = useState(
    null as ConfirmationProps | null
  );

  initializeAppIfNecessary();
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
          router.push("/login");
        } else {
          const userDocRef = doc(db, "users", user.uid);
          getDoc(userDocRef)
            .then((docRef) => {
              if (docRef.exists()) {
                const docData = docRef.data();
                if (docData.role !== "admin" && docData.role !== "site_admin") {
                  router.push("/samples");
                }
                setUserData(docRef.data() as UserData);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    }
  }, []);

  if (userDataArray.length < 1) {
    const usersListArray: UserData[] = [];
    if (userData.role === "site_admin") {
      getDocs(collection(db, "users"))
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            if (docData.org) {
              usersListArray.push({
                ...docData,
                user_id: doc.id,
              } as UserData);
            }
          });
          if (usersListArray.length > 0) {
            setUserDataArray(usersListArray);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (userData.role === "admin") {
      const q = query(
        collection(db, "users"),
        where("org", "==", userData.org)
      );
      const docRef = getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            usersListArray.push({
              ...docData,
              user_id: doc.id,
            } as UserData);
          });
          if (usersListArray.length > 0) {
            setUserDataArray(usersListArray);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  if (
    userData.role === "site_admin" &&
    userDataArray.length > 0 &&
    orgDataArray.length < 1
  ) {
    getDocs(collection(db, "organizations"))
      .then((querySnapshot) => {
        let orgList: OrgData[] = [];

        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          console.log(docData);
          orgList.push({
            name: docData.org_name,
            admin: docData.admins ? docData.admins[0].name : "",
            number_of_users:
              userDataArray.length > 0
                ? userDataArray.filter((user) => user.org === doc.id).length
                : 0,
          } as OrgData);
        });
        if (orgList.length > 0) {
          setOrgDataArray(orgList);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const userColumns = useMemo<MRT_ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("name"),
        size: 150,
      },
      {
        accessorKey: "email",
        header: t("email"),
        size: 100,
      },
      {
        accessorKey: "org_name",
        header: t("organization"),
        size: 100,
      },
      {
        accessorKey: "date_added",
        header: t("dateAdded"),
        size: 100,
      },
    ],
    [userDataArray]
  );

  const orgColumns = useMemo<MRT_ColumnDef<OrgData>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("name"),
        size: 150,
      },
      {
        accessorKey: "admin",
        header: t("admin"),
        size: 100,
      },
      {
        accessorKey: "number_of_users",
        header: t("numberOfUsers"),
        size: 100,
      },
    ],
    [userDataArray]
  );

  function handleRemoveClick(userData: UserData) {
    const removeUserFunction = () => {
      const removedMemberId = userData.user_id;
      deleteDoc(doc(db, "users", removedMemberId)).catch((error) => {
        console.log(error);
      });
      setDoc(doc(db, "new_users", removedMemberId), {
        email: userData.email,
        uid: userData.user_id,
        name: userData.name,
      }).catch((error) => {
        console.log(error);
      });
      if (userData.email) {
        updateDoc(doc(db, "organizations", userData.org), {
          members: arrayRemove(userData.email),
        }).catch((error) => {
          console.log(error);
        });
      }

      setConfirmationBoxData(null);
    };
    const cancelDeleteFunction = () => {
      setConfirmationBoxData(null);
    };
    const title = t("removeUserConfirmation", { user: userData.name });
    const actionButtonTitle = t("remove");
    setConfirmationBoxData({
      title: title,
      actionButtonTitle: actionButtonTitle,
      onActionButtonClick: removeUserFunction,
      onCancelButtonClick: cancelDeleteFunction,
    });
  }

  function handleMakeOrgAdminClick(userData: UserData) {
    if ((userData.role as unknown as string) === "site_admin") {
      // Cannot demote site_admin to org_admin
      return;
    }

    const makeAdminFunction = () => {
      const newOrgAdminId = userData.user_id;
      const userDocRef = doc(db, "users", newOrgAdminId);
      updateDoc(userDocRef, {
        role: "admin",
      });

      setConfirmationBoxData(null);
    };
    const cancelFunction = () => {
      setConfirmationBoxData(null);
    };
    const title = t("makeOrgAdminConfirmation", { user: userData.name });
    const actionButtonTitle = t("confirm");
    setConfirmationBoxData({
      title: title,
      actionButtonTitle: actionButtonTitle,
      onActionButtonClick: makeAdminFunction,
      onCancelButtonClick: cancelFunction,
    });
  }

  function handleMakeSiteAdminClick(userData: UserData) {
    const makeAdminFunction = () => {
      const newSiteAdminId = userData.user_id;
      const userDocRef = doc(db, "users", newSiteAdminId);
      updateDoc(userDocRef, {
        role: "site_admin",
      });

      setConfirmationBoxData(null);
    };
    const cancelFunction = () => {
      setConfirmationBoxData(null);
    };
    const title = t("makeSiteAdminConfirmation", { user: userData.name });
    const actionButtonTitle = t("confirm");
    setConfirmationBoxData({
      title: title,
      actionButtonTitle: actionButtonTitle,
      onActionButtonClick: makeAdminFunction,
      onCancelButtonClick: cancelFunction,
    });
  }

  return (
    <div>
      <div className="all-users-admin-wrapper">
        <h3 className="all-users-title">
          {userData.role === "admin" ? "My organization" : "All users"}
        </h3>

        {userData.role === "site_admin" && (
          <div className="all-users-tab-wrapper">
            <div className="all-users-tab-group">
              <div
                onClick={() => setCurrentTab(1)}
                className={
                  currentTab === 1
                    ? "all-users-selected-tab all-users-tab"
                    : "all-users-tab"
                }
              >
                <div className="all-users-slate-wrapper">
                  <div
                    id="individuals-title"
                    className="all-users-tab-contents"
                  >
                    <p className="all-users-tab-text">
                      Individuals ({userDataArray.length})
                    </p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setCurrentTab(2)}
                className={
                  currentTab === 2
                    ? "all-users-selected-tab all-users-tab"
                    : "all-users-tab"
                }
                id="all-users-tab-2"
              >
                <div className="all-users-slate-wrapper">
                  <div
                    id="organizations-title"
                    className="all-users-tab-contents"
                  >
                    <p className="all-users-tab-text">
                      Organizations ({orgDataArray.length})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          {currentTab === 1 && (
            <MaterialReactTable
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
                  disabled={
                    userData.role !== "site_admin" ||
                    row.original.role === "site_admin"
                  }
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
                  disabled={
                    row.original.role === "site_admin" ||
                    row.original.role === "admin"
                  }
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
            />
          )}
          {currentTab === 2 && (
            <MaterialReactTable
              columns={orgColumns}
              data={orgDataArray}
              enableFacetedValues
              tableInstanceRef={orgDataTableInstanceRef}
              globalFilterFn="contains"
              muiTablePaginationProps={{
                rowsPerPageOptions: [5, 10],
              }}
            />
          )}
        </div>
      </div>
      {confirmationBoxData && <ConfirmationBox {...confirmationBoxData} />}
    </div>
  );
}
