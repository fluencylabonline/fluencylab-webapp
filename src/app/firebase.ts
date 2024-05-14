import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyDWcf-ML7SYn_N_g0wyw-YG5IqDbm0Mezw",
  authDomain: "fluencylabweb-pro.firebaseapp.com",
  projectId: "fluencylabweb-pro",
  storageBucket: "fluencylabweb-pro.appspot.com",
  messagingSenderId: "719140672285",
  appId: "1:719140672285:web:94d7809dd5841b482287f4",
  measurementId: "G-87Q2PZL594"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(app);

export { app, db, auth, storage };