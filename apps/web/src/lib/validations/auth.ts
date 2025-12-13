import { z } from "zod";

export const roleEnum = z.enum(["student", "ta", "teacher", "admin"]);

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const baseRegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: roleEnum,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const studentExtendSchema = z.object({
    role: z.literal("student"),
    rollNumber: z.string().min(1, "Roll Number is required"),
    department: z.string().min(1, "Department is required"),
    semester: z.string().min(1, "Semester is required"),
    batch: z.string().min(1, "Batch is required"),
});

export const taExtendSchema = z.object({
    role: z.literal("ta"),
    department: z.string().min(1, "Department is required"),
    courseCode: z.string().optional(),
    inviteCode: z.string().optional(),
});

// Admin/Teacher might just be invite only, so no public register schema needed or just basic info
export const inviteOnlySchema = z.object({
    role: z.enum(["teacher", "admin"]),
    inviteCode: z.string().min(1, "Invite code is required"),
});

// Discriminated Union for parsing the final payload
export const registerSchema = z.discriminatedUnion("role", [
    baseRegisterSchema.merge(studentExtendSchema),
    baseRegisterSchema.merge(taExtendSchema),
    baseRegisterSchema.merge(inviteOnlySchema),
]);

export type RegisterValues = z.infer<typeof registerSchema>;
