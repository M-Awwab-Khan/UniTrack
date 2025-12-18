
export interface TAInvite {
    id: string;
    taName: string;
    taEmail: string;
    inviteCode: string;
    assignedCourses: { code: string; name: string }[];
    status: 'Active' | 'Used' | 'Expired' | 'Revoked';
    permissions: string[]; // e.g. ["create_assignments", "post_announcements"]
    createdOn: string; // ISO date
    expiresOn?: string; // ISO date
}

export const MOCK_INVITES: TAInvite[] = [
    {
        id: '1',
        taName: 'Alice Johnson',
        taEmail: 'alice.johnson@uni.edu',
        inviteCode: 'TA-8X92-221B',
        assignedCourses: [{ code: 'CS-301', name: 'Applied Numerical Methods' }],
        status: 'Active',
        permissions: ['create_assignments', 'post_announcements', 'upload_notes'],
        createdOn: new Date().toISOString(),
        expiresOn: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString() // Expires in 7 days
    },
    {
        id: '2',
        taName: 'Bob Smith',
        taEmail: 'bob.smith@uni.edu',
        inviteCode: 'TA-7Y33-998A',
        assignedCourses: [
            { code: 'CS-302L', name: 'Database Systems Lab' },
            { code: 'CS-302', name: 'Database Systems' }
        ],
        status: 'Used',
        permissions: ['create_assignments', 'edit_assignments', 'post_announcements', 'upload_notes', 'edit_timetable'],
        createdOn: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
    },
    {
        id: '3',
        taName: 'Charlie Demo',
        taEmail: 'charlie.d@uni.edu',
        inviteCode: 'TA-EXP-1234',
        assignedCourses: [{ code: 'SE-201', name: 'Software Engineering' }],
        status: 'Expired',
        permissions: ['create_assignments'],
        createdOn: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        expiresOn: new Date(new Date().setDate(new Date().getDate() - 23)).toISOString()
    },
    {
        id: '4',
        taName: 'David Revoked',
        taEmail: 'david.r@uni.edu',
        inviteCode: 'TA-REV-5678',
        assignedCourses: [{ code: 'CS-101', name: 'Intro to Computing' }],
        status: 'Revoked',
        permissions: ['all'],
        createdOn: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    }
];

export const ALL_COURSES = [
    { code: 'CS-301', name: 'Applied Numerical Methods' },
    { code: 'CS-302', name: 'Database Systems' },
    { code: 'CS-302L', name: 'Database Systems Lab' },
    { code: 'SE-201', name: 'Software Engineering' },
    { code: 'CS-303', name: 'Operating Systems' },
    { code: 'CS-101', name: 'Intro to Computing' },
    { code: 'MATH-201', name: 'Linear Algebra' },
    { code: 'ENG-101', name: 'Technical Writing' }
];

export const PERMISSION_OPTIONS = [
    { id: 'create_assignments', label: 'Create assignments' },
    { id: 'edit_assignments', label: 'Edit assignments' },
    { id: 'post_announcements', label: 'Post announcements' },
    { id: 'upload_notes', label: 'Upload notes' },
    { id: 'edit_timetable', label: 'Edit timetable' },
    // { id: 'delete_courses', label: 'Delete courses', disabled: true } // Admin only, usually not for TAs
];
