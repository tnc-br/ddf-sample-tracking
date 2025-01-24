"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
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
  addDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  showNavBar,
  showTopBar,
  getRanHex,
  initializeAppIfNecessary,
  isProd,
} from "../../old_components/utils";
import { getUserData } from "../../old_components/firebase_utils";

type UserData = {
  role: string;
  org: string;
};

interface NestedSchemas {
  [key: string]: NestedSchemas;
}

/**
 * Component used by admins to approve new members. If the user is a site_admin all
 * new uses in the 'new_users' collection will be shown, otherwise if they are normal
 * organization admins they will only be shown users trying ot join their organization.
 *
 * Data in the 'new_orgs' document in the 'new_users' collection is fetched by site_admins
 * to let site admins approve/reject new organizations.
 */
export default function SignUpRequests() {
  const [pendingApprovals, setPendingApprovals] = useState({});
  const [prospectiveUsers, setProspectiveUsers] = useState({} as NestedSchemas);
  const [prospectiveOrgs, setProspectiveOrgs] = useState({} as NestedSchemas);
  const [userData, setUserData] = useState({} as UserData);

  initializeAppIfNecessary();
  const auth = getAuth();
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    showNavBar();
    showTopBar();
    if (Object.keys(userData).length < 1) {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/login");
        } else {
          const userDocRef = doc(db, "users", user.uid);
          getDoc(userDocRef).then((docRef) => {
            if (docRef.exists()) {
              const docData = docRef.data();
              if (docData.role !== "admin" && docData.role !== "site_admin") {
                router.push("/samples");
              }
              setUserData(docRef.data() as UserData);
            }
          });
        }
      });
    }
  });

  if (Object.keys(pendingApprovals).length < 1) {
    const pendingUsers: NestedSchemas = {};

    if (userData.role === "admin" && userData.org.length > 0) {
      const q = query(
        collection(db, "new_users"),
        where("org", "==", userData.org)
      );
      const docRef = getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((docRef) => {
          pendingUsers[docRef.id] = docRef.data();
        });
        if (
          Object.keys(pendingUsers).length > 0 &&
          Object.keys(prospectiveUsers).length < 1
        ) {
          setProspectiveUsers(pendingUsers);
        }
      });
    } else if (userData.role === "site_admin") {
      const pendingOrgs: NestedSchemas = {};
      getDocs(collection(db, "new_users")).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (doc.id === "new_orgs") {
            Object.keys(docData).forEach((orgName: string) => {
              pendingOrgs[orgName] = docData[orgName];
            });
          } else {
            // If the prospective members have not selected the org they wish to join yet,
            // they can't be approved and shouldn't be shown on the pending users list.
            if (docData.org) {
              const data = doc.data();
              pendingUsers[doc.id] = data;
            }
          }
        });
        if (
          Object.keys(pendingOrgs).length > 0 &&
          Object.keys(prospectiveOrgs).length < 1
        ) {
          setProspectiveOrgs(pendingOrgs);
        }
        if (
          Object.keys(pendingUsers).length > 0 &&
          Object.keys(prospectiveUsers).length < 1
        ) {
          setProspectiveUsers(pendingUsers);
        }
      });
    }
  }

  function handleApproveOrgClick(evt: any) {
    const orgName = evt.target.parentElement.parentElement.id;
    const adminId = prospectiveOrgs[orgName].admin_id as unknown as string;
    const date = new Date();
    const dateString = `${
      date.getMonth() + 1
    } ${date.getDate()} ${date.getFullYear()}`;
    const orgId = getRanHex(20);
    const newOrgRef = doc(db, "organizations", orgId);
    const orgEmail = isProd()
      ? `${orgName}@timberid.org`
      : `${orgName}-test@timberid.org`;
    setDoc(newOrgRef, {
      org_name: orgName,
      org_email: orgEmail,
      admins: [
        {
          name: prospectiveOrgs[orgName].admin_name,
          email: prospectiveOrgs[orgName].email,
          id: prospectiveOrgs[orgName].admin_id,
        },
      ],
    });
    const newUserDocRef = doc(db, "users", adminId);
    setDoc(newUserDocRef, {
      org: orgId,
      name: prospectiveOrgs[orgName].admin_name,
      email: prospectiveOrgs[orgName].email,
      role: "admin",
      date_added: dateString,
      org_name: orgName,
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

  async function handleApproveMemberClick(evt: any) {
    const memberId = evt.target.parentElement.parentElement.id;
    const orgId = prospectiveUsers[memberId].org;
    if (!orgId) {
      alert(
        "Prospective user has not selected an organization to join. Once they select an organization, you will be able to approve their membership"
      );
      return;
    }
    const userId = prospectiveUsers[memberId].uid;

    const date = new Date();
    const dateString = `${
      date.getMonth() + 1
    } ${date.getDate()} ${date.getFullYear()}`;
    const potentialUserData = await getUserData(userId as unknown as string);
    const newUserDocRef = doc(db, "users", userId as unknown as string);
    if (potentialUserData.email) {
      updateDoc(newUserDocRef, {
        org: orgId,
        org_name: prospectiveUsers[memberId].org_name,
        date_added: dateString,
        role: "member",
      });
    } else {
      setDoc(newUserDocRef, {
        name: prospectiveUsers[memberId].name,
        org: orgId,
        org_name: prospectiveUsers[memberId].org_name,
        date_added: dateString,
        role: "member",
        email: prospectiveUsers[memberId].email,
      });
    }

    const orgDocRef = doc(db, "organizations", orgId);
    updateDoc(orgDocRef, {
      members: arrayUnion(prospectiveUsers[memberId].email),
    });
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
    <div className="admin-wrapper">
      <h3 className="header">
        Sign up requests (
        {Object.keys(prospectiveUsers).length +
          Object.keys(prospectiveOrgs).length}
        )
      </h3>
      <div className="details">
        <div className="section-title">
          <p className="section-title">
            Users ({Object.keys(prospectiveUsers).length})
          </p>
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
            {Object.keys(prospectiveUsers).map((key, i) => {
              return (
                <tr key={i} id={key}>
                  <td>{prospectiveUsers[key].name as unknown as string}</td>
                  <td>{prospectiveUsers[key].org_name as unknown as string}</td>
                  <td>{prospectiveUsers[key].email as unknown as string}</td>
                  <td>
                    {prospectiveUsers[key].date_requested as unknown as string}
                  </td>
                  <td className="approve-reject-wrapper">
                    <button
                      onClick={handleRejectMemberClick}
                      type="button"
                      className="btn btn-outline-danger reject-button"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleApproveMemberClick}
                      type="button"
                      className="btn btn-outline-primary approve-button"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="details">
        <div className="section-title">
          <p className="section-title">
            Organizations ({Object.keys(prospectiveOrgs).length})
          </p>
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
            {Object.keys(prospectiveOrgs).map((key, i) => {
              return (
                <tr key={i} id={key}>
                  <td>
                    {prospectiveOrgs[key].admin_name as unknown as string}
                  </td>
                  <td>{prospectiveOrgs[key].email as unknown as string}</td>
                  <td>
                    {prospectiveOrgs[key].date_requested as unknown as string}
                  </td>
                  <td>
                    {prospectiveOrgs[key].date_requested as unknown as string}
                  </td>
                  <td className="approve-reject-wrapper">
                    <button
                      onClick={handleRejectOrgClick}
                      type="button"
                      className="btn btn-outline-danger reject-button"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleApproveOrgClick}
                      type="button"
                      className="btn btn-outline-primary approve-button"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
