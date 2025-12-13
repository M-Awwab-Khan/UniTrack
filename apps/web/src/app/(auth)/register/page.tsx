import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register | UniTrack",
    description: "Create your academic account.",
};

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Join UniTrack"
            subtitle="Connect with your university ecosystem."
        >
            <RegisterForm />
        </AuthLayout>
    );
}
