"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, BookOpen, GraduationCap, Users, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RoleCard } from "./role-card";
import {
    registerSchema,
    baseRegisterSchema,
    studentExtendSchema,
    taExtendSchema,
    inviteOnlySchema
} from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";

type RoleType = "student" | "ta" | "teacher" | "admin";

import { useTRPC } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

export function RegisterForm() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const trpc = useTRPC();
    const createProfileMutation = useMutation(trpc.auth.createProfile.mutationOptions({
        onSuccess: () => {
            toast.success("Account created successfully!");
            router.push("/dashboard");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));


    // Determine schema based on role
    const getSchema = () => {
        switch (selectedRole) {
            case "student": return baseRegisterSchema.merge(studentExtendSchema);
            case "ta": return baseRegisterSchema.merge(taExtendSchema);
            case "teacher":
            case "admin":
                return baseRegisterSchema.merge(inviteOnlySchema);
            default: return baseRegisterSchema;
        }
    };

    // Superset type for all form fields to satisfy all schemas
    type RegisterFormValues = z.infer<typeof baseRegisterSchema> & {
        rollNumber?: string;
        department?: string;
        semester?: string;
        batch?: string;
        inviteCode?: string;
        courseCode?: string;
    };

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(getSchema()),
        defaultValues: {
            role: "student", // default, will be overwritten
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            rollNumber: "",
            department: "",
            semester: "",
            batch: "",
            inviteCode: "",
            courseCode: "",
        },
        mode: "onChange",
    });

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role as RoleType);
        form.setValue("role", role as RoleType);
        setStep(2);
    };

    async function onSubmit(values: any) {
        setIsLoading(true);
        try {
            await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.name,
                // @ts-ignore - better-auth types might need update or mapped correctly
                role: values.role,
                // Pass additional metadata or fields as needed by your auth setup
                // If using custom fields, ensure better-auth is configured to receive them or use a separate API call to create profile
                image: undefined, // optional
                fetchOptions: {
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                        setIsLoading(false);
                    },
                    onSuccess: async () => {
                        try {
                            // Create profile after signup
                            await createProfileMutation.mutateAsync({
                                role: values.role,
                                rollNumber: values.rollNumber,
                                department: values.department,
                                semester: values.semester,
                                batch: values.batch,
                            });
                            // Success/error handling is in the mutation options above
                        } catch (profileError) {
                            console.error("Profile creation failed", profileError);
                            // Error toast is in mutation onError
                            router.push("/dashboard");
                        }
                    }
                }
            });
            // Note: In a real implementation with separate profile tables, 
            // you might need to hook into the signUp success or call a separate API endpoint to create the profile record.
            // Better-auth's `signUp` mainly handles the `user` table. 
            // For this implementation, we'll assume there is a hook or we need to do it manually.
            // However, for correct auth, checking if the user was created is enough for now.

        } catch (error) {
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                            <p className="text-muted-foreground mt-2">
                                Choose your primary role to get started.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-8">
                            <RoleCard
                                id="student"
                                title="Student"
                                description="Access courses, track attendance, and view results."
                                icon={<GraduationCap size={20} />}
                                selected={selectedRole === "student"}
                                onSelect={handleRoleSelect}
                            />
                            <RoleCard
                                id="ta"
                                title="Teaching Assistant"
                                description="Manage assignments and assist faculty members."
                                icon={<BookOpen size={20} />}
                                selected={selectedRole === "ta"}
                                onSelect={handleRoleSelect}
                            />
                            <RoleCard
                                id="teacher"
                                title="Faculty / Teacher"
                                description="Create courses, set deadlines, and grade students."
                                icon={<Users size={20} />}
                                selected={selectedRole === "teacher"}
                                onSelect={handleRoleSelect}
                                disabled // Future
                            />
                            <RoleCard
                                id="admin"
                                title="Administrator"
                                description="Manage department settings and users."
                                icon={<Shield size={20} />}
                                selected={selectedRole === "admin"}
                                onSelect={handleRoleSelect}
                                disabled // Invite only
                            />
                        </div>
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                            type="button"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to roles
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {selectedRole === "student" ? "Student Registration" :
                                    selectedRole === "ta" ? "TA Registration" : "Registration"}
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Enter your details to verify your identity.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>University Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="student@university.edu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Role Specific Fields */}
                                {selectedRole === "student" && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="rollNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Roll Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="123456" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="batch"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Batch</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="2024" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="department"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Department</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="CS" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="semester"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Semester</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sem" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                                        <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}

                                {selectedRole === "ta" && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="department"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="CS" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="inviteCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Invite Code (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="TA-123-CODE" {...field} />
                                                    </FormControl>
                                                    <FormDescription>If you were given a code by a professor.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </Form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
