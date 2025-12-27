
export interface GlobalAnnouncement {
    id: string;
    title: string;
    content: string;
    courseName: string;
    courseCode: string;
    courseColor: string;
    author: string;
    role: 'Instructor' | 'TA' | 'Admin';
    date: string; // ISO date
    priority: 'Important' | 'Normal';
    tags?: string[];
    attachments?: { id: string; name: string; type: 'file' | 'link'; url: string; fileSize?: number; mimeType?: string }[];
    isRead?: boolean;
}

export const GLOBAL_ANNOUNCEMENTS: GlobalAnnouncement[] = [
    {
        id: '1',
        title: 'Midterm Exam Schedule Update',
        content: 'The midterm exam for Applied Numerical Methods has been rescheduled to next Tuesday, Dec 24th, due to the upcoming public holiday. Please check the updated timetable for the exact timing and venue.',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        author: 'Dr. Sarah Connor',
        role: 'Instructor',
        date: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), // 2 hours ago
        priority: 'Important',
        tags: ['Exam', 'Schedule'],
        attachments: [
            { id: '1', name: 'Updated_Exam_Schedule.pdf', type: 'file', url: '#', mimeType: 'application/pdf' }
        ]
    },
    {
        id: '2',
        title: 'Lab 5 Materials Uploaded',
        content: 'Slides and starter code for Lab 5: Matrix Operations have been uploaded to the course resources. Please review the slides before coming to the lab session.',
        courseName: 'Database Systems Lab',
        courseCode: 'CS-302L',
        courseColor: 'bg-emerald-500',
        author: 'Ms. Ellie Sattler',
        role: 'TA',
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        priority: 'Normal',
        attachments: [
            { id: '2', name: 'Lab5_Slides.pdf', type: 'file', url: '#', mimeType: 'application/pdf' },
            { id: '3', name: 'starter_code.zip', type: 'link', url: '#' }
        ]
    },
    {
        id: '3',
        title: 'Guest Lecture on Distributed Systems',
        content: 'We are excited to announce a guest lecture by Dr. Emmet Brown on "Time Synchronization in Distributed Systems". Attendance is mandatory for all students.',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        author: 'Dr. Ian Malcolm',
        role: 'Instructor',
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // 2 days ago
        priority: 'Important',
        tags: ['Guest Lecture', 'Mandatory']
    },
    {
        id: '4',
        title: 'Project Proposal Deadline Extended',
        content: 'Due to multiple requests, the deadline for the semester project proposal has been extended by 24 hours. The new deadline is tomorrow at 11:59 PM.',
        courseName: 'Software Engineering',
        courseCode: 'SE-201',
        courseColor: 'bg-indigo-500',
        author: 'Mr. John Hammond',
        role: 'Instructor',
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        priority: 'Normal',
    },
    {
        id: '5',
        title: 'University Sports Week Registration',
        content: 'Registration for the annual Sports Week is now open! Sign up for football, cricket, and badminton trials at the student center.',
        courseName: 'Student Affairs',
        courseCode: 'ADMIN',
        courseColor: 'bg-gray-500',
        author: 'Admin Office',
        role: 'Admin',
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        priority: 'Normal',
        tags: ['Sports', 'Events'],
        attachments: [
            { id: '4', name: 'Registration_Form.pdf', type: 'file', url: '#', mimeType: 'application/pdf' }
        ]
    }
];
