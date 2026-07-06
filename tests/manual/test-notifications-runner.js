/**
 * Test Runner for Push Notifications
 * Loads environment variables and runs the test script
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env") });

// Now import and run the test
import("./test-notifications.ts");
