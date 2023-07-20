/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


const {onDocumentCreated, onDocumentUpdated} =
  require("firebase-functions/v2/firestore");
// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

exports.approveRole = onDocumentCreated("/roles_to_be_updated/{documentId}",
    (event) => {
      const userId = event.params.documentId;
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data sent with request");
        return;
      }
      const data = snapshot.data();
      const role = data.role;

      // New entries in this database cannot create new site admins.
      if (role === "site_admin") {
        console.log(`${userId} 
          attempted to get site_admin privileges. They were rejected.`);
        return;
      }

      getAuth().setCustomUserClaims(userId, {role: role}).then(() => {
        console.log(`Successfully added ${role} role to ${userId}`);
      });
    });

exports.pauseAccess = onDocumentUpdated("/roles_to_be_updated/{documentId}",
    (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data sent with request");
        return;
      }
      const documentId = event.params.documentId;
      const data = snapshot.after.data();
      const accessPaused = data.access_paused;
      const role = data.role;

      getAuth().setCustomUserClaims(documentId,
          {role: accessPaused ? "" : role})
          .then(() => {
            console.log(`Successfully added ${role} role to ${documentId}`);
          });
    });

exports.addSiteAdmin = onDocumentCreated("/site_admin/{documentId}",
    (event) => {
      const userId = event.params.documentId;

      getAuth().setCustomUserClaims(userId, {role: "site_admin"}).then(() => {
        console.log(`Successfully made ${userId} a site admin`);
      });
    });

exports.addOrganization = onDocumentCreated("/organizations/{documentId}",
    (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data sent with request");
        return;
      }
      const data = snapshot.data();
      const orgId = event.params.documentId;
      const adminId = data.admin_uid[0];
      if (!adminId) {
        console.log("No adminId sent with new organization");
      }
      console.log("Admin id: " + adminId);
      getAuth().setCustomUserClaims(adminId,
          {role: "admin", org: orgId}).then(() => {
        console.log(
            `Successfully made ${adminId} admin of ${orgId}`);
      });
      const firestore = getFirestore();
      const docPath = "users/" + adminId;
      const document = firestore.doc(docPath);
      document.update({
        lab: orgId,
      });
    });

exports.updateOrganization = onDocumentUpdated("/organizations/{documentId}",
    (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data sent with request");
        return;
      }
      const documentId = event.params.documentId;
      const newAdmins = snapshot.after.data()["admin_uid"];
      const oldAdmins = snapshot.before.data()["admin_uid"];

      if (newAdmins.length < 1) {
        console.log(`updateOrganization: cannot remove
          ${oldAdmins} from ${documentId}. There would be no admin left.`);
        return;
      }
      if (newAdmins.length != oldAdmins.length) {
        updateOrgAdminOrMember(oldAdmins, newAdmins, documentId, true);
      }

      const newMembers = snapshot.after.data()["members"];
      const oldMembers = snapshot.before.data()["members"];

      if (newMembers.length < 1) {
        console.log(`updateOrganization: cannot remove ${oldMembers}
          from ${documentId}. There would be no members left.`);
        return;
      }
      if (newMembers.length != oldMembers.length) {
        updateOrgAdminOrMember(oldMembers, newMembers, documentId, false);
      }
    });

/**
 *
 * @param {Array} oldList
 * @param {Array} newList
 * @param {string} orgId
 * @param {boolean} updateAdmin
 */
function updateOrgAdminOrMember(oldList, newList, orgId, updateAdmin) {
  let added = "";
  newList.forEach((userAdded) => {
    if (!oldList.includes(userAdded)) {
      added = userAdded;
    }
  });
  let removed = "";
  if (added.length < 1) {
    oldList.forEach((userRemoved) => {
      if (!newList.includes(userRemoved)) {
        removed = userRemoved;
      }
    });
  }
  if (added.length > 0 && removed.length > 0) {
    console.log(`updateOrganization: found both added and
      removed admin/member in same method call. Returning early`);
  }

  const userAdded = added.length > 0;
  const userId = userAdded ? added : removed;
  let newRole;
  let newOrgId;
  getAuth().getUser(userId).then((userRecord) => {
    if (updateAdmin) {
      const userRole = userRecord.customClaims["role"];
      newOrgId = orgId;
      newRole = userRole === "site_admin" ? userRole :
        (userAdded ? "admin" : "member");
    } else {
      newRole = userAdded ? "member" : "guest";
      newOrgId = userAdded ? orgId : "";
    }
    getAuth().setCustomUserClaims(userId,
        {role: newRole, org: newOrgId}).then(() => {
      console.log(`Successfully made ${userId} ${newRole}
        and admin of ${newOrgId}`);
    });
  });
}
