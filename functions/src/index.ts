import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const createUserOnFirestore = functions.auth.user().onCreate((user) => {
  const email = user.email;
  const name = user.displayName?.split(" ")[0] || "Anonymous";
  const surname = user.displayName?.split(" ").slice(1).join(" ") || "";
  const uid = user.uid;

  const userDoc = {
    email,
    name,
    surname,
    createdAt: new Date().toISOString(),
  };

  return admin.firestore().collection("users").doc(uid).set(userDoc);
});

export const registerUser = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  const user = {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
  };
  const isAdmin = data.admin || false;

  await admin.auth().createUser({
    email: user.email,
    password: user.password,
    displayName: `${user.firstName} ${user.lastName}`,
  });

  // Set custom claims for the users
  const createdUser = await admin.auth().getUserByEmail(user.email!);
  await admin.auth().setCustomUserClaims(createdUser.uid, { roles: isAdmin ? ["admin"] : [] });
});
