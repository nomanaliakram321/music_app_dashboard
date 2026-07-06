/**
 * Firebase Configuration Test
 *
 * This script validates your Firebase configuration without requiring network access.
 * It checks that all required environment variables are set and properly formatted.
 *
 * Usage:
 *   npx tsx test-firebase-config.ts
 */

import { config } from "dotenv";

// Load environment variables
config();

console.log("🔍 Testing Firebase Configuration\n");

// Check if environment variables are set
console.log("1️⃣ Checking environment variables...");

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const privateKey = process.env.VITE_FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL;

if (!projectId) {
  console.error("❌ VITE_FIREBASE_PROJECT_ID is not set");
  process.exit(1);
}
console.log(`✅ VITE_FIREBASE_PROJECT_ID: ${projectId}`);

if (!clientEmail) {
  console.error("❌ VITE_FIREBASE_CLIENT_EMAIL is not set");
  process.exit(1);
}
console.log(`✅ VITE_FIREBASE_CLIENT_EMAIL: ${clientEmail}`);

if (!privateKey) {
  console.error("❌ VITE_FIREBASE_PRIVATE_KEY is not set");
  process.exit(1);
}
console.log(
  `✅ VITE_FIREBASE_PRIVATE_KEY is set (${privateKey.length} characters)`,
);

console.log();

// Validate private key format
console.log("2️⃣ Validating private key format...");

if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
  console.error("❌ Private key is missing BEGIN marker");
  process.exit(1);
}
console.log("✅ Private key has BEGIN marker");

if (!privateKey.includes("-----END PRIVATE KEY-----")) {
  console.error("❌ Private key is missing END marker");
  process.exit(1);
}
console.log("✅ Private key has END marker");

// Check if key has escaped newlines
if (privateKey.includes("\\n")) {
  console.log(
    "✅ Private key has escaped newlines (will be converted at runtime)",
  );
} else if (privateKey.includes("\n")) {
  console.log("✅ Private key has actual newlines");
} else {
  console.warn("⚠️  Private key might not have proper newlines");
}

console.log();

// Validate client email format
console.log("3️⃣ Validating client email format...");

if (!clientEmail.includes("@")) {
  console.error("❌ Client email is not a valid email address");
  process.exit(1);
}
console.log("✅ Client email has @ symbol");

if (!clientEmail.includes(projectId)) {
  console.warn(`⚠️  Client email doesn't contain project ID (${projectId})`);
  console.warn("   This might be okay, but verify it's correct");
} else {
  console.log(`✅ Client email contains project ID`);
}

console.log();

// Try to initialize Firebase Admin SDK
console.log("4️⃣ Testing Firebase Admin SDK initialization...");

try {
  const admin = await import("firebase-admin");

  // Format the private key (replace escaped newlines)
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  // Initialize Firebase Admin
  const app = admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId: projectId,
        privateKey: formattedPrivateKey,
        clientEmail: clientEmail,
      }),
    },
    "test-app-" + Date.now(),
  ); // Use unique name to avoid conflicts

  console.log("✅ Firebase Admin SDK initialized successfully!");
  console.log(`   App name: ${app.name}`);
  console.log(`   Project ID: ${app.options.credential ? projectId : "N/A"}`);

  // Try to get messaging instance
  const messaging = admin.messaging(app);
  console.log("✅ Firebase Messaging instance created successfully!");

  // Clean up
  await app.delete();
  console.log("✅ Test app cleaned up");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:");
  if (error instanceof Error) {
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(
        `   Stack: ${error.stack.split("\n").slice(0, 3).join("\n")}`,
      );
    }
  } else {
    console.error(`   Error: ${String(error)}`);
  }
  process.exit(1);
}

console.log();
console.log("✨ All Firebase configuration tests passed!");
console.log();
console.log("📝 Summary:");
console.log(`   Project ID: ${projectId}`);
console.log(`   Client Email: ${clientEmail}`);
console.log(`   Private Key: ${privateKey.length} characters`);
console.log();
console.log("🎉 Your Firebase configuration is ready to use!");
console.log();
console.log("Next steps:");
console.log("1. Create an album through your UI (Upload.tsx or CsvUpload.tsx)");
console.log("2. Check the notification_logs table in your database");
console.log(
  "3. Register a real FCM token from a mobile device to receive actual notifications",
);
