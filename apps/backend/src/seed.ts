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

  console.log("Superadmin user ensured.");

  const templates = db.collection("templates");
  
  const modernBistro = {
    name: "Modern Bistro",
    thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    description: "A bold, image-heavy layout perfect for high-end dining and visual storytelling.",
    slotConfig: {
      hero: "fullBleed",
      categoryNav: "scrollTabs",
      itemCard: "magazine",
      categoryHeader: "banner",
      footer: "minimal",
    },
    defaultBrand: {
      primary: "#c06b3e",
      bg: "#fffaf2",
      text: "#1d140f",
      accent: "#9ac7b8",
      font: "Syne",
      borderRadius: "lg",
      darkMode: false,
      showImages: true,
      heroImage: "",
    },
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const minimalist = {
    name: "Minimalist",
    thumbnail: "https://images.unsplash.com/photo-1494346480775-936a9f0d0877?auto=format&fit=crop&w=800&q=80",
    description: "Clean, fast, and text-focused. Great for cafes and quick-service menus.",
    slotConfig: {
      hero: "logoOnly",
      categoryNav: "dropdown",
      itemCard: "minimalList",
      categoryHeader: "minimal",
      footer: "hidden",
    },
    defaultBrand: {
      primary: "#000000",
      bg: "#ffffff",
      text: "#000000",
      accent: "#666666",
      font: "Space Grotesk",
      borderRadius: "none",
      darkMode: false,
      showImages: false,
      heroImage: "",
    },
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await templates.updateOne(
    { name: modernBistro.name },
    { $set: modernBistro },
    { upsert: true }
  );

  await templates.updateOne(
    { name: minimalist.name },
    { $set: minimalist },
    { upsert: true }
  );

  console.log("Default templates seeded.");
}

void seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
