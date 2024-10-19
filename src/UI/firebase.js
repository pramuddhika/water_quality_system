// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDYUsVIgr7gCL3D1S5dhwyDc6K-aP31sXA",
  authDomain: "waterquality-ba0bb.firebaseapp.com",
  databaseURL: "https://waterquality-ba0bb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "waterquality-ba0bb",
  storageBucket: "waterquality-ba0bb.appspot.com",
  messagingSenderId: "654440423465",
  appId: "1:654440423465:web:8e7694398bd773f3343c38",
  measurementId: "G-QSVJTQQ3RD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
