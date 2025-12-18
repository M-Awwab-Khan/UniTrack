import "dotenv/config";
import { db } from "./index";
import { user, account, adminProfile } from "./schema/auth";
import { hashPassword } from "better-auth/crypto";
import { generateId } from "better-auth";

async function createAdminAccount() {
    // ⚠️ CHANGE THESE VALUES BEFORE RUNNING
    const adminEmail = "admin@unitrack.com";
    const adminPassword = "StrongPass123!"; // Use a strong password
    const adminName = "Awwab";

    // Generate unique IDs
    const userId = generateId();
    const accountId = generateId();
    const adminProfileId = generateId();

    console.log("🔐 Creating admin account...");
    console.log(`Email: ${adminEmail}`);
    console.log(`Name: ${adminName}`);

    try {
        // Hash the password using Better Auth's hash function
        const hashedPassword = await hashPassword(adminPassword);

        // Create user record
        await db.insert(user).values({
            id: userId,
            name: adminName,
            email: adminEmail,
            emailVerified: true,
            role: "admin",
        });
        console.log("✅ User created");

        // Create account record for email/password authentication
        await db.insert(account).values({
            id: accountId,
            accountId: adminEmail,
            providerId: "credential",
            userId: userId,
            password: hashedPassword,
        });
        console.log("✅ Account created");

        // Create admin profile
        await db.insert(adminProfile).values({
            id: adminProfileId,
            userId: userId,
        });
        console.log("✅ Admin profile created");

        console.log("\n🎉 Admin account created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log(`🆔 User ID: ${userId}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n⚠️  Please save these credentials securely!");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error creating admin account:");
        console.error(error);

        if (error instanceof Error) {
            if (error.message.includes("unique")) {
                console.error("\n⚠️  An account with this email already exists!");
            }
        }

        process.exit(1);
    }
}

createAdminAccount();
