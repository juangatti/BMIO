const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^DATABASE_URL=["']?([^"\n\r']+)["']?/m);
      if (match) {
        process.env.DATABASE_URL = match[1];
      }
    }
  } catch (e) {
    console.warn("Warning: Could not read .env.local file:", e.message);
  }
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in process.env or .env.local");
  process.exit(1);
}
