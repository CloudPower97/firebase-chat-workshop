# Firebase Chat Workshop: Firestore vs Realtime Database

This repository provides a ready-to-use project for a workshop comparing Cloud Firestore and Realtime Database (RTDB) by implementing two versions of a real-time chat application with the same UI.

## Workshop Objectives

* Understand the core differences between Cloud Firestore and Realtime Database.
* Explore practical implementation patterns for real-time features like chat and presence.
* Learn how to use the Firebase Web SDK v10+ with React, TypeScript, and Material UI.
* Master the Firebase Emulator Suite for local development and testing.
* Discuss trade-offs, costs, offline capabilities, indexing, and best practices for each database.

## Stack

* **Frontend:** React 18 + TypeScript + Vite
* **UI Library:** Material UI (MUI) v5 + `@emotion`
* **Backend (local):** Firebase Emulator Suite (Firestore, Realtime Database, Auth)
* **Firebase SDK:** Firebase Web SDK v10+
* **Utilities:** `dayjs` for date formatting, `uuid` for unique IDs, `concurrently` for running multiple NPM scripts.
* **Development Tools:** ESLint, Prettier, `ts-node` for seed script.

## Quick Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/firebase-chat-workshop.git
    cd firebase-chat-workshop
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create `.env.local`:**
    Copy the `.env.example` file to `.env.local` and fill in your Firebase project configuration. For local development with emulators, these values are mostly placeholders, but `VITE_FIREBASE_PROJECT_ID` should match the `default` project in `.firebaserc` (which is `demo-chat`).

    ```bash
    cp .env.example .env.local
    # Open .env.local and update values (e.g., VITE_FIREBASE_PROJECT_ID="demo-chat")
    ```

4. **Start Emulators and Development Server:**
    This command will start the Firebase Emulators (Firestore, RTDB, Auth, UI) and the React development server concurrently.

    ```bash
    npm run dev:emulated
    ```

    The Emulator UI will be available at `http://localhost:4000`.
    The React app will be available at `http://localhost:5173` (or another port if 5173 is in use).
5. **Seed Initial Data:**
    Once the emulators are running, open a **new terminal** and run the seed script to populate the databases with example messages and presence data.

    ```bash
    npm run seed
    ```

    You should see messages appear in both the Firestore and Realtime DB tabs of the chat application.

## Architecture

The application is structured to clearly separate concerns and facilitate comparison between Firestore and Realtime Database implementations.

```
firebase-chat-workshop/
  .editorconfig
  .gitignore
  package.json
  README.md
  LICENSE
  .env.example
  .env.local
  firebase.json
  .firebaserc
  firestore.rules
  firestore.indexes.json
  database.rules.json
  scripts/
    seed.ts             # Script to populate emulators with initial data
  src/
    main.tsx            # Main React entry point
    index.css           # Global styles
    App.tsx             # Root component, handles user identity and context
    theme.ts            # Material UI theme configuration
    firebase.ts         # Firebase initialization and emulator connection logic
    types/
      message.ts        # TypeScript interfaces for chat messages (Firestore & RTDB specific)
      presence.ts       # TypeScript interfaces for user presence
    components/
      FirestoreChat.tsx # Chat implementation using Cloud Firestore
      RtdbChat.tsx      # Chat implementation using Realtime Database
      PresencePanel.tsx # Displays online users using Realtime Database presence
      UserPromptDialog.tsx # Dialog for user to enter their display name
    utils/
      storage.ts        # Utility for local storage operations (user identity)
      time.ts           # Utility for timestamp formatting
    pages/
      Home.tsx          # Main application page with tabs and chat views
  public/
    favicon.svg
```

### Data Flow (Listeners & Sending)

* **Firestore Chat:**
  * Uses `onSnapshot` with `collection`, `query`, `orderBy('createdAt', 'asc')`, and `limit(50)` to listen for real-time message updates.
  * Sends messages using `addDoc` with `serverTimestamp()` for `createdAt`.
* **Realtime Database Chat:**
  * Uses `onValue` with `ref`, `query`, `orderByChild('createdAt')`, and `limitToLast(50)` to listen for real-time message updates.
  * Sends messages using `push` with `serverTimestamp()` for `createdAt`.
* **Presence:**
  * The `PresencePanel` component uses Realtime Database's `.info/connected` to detect connection status.
  * `onDisconnect` is used to automatically set a user's status to `offline` when they disconnect.
  * The user's online status is updated in `status/{userId}` node.

## Firestore vs Realtime Database Comparison

| Feature           | Cloud Firestore                                     | Realtime Database                                   |
| :---------------- | :-------------------------------------------------- | :-------------------------------------------------- |
| **Data Model**    | Collection-Document model (hierarchical, flexible)  | JSON tree (single, large JSON object)               |
| **Queries**       | Rich, indexed queries (compound queries, array ops) | Limited queries (single-path, `orderByChild`)       |
| **Consistency**   | Strong consistency (reads always get latest data)   | Eventual consistency (data might be slightly stale) |
| **Scalability**   | Scales automatically to global apps                 | Scales to large numbers of concurrent users         |
| **Costs (High-level)** | Based on reads, writes, deletes, storage, network | Based on storage, network, and concurrent connections |
| **Offline Support** | Built-in, robust offline data persistence           | Built-in, robust offline data persistence           |
| **Indexing**      | Automatic indexing, composite indexes required for complex queries | Manual indexing with `.indexOn` in rules            |
| **Presence**      | Requires custom implementation (e.g., RTDB for presence) | Native support with `.info/connected` and `onDisconnect` |
| **Use Cases**     | Complex data, large-scale apps, flexible queries    | Simple data, high-frequency updates, presence       |

## Firebase Emulator Suite

The Firebase Emulator Suite allows you to develop and test your Firebase application locally without deploying to a live project.

* **Ports:**
  * Firestore: `8080`
  * Realtime Database: `9000`
  * Authentication: `9099`
  * Emulator UI: `4000`
* **Connecting:** The `src/firebase.ts` file automatically connects to these local emulator instances when `location.hostname === 'localhost'`.
* **Resetting Data:** You can clear all emulator data by running `firebase emulators:start --only firestore,database,auth --import=./data --export-on-exit=./data` and then deleting the `data` folder. For a quick reset, you can also use the Emulator UI.
* **Import/Export:** The `--import` and `--export-on-exit` flags can be used with `firebase emulators:start` to save and load emulator data snapshots, useful for consistent testing environments.

## Security & Rules

Firebase Security Rules are crucial for controlling access to your data.

* **Firestore Rules (`firestore.rules`):**
  * `read`: Allowed for everyone for workshop simplicity. In a production app, this would typically require authentication.
  * `create`: Requires an authenticated user (`request.auth != null`), `senderId` to match the user's `uid`, `text` to be a non-empty string (max 1000 chars), and `createdAt` to be a server timestamp (`request.time`).
* **Realtime Database Rules (`database.rules.json`):**
  * `rooms/{roomId}/messages`:
    * `.read`: Allowed for everyone.
    * `.write`: Requires an authenticated user (`auth != null`), `senderId` to match the user's `uid`, `text` to be a non-empty string (max 1000 chars), and `createdAt` to be a server timestamp (`now`).
    * `.indexOn`: `createdAt` is indexed to support efficient queries by creation time.
  * `status/{userId}`:
    * `.read`: Allowed for everyone.
    * `.write`: Allowed only if the `userId` matches the authenticated user's `uid`. This ensures users can only update their own presence status.

**Note on Production:** These rules are simplified for the workshop. In a production environment, you would implement more stringent authentication and authorization checks.

## Exercises (Optional)

* **Pagination:** Implement message pagination for both Firestore (using `startAfter` / `endBefore` with cursors) and Realtime Database (using `startAt` / `endAt`).
* **Typing Indicator:** Add a typing indicator to the chat, leveraging Realtime Database's fast updates for `typing/{roomId}/{userId}: true|false` with `onDisconnect` cleanup.
* **Basic Moderation:** Implement a simple message moderation feature (e.g., deleting messages) with appropriate security rules.

## Troubleshooting

* **CORS Issues:** Ensure your Vite development server is running on `localhost` and that Firebase Emulators are accessible. If you encounter CORS errors, double-check your emulator configuration and browser settings.
* **Missing `.env.local`:** The application relies on environment variables. If `.env.local` is missing or incorrectly configured, Firebase initialization will fail.
* **Emulator Not Reachable:** Verify that the Firebase Emulators are running on the correct ports (`8080`, `9000`, `9099`, `4000`). Check the terminal output of `npm run emulators` for any errors.

## Key Takeaways

* **When to choose Firestore:** For complex data models, flexible querying, strong consistency, and automatic scaling for global applications. Ideal for social networks, e-commerce, and analytics.
* **When to choose Realtime Database:** For simple, hierarchical data, high-frequency updates, and native presence features. Ideal for games, live polls, and real-time dashboards.
* **Hybrid Pattern:** A common approach is to use Firestore for primary data storage and complex queries, while leveraging Realtime Database for high-frequency, low-latency data like presence and typing indicators. This workshop demonstrates this hybrid pattern with RTDB for presence.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
