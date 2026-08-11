import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const app = initializeApp({});
const db = getFirestore(app, 'default');
console.log(db);
