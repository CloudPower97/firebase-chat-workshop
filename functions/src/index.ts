import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const createUserOnFirestore = functions.auth.user().onCreate((user) => {
  const email = user.email;
  const name = user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Anonymous";
  const surname = user.displayName?.split(" ").slice(1).join(" ") || "Anonymous";
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
    name: data.firstName,
    surname: data.lastName,
  };
  const isAdmin = data.admin || false;

  await admin.auth().createUser({
    email: user.email,
    password: user.password,
    displayName: `${user.name} ${user.surname}`,
  });

  // Set custom claims for the users
  const createdUser = await admin.auth().getUserByEmail(user.email!);
  await admin.auth().setCustomUserClaims(createdUser.uid, { roles: isAdmin ? ["admin"] : [] });
});

// Funzione per inviare notifiche quando viene creato un nuovo post
export const sendNotificationOnNewPost = functions.firestore
  .document("posts/{postId}")
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;

    if (!postData) {
      console.log("No post data found");
      return null;
    }

    try {
      // Recupera tutti gli utenti con token FCM (escludi l'autore del post)
      const usersQuery = await admin
        .firestore()
        .collection("users")
        .where("fcmToken", "!=", null)
        .get();

      const tokens: string[] = [];
      usersQuery.forEach((userDoc) => {
        const userData = userDoc.data();
        // Non inviare notifica all'autore del post
        // if (userDoc.id !== postData.ownerId && userData.fcmToken) {
          tokens.push(userData.fcmToken);
        // }
      });

      if (tokens.length === 0) {
        console.log("No valid FCM tokens found");
        return null;
      }

      // Prepara il messaggio
      const message = {
        notification: {
          title: "Nuovo Post",
          body: `${postData.author.name} ${postData.author.surname} ha pubblicato: "${postData.text.substring(0, 100)}${postData.text.length > 100 ? "..." : ""}"`,
        },
        data: {
          type: "new_post",
          postId: postId,
          authorId: postData.ownerId,
          authorName: `${postData.author.name} ${postData.author.surname}`,
        },
        tokens: tokens,
      };

      // Invia la notifica multicast
      setTimeout(async () => {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Notification sent to ${response.successCount} out of ${tokens.length} recipients`);

        // Log eventuali errori
        if (response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
              console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
            }
          });

          // Rimuovi token non validi dal database
          for (const token of failedTokens) {
            const invalidUserQuery = await admin
              .firestore()
              .collection("users")
              .where("fcmToken", "==", token)
              .get();

            invalidUserQuery.forEach(async (userDoc) => {
              await userDoc.ref.update({ fcmToken: admin.firestore.FieldValue.delete() });
              console.log(`Removed invalid token for user ${userDoc.id}`);
            });
          }
        }
      }, 4000); // Ritardo di 4 secondi per evitare problemi di rate limiting

      return null;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  });

// Funzione per inviare notifiche quando viene creato un nuovo messaggio in chat
// export const sendNotificationOnNewMessage = functions.database
//   .ref("rooms/{roomId}/messages/{messageId}")
//   .onCreate(async (snapshot, context) => {
//     const messageData = snapshot.val();
//     const roomId = context.params.roomId;

//     if (!messageData) {
//       console.log("No message data found");
//       return null;
//     }

//     try {
//       // Recupera tutti gli utenti con token FCM (escludi il mittente)
//       const usersQuery = await admin
//         .firestore()
//         .collection("users")
//         .where("fcmToken", "!=", null)
//         .get();

//       const tokens: string[] = [];
//       usersQuery.forEach((userDoc) => {
//         const userData = userDoc.data();
//         // Non inviare notifica al mittente
//         if (userDoc.id !== messageData.senderId && userData.fcmToken) {
//           tokens.push(userData.fcmToken);
//         }
//       });

//       if (tokens.length === 0) {
//         console.log("No valid FCM tokens found for chat message");
//         return null;
//       }

//       // Prepara il messaggio
//       const message = {
//         notification: {
//           title: `Nuovo messaggio da ${messageData.senderName}`,
//           body: messageData.text.substring(0, 100) + (messageData.text.length > 100 ? "..." : ""),
//         },
//         data: {
//           type: "new_chat_message",
//           roomId: roomId,
//           senderId: messageData.senderId,
//           senderName: messageData.senderName,
//         },
//         tokens: tokens,
//       };

//       // Invia la notifica multicast
//       const response = await admin.messaging().sendEachForMulticast(message);
//       console.log(`Chat notification sent to ${response.successCount} out of ${tokens.length} recipients`);

//       return null;
//     } catch (error) {
//       console.error("Error sending chat notification:", error);
//       return null;
//     }
//   });
