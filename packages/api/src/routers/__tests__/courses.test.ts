import { describe, it, expect, vi, beforeEach } from 'vitest';
import { coursesRouter } from '../courses';
import { createCallerFactory } from '../../trpc';
import { TRPCError } from '@trpc/server';

const { mockDb, mockTx } = vi.hoisted(() => {
    const tx = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis()
    };

    const db: any = {
        query: {
            courses: { findFirst: vi.fn(), findMany: vi.fn() },
            assignments: { findMany: vi.fn() },
            assignmentSubmissions: { findMany: vi.fn() },
            classSessions: { findMany: vi.fn() },
            courseEnrollmentCodes: { findFirst: vi.fn() },
            courseStudents: { findFirst: vi.fn(), findMany: vi.fn() }
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        transaction: vi.fn(async (cb: any) => {
            return await cb(tx);
        })
    };
    return { mockDb: db, mockTx: tx };
});

vi.mock('@uni-track/db', () => ({ db: mockDb }));

vi.mock('@uni-track/db/schema', () => ({
    courseEnrollmentCodes: { id: 'code_id', uses: 'uses' },
    courseStudents: { id: 'cs_id' },
    notifications: { id: 'notif_id' }
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    and: vi.fn((...args) => ({ and: args })),
    or: vi.fn((...args) => ({ or: args })),
    ilike: vi.fn((col, val) => ({ ilike: val })),
    gte: vi.fn((col, val) => ({ gte: val })),
    lte: vi.fn((col, val) => ({ lte: val })),
    inArray: vi.fn((col, val) => ({ inArray: val })),
    gt: vi.fn((col, val) => ({ gt: val })),
    sql: vi.fn((strings, ...values) => strings.join(''))
}));

vi.mock('../lib/notifications', () => ({
    createNotification: vi.fn().mockResolvedValue({})
}));

vi.mock('@uni-track/auth', () => ({
    auth: { api: { getSession: vi.fn() } }
}));

const createCaller = createCallerFactory(coursesRouter);

describe('Courses Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const caller = createCaller({
        session: { user: { id: 'test-user-id' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    describe('Feature: Course Enrollment & Stats', () => {

        it('TC-C1: Query courses.findFirst with invalid UUID (testing NOT_FOUND via null return)', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce(null);
            await expect(caller.getById({ id: '123e4567-e89b-12d3-a456-426614174000' }))
                .rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' }));
        });

        it('TC-C1b: Valid getById call', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce({
                id: '123', name: 'Intro', code: 'CS101', description: 'Desc', creditHours: 3,
                semester: '1', department: 'CS', createdAt: new Date()
            });
            const res = await caller.getById({ id: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.code).toBe('CS101');
        });

        it('TC-C2: Execute findMany with ilike search filters', async () => {
            mockDb.query.courses.findMany.mockResolvedValueOnce([{ code: 'CS101' }]);
            const res = await caller.getAllCourses({ search: 'CS101', limit: 10 });
            expect(res).toEqual([{ code: 'CS101' }]);
            expect(mockDb.query.courses.findMany).toHaveBeenCalled();
        });

        it('TC-C2b: Execute findMany without search filters', async () => {
            mockDb.query.courses.findMany.mockResolvedValueOnce([]);
            const res = await caller.getAllCourses({ page: 1, limit: 10 });
            expect(res).toEqual([]);
        });

        it('TC-C2c: Execute getCourses (all courses)', async () => {
            mockDb.query.courses.findMany.mockResolvedValueOnce([{ code: 'CS101' }]);
            const res = await caller.getCourses();
            expect(res).toEqual([{ code: 'CS101' }]);
        });

        it('TC-C3: Evaluate codeRecord.isActive === false condition (NOT_FOUND from getEnrollInfoByCode)', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce(null);
            await expect(caller.getEnrollInfoByCode({ code: 'INV-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or inactive enrollment code' }));
        });

        it('TC-C4: Check codeRecord.expiresAt < new Date() path', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, expiresAt: new Date('2020-01-01'), course: { name: 'CS' }
            });
            await expect(caller.getEnrollInfoByCode({ code: 'VALID-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Enrollment code has expired' }));
        });

        it('TC-C5: Evaluate uses >= maxUses atomic condition', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, uses: 5, maxUses: 5, course: { name: 'CS' }
            });
            await expect(caller.getEnrollInfoByCode({ code: 'VALID-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Enrollment code usage limit reached' }));
        });

        it('TC-C5b: Success path for getEnrollInfoByCode', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, uses: 1, maxUses: 5, course: { name: 'CS' }
            });
            const res = await caller.getEnrollInfoByCode({ code: 'VALID-01' });
            expect(res.valid).toBe(true);
        });

        it('TC-C6: Check existingEnrollment.status === "active" branch', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, courseId: 'c1', course: { name: 'CS' }
            });
            mockDb.query.courseStudents.findFirst.mockResolvedValueOnce({ status: 'active' });
            await expect(caller.enrollWithCode({ code: 'VALID-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'CONFLICT', message: 'You are already enrolled in this course' }));
        });

        it('TC-C7: Execute re-activation path via db.update', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, courseId: 'c1', course: { name: 'CS' }
            });
            mockDb.query.courseStudents.findFirst.mockResolvedValueOnce({ id: 'enr1', status: 'dropped' });
            mockDb.update.mockReturnValueOnce({ set: vi.fn().mockReturnValueOnce({ where: vi.fn() }) } as any);

            const res = await caller.enrollWithCode({ code: 'VALID-01' });
            expect(res).toEqual({ success: true, message: 'Enrollment reactivated' });
        });

        it('TC-C8: Execute full db.transaction for new enrollment', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, courseId: 'c1', id: 'ce1', course: { name: 'CS', code: 'CS101' }
            });
            mockDb.query.courseStudents.findFirst.mockResolvedValueOnce(null);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn() } as any);
            mockTx.update.mockReturnValueOnce({ set: vi.fn().mockReturnValueOnce({ where: vi.fn() }) } as any);

            const res = await caller.enrollWithCode({ code: 'VALID-01' });
            expect(res).toEqual({ success: true, courseId: 'c1' });
        });

        it('TC-C8b: Validation errors in enrollWithCode (NOT_FOUND)', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce(null);
            await expect(caller.enrollWithCode({ code: 'INV-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or inactive enrollment code' }));
        });

        it('TC-C8c: Validation errors in enrollWithCode (Expired)', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, expiresAt: new Date('2020-01-01'), course: { name: 'CS' }
            });
            await expect(caller.enrollWithCode({ code: 'INV-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Enrollment code has expired' }));
        });

        it('TC-C8d: Validation errors in enrollWithCode (Usage limit)', async () => {
            mockDb.query.courseEnrollmentCodes.findFirst.mockResolvedValueOnce({
                isActive: true, uses: 5, maxUses: 5, course: { name: 'CS' }
            });
            await expect(caller.enrollWithCode({ code: 'INV-01' }))
                .rejects.toThrowError(new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Enrollment code usage limit reached' }));
        });

        it('TC-C9: Calculate pendingAssignments date filter logic', async () => {
            mockDb.query.assignments.findMany.mockResolvedValueOnce([
                { id: 'a1', dueDate: new Date(Date.now() + 100000) },
                { id: 'a2', dueDate: new Date(Date.now() - 100000) }
            ]);
            mockDb.query.assignmentSubmissions.findMany.mockResolvedValueOnce([{ assignmentId: 'a2' }]);
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([{}, {}]); // 2 sessions

            const res = await caller.getStats({ courseId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.totalAssignments).toBe(2);
            expect(res.pendingAssignments).toBe(1);
            expect(res.upcomingClasses).toBe(2);
            expect(res.lastUpdated).toBeDefined();
        });

        it('TC-C10: Calculate getMyCourses', async () => {
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([{
                id: 'ce_1', status: 'active', enrolledAt: new Date(),
                course: {
                    id: 'c1', code: 'CS101', name: 'Intro', semester: '1', department: 'CS',
                    assignments: [{ title: 'HW1', dueDate: new Date() }]
                }
            }]);
            const res = await caller.getMyCourses();
            expect(res).toHaveLength(1);
            expect(res[0].nextAssignment?.title).toBe('HW1');
        });

        it('TC-C10b: Calculate getMyCourses without nextAssignment', async () => {
            mockDb.query.courseStudents.findMany.mockResolvedValueOnce([{
                id: 'ce_1', status: 'active', enrolledAt: new Date(),
                course: {
                    id: 'c1', code: 'CS101', name: 'Intro', semester: '1', department: 'CS',
                    assignments: []
                }
            }]);
            const res = await caller.getMyCourses();
            expect(res).toHaveLength(1);
            expect(res[0].nextAssignment).toBeNull();
        });
    });
});
