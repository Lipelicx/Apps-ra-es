
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPjSmBBiy1ra_H9-5eCwEANIGcpibjY4k",
  authDomain: "prosutospetsapp.firebaseapp.com",
  databaseURL: "https://prosutospetsapp-default-rtdb.firebaseio.com",
  projectId: "prosutospetsapp",
  storageBucket: "prosutospetsapp.appspot.com",
  messagingSenderId: "302675094125",
  appId: "1:302675094125:web:8e788d4f04ec8f3374ad64"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue, remove, update };
