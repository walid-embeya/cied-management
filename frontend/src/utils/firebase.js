import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyB3PxCt9bFl2Rz2KbZejbSLeN-UEzLaAvg",
  authDomain: "proyecto-coe-20592.firebaseapp.com",
  projectId: "proyecto-coe-20592",
  storageBucket: "proyecto-coe-20592.appspot.com",
  messagingSenderId: "320040488998",
  appId: "1:320040488998:web:03ac81de92c378385e96e7"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
setPersistence(auth, browserSessionPersistence)

export const db = getFirestore(app)

const storage = getStorage(app)
export { storage }