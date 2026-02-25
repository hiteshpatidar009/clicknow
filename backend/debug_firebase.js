
import admin from "firebase-admin";
import { config } from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

console.log("\n--- Debugging Firebase Connection ---\n");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log(`1. Project ID: ${projectId}`);
console.log(`2. Client Email: ${clientEmail}`);
console.log(`3. Private Key Length: ${privateKey ? privateKey.length : 'MISSING'}`);

if (privateKey) {
  // Check if it starts/ends correctly
  const startsCorrectly = privateKey.includes("-----BEGIN PRIVATE KEY-----");
  const endsCorrectly = privateKey.includes("-----END PRIVATE KEY-----");
  console.log(`   - Starts with header: ${startsCorrectly ? 'YES' : 'NO'}`);
  console.log(`   - Ends with footer: ${endsCorrectly ? 'YES' : 'NO'}`);
  
  // Check for literal \n vs actual newlines
  const hasLiteralSlashN = privateKey.includes("\\n");
  const hasActualNewline = privateKey.includes("\n");
  console.log(`   - Contains literal '\\n': ${hasLiteralSlashN ? 'YES' : 'NO'}`);
  console.log(`   - Contains actual newline characters: ${hasActualNewline ? 'YES' : 'NO'}`);

  // Auto-correct attempt
  const fixedKey = privateKey.replace(/\\n/g, "\n");
  console.log(`   - Fixed Key Length: ${fixedKey.length}`);
}

const serviceAccount = {
  type: "service_account",
  project_id: projectId,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey?.replace(/\\n/g, "\n"),
  client_email: clientEmail,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

console.log("\n4. Attempting Connection...");

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  console.log("   - Initialized. Querying 'users' collection...");
  
  const snapshot = await db.collection("users").limit(1).get();
  console.log("   - SUCCESS! Connection working.");
  console.log(`   - Users found: ${snapshot.size}`);

} catch (error) {
  console.error("\n❌ CONNECTION FAILED:");
  console.error(`   - Code: ${error.code}`);
  console.error(`   - Message: ${error.message}`);
  if (error.code === 5) {
     console.error("\n   -> ERROR CODE 5 (NOT_FOUND) usually means:");
     console.error("      1. The Project ID 'clicknow-9bafc' does not exist.");
     console.error("      2. The Service Account Email does not belong to this project.");
     console.error("      3. The Private Key is for a DIFFERENT project.");
  }
}
