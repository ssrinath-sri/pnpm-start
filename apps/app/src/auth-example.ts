import { mongoService } from "./mongodb.service";
import { userService, UserRole } from "./user.service";
import { authService } from "./auth.service";
import { authMiddleware } from "./auth.middleware";

interface DataItem {
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
}

async function runAuthenticationExample() {
  try {
    // Initialize MongoDB
    await mongoService.connect();
    console.log("\n=== AUTHENTICATION & AUTHORIZATION EXAMPLE ===\n");

    // 1. CREATE USERS
    console.log("1️⃣  Creating users with different roles...");
    const adminId = await userService.createUser({
      username: "admin_user",
      email: "admin@example.com",
      password: "admin123",
      role: UserRole.ADMIN,
    });

    const userId = await userService.createUser({
      username: "regular_user",
      email: "user@example.com",
      password: "user123",
      role: UserRole.USER,
    });

    const guestId = await userService.createUser({
      username: "guest_user",
      email: "guest@example.com",
      password: "guest123",
      role: UserRole.GUEST,
    });

    // 2. LOGIN AS DIFFERENT USERS
    console.log("\n2️⃣  User login...");

    let loginResponse = await authService.login({
      username: "admin_user",
      password: "admin123",
    });
    console.log("✅ Admin logged in");
    console.log(
      `   Token: ${loginResponse.token.substring(0, 20)}...`
    );
    const adminToken = loginResponse.token;

    loginResponse = await authService.login({
      username: "regular_user",
      password: "user123",
    });
    console.log("✅ Regular user logged in");
    const userToken = loginResponse.token;

    loginResponse = await authService.login({
      username: "guest_user",
      password: "guest123",
    });
    console.log("✅ Guest logged in");
    const guestToken = loginResponse.token;

    // 3. TEST PERMISSIONS
    console.log("\n3️⃣  Testing permissions and access control...");

    // Admin can read users
    try {
      const adminContext = authMiddleware.requireAuth(adminToken);
      authMiddleware.requirePermission(adminContext, "read:users");
      console.log("✅ Admin can read users");
    } catch (error) {
      console.log(`❌ ${(error as Error).message}`);
    }

    // Regular user cannot read users
    try {
      const userContext = authMiddleware.requireAuth(userToken);
      authMiddleware.requirePermission(userContext, "read:users");
      console.log("✅ User can read users");
    } catch (error) {
      console.log(`❌ User cannot read users: ${(error as Error).message}`);
    }

    // Guest can only read data
    try {
      const guestContext = authMiddleware.requireAuth(guestToken);
      authMiddleware.requirePermission(guestContext, "read:data");
      console.log("✅ Guest can read data");
    } catch (error) {
      console.log(`❌ ${(error as Error).message}`);
    }

    // Guest cannot write data
    try {
      const guestContext = authMiddleware.requireAuth(guestToken);
      authMiddleware.requirePermission(guestContext, "write:data");
      console.log("✅ Guest can write data");
    } catch (error) {
      console.log(
        `❌ Guest cannot write data: ${(error as Error).message}`
      );
    }

    // 4. ROLE-BASED ACCESS
    console.log("\n4️⃣  Testing role-based access control...");

    // Only admin can access admin endpoints
    try {
      const adminContext = authMiddleware.requireAuth(adminToken);
      authMiddleware.requireRole(adminContext, UserRole.ADMIN);
      console.log("✅ Admin role required: GRANTED to admin");
    } catch (error) {
      console.log(`❌ ${(error as Error).message}`);
    }

    try {
      const userContext = authMiddleware.requireAuth(userToken);
      authMiddleware.requireRole(userContext, UserRole.ADMIN);
      console.log("✅ Admin role required: GRANTED to user");
    } catch (error) {
      console.log(
        `❌ Admin role required: DENIED to user - ${(error as Error).message}`
      );
    }

    // 5. UPDATE USER ROLES
    console.log("\n5️⃣  Updating user roles and permissions...");
    await userService.updateUser(userId.toString(), {
      role: UserRole.ADMIN,
    });
    console.log("✅ Promoted regular user to admin");

    const updatedUser = await userService.getUserById(userId.toString());
    if (updatedUser) {
      console.log(`   New role: ${updatedUser.role}`);
      console.log(`   New permissions: ${updatedUser.permissions.join(", ")}`);
    }

    // 6. DEACTIVATE USER
    console.log("\n6️⃣  Deactivating user account...");
    await userService.updateUser(guestId.toString(), {
      isActive: false,
    });
    console.log("✅ Guest account deactivated");

    try {
      await authService.login({
        username: "guest_user",
        password: "guest123",
      });
    } catch (error) {
      console.log(
        `❌ Cannot login with deactivated account: ${(error as Error).message}`
      );
    }

    // 7. LIST ALL ACTIVE USERS
    console.log("\n7️⃣  Listing all active users...");
    const allUsers = await userService.getAllUsers();
    console.log(`Found ${allUsers.length} active users:`);
    allUsers.forEach((user) => {
      console.log(
        `   - ${user.username} (${user.email}) - Role: ${user.role}`
      );
    });

    console.log("\n✅ Authentication example completed successfully!\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoService.disconnect();
  }
}

// Run the example
runAuthenticationExample();
