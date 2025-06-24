import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXaCdKVk4Sxjn4zGXLIi3aTOi9u9oYF1M",
  authDomain: "react-http-1c328.firebaseapp.com",
  databaseURL: "https://react-http-1c328-default-rtdb.firebaseio.com",
  projectId: "react-http-1c328",
  storageBucket: "react-http-1c328.appspot.com",
  messagingSenderId: "271833015585",
  appId: "1:271833015585:web:912e47806a4ba36c7f4a60"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

