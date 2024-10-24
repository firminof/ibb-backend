import * as admin from 'firebase-admin';
import {App} from "firebase-admin/lib/app";
import * as dotenv from 'dotenv';
dotenv.config();

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
        projectId: 'ibb-app-web-dev',
        clientEmail: 'firebase-adminsdk-398au@ibb-app-web-dev.iam.gserviceaccount.com',
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDxE8Ne9Zywc+Jn\nD/RyEuD0BT3V/uhWBuSBQR4EbogpJY2zXHIQuFRCTWNy61EOatGHMKtrb+nJoHT5\n/6BY98Cx0CAoPjAi0OaA8RC+l4GX3tDQhJR/E6A3kCgT55UOhyvdfz7cQ/4KOf1i\nvzaZQ1232JjXb5k6Hg+K8BGBsgCbGoNTqLi3mbII9+gM716OxP4lb6SaSrdaUE7K\nNfUfPJNUoeo4IRBOU+e/S8dcVrWkiWpVPYBMrUOSo4CmLJ8ewcpJvLXPE1nWP8Ws\nvzGH2ywur4bgMtdNFn1mvFGlsVRxRCbV7vBsqDMf1Vg3lyIzc1BxpMYNMioZe3fp\nwNvBpFGpAgMBAAECggEAAOljzSGCIZBKr2brGi9zmVE5Q7MGzuszjR805BJE6Jhg\nPVgzrSBdrOrrXdaKwtCaQE4m20hUhwjywc6iusogi3vVJz3dbZPQhRTc4VVgRXao\nNPrwtRztd49IGoh/+OSZl+Gy+ZP6+MnqDGU3xFJhJL4w0fQKBA7JEuZKam0SyXSG\nbz+mDDkjs3+znP/XI6wHBSa+qem/lPQU3Tmj8INrCYAlZBCKnS+SWSRKBZ32V+62\nTCMun48lJHKekqZgXji5qgPCuyska/1OdN8miKZ44DDSwRX52hbs9hNrST8M+PxT\nEWpbc1lMr1U0owqmCop4TvSXE2FwuUboQrk9nFyo9QKBgQD/Pn9hJLSDQvHSTMyY\nawKl4kFuVEvfe9q+z0wqh+tuwade8QOhSV5O8bFfyEZShixYbe3vQn+OYPoNIiOy\nk8PXw9x0KfjOsbleoHtPVfoQg3nJ2TTelwvyE1C3fAb0XQqRcNirSrQsozIXXFe6\ntsVCACKgSg7s3+h5rfbvFQn0hwKBgQDxyoaJsM5qsoVoZMzO78qFoZGnQp7p+ecH\nJyrBWHaZCLUPqdYeqIXsfxJLQy7cmmgPVZ9g8HXESPn/deF9X2SjmdOCmPlfzbIl\n3VnraZdRLNDSyFowwCLZCHKQRNy7geqyXFq7ISYBQLyNxVYWg4g370U3xXLrvIXN\nnk/MkfJETwKBgCXwFyTMPNxpveHBMoPRHAKl/42zj9d25EuKKksECtVaiVMORbja\nW98mA3Q2I2WutbarGDuAyc7S0TfUhDPNzMUsQn8toeKu/dt3xPxEzjdYI2kCFN6k\n2syvXEb5c1ss3R5DBKFpKCCeXRqlyhBhjC5EMOFcQJ2qpjY3ykU8/k7PAoGAQKzF\nk+sBK7UYzjW4OtoVN+1hwnWlgDxiOZ2WaCU7g++6TrhFF+pH+Fx9DjioPkXm88MZ\nYJqxRZGnnVdwu1Ja3w/0bYhxm9ivgEVXGgsieIoeSWNiDIw4Rglma4Sf7l/v4Umm\n00somUkxplJUlq0UMLIFt8dO2BOTTs671aJsRS0CgYBzT6F7c5PJbJRFehdnwYHK\nrd4OAd0ePon+Tw4V31da7q2Iasdlb8spPUB3LelpkGdZWrfCq7AMcFvcrluNbItR\nlpfhbt5H+zi3Wf4JIuXtx4Vp/zJvWjpICtHrCgBrgnw8XQfxtiiXzEhvYiezZCgH\nmJ4Ys4cKTPrc5JkWeOFsoQ==\n-----END PRIVATE KEY-----\n",
    }),
}

export const firebaseApp: App = admin.initializeApp(options, 'firebase-auth-ibb');
