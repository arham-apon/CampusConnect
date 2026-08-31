const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const credential = process.env.FIREBASE_PROJECT_ID
    ? cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
    : cert(require('./firebase.admin.json'));

const app = initializeApp({
    credential,
});

const adminAuth = getAuth(app);

module.exports = adminAuth;
