import * as admin from 'firebase-admin';
import {App} from "firebase-admin/lib/app";
import * as dotenv from 'dotenv';
dotenv.config();
import * as process from "process";

const options = {
    credential: admin.credential.cert({
        projectId: process.env.NEST_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEST_PUBLIC_CLIENT_EMAIL_FIREBASE,
        privateKey: process.env.NEST_PUBLIC_FIREBASE_PRIVATE_KEY
    }),
}

export const firebaseApp: App = admin.initializeApp(options, 'firebase-auth-ibb');
