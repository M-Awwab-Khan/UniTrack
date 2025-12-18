import "better-auth";

declare module "better-auth" {
    interface User {
        role: "admin" | "ta" | "student" | "teacher";
    }
}
