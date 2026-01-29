import { mongoService } from "./mongodb.service";

interface User {
  name: string;
  email: string;
  age?: number;
}

async function runCRUDOperations() {
  try {
    // Connect to MongoDB
    await mongoService.connect();

    const collectionName = "users";

    // CREATE - Insert a single document
    console.log("\n=== CREATE ===");
    const userId = await mongoService.create(collectionName, {
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    });

    // CREATE - Insert multiple documents
    await mongoService.createMany(collectionName, [
      { name: "Jane Smith", email: "jane@example.com", age: 28 },
      { name: "Bob Johnson", email: "bob@example.com", age: 35 },
    ]);

    // READ - Find all documents
    console.log("\n=== READ ALL ===");
    const allUsers = await mongoService.findAll(collectionName);
    console.log(`Found ${allUsers.length} users:`, allUsers);

    // READ - Find by ID
    console.log("\n=== READ BY ID ===");
    const user = await mongoService.findById(collectionName, userId.toString());
    console.log("User found:", user);

    // READ - Find one by filter
    console.log("\n=== READ ONE BY FILTER ===");
    const janeUser = await mongoService.findOne(collectionName, {
      name: "Jane Smith",
    });
    console.log("Jane found:", janeUser);

    // UPDATE - Update by ID
    console.log("\n=== UPDATE BY ID ===");
    await mongoService.updateById(collectionName, userId.toString(), {
      age: 31,
      name: "John Doe Updated",
    });

    // UPDATE - Update multiple documents
    console.log("\n=== UPDATE MANY ===");
    await mongoService.updateMany(
      collectionName,
      { age: { $gte: 30 } },
      { status: "senior" }
    );

    // READ - Verify updates
    console.log("\n=== VERIFY UPDATES ===");
    const updatedUsers = await mongoService.findAll(collectionName);
    console.log("Updated users:", updatedUsers);

    // DELETE - Delete by ID
    console.log("\n=== DELETE BY ID ===");
    const bobUser = await mongoService.findOne(collectionName, {
      name: "Bob Johnson",
    });
    if (bobUser?._id) {
      await mongoService.deleteById(collectionName, bobUser._id.toString());
    }

    // READ - Final state
    console.log("\n=== FINAL STATE ===");
    const finalUsers = await mongoService.findAll(collectionName);
    console.log(`Remaining users (${finalUsers.length}):`, finalUsers);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoService.disconnect();
  }
}

// Run CRUD operations
runCRUDOperations();
