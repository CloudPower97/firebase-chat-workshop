# Firebase Functions

This directory contains the Firebase Cloud Functions for the chat workshop project.

## Functions Available

### HTTP Functions (Firebase Functions v2)

- **`helloWorld`** - A simple HTTP function that returns a hello message
  - Local: `http://localhost:5001/demo-chat/us-central1/helloWorld`
  - Production: `https://us-central1-demo-chat.cloudfunctions.net/helloWorld`

- **`createUserProfileInFirestore`** - Create user profile in Firestore
  - Local: `http://localhost:5001/demo-chat/us-central1/createUserProfileInFirestore`
  - Production: `https://us-central1-demo-chat.cloudfunctions.net/createUserProfileInFirestore`
  - Method: POST
  - Body: `{uid, email, displayName, photoURL}`

- **`syncUserToFirestore`** - **🆕 V2** Sync Firebase Auth user to Firestore
  - Local: `http://localhost:5001/demo-chat/us-central1/syncUserToFirestore`
  - Production: `https://us-central1-demo-chat.cloudfunctions.net/syncUserToFirestore`
  - Method: POST
  - Body: `{uid, email, displayName, photoURL, phoneNumber, emailVerified}`
  - **CORS enabled** - Call from frontend after user registration

- **`deleteUserFromFirestore`** - **🆕 V2** Delete user data from Firestore
  - Local: `http://localhost:5001/demo-chat/us-central1/deleteUserFromFirestore`
  - Production: `https://us-central1-demo-chat.cloudfunctions.net/deleteUserFromFirestore`
  - Method: DELETE
  - Body: `{uid}`

- **`updateUserPresence`** - **🆕 V2** Update user online status and presence
  - Local: `http://localhost:5001/demo-chat/us-central1/updateUserPresence`
  - Production: `https://us-central1-demo-chat.cloudfunctions.net/updateUserPresence`
  - Method: POST
  - Body: `{uid, isOnline: boolean, status: string}`

### Identity/Validation Triggers (Firebase Functions v2)

- **`createUserProfile`** - **🔥 AUTOMATIC** Validates user BEFORE creation
  - Can validate email domains, display names, etc.
  - Can set custom claims and roles
  - Can block user creation if validation fails
  - Uses latest v2 identity triggers

## Development

### Build Functions
```bash
npm run build
```

### Watch for Changes
```bash
npm run build:watch
```

### Serve Functions Locally
```bash
npm run serve
```

### Deploy Functions
```bash
npm run deploy
```

### View Logs
```bash
npm run logs
```

## Running with Emulators

From the root project directory:
```bash
npm run emulators
```

This will start all Firebase emulators including Functions. The Functions emulator will be available at:
- **Functions UI**: http://localhost:4000
- **Functions endpoint**: http://localhost:5001

## Adding New Functions

1. Add your function to `src/index.ts`
2. Build the functions: `npm run build`
3. Test locally with emulators
4. Deploy when ready: `npm run deploy`

## Environment Variables

For production deployment, you can set environment variables using:
```bash
firebase functions:config:set someservice.key="THE API KEY"
```

Access them in your functions with:
```javascript
import {config} from 'firebase-functions';
const apiKey = config().someservice.key;
```

## 🚀 Using Firebase Functions v2

### Key Improvements in v2:
- **Better performance** and cold start times
- **CORS support** built-in for HTTP functions
- **Regional deployment** options
- **Enhanced TypeScript** support
- **Modern SDK** with latest Firebase features

### Frontend Integration Example:

```typescript
// In your React/TypeScript app
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; // your Firebase config

// Sync user to Firestore after registration
export const syncUserToFirestore = async (userData) => {
  const response = await fetch('http://localhost:5001/demo-chat/us-central1/syncUserToFirestore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Update user presence
export const updateUserPresence = async (uid: string, isOnline: boolean, status?: string) => {
  const response = await fetch('http://localhost:5001/demo-chat/us-central1/updateUserPresence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, isOnline, status }),
  });
  return response.json();
};
```

### Migration from v1 to v2:
- ✅ All functions updated to v2 syntax
- ✅ Modern imports and error handling
- ✅ Better TypeScript support
- ✅ CORS enabled for frontend integration
- ✅ Regional deployment configuration
