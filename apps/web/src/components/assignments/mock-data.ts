
export interface GlobalAssignment {
    id: string;
    title: string;
    courseName: string;
    courseCode: string;
    courseColor: string; // for badge accent
    type: 'Lab' | 'Assignment' | 'Quiz' | 'Project' | 'Presentation';
    dueDate: string; // ISO date
    status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Completed' | 'Submitted';

    // Details for Modal
    description: string;
    assignedBy: string;
    submissionStatus: 'Not Submitted' | 'Submitted' | 'Graded';
    resources?: { name: string; type: 'PDF' | 'Doc' | 'Link'; url: string }[];
    instructions?: string;
}

export const GLOBAL_ASSIGNMENTS: GlobalAssignment[] = [
    {
        id: '1',
        title: 'Assignment 3: Root Finding Methods',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        type: 'Assignment',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // Due in 2 days
        status: 'Upcoming',
        description: `Implement the **Bisection Method** and **Newton-Raphson Method** to find roots of non-linear equations. 
    
Compare the convergence rate of both methods for the function f(x) = x^3 - 2x - 5.
    
**Deliverables:**
* Python script (.py)
* Report comparing iterations (.pdf)`,
        assignedBy: 'Dr. Sarah Connor',
        submissionStatus: 'Not Submitted',
        resources: [
            { name: 'Lecture 5 Slides.pdf', type: 'PDF', url: '#' },
            { name: 'Starter Code.py', type: 'Doc', url: '#' }
        ]
    },
    {
        id: '2',
        title: 'Lab 5: Matrix Operations',
        courseName: 'Database Systems Lab',
        courseCode: 'CS-302L',
        courseColor: 'bg-emerald-500',
        type: 'Lab',
        dueDate: new Date().toISOString(), // Due Today
        status: 'Due Today',
        description: "Complete the exercises in the lab manual regarding **matrix multiplication** and **inversion** using Python's NumPy library.",
        assignedBy: 'Ms. Ellie Sattler',
        submissionStatus: 'Not Submitted',
        instructions: "Late submissions will be penalized by 10% per day.",
        resources: [
            { name: 'Lab Manual.pdf', type: 'PDF', url: '#' }
        ]
    },
    {
        id: '3',
        title: 'Quiz 2: Normalization',
        courseName: 'Database Systems',
        courseCode: 'CS-302',
        courseColor: 'bg-green-500',
        type: 'Quiz',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Overdue by 1 day
        status: 'Overdue',
        description: "In-class quiz covering 1NF, 2NF, 3NF, and BCNF normalization forms.",
        assignedBy: 'Prof. Alan Grant',
        submissionStatus: 'Not Submitted',
    },
    {
        id: '4',
        title: 'Project Proposal',
        courseName: 'Software Engineering',
        courseCode: 'SE-201',
        courseColor: 'bg-indigo-500',
        type: 'Project',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        status: 'Completed',
        description: "Submit a comprehensive proposal for your semester project. Include problem statement, proposed solution, and tech stack.",
        assignedBy: 'Mr. John Hammond',
        submissionStatus: 'Submitted',
    },
    {
        id: '5',
        title: 'Assignment 2: Error Analysis',
        courseName: 'Applied Numerical Methods',
        courseCode: 'CS-301',
        courseColor: 'bg-blue-500',
        type: 'Assignment',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        status: 'Completed',
        description: "Perform truncation and round-off error analysis for Taylor series expansion.",
        assignedBy: 'Dr. Sarah Connor',
        submissionStatus: 'Submitted',
    },
    {
        id: '6',
        title: 'Lab 4: SQL Queries',
        courseName: 'Database Systems Lab',
        courseCode: 'CS-302L',
        courseColor: 'bg-emerald-500',
        type: 'Lab',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: 'Upcoming',
        description: "Write complex SQL queries involving JOINs, subqueries, and aggregation functions.",
        assignedBy: 'Ms. Ellie Sattler',
        submissionStatus: 'Not Submitted',
    },
    {
        id: '7',
        title: 'Operating Systems Quiz 1',
        courseName: 'Operating Systems',
        courseCode: 'CS-303',
        courseColor: 'bg-purple-500',
        type: 'Quiz',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Due Tomorrow
        status: 'Upcoming',
        description: "Quiz covering topics from Process Management and Scheduling algorithms.",
        assignedBy: 'Dr. Ian Malcolm',
        submissionStatus: 'Not Submitted',
    }
];
