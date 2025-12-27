import { createTRPCRouter as router, protectedProcedure } from "../trpc";

// Mock Data
const overviewStats = {
    enrolledCourses: "5 Courses",
    upcomingDeadlines: "3 Due This Week",
    overdueTasks: "1 Missed",
    todaysClasses: "2 Classes",
};

const deadlines = [
    {
        id: 1,
        title: "Lab 4: Process Scheduling",
        course: "Operating Systems",
        dueDate: "Today, 11:59 PM",
        status: "Due Today",
    },
    {
        id: 2,
        title: "Database Project Proposal",
        course: "Database Systems",
        dueDate: "Tomorrow, 11:59 PM",
        status: "Upcoming",
    },
    {
        id: 3,
        title: "Assignment 2: Numerical Integration",
        course: "Applied Numerical Methods",
        dueDate: "Dec 18, 11:59 PM",
        status: "Upcoming",
    },
    {
        id: 4,
        title: "Quiz 3",
        course: "Applied Numerical Methods",
        dueDate: "Missed Yesterday",
        status: "Overdue",
    }
];

const classes = [
    {
        id: 1,
        name: "Operating Systems",
        time: "10:00 AM – 11:30 AM",
        location: "Room 304",
        type: "on-campus",
        status: "Scheduled",
    },
    {
        id: 2,
        name: "Applied Numerical Methods",
        time: "02:00 PM – 03:30 PM",
        location: "Online (Zoom)",
        type: "online",
        status: "Scheduled",
    }
];

const announcements = [
    {
        id: 1,
        course: "Operating Systems",
        title: "Quiz 3 Postponed to Next Week",
        date: "2 hours ago",
        priority: "high"
    },
    {
        id: 2,
        course: "Database Systems",
        title: "Assignment 1 Grades Released",
        date: "Yesterday",
        priority: "normal"
    },
    {
        id: 3,
        course: "Administration",
        title: "Campus Wi-Fi Maintenance Notice",
        date: "2 days ago",
        priority: "info"
    }
];

const courses = [
    {
        id: 1,
        name: "Applied Numerical Methods",
        instructor: "Dr. Sarah Johnson",
        pendingTasks: 2,
        progress: 65,
        code: "CS-301"
    },
    {
        id: 2,
        name: "Operating Systems",
        instructor: "Prof. Michael Chen",
        pendingTasks: 1,
        progress: 40,
        code: "CS-302"
    },
    {
        id: 3,
        name: "Database Systems",
        instructor: "Dr. Emily Davis",
        pendingTasks: 3,
        progress: 78,
        code: "CS-303"
    },
    {
        id: 4,
        name: "Technical Writing",
        instructor: "Ms. Jessica Brown",
        pendingTasks: 0,
        progress: 90,
        code: "HU-201"
    }
];

export const dashboardRouter = router({
    getOverviewStats: protectedProcedure.query(async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return overviewStats;
    }),

    getUpcomingDeadlines: protectedProcedure.query(async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return deadlines;
    }),

    getTodaysClasses: protectedProcedure.query(async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return classes;
    }),

    getRecentAnnouncements: protectedProcedure.query(async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return announcements;
    }),

    getCourses: protectedProcedure.query(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return courses;
    }),
});
