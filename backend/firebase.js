const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('../sikelas-d021d-firebase-adminsdk-fbsvc-4e30811f85.json');

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'sikelas-d021d.appspot.com' // Default storage bucket format
});

const bucket = getStorage(app).bucket();

module.exports = { bucket };
