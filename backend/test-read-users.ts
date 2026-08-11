import { db } from './src/firebase/admin';

async function checkUsers() {
  if (!db) {
    console.log("No DB");
    return;
  }
  const snap = await db.collection('users').get();
  console.log(`Found ${snap.size} users.`);
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
checkUsers();
