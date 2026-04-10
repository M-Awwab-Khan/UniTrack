import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from '../auth';
import { createCallerFactory } from '../../trpc';
import { TRPCError } from '@trpc/server';

// Mock DB objects
const { mockDb, mockTx } = vi.hoisted(() => {
    const tx = {
        query: {
            taInvites: { findFirst: vi.fn() },
            user: { findFirst: vi.fn() }
        },
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn()
    };

    const db: any = {
        query: {
            user: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn(),
        transaction: vi.fn(async (cb: any) => {
            return await cb(tx);
        })
    };
    return { mockDb: db, mockTx: tx };
});

vi.mock('@uni-track/db', () => ({
    db: mockDb
}));

// Mock schema
vi.mock('@uni-track/db/schema', () => ({
    studentProfile: { _: 'studentProfile' },
    taProfile: { _: 'taProfile' },
    teacherProfile: { _: 'teacherProfile' },
    adminProfile: { _: 'adminProfile' },
    user: { id: 'user_id', email: 'user_email' },
    taInvites: { id: 'ta_invite_id', inviteCode: 'ta_invite_code' },
    courseTas: { _: 'courseTas' },
    account: { _: 'account' }
}));

// Mock better-auth definitions
vi.mock('better-auth/crypto', () => ({
    hashPassword: vi.fn().mockResolvedValue('hashed_password')
}));

vi.mock('better-auth', () => ({
    generateId: vi.fn().mockReturnValue('generated-id')
}));

vi.mock('@uni-track/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}));

// Mock Drizzle ORM eq function
vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ col, val }))
}));

// Setup Caller
const createCaller = createCallerFactory(authRouter);

describe('Auth Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProfile', () => {
        const caller = createCaller({
            session: { user: { id: 'test-user-id' } } as any,
            headers: new Headers(),
            db: mockDb as any
        });

        it('TC-A1: Execute user.findFirst where ID does not exist', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);

            await expect(caller.createProfile({
                role: 'student', rollNumber: 'CS-01', department: 'CS', semester: '1', batch: '2022'
            })).rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'User not found' }));
        });

        it('TC-A2: Evaluate dbUser.role !== input.role condition', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'student' });

            await expect(caller.createProfile({
                role: 'teacher', department: 'CS'
            })).rejects.toThrowError(new TRPCError({ code: 'FORBIDDEN', message: 'Role mismatch' }));
        });

        it('TC-A3: Execute db.insert(studentProfile) branch', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'student' });
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockResolvedValueOnce({}) } as any);

            const result = await caller.createProfile({
                role: 'student', rollNumber: 'CS-01', department: 'CS', semester: '1', batch: '2022'
            });
            expect(result).toEqual({ success: true });
        });

        it('TC-A4: Execute db.insert(teacherProfile) branch', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'teacher' });
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockResolvedValueOnce({}) } as any);

            const result = await caller.createProfile({
                role: 'teacher', department: 'CS'
            });
            expect(result).toEqual({ success: true });
        });

        it('TC-A4b: Execute db.insert(taProfile) branch', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'ta' });
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockResolvedValueOnce({}) } as any);

            const result = await caller.createProfile({
                role: 'ta', department: 'CS'
            });
            expect(result).toEqual({ success: true });
        });

        it('TC-A4c: Execute db.insert(adminProfile) branch', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'admin' });
            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockResolvedValueOnce({}) } as any);

            const result = await caller.createProfile({
                role: 'admin'
            });
            expect(result).toEqual({ success: true });
        });

        it('TC-A5: Trigger catch(error) block in mutation', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'student' });
            mockDb.insert.mockImplementationOnce(() => { throw new Error('DB Error'); });

            await expect(caller.createProfile({
                role: 'student', rollNumber: 'CS-01', department: 'CS', semester: '1', batch: '2022'
            })).rejects.toThrowError(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create profile' }));
        });
    });

    describe('registerTaWithInvite', () => {
        const caller = createCaller({
            headers: new Headers(),
            db: mockDb as any
        } as any);

        const defaultInput = {
            inviteCode: 'VALID_CODE',
            password: 'password123',
            email: 'b@test.com',
            name: 'Test TA'
        };

        it('TC-A6: Query taInvites with non-existent code', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce(null);

            await expect(caller.registerTaWithInvite(defaultInput))
                .rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'Invalid invite code' }));
        });

        it('TC-A7: Check invite.status !== "active" path', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({ status: 'used' });

            await expect(caller.registerTaWithInvite(defaultInput))
                .rejects.toThrowError(new TRPCError({ code: 'BAD_REQUEST', message: 'This invite is no longer active (Status: used)' }));
        });

        it('TC-A8: Evaluate new Date() > invite.expiresAt branch', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({ status: 'active', expiresAt: '2020-01-01T00:00:00Z' });

            await expect(caller.registerTaWithInvite(defaultInput))
                .rejects.toThrowError(new TRPCError({ code: 'BAD_REQUEST', message: 'This invite has expired' }));
        });

        it('TC-A9: Compare invite.email vs input.email', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({
                status: 'active',
                expiresAt: '2099-01-01T00:00:00Z',
                email: 'a@test.com'
            });

            await expect(caller.registerTaWithInvite(defaultInput))
                .rejects.toThrowError(new TRPCError({ code: 'FORBIDDEN', message: 'This invite code is not for this email address' }));
        });

        it('TC-A10: Check existingUser query result', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({
                status: 'active',
                expiresAt: '2099-01-01T00:00:00Z',
                email: 'b@test.com'
            });
            mockTx.query.user.findFirst.mockResolvedValueOnce({ email: 'b@test.com' });

            await expect(caller.registerTaWithInvite(defaultInput))
                .rejects.toThrowError(new TRPCError({ code: 'CONFLICT', message: 'An account with this email already exists' }));
        });

        it('TC-A11: Execute full db.transaction success path', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({
                id: 'invite_id_123',
                status: 'active',
                expiresAt: '2099-01-01T00:00:00Z',
                email: 'b@test.com',
                department: 'CS',
                courses: [{ courseId: 'course_1' }]
            });
            mockTx.query.user.findFirst.mockResolvedValueOnce(null);

            const result = await caller.registerTaWithInvite(defaultInput);
            expect(result).toEqual({ success: true, userId: 'generated-id', message: 'TA account created successfully' });
        });

        it('TC-A11b: Execute full db.transaction success path without courses', async () => {
            mockTx.query.taInvites.findFirst.mockResolvedValueOnce({
                id: 'invite_id_123',
                status: 'active',
                expiresAt: '2099-01-01T00:00:00Z',
                email: 'b@test.com',
                department: 'CS',
                courses: []
            });
            mockTx.query.user.findFirst.mockResolvedValueOnce(null);

            const result = await caller.registerTaWithInvite(defaultInput);
            expect(result).toEqual({ success: true, userId: 'generated-id', message: 'TA account created successfully' });
        });
    });
});
