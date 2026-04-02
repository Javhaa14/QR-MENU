import path from "node:path";

import mongoose from "mongoose";

const bcrypt = require("bcryptjs") as {
  hash(value: string, saltRounds: number): Promise<string>;
};

function loadEnv() {
  if (process.env.MONGODB_URI) {
    return;
  }

  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const candidate of candidates) {
    try {
      process.loadEnvFile?.(candidate);
      if (process.env.MONGODB_URI) {
        return;
      }
    } catch {
      // Ignore missing env files and keep trying.
    }
  }
}

async function seed() {
  loadEnv();

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing.");
  }

  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection is not ready.");
  }

  const users = db.collection("users");
  const now = new Date();
  const email = "admin@qrmenu.com";
  const passwordHash = await bcrypt.hash("changeme123", 10);

  await users.updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash,
        role: "superadmin",
        restaurantId: null,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  console.log("Superadmin user ensured:");
  console.log("email: admin@qrmenu.com");
  console.log("password: changeme123");
  console.log("role: superadmin");
}

void seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
