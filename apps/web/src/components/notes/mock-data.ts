

export interface Attachment {
    id: string;
    type: "file" | "link";
    name: string;
    url: string;
    fileSize?: number | null; // changed from string to number | null to match backend
    mimeType?: string | null;
}

export interface GlobalNote {
    id: string;
    title: string;
    description?: string;
    type: 'PDF' | 'Slides' | 'Lab Manual' | 'Reference' | 'Link' | 'Lecture Notes';
    courseName: string;
    courseCode: string;
    courseColor: string;
    uploadedBy: string;
    uploadDate: string; // ISO date
    attachments: Attachment[];
    week?: string;
    isNew?: boolean;
}

export const GLOBAL_NOTES: GlobalNote[] = [
    {
        id: '1',
        title: 'Lecture 5: Root Finding Techniques',
        description: 'Comprehensive detailed notes on Bisection, Newton-Raphson, and Secant methods.',
        type: 'Lecture Notes',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        uploadedBy: 'Dr. Sarah Connor',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        attachments: [
            {
                id: 'a1',
                type: 'file',
                name: 'Lecture_5_Root_Finding.pdf',
                url: '#',
                fileSize: 2400000,
                mimeType: 'application/pdf'
            }
        ],
        week: 'Week 5',
        isNew: true
    },
    {
        id: '2',
        title: 'Lab Manual 05: Matrix Ops',
        description: 'Step-by-step guide for various matrix operations implementation.',
        type: 'Lab Manual',
        courseName: 'Database Systems Lab',
        courseCode: 'CS-302L',
        courseColor: 'bg-emerald-500',
        uploadedBy: 'Ms. Ellie Sattler',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        attachments: [
            {
                id: 'a2',
                type: 'file',
                name: 'Lab_05_Instructions.pdf',
                url: '#',
                fileSize: 1100000,
                mimeType: 'application/pdf'
            }
        ],
        week: 'Week 5'
    },
    {
        id: '3',
        title: 'Distributed Systems Overview',
        description: 'Slides from the guest lecture covering time synchronization and consensus.',
        type: 'Slides',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        uploadedBy: 'Dr. Ian Malcolm',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        attachments: [
            {
                id: 'a3',
                type: 'file',
                name: 'Distributed_Systems_Intro.pptx',
                url: '#',
                fileSize: 5600000,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            }
        ],
        week: 'Week 4'
    },
    {
        id: '4',
        title: 'Python Installation Guide',
        description: 'Official setup guide for Python 3.11 and VS Code environment.',
        type: 'Reference',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        uploadedBy: 'Dr. Sarah Connor',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        attachments: [
            {
                id: 'a4',
                type: 'file',
                name: 'Python_Setup.pdf',
                url: '#',
                fileSize: 500000,
                mimeType: 'application/pdf'
            }
        ],
    },
    {
        id: '5',
        title: 'React Documentation',
        type: 'Link',
        courseName: 'Web Engineering',
        courseCode: 'SE-302',
        courseColor: 'bg-indigo-500',
        uploadedBy: 'Mr. John Hammond',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        attachments: [
            {
                id: 'a5',
                type: 'link',
                name: 'React Official Docs',
                url: 'https://react.dev'
            }
        ],
        week: 'Week 2'
    },
    {
        id: '6',
        title: 'Database Normalization Readings',
        description: 'Required reading material for 1NF, 2NF and 3NF.',
        type: 'Reference',
        courseName: 'Database Systems',
        courseCode: 'CS-302',
        courseColor: 'bg-green-500',
        uploadedBy: 'Prof. Alan Grant',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        attachments: [
            {
                id: 'a6',
                type: 'file',
                name: 'Normalization_Readings.pdf',
                url: '#',
                fileSize: 3200000,
                mimeType: 'application/pdf'
            }
        ],
        week: 'Week 4'
    }
];
