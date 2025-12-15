
export interface Course {
    id: string;
    name: string;
    code: string;
    instructor: string;
    role: 'Student' | 'TA';
    type: 'Theory' | 'Lab';
    term: string; // e.g., "Fall 2024"
    progress: number; // 0-100
    classActivity: {
        conducted: number;
        cancelled: number;
        compensatory: number;
    };
    upcomingDeadlines: number;
    hasAnnouncement: boolean;
    color: string; // Hex code or tailwind class for accent
}

export const COURSES: Course[] = [
    {
        id: '1',
        name: 'Applied Numerical Methods',
        code: 'CS-301',
        instructor: 'Dr. Sarah Connor',
        role: 'Student',
        type: 'Theory',
        term: 'Fall 2024',
        progress: 65,
        classActivity: {
            conducted: 24,
            cancelled: 1,
            compensatory: 1,
        },
        upcomingDeadlines: 2,
        hasAnnouncement: true,
        color: 'bg-blue-500',
    },
    {
        id: '2',
        name: 'Database Systems',
        code: 'CS-302',
        instructor: 'Prof. Alan Grant',
        role: 'Student',
        type: 'Theory',
        term: 'Fall 2024',
        progress: 45,
        classActivity: {
            conducted: 18,
            cancelled: 0,
            compensatory: 0,
        },
        upcomingDeadlines: 0,
        hasAnnouncement: false,
        color: 'bg-green-500',
    },
    {
        id: '3',
        name: 'Database Systems Lab',
        code: 'CS-302L',
        instructor: 'Ms. Ellie Sattler',
        role: 'Student',
        type: 'Lab',
        term: 'Fall 2024',
        progress: 80,
        classActivity: {
            conducted: 10,
            cancelled: 0,
            compensatory: 0,
        },
        upcomingDeadlines: 1,
        hasAnnouncement: true,
        color: 'bg-emerald-500',
    },
    {
        id: '4',
        name: 'Operating Systems',
        code: 'CS-303',
        instructor: 'Dr. Ian Malcolm',
        role: 'TA',
        type: 'Theory',
        term: 'Fall 2024',
        progress: 30,
        classActivity: {
            conducted: 12,
            cancelled: 2,
            compensatory: 2,
        },
        upcomingDeadlines: 5,
        hasAnnouncement: true,
        color: 'bg-purple-500',
    },
    {
        id: '5',
        name: 'Software Engineering',
        code: 'SE-201',
        instructor: 'Mr. John Hammond',
        role: 'Student',
        type: 'Theory',
        term: 'Fall 2024',
        progress: 55,
        classActivity: {
            conducted: 20,
            cancelled: 0,
            compensatory: 0,
        },
        upcomingDeadlines: 0,
        hasAnnouncement: false,
        color: 'bg-indigo-500',
    },
    {
        id: '6',
        name: 'Linear Algebra',
        code: 'MT-204',
        instructor: 'Ms. Claire Dearing',
        role: 'Student',
        type: 'Theory',
        term: 'Fall 2024',
        progress: 70,
        classActivity: {
            conducted: 28,
            cancelled: 1,
            compensatory: 0,
        },
        upcomingDeadlines: 1,
        hasAnnouncement: false,
        color: 'bg-yellow-500',
    }
];
