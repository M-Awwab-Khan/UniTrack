"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { TodaysClasses } from "@/components/dashboard/todays-classes";
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements";
import { CourseOverviewGrid } from "@/components/dashboard/course-grid";
import { authClient } from "@/lib/auth-client";

interface DashboardProps {
	session: typeof authClient.$Infer.Session | null;
}

export default function Dashboard({ session }: DashboardProps) {
	const user = session?.user;

	return (
		<div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
			<DashboardHeader userName={user?.name || "Student"} />

			<OverviewCards />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-8">
					<UpcomingDeadlines />
					<CourseOverviewGrid />
				</div>
				<div className="space-y-8">
					<TodaysClasses />
					<RecentAnnouncements />
				</div>
			</div>
		</div>
	);
}
