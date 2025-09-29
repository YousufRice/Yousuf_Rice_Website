import { Client, ID, TablesDB } from "node-appwrite";

// -------------------
// 1. Init Client
// -------------------
const client = new Client();

client
  .setEndpoint("https://syd.cloud.appwrite.io/v1") // change if self-hosted
  .setProject("68cb65a4000ab2fec182") // replace with your Project ID
  .setKey("standard_4b63bc32da61c14d3606a31dbf45166e9f640cea8515a36ad64bbfcd706254bf794d9d8d977bcb06f178a0e806f6eefd48504d2dcce871058c204b44798d9439a9ac89adcff37a953800a204d951aa5d251ef475da8ca4cba2ec49f60da39e581a17386fa3f45bcbfba8108df2d4bc9d31effff4d4b2479b8bd8c8a9c445ec83"); // replace with API Key (with database write perms)

const tablesdb = new TablesDB(client);

// -------------------
// 2. Database Config
// -------------------
const DATABASE_ID = "68da7071003bbb01685e"; // database must exist already

// -------------------
// 3. Create Database & Tables + Columns
// -------------------
async function setupTables() {
  try {

    // -------------------
    // PRODUCTS
    // -------------------
    console.log("Creating Products table...");
    const productsTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "products",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "name",
      size: 255,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "description",
      size: 1000,
      required: false,
    });

    await tablesdb.createFloatColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "price",
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "stock",
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "category",
      size: 255,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: productsTable.$id,
      key: "image_url",
      size: 500,
      required: false,
    });
    console.log("✅ Products table created");

    // -------------------
    // CUSTOMERS
    // -------------------
    console.log("Creating Customers table...");
    const customersTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "customers",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: customersTable.$id,
      key: "name",
      size: 255,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: customersTable.$id,
      key: "email",
      size: 255,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: customersTable.$id,
      key: "phone",
      size: 20,
      required: false,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: customersTable.$id,
      key: "address",
      size: 500,
      required: false,
    });
    console.log("✅ Customers table created");

    // -------------------
    // ORDERS
    // -------------------
    console.log("Creating Orders table...");
    const ordersTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "orders",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: ordersTable.$id,
      key: "customer_id",
      size: 36,
      required: true,
    });

    await tablesdb.createFloatColumn({
      databaseId: DATABASE_ID,
      tableId: ordersTable.$id,
      key: "total_amount",
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: ordersTable.$id,
      key: "status",
      size: 50,
      required: true,
    });
    console.log("✅ Orders table created");

    // -------------------
    // ORDER_ITEMS
    // -------------------
    console.log("Creating Order Items table...");
    const orderItemsTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "order_items",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: orderItemsTable.$id,
      key: "order_id",
      size: 36,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: orderItemsTable.$id,
      key: "product_id",
      size: 36,
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: orderItemsTable.$id,
      key: "quantity",
      required: true,
    });

    await tablesdb.createFloatColumn({
      databaseId: DATABASE_ID,
      tableId: orderItemsTable.$id,
      key: "price",
      required: true,
    });
    console.log("✅ Order Items table created");

    // -------------------
    // INVENTORY
    // -------------------
    console.log("Creating Inventory table...");
    const inventoryTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "inventory",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: inventoryTable.$id,
      key: "product_id",
      size: 36,
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: inventoryTable.$id,
      key: "quantity",
      required: true,
    });
    console.log("✅ Inventory table created");

    // -------------------
    // ADMIN_USERS
    // -------------------
    console.log("Creating Admin Users table...");
    const adminUsersTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "admin_users",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: adminUsersTable.$id,
      key: "username",
      size: 255,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: adminUsersTable.$id,
      key: "password_hash",
      size: 500,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: adminUsersTable.$id,
      key: "role",
      size: 50,
      required: true,
    });
    console.log("✅ Admin Users table created");

    // -------------------
    // ANALYTICS_EVENTS
    // -------------------
    console.log("Creating Analytics Events table...");
    const analyticsEventsTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "analytics_events",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsEventsTable.$id,
      key: "event_type",
      size: 100,
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsEventsTable.$id,
      key: "user_id",
      size: 36,
      required: false,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsEventsTable.$id,
      key: "product_id",
      size: 36,
      required: false,
    });
    console.log("✅ Analytics Events table created");

    // -------------------
    // ANALYTICS_SUMMARY
    // -------------------
    console.log("Creating Analytics Summary table...");
    const analyticsSummaryTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "analytics_summary",
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "total_page_views",
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "unique_visitors",
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "total_product_views",
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "total_cart_additions",
      required: true,
    });

    await tablesdb.createIntegerColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "total_orders",
      required: true,
    });

    await tablesdb.createFloatColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "total_revenue",
      required: true,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "top_products",
      size: 1000,
      array: true,
      required: false,
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: analyticsSummaryTable.$id,
      key: "top_categories",
      size: 1000,
      array: true,
      required: false,
    });
    console.log("✅ Analytics Summary table created");

    // -------------------
    // SESSIONS
    // -------------------
    console.log("Creating Sessions table...");
    const sessionsTable = await tablesdb.createTable({
      databaseId: DATABASE_ID,
      tableId: ID.unique(),
      name: "sessions",
    });

    await tablesdb.createStringColumn({
      databaseId: DATABASE_ID,
      tableId: sessionsTable.$id,
      key: "user_id",
      size: 36,
      required: true,
    });

    await tablesdb.createDatetimeColumn({
      databaseId: DATABASE_ID,
      tableId: sessionsTable.$id,
      key: "login_time",
      required: false,
    });

    await tablesdb.createDatetimeColumn({
      databaseId: DATABASE_ID,
      tableId: sessionsTable.$id,
      key: "logout_time",
      required: false,
    });
    console.log("✅ Sessions table created");

    console.log("\n🎉 All tables and schemas created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
}

setupTables();