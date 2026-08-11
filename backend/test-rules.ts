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

async function checkRules() {
  try {
    const rs = getSecurityRules(app);
    // getFirestoreRuleset is what we want
    const ruleset = await rs.getFirestoreRuleset();
    console.log("=== CURRENT FIRESTORE RULES ===");
    console.log((ruleset.source as any)[0].content);
    console.log("===============================");
  } catch (err: any) {
    console.error('Failed to get rules:', err.message);
  }
}
checkRules();
