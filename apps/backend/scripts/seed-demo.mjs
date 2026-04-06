import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const DEMO_SLUG = "demo";
const DEMO_EMAIL = "demo@qrmenu.local";
const DEMO_PASSWORD = "demo12345";

const now = new Date();

const themeConfig = {
  colors: {
    primary: "#c06b3e",
    bg: "#fffaf2",
    text: "#1d140f",
    accent: "#9ac7b8",
  },
  font: "Syne",
  borderRadius: "lg",
  darkMode: false,
  showImages: true,
  heroImage: "",
  components: {
    hero: "fullBleed",
    categoryNav: "scrollTabs",
    itemCard: "imageTop",
    categoryHeader: "banner",
    footer: "minimal",
  },
};

function createMenuDocument(restaurantId) {
  const startersId = new mongoose.Types.ObjectId();
  const mainsId = new mongoose.Types.ObjectId();
  const drinksId = new mongoose.Types.ObjectId();

  const truffleFriesId = new mongoose.Types.ObjectId();
  const crispyShrimpId = new mongoose.Types.ObjectId();
  const steakId = new mongoose.Types.ObjectId();
  const salmonId = new mongoose.Types.ObjectId();
  const tiramisuId = new mongoose.Types.ObjectId();
  const citrusSpritzId = new mongoose.Types.ObjectId();

  return {
    _id: new mongoose.Types.ObjectId(),
    restaurantId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    categories: [
      {
        _id: startersId,
        name: "Starters",
        position: 0,
        items: [
          {
            _id: truffleFriesId,
            name: "Truffle Fries",
            description: "Crisp fries, parmesan, herbs, truffle salt.",
            price: 8,
            currency: "USD",
            image: "",
            tags: ["popular", "shareable"],
            allergens: ["dairy"],
            isAvailable: true,
          },
          {
            _id: crispyShrimpId,
            name: "Crispy Shrimp",
            description: "Light batter, smoked chili glaze, lime.",
            price: 12,
            currency: "USD",
            image: "",
            tags: ["spicy"],
            allergens: ["shellfish", "gluten"],
            isAvailable: true,
          },
        ],
      },
      {
        _id: mainsId,
        name: "Mains",
        position: 1,
        items: [
          {
            _id: steakId,
            name: "House Steak",
            description: "Grilled steak, roast potatoes, pepper sauce.",
            price: 28,
            currency: "USD",
            image: "",
            tags: ["signature"],
            allergens: [],
            isAvailable: true,
          },
          {
            _id: salmonId,
            name: "Cedar Salmon",
            description: "Maple glaze, charred greens, citrus butter.",
            price: 24,
            currency: "USD",
            image: "",
            tags: ["fresh"],
            allergens: ["fish"],
            isAvailable: true,
          },
          {
            _id: tiramisuId,
            name: "Midnight Tiramisu",
            description: "Espresso cream, cocoa, mascarpone layers.",
            price: 9,
            currency: "USD",
            image: "",
            tags: ["dessert"],
            allergens: ["dairy", "egg"],
            isAvailable: true,
          },
        ],
      },
      {
        _id: drinksId,
        name: "Drinks",
        position: 2,
        items: [
          {
            _id: citrusSpritzId,
            name: "Citrus Spritz",
            description: "Orange, tonic, rosemary, sparkling finish.",
            price: 7,
            currency: "USD",
            image: "",
            tags: ["refreshing"],
            allergens: [],
            isAvailable: true,
          },
        ],
      },
    ],
  };
}

function createOrderDocuments(restaurantId, menu) {
  const [starters, mains, drinks] = menu.categories;
  const truffleFries = starters.items[0];
  const crispyShrimp = starters.items[1];
  const steak = mains.items[0];
  const salmon = mains.items[1];
  const tiramisu = mains.items[2];
  const citrusSpritz = drinks.items[0];

  return [
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: "1",
      status: "pending",
      totalPrice: 35,
      createdAt: new Date(now.getTime() - 4 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 60 * 1000),
      items: [
        {
          menuItemId: String(steak._id),
          name: steak.name,
          price: steak.price,
          quantity: 1,
          note: "Medium rare",
        },
        {
          menuItemId: String(citrusSpritz._id),
          name: citrusSpritz.name,
          price: citrusSpritz.price,
          quantity: 1,
          note: "",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: "2",
      status: "preparing",
      totalPrice: 20,
      createdAt: new Date(now.getTime() - 11 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 60 * 1000),
      items: [
        {
          menuItemId: String(truffleFries._id),
          name: truffleFries.name,
          price: truffleFries.price,
          quantity: 1,
          note: "",
        },
        {
          menuItemId: String(crispyShrimp._id),
          name: crispyShrimp.name,
          price: crispyShrimp.price,
          quantity: 1,
          note: "Extra lime",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: "4",
      status: "ready",
      totalPrice: 31,
      createdAt: new Date(now.getTime() - 17 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 1000),
      items: [
        {
          menuItemId: String(salmon._id),
          name: salmon.name,
          price: salmon.price,
          quantity: 1,
          note: "",
        },
        {
          menuItemId: String(citrusSpritz._id),
          name: citrusSpritz.name,
          price: citrusSpritz.price,
          quantity: 1,
          note: "",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      restaurantId,
      tableNumber: "5",
      status: "completed",
      totalPrice: 18,
      createdAt: new Date(now.getTime() - 35 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 22 * 60 * 1000),
      items: [
        {
          menuItemId: String(tiramisu._id),
          name: tiramisu.name,
          price: tiramisu.price,
          quantity: 2,
          note: "",
        },
      ],
    },
  ];
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to the root .env file first.");
  }

  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const restaurants = db.collection("restaurants");
  const users = db.collection("users");
  const menus = db.collection("menus");
  const orders = db.collection("orders");

  const existingRestaurant = await restaurants.findOne({ slug: DEMO_SLUG });
  const restaurantId = existingRestaurant?._id ?? new mongoose.Types.ObjectId();
  const restaurantIdString = String(restaurantId);

  await restaurants.updateOne(
    { _id: restaurantId },
    {
      $set: {
        slug: DEMO_SLUG,
        name: "Demo Bistro",
        logo: "",
        themeConfig,
        plan: "pro",
        restaurantType: "order_enabled",
        tables: ["1", "2", "4", "5"],
        isActive: true,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await users.updateOne(
    { email: DEMO_EMAIL },
    {
      $set: {
        email: DEMO_EMAIL,
        passwordHash,
        restaurantId: restaurantIdString,
        role: "restaurant_admin",
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  await menus.deleteMany({ restaurantId: restaurantIdString });
  const demoMenu = createMenuDocument(restaurantIdString);
  await menus.insertOne(demoMenu);

  await orders.deleteMany({ restaurantId: restaurantIdString });
  const demoOrders = createOrderDocuments(restaurantIdString, demoMenu);
  await orders.insertMany(demoOrders);

  console.log("");
  console.log("Demo data seeded successfully.");
  console.log(`Restaurant slug: ${DEMO_SLUG}`);
  console.log(`Admin email: ${DEMO_EMAIL}`);
  console.log(`Admin password: ${DEMO_PASSWORD}`);
  console.log("Menu URL: http://localhost:3000/menu/demo");
  console.log("Admin URL: http://localhost:3000/admin/login");
  console.log("QR URL: http://localhost:3002/public/qr/demo");
  console.log("");
  console.log("Sample tables already represented in demo orders: 1, 2, 4, 5");
}

main()
  .catch((error) => {
    console.error("Failed to seed demo data.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
