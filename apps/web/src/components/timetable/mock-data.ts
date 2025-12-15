
export interface GlobalClassSession {
    id: string;
    courseName: string;
    courseCode: string;
    courseColor: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string; // "HH:mm" 24h format for easier sorting
    endTime: string; // "HH:mm"
    room: string;
    type: 'Lecture' | 'Lab' | 'Tutorial';
    instructor?: string;
    status: 'Scheduled' | 'Conducted' | 'Cancelled' | 'Compensatory';
    date?: string; // ISO date for history/specific instances
    note?: string;
}

export const WEEKLY_SCHEDULE: GlobalClassSession[] = [
    {
        id: '1',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'C-201',
        type: 'Lecture',
        instructor: 'Dr. Sarah Connor',
        status: 'Scheduled'
    },
    {
        id: '2',
        courseName: 'Database Systems',
        courseCode: 'CS-302',
        courseColor: 'bg-green-500',
        day: 'Monday',
        startTime: '13:00',
        endTime: '14:30',
        room: 'B-102',
        type: 'Lecture',
        instructor: 'Prof. Alan Grant',
        status: 'Scheduled'
    },
    {
        id: '3',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        day: 'Tuesday',
        startTime: '08:30',
        endTime: '10:00',
        room: 'A-301',
        type: 'Lecture',
        instructor: 'Dr. Ian Malcolm',
        status: 'Scheduled'
    },
    {
        id: '4',
        courseName: 'Database Systems Lab',
        courseCode: 'CS-302L',
        courseColor: 'bg-emerald-500',
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '17:00',
        room: 'Lab-2',
        type: 'Lab',
        instructor: 'Ms. Ellie Sattler',
        status: 'Scheduled'
    },
    {
        id: '5',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'C-201',
        type: 'Lecture',
        status: 'Cancelled',
        note: 'Instructor unavailable'
    },
    {
        id: '6',
        courseName: 'Software Engineering',
        courseCode: 'SE-201',
        courseColor: 'bg-indigo-500',
        day: 'Wednesday',
        startTime: '11:30',
        endTime: '13:00',
        room: 'D-101',
        type: 'Lecture',
        instructor: 'Mr. John Hammond',
        status: 'Scheduled'
    },
    {
        id: '7',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        day: 'Thursday',
        startTime: '08:30',
        endTime: '10:00',
        room: 'A-301',
        type: 'Lecture',
        status: 'Scheduled'
    },
    {
        id: '8',
        courseName: 'Software Engineering',
        courseCode: 'SE-201',
        courseColor: 'bg-indigo-500',
        day: 'Thursday',
        startTime: '14:30',
        endTime: '16:00',
        room: 'D-101',
        type: 'Lecture',
        status: 'Scheduled'
    },
    {
        id: '9',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        day: 'Friday',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab-3',
        type: 'Lab',
        status: 'Scheduled'
    },
    {
        id: '10',
        courseName: 'Database Systems',
        courseCode: 'CS-302',
        courseColor: 'bg-green-500',
        day: 'Friday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'B-102',
        type: 'Lecture',
        status: 'Compensatory',
        note: 'Makeup class'
    }
];

export const CLASS_HISTORY: GlobalClassSession[] = [
    {
        id: 'h1',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'C-201',
        type: 'Lecture',
        status: 'Conducted',
        date: '2024-12-09'
    },
    {
        id: 'h2',
        courseName: 'Database Systems',
        courseCode: 'CS-302',
        courseColor: 'bg-green-500',
        day: 'Monday',
        startTime: '13:00',
        endTime: '14:30',
        room: 'B-102',
        type: 'Lecture',
        status: 'Conducted',
        date: '2024-12-09'
    },
    {
        id: 'h3',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        day: 'Tuesday',
        startTime: '08:30',
        endTime: '10:00',
        room: 'A-301',
        type: 'Lecture',
        status: 'Cancelled',
        date: '2024-12-10',
        note: 'Public Holiday'
    }
];
