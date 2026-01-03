import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "UniTrack - All Your Academic Life. One Place.",
	description: "Assignments, deadlines, announcements, and schedules — finally organized.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NuqsAdapter>
					<TRPCReactProvider>
						{children}
						<Toaster />
					</TRPCReactProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
