import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


export const createUserOnFirestore = functions.auth.user().onCreate((user) => {
  const email = user.email;
  const name = user.displayName?.split(' ')[0] || "Anonymous";
  const surname = user.displayName?.split(' ').slice(1).join(' ') || "";
  const uid = user.uid;

  const userDoc = {
    email,
    name,
    surname,
    createdAt: new Date().toISOString(),
  };

  return admin.firestore().collection("users").doc(uid).set(userDoc);
});
