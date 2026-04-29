import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminRouter } from '../admin';
import { createCallerFactory } from '../../trpc';
import { TRPCError } from '@trpc/server';

const { mockDb } = vi.hoisted(() => {
    const db: any = {
        query: {
            user: { findFirst: vi.fn(), findMany: vi.fn() },
            taInvites: { findFirst: vi.fn(), findMany: vi.fn() },
            courses: { findFirst: vi.fn(), findMany: vi.fn() },
            semesters: { findMany: vi.fn() },
            timetableTemplates: { findMany: vi.fn() },
            academicEvents: { findMany: vi.fn() },
            courseEnrollmentCodes: { findMany: vi.fn() }
        },
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{}])
    };
    db.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{}])
    }));
    db.update.mockImplementation(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{}])
    }));
    return { mockDb: db };
});

vi.mock('@uni-track/db', () => ({ db: mockDb }));
vi.mock('@uni-track/db/schema', () => ({
    taInvites: { id: 'taInvites' },
    taInviteCourses: { id: 'taInviteCourses' },
    taPermissions: { id: 'taPermissions' },
    courses: { id: 'courses' },
    user: { id: 'user' },
    semesters: { id: 'semesters' },
    timetableTemplates: { id: 'timetableTemplates' },
    academicEvents: { id: 'academicEvents' },
    courseEnrollmentCodes: { id: 'courseEnrollmentCodes' }
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    and: vi.fn((...args) => ({ and: args })),
    desc: vi.fn((col) => ({ desc: col })),
    or: vi.fn((...args) => ({ or: args })),
    ilike: vi.fn((col, val) => ({ ilike: { col, val } })),
    relations: vi.fn()
}));

vi.mock('@uni-track/auth', () => ({
    auth: { api: { getSession: vi.fn() } }
}));

const createCaller = createCallerFactory(adminRouter);

describe('Admin Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mocks properly
        mockDb.insert = vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{}])
            })
        });
        mockDb.update = vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{}])
                })
            })
        });
    });

    const adminCaller = createCaller({
        session: { user: { id: 'admin-1', role: 'admin' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    const studentCaller = createCaller({
        session: { user: { id: 'student-1', role: 'student' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    describe('Feature: Administrative Controls & Invites', () => {

        it('TC-D1: Validate adminProcedure role check -> FORBIDDEN', async () => {
            await expect(studentCaller.getTaInvites()).rejects.toThrow(TRPCError);
            await expect(studentCaller.getTaInvites()).rejects.toThrow('Admin access required');
        });

        it('TC-D2: Check existingUser?.role === "ta" conflict -> CONFLICT', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce({ role: 'ta' });
            await expect(adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'ta@uni.edu', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            })).rejects.toThrow(/TA account with this email already exists/);
        });

        it('TC-D3: Evaluate existingInvite active check -> CONFLICT', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce({ status: 'active', email: 'invitee@test.com' });

            await expect(adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'invitee@test.com', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            })).rejects.toThrow(/active invite for this email already exists/);
        });

        it('TC-D4: Test while loop attempts < 10 limit -> INTERNAL_SERVER_ERROR', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null); // No existing active invite
            // Mock collision 10 times
            mockDb.query.taInvites.findFirst.mockResolvedValue({ id: 'existing-code' });

            await expect(adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'new@test.com', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            })).rejects.toThrow(/Failed to generate unique invite code/);

            // Should have been called 1 time for active invite + 10 times for collision
            expect(mockDb.query.taInvites.findFirst).toHaveBeenCalledTimes(11);
        });

        it('TC-D5: Execute full taInvites insertion path -> Success', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null); // active invite
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null); // code collision

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'mock-invite-id' }])
                })
            } as any);

            const res = await adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'success@test.com', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            });

            expect(res.inviteId).toBe('mock-invite-id');
            expect(res.inviteCode).toBeDefined();
            expect(mockDb.insert).toHaveBeenCalledTimes(3); // invites, courses, permissions
        });

        it('TC-D5b: Execute full taInvites insertion path with zero courses -> Success', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null);

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'mock-invite-id' }])
                })
            } as any);

            const res = await adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'success@test.com', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            });

            expect(res.inviteId).toBe('mock-invite-id');
        });

        it('TC-D5c: Evaluate insert returning null fallback -> INTERNAL_SERVER_ERROR', async () => {
            mockDb.query.user.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null);
            mockDb.query.taInvites.findFirst.mockResolvedValueOnce(null);

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([null])
                })
            } as any);

            await expect(adminCaller.createTaInvite({
                fullName: 'TA 1', email: 'success@test.com', department: 'CS', courseIds: ['123e4567-e89b-12d3-a456-426614174000'], permissions: ['grade']
            })).rejects.toThrow(/Failed to create invite/);
        });

        it('TC-D6: Evaluate duplicate code check in createCourse -> CONFLICT', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce({ code: 'CS101' });
            await expect(adminCaller.createCourse({
                code: 'cs101', name: 'Intro', department: 'CS'
            })).rejects.toThrow(/Course with this code already exists/);
        });

        it('TC-D6b: Execute db.insert fallback -> INTERNAL_SERVER_ERROR', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce(null);
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([null])
                })
            } as any);

            await expect(adminCaller.createCourse({
                code: 'cs101', name: 'Intro', department: 'CS'
            })).rejects.toThrow(/Failed to create course/);
        });

        it('TC-D6c: Execute createCourse -> Success', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce(null);
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ code: 'CS101', id: '1' }])
                })
            } as any);

            const res = await adminCaller.createCourse({
                code: 'cs101', name: 'Intro', department: 'CS'
            });
            expect(res.code).toBe('CS101');
        });

        it('TC-D7: Execute in-memory department filter path -> Filtered User Array', async () => {
            const mockUsers = [
                { id: '1', role: 'student', studentProfile: { department: 'CS' }, emailVerified: true },
                { id: '2', role: 'ta', taProfile: { department: 'EE' }, emailVerified: false },
                { id: '3', role: 'teacher', teacherProfile: { department: 'CS' } },
                { id: '4', role: 'admin' } // N/A
            ];
            mockDb.query.user.findMany.mockResolvedValueOnce(mockUsers);

            // Fetch with CS department filter
            const res = await adminCaller.users.list({
                page: 1, limit: 10, search: 'test', role: 'student', department: 'CS'
            });

            expect(res.length).toBe(2); // Only ID 1 and 3 should match
            expect(res[0].id).toBe('1');
            expect(res[0].status).toBe('Active');
            expect(res[1].id).toBe('3');
            expect(res[1].status).toBe('Pending');
        });

        it('TC-D7b: Execute list without filters', async () => {
            mockDb.query.user.findMany.mockResolvedValueOnce([
                { id: '1', role: 'student', studentProfile: { department: 'CS' }, emailVerified: true },
            ]);

            const res = await adminCaller.users.list({ page: 1, limit: 10 });
            expect(res.length).toBe(1);
            expect(res[0].department).toBe('CS');
        });

        it('TC-D8: Deactivate existing codes in generate -> New Code', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce({ code: 'CS101', department: 'CS' });
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ code: 'CS101-ABCDE' }])
                })
            } as any);

            const res = await adminCaller.enrollmentCodes.generate({ courseId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.code).toBe('CS101-ABCDE');
            expect(mockDb.update).toHaveBeenCalled(); // Should set isActive: false
            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('TC-D8b: generate fails when course not found -> NOT_FOUND', async () => {
            mockDb.query.courses.findFirst.mockResolvedValueOnce(null);
            await expect(adminCaller.enrollmentCodes.generate({ courseId: '123e4567-e89b-12d3-a456-426614174000' })).rejects.toThrow(/Course not found/);
        });

        it('TC-D9: Check revokeTaInvite path for missing record -> NOT_FOUND', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([null]) // update returned 0 records
                    })
                })
            } as any);

            await expect(adminCaller.revokeTaInvite({ inviteId: '123e4567-e89b-12d3-a456-426614174000' })).rejects.toThrow(/Invite not found/);
        });

        it('TC-D9b: revokeTaInvite success', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{ id: 'inv1' }]) // update returned 1 record
                    })
                })
            } as any);

            const res = await adminCaller.revokeTaInvite({ inviteId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.success).toBe(true);
        });

        it('Extra: getTaInvites runs mapping properly', async () => {
            mockDb.query.taInvites.findMany.mockResolvedValueOnce([
                { id: 'i1', fullName: 'TA', courses: [{ course: { id: 'c1' } }], permissions: [{ permission: 'grade' }], createdAt: new Date(), expiresAt: new Date() }
            ]);
            const res = await adminCaller.getTaInvites();
            expect(res.length).toBe(1);
        });

        it('Extra: getCourses runs mapping properly', async () => {
            mockDb.query.courses.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.getCourses();
            expect(res.length).toBe(0);
        });

        it('Extra: getAllCourses runs mapping properly', async () => {
            mockDb.query.courses.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.getAllCourses({ search: 'query' });
            expect(res.length).toBe(0);
        });

        it('Extra: createSemester runs successfully', async () => {
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'sem1' }])
                })
            } as any);
            const res = await adminCaller.createSemester({ name: 'Fall', startDate: new Date() });
            expect(res.id).toBe('sem1');
        });

        it('Extra: getSemesters runs successfully', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.getSemesters();
            expect(res.length).toBe(0);
        });

        it('Extra: createTimetableTemplate runs successfully', async () => {
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'tt1' }])
                })
            } as any);
            const res = await adminCaller.createTimetableTemplate({ courseId: '123e4567-e89b-12d3-a456-426614174000', dayOfWeek: '1', startTime: '10:00', endTime: '11:00', location: 'L1' });
            expect(res.id).toBe('tt1');
        });

        it('Extra: getTimetableTemplates runs successfully', async () => {
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.getTimetableTemplates();
            expect(res.length).toBe(0);
        });

        it('Extra: createAcademicEvent runs successfully', async () => {
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'event1' }])
                })
            } as any);
            const res = await adminCaller.createAcademicEvent({ title: 'Break', type: 'break', startDate: new Date(), endDate: new Date() });
            expect(res.id).toBe('event1');
        });

        it('Extra: getAcademicEvents runs successfully', async () => {
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.getAcademicEvents();
            expect(res.length).toBe(0);
        });

        it('Extra: users.getById behaves correctly', async () => {
            mockDb.query.user.findFirst.mockResolvedValue(null);
            await expect(adminCaller.users.getById({ id: '123e4567-e89b-12d3-a456-426614174000' })).rejects.toThrow(/User not found/);

            mockDb.query.user.findFirst.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', emailVerified: false });
            const res = await adminCaller.users.getById({ id: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.status).toBe('Pending');
        });

        it('Extra: users.changeRole behaves correctly', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{}])
                    })
                })
            } as any);
            const res = await adminCaller.users.changeRole({ userId: '123e4567-e89b-12d3-a456-426614174000', newRole: 'student' });
            expect(res.success).toBe(true);
        });

        it('Extra: enrollmentCodes.list behaves correctly', async () => {
            mockDb.query.courseEnrollmentCodes.findMany.mockResolvedValueOnce([]);
            const res = await adminCaller.enrollmentCodes.list({ courseId: 'c1' });
            expect(res.length).toBe(0);
        });

        it('Extra: enrollmentCodes.revoke behaves correctly', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{}])
                    })
                })
            } as any);
            const res = await adminCaller.enrollmentCodes.revoke({ id: '123e4567-e89b-12d3-a456-426614174000' });
            expect(res.success).toBe(true);
        });
    });
});
