
export interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: string; // ISO date string
    type: 'Lab' | 'Quiz' | 'Project' | 'Assignment';
    status: 'Pending' | 'Submitted' | 'Missed' | 'Graded';
    grade?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    role: 'Instructor' | 'TA';
    date: string; // ISO date string
    isImportant: boolean;
}

export interface Resource {
    id: string;
    title: string;
    type: 'PDF' | 'Link' | 'Video' | 'File';
    url: string;
    uploadDate: string;
    category?: string; // e.g., "Week 1", "Syllabus"
}

export interface ClassSession {
    id: string;
    day: string; // e.g., "Monday"
    date?: string; // Specific date for history
    startTime: string; // "10:00 AM"
    endTime: string; // "11:30 AM"
    room: string;
    status: 'Scheduled' | 'Conducted' | 'Cancelled' | 'Compensatory';
}

export interface CourseDetail {
    id: string;
    overview: {
        description: string;
        totalAssignments: number;
        pendingAssignments: number;
        upcomingClasses: number;
        lastUpdated: string;
    };
    assignments: Assignment[];
    announcements: Announcement[];
    resources: Resource[];
    timetable: ClassSession[];
}

export const MOCK_COURSE_DETAILS: Record<string, CourseDetail> = {
    '1': {
        id: '1',
        overview: {
            description: "This course covers advanced numerical techniques for solving engineering problems. Topics include roots of equations, linear algebraic equations, optimization, curve fitting, and differential equations.",
            totalAssignments: 12,
            pendingAssignments: 2,
            upcomingClasses: 3,
            lastUpdated: "2024-12-14T10:30:00Z"
        },
        assignments: [
            {
                id: 'a1',
                title: 'Assignment 3: Root Finding Methods',
                description: 'Implement Bisection and Newton-Raphson methods in Python.',
                dueDate: '2024-12-18T23:59:00Z',
                type: 'Assignment',
                status: 'Pending'
            },
            {
                id: 'a2',
                title: 'Lab 5: Matrix Operations',
                description: 'Complete the exercises in the lab manual.',
                dueDate: '2024-12-20T23:59:00Z',
                type: 'Lab',
                status: 'Pending'
            },
            {
                id: 'a3',
                title: 'Quiz 2',
                description: 'Topics: Linear Algebra and Curve Fitting',
                dueDate: '2024-12-10T11:00:00Z',
                type: 'Quiz',
                status: 'Graded',
                grade: '85/100'
            },
            {
                id: 'a4',
                title: 'Assignment 2: Error Analysis',
                description: 'Analyze truncation and round-off errors.',
                dueDate: '2024-11-25T23:59:00Z',
                type: 'Assignment',
                status: 'Submitted',
                grade: '90/100'
            },
            {
                id: 'a5',
                title: 'Project Proposal',
                description: 'Submit a 1-page proposal for your semester project.',
                dueDate: '2024-11-15T23:59:00Z',
                type: 'Project',
                status: 'Submitted',
                grade: 'Complete'
            }
        ],
        announcements: [
            {
                id: 'an1',
                title: 'Midterm Exam Schedule Changed',
                content: 'The midterm exam has been rescheduled to next Tuesday due to the public holiday.',
                author: 'Dr. Sarah Connor',
                role: 'Instructor',
                date: '2024-12-12T09:00:00Z',
                isImportant: true
            },
            {
                id: 'an2',
                title: 'Lab 5 Materials Uploaded',
                content: 'The slides and starter code for Lab 5 are now available under the Notes tab.',
                author: 'Ian Malcolm',
                role: 'TA',
                date: '2024-12-10T14:30:00Z',
                isImportant: false
            },
            {
                id: 'an3',
                title: 'Welcome to CS-301',
                content: 'Welcome to the course! Please adhere to the academic integrity policy.',
                author: 'Dr. Sarah Connor',
                role: 'Instructor',
                date: '2024-09-01T08:00:00Z',
                isImportant: false
            }
        ],
        resources: [
            {
                id: 'r1',
                title: 'Course Syllabus',
                type: 'PDF',
                url: '#',
                uploadDate: '2024-09-01',
                category: 'General'
            },
            {
                id: 'r2',
                title: 'Lecture 1: Introduction',
                type: 'PDF',
                url: '#',
                uploadDate: '2024-09-03',
                category: 'Week 1'
            },
            {
                id: 'r3',
                title: 'Lab 1 Manual',
                type: 'PDF',
                url: '#',
                uploadDate: '2024-09-05',
                category: 'Week 1'
            },
            {
                id: 'r4',
                title: 'Python Setup Guide',
                type: 'Link',
                url: '#',
                uploadDate: '2024-09-05',
                category: 'General'
            }
        ],
        timetable: [
            {
                id: 't1',
                day: 'Monday',
                startTime: '10:00 AM',
                endTime: '11:30 AM',
                room: 'C-201',
                status: 'Scheduled'
            },
            {
                id: 't2',
                day: 'Wednesday',
                startTime: '10:00 AM',
                endTime: '11:30 AM',
                room: 'C-201',
                status: 'Scheduled'
            },
            {
                id: 't3',
                day: 'Friday',
                startTime: '02:00 PM',
                endTime: '04:00 PM',
                room: 'Lab-3',
                status: 'Scheduled'
            },
            {
                id: 't4',
                day: 'Monday',
                date: '2024-12-09',
                startTime: '10:00 AM',
                endTime: '11:30 AM',
                room: 'C-201',
                status: 'Conducted'
            },
            {
                id: 't5',
                day: 'Wednesday',
                date: '2024-12-11',
                startTime: '10:00 AM',
                endTime: '11:30 AM',
                room: 'C-201',
                status: 'Cancelled'
            }
        ]
    }
};
