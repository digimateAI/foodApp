import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

import { getStorage } from 'firebase-admin/storage';

const serviceAccountVal = require(path.join(__dirname, '../../serviceAccountKey.json'));

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountVal),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const db = getFirestore(app, 'food-app-db');
export const bucket = getStorage(app).bucket();
