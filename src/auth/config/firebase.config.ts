import * as admin from 'firebase-admin';
import {App} from "firebase-admin/lib/app";
import * as process from "process";

// const options = {
//     apiKey: process.env.NEST_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEST_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEST_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEST_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEST_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEST_PUBLIC_FIREBASE_APP_ID,
// }

const options = {
    credential: admin.credential.cert({
        projectId: process.env.NEST_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEST_PUBLIC_CLIENT_EMAIL_FIREBASE,
        privateKey: process.env.NEST_PUBLIC_FIREBASE_PRIVATE_KEY,
    }),
}

export const firebaseApp: App = admin.initializeApp(options, 'firebase-auth-ibb');
