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

      getAuth().setCustomUserClaims(userId, {role: role}).then(() => {
        console.log(`Successfully added ${role} role to ${userId}`);
      });
    });

exports.pauseAccess = onDocumentUpdated("/roles_to_be_updated/{documentId}",
    (event) => {
      const userId = event.params.documentId;
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data sent with request");
        return;
      }
      const data = snapshot.after.data();
      const accessPaused = data.access_paused;
      const role = data.role;

      getAuth().setCustomUserClaims(userId, {role: accessPaused ? "" : role})
          .then(() => {
            console.log(`Successfully added ${role} role to ${userId}`);
          });
    });
