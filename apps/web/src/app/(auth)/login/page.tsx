import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | UniTrack",
    description: "Login to your academic workspace.",
};

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome back to UniTrack"
            subtitle="Your academic workspace, organized."
        >
            <LoginForm />
        </AuthLayout>
    );
}
