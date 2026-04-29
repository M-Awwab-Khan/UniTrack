import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignmentsRouter } from '../assignments';
import { createCallerFactory } from '../../trpc';
import { TRPCError } from '@trpc/server';

const { mockDb, mockTx, mockStorage } = vi.hoisted(() => {
    const storage = {
        upload: vi.fn(),
        delete: vi.fn()
    };

    const db: any = {
        query: {
            assignments: { findFirst: vi.fn(), findMany: vi.fn() },
            courseStudents: { findFirst: vi.fn(), findMany: vi.fn() },
            courseTas: { findFirst: vi.fn() },
            attachments: { findFirst: vi.fn(), findMany: vi.fn() }
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    };
    return { mockDb: db, mockStorage: storage };
});

vi.mock('@uni-track/db', () => ({ db: mockDb }));

vi.mock('@uni-track/db/schema', () => ({
    assignments: { id: 'assignment_id' },
    assignmentSubmissions: { assignmentId: 'assignment_id', studentId: 'student_id', attemptNumber: 'attempt_number' },
    courseStudents: { courseId: 'course_id' },
    attachments: { id: 'attachment_id', assignmentId: 'assignmentId' },
    assignmentTypeEnum: { enumValues: ['quiz', 'assignment', 'project'] },
    attachmentTypeEnum: { enumValues: ['file', 'link'] },
    notifications: { id: 'notif_id' }
}));

vi.mock('@uni-track/storage', () => ({ storage: mockStorage }));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    and: vi.fn((...args) => ({ and: args })),
    sql: vi.fn((strings, ...values) => strings.join(''))
}));

vi.mock('../lib/notifications', () => ({
    createNotification: vi.fn().mockResolvedValue({})
}));

vi.mock('@uni-track/auth', () => ({
    auth: { api: { getSession: vi.fn() } }
}));

const createCaller = createCallerFactory(assignmentsRouter);

describe('Assignments Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const studentCaller = createCaller({
        session: { user: { id: 'student-id', role: 'student' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    const taCaller = createCaller({
        session: { user: { id: 'ta-id', role: 'ta' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    describe('Feature: Assignment Logic & Submission', () => {
        it('TC-B1: Call getAll for student with submission -> Completed', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([{
                id: 'a1', title: 'A1', courseId: 'c1', dueDate: new Date(Date.now() + 100000),
                course: { name: 'CS101', code: 'CS101' }, attachments: [],
                submissions: [{ submittedAt: new Date(), isLate: false, attemptNumber: 1 }]
            }]);
            const res = await studentCaller.getAll();
            expect(res[0].status).toBe('Completed');
            expect(res[0].submissionStatus).toBe('Submitted');
        });

        it('TC-B1b: Call getAll for student with late submission -> Completed / Late Submission', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([{
                id: 'a1', title: 'A1', courseId: 'c1', dueDate: new Date(Date.now() - 100000),
                course: { name: 'CS101', code: 'CS101' }, attachments: [],
                submissions: [{ submittedAt: new Date(), isLate: true, attemptNumber: 1 }]
            }]);
            const res = await studentCaller.getAll();
            expect(res[0].status).toBe('Completed');
            expect(res[0].submissionStatus).toBe('Late Submission');
        });

        it('TC-B2: Evaluate overdue logic in getAll -> Overdue', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([{
                id: 'a2', title: 'A2', courseId: 'c1', dueDate: new Date(Date.now() - 100000), // Past
                course: { name: 'CS101', code: 'CS101' }, attachments: [], submissions: []
            }]);
            const res = await studentCaller.getAll();
            expect(res[0].status).toBe('Overdue');
        });

        it('TC-B3: Evaluate "Due Today" path in getAll -> Due Today', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([{
                id: 'a3', title: 'A3', courseId: 'c1', dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // Late Today
                course: { name: 'CS101', code: 'CS101' }, attachments: [], submissions: []
            }]);
            const res = await studentCaller.getAll();
            expect(res[0].status).toBe('Due Today');
        });

        it('TC-B3b: Evaluate getByCourseId for specific states', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([{
                id: 'a3', title: 'A3', courseId: 'c1', dueDate: new Date(new Date().setHours(23, 59, 59, 999)), // Late Today
                course: { name: 'CS101', code: 'CS101' }, attachments: [{ id: 'att1', type: 'file' }], submissions: []
            }]);
            const res = await studentCaller.getByCourseId({ courseId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res[0].status).toBe('Due Today');
        });

        it('TC-B4: Execute submit mutation after deadline (isLate: true)', async () => {
            mockDb.query.assignments.findFirst.mockResolvedValueOnce({
                id: 'a1', courseId: 'c1', dueDate: new Date(Date.now() - 100000) // Past
            });
            mockDb.query.courseStudents.findFirst.mockResolvedValueOnce({ courseId: 'c1', userId: 'student-id' }); // Enrolled
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValueOnce({ onConflictDoUpdate: vi.fn() }) } as any);

            const res = await studentCaller.submit({ assignmentId: '123e4567-e89b-12d3-a456-426614174000', submissionText: 'Done' });
            expect(res.isLate).toBe(true);
            expect(res.success).toBe(true);
        });

        it('TC-B5: Trigger taProcedure with student role (FORBIDDEN)', async () => {
            await expect(studentCaller.create({
                title: 'New', description: 'Desc', courseId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'assignment', dueDate: new Date().toISOString()
            })).rejects.toThrowError(new TRPCError({ code: 'FORBIDDEN', message: 'Only Teaching Assistants can perform this action' }));
        });

        it('TC-B6: Check isTaAssignedToCourse fail path (FORBIDDEN)', async () => {
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce(null); // Not assigned

            await expect(taCaller.create({
                title: 'New', description: 'Desc', courseId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'assignment', dueDate: new Date().toISOString()
            })).rejects.toThrowError(new TRPCError({ code: 'FORBIDDEN', message: 'You are not assigned to this course' }));
        });

        it('TC-B7: Execute create with attachment loop (2 files) -> {success: true}', async () => {
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' }); // Assigned
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValueOnce({ returning: vi.fn().mockResolvedValueOnce([{ id: 'new-a1' }]) }) } as any);
            mockStorage.upload.mockResolvedValue({ url: 'http://cloud/1', publicId: 'pub1' });
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([]); // No students for notification

            const res = await taCaller.create({
                title: 'With Files', description: 'Desc', courseId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'assignment', dueDate: new Date().toISOString(),
                attachments: [
                    { type: 'file', name: 'File 1', value: 'base64-1' },
                    { type: 'file', name: 'File 2', value: 'base64-2' }
                ]
            });
            expect(res.success).toBe(true);
            expect(mockStorage.upload).toHaveBeenCalledTimes(2);
        });

        it('TC-B7b: Execute create with attachment loop - upload fail is handled gracefully', async () => {
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' }); // Assigned
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValueOnce({ returning: vi.fn().mockResolvedValueOnce([{ id: 'new-a1' }]) }) } as any);
            mockStorage.upload.mockRejectedValueOnce(new Error('Cloud fail')); // fail upload
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([]);

            const res = await taCaller.create({
                title: 'With Files Throw', description: 'Desc', courseId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'assignment', dueDate: new Date().toISOString(),
                attachments: [
                    { type: 'file', name: 'File 1', value: 'base64-1' },
                    { type: 'link', name: 'Link 1', value: 'http://link' }
                ]
            });
            expect(res.success).toBe(true);
        });

        it('TC-B8: Check attachments.length >= 3 limit (BAD_REQUEST)', async () => {
            mockDb.query.assignments.findFirst.mockResolvedValueOnce({ id: 'a1', courseId: 'c1' });
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' }); // Assigned
            mockDb.query.attachments.findMany.mockResolvedValueOnce([{}, {}, {}]); // 3 existing attachments

            await expect(taCaller.addAttachment({
                assignmentId: '123e4567-e89b-12d3-a456-426614174000', type: 'file', name: 'file4', value: 'b64'
            })).rejects.toThrowError(new TRPCError({ code: 'BAD_REQUEST', message: 'Maximum 3 attachments per assignment' }));
        });

        it('TC-B9: Execute removeAttachment with cloud fail -> {success: true}', async () => {
            mockDb.query.attachments.findFirst.mockResolvedValueOnce({
                id: 'att1', type: 'file', publicId: 'pub1', assignment: { courseId: 'c1' }
            });
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' }); // Assigned
            mockStorage.delete.mockRejectedValueOnce(new Error('Cloud delete fail'));
            // Even if delete fails, DB deletion proceeds
            mockDb.delete.mockReturnValueOnce({ where: vi.fn() } as any);

            const res = await taCaller.removeAttachment({ attachmentId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.success).toBe(true);
        });

        // Let's add additional coverages for update, delete and other addAttachment logic to hit 100% path coverage
        it('TC-B10: Execute addAttachment success path', async () => {
            mockDb.query.assignments.findFirst.mockResolvedValueOnce({ id: 'a1', courseId: 'c1' });
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' }); // Assigned
            mockDb.query.attachments.findMany.mockResolvedValueOnce([]); // 0 existing attachments
            mockStorage.upload.mockResolvedValue({ url: 'http://url', publicId: 'pub1' });

            const res = await taCaller.addAttachment({
                assignmentId: '123e4567-e89b-12d3-a456-426614174000', type: 'file', name: 'file1', value: 'b64'
            });
            expect(res.success).toBe(true);
        });

        it('TC-B11: Execute update and delete success paths', async () => {
            // Update
            mockDb.query.assignments.findFirst.mockResolvedValueOnce({ id: 'a1', courseId: 'c1' });
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' });
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([]);
            await expect(taCaller.update({ id: '123e4567-e89b-12d3-a456-426614174000', title: 'T', description: 'D', type: 'project', dueDate: new Date().toISOString() })).resolves.toEqual({ success: true });

            // Delete
            mockDb.query.assignments.findFirst.mockResolvedValueOnce({ id: 'a1', title: 'T', courseId: 'c1' });
            mockDb.query.courseTas.findFirst.mockResolvedValueOnce({ taId: 'ta-id', courseId: 'c1' });
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([]);
            await expect(taCaller.delete({ id: '123e4567-e89b-12d3-a456-426614174000' })).resolves.toEqual({ success: true });
        });
    });
});
