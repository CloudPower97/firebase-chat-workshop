import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


export const createUserOnFirestore = functions.auth.user().onCreate((user) => {
  const email = user.email;
  const displayName = user.displayName || "Anonymous";
  const uid = user.uid;

  const userDoc = {
    email,
    displayName,
    createdAt: new Date().toISOString(),
  };

  return admin.firestore().collection("users").doc(uid).set(userDoc);
});
