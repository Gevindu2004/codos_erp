import { initializeApp, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';
import dotenv from 'dotenv';
dotenv.config();

let pk = process.env.FIREBASE_PRIVATE_KEY!;
if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.slice(1, -1);
pk = pk.replace(/\\n/g, '\n');

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: pk,
  }),
});

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow users to read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Allow authenticated users to interact with core ERP modules
    match /activity_logs/{logId} {
      allow read, write: if request.auth != null;
    }
    // Default deny for everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

async function deployRules() {
  try {
    const rs = getSecurityRules(app);
    await rs.releaseFirestoreRulesetFromSource(rules);
    console.log('✅ Successfully deployed Production Security Rules!');
  } catch (err: any) {
    console.error('❌ Failed to deploy rules:', err.message);
  }
}

deployRules();
