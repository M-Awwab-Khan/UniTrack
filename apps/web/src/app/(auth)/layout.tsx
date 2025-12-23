import { auth } from "@uni-track/auth"
import { redirect } from "next/navigation";
import { headers } from "next/headers";
export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session && session.user) {
        if (session.user.role === 'admin') redirect('/admin' as any);
        redirect("/dashboard");
    }
    return (
        <div>
            {children}
        </div>
    );
}