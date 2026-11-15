"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { TestCredentialsModal } from "@/components/auth/test-credentials-modal";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            await authClient.signIn.email({
                email: values.email,
                password: values.password,
                fetchOptions: {
                    onResponse: () => {
                        setIsLoading(false);
                    },
                    onSuccess: async () => {
                        console.log("success")
                        const session = await authClient.getSession();
                        console.log(session);

                        if (session.data?.user?.role === "admin") {
                            router.push("/admin" as any);
                        } else {
                            router.push("/dashboard");
                        }
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    }
                }
            });
        } catch (error) {
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-muted-foreground mt-2">
                        Enter your credentials to access your account.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="student@university.edu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

                        <div className="flex items-center justify-between text-sm">
                            <Link href="#" className="font-medium text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>

                        <div className="mt-4 text-center text-sm">
                            <span className="text-muted-foreground">Don&apos;t have an account? </span>
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                Register
                            </Link>
                        </div>
                    </form>
                </Form>
            </motion.div>
            <TestCredentialsModal />
        </>
    );
}
