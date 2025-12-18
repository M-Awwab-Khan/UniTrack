
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
    fileSize?: string;
    url: string;
    week?: string;
    isNew?: boolean;
}

export const GLOBAL_NOTES: GlobalNote[] = [
    {
        id: '1',
        title: 'Lecture 5: Root Finding Techniques',
        description: 'Comprehensive detailed notes on Bisection, Newton-Raphson, and Secant methods.',
        type: 'Lecture Notes' as any, // keeping types flexible for UI
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        uploadedBy: 'Dr. Sarah Connor',
        uploadDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        fileSize: '2.4 MB',
        url: '#',
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
        fileSize: '1.1 MB',
        url: '#',
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
        fileSize: '5.6 MB',
        url: '#',
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
        url: '#',
        fileSize: '500 KB'
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
        url: '#',
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
        fileSize: '3.2 MB',
        url: '#',
        week: 'Week 4'
    }
];
