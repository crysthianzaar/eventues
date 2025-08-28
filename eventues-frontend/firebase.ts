// firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { envConfig } from "./lib/config/environment";

// Get Firebase configuration from environment manager
const firebaseConfig = envConfig.getFirebaseConfig();

// Inicializa o Firebase apenas uma vez
let firebaseApp: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  console.log("Firebase initialized");
} else {
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
  console.log("Firebase already initialized");
}

export { auth };
