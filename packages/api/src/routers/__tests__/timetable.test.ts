import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timetableRouter } from '../timetable';
import { createCallerFactory } from '../../trpc';

const { mockDb } = vi.hoisted(() => {
    const db: any = {
        query: {
            semesters: { findMany: vi.fn() },
            classSessions: { findMany: vi.fn() },
            academicEvents: { findMany: vi.fn() },
            timetableTemplates: { findMany: vi.fn() }
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{}])
    };
    return { mockDb: db };
});

vi.mock('@uni-track/db', () => ({ db: mockDb }));

vi.mock('@uni-track/db/schema', () => ({
    classSessions: { id: 'session_id' }
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ col, val })),
    and: vi.fn((...args) => ({ and: args })),
    or: vi.fn((...args) => ({ or: args })),
    gte: vi.fn((col, val) => ({ gte: { col, val } })),
    lte: vi.fn((col, val) => ({ lte: { col, val } })),
    isNull: vi.fn((col) => ({ isNull: col })),
    inArray: vi.fn((col, arr) => ({ inArray: { col, arr } })),
    sql: vi.fn((strings, ...values) => strings.join('')),
    relations: vi.fn()
}));

vi.mock('@uni-track/auth', () => ({
    auth: { api: { getSession: vi.fn() } }
}));

const createCaller = createCallerFactory(timetableRouter);

describe('Timetable Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const caller = createCaller({
        session: { user: { id: 'user-id', role: 'student' } } as any,
        headers: new Headers(),
        db: mockDb as any
    });

    describe('Feature: Lazy Schedule Generation', () => {

        it('TC-T1: Query semesters with out-of-range dates -> Empty List []', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([]); // No active semesters
            const res = await caller.getWeekSchedule({
                startDate: new Date('2020-01-01T00:00:00Z'),
                endDate: new Date('2020-01-07T00:00:00Z')
            });
            expect(res).toEqual([]);
        });

        it('TC-T2: Execute isHoliday check within date loop -> Skip Generation', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([{ id: 'sem1' }]);
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([]);
            // Mock a holiday that covers the entire requested range
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([{
                startDate: new Date('2026-12-24T00:00:00Z'),
                endDate: new Date('2026-12-26T00:00:00Z'),
                type: 'holiday'
            }]);
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: '5', courseId: 'c1', startTime: '10:00', endTime: '11:00'
            }]); // Friday is 5. 2026-12-25 is Friday.

            const startDate = new Date('2026-12-25T00:00:00Z');
            const res = await caller.getWeekSchedule({
                startDate: startDate,
                endDate: startDate // Single day to simplify
            });

            // Since it's a holiday, no sessions should be generated or inserted.
            // insert shouldn't be called.
            expect(mockDb.insert).not.toHaveBeenCalled();
            // Should return filtered existingSessions (which is empty)
            expect(res).toEqual([]);
        });

        it('TC-T3: Execute db.insert for missing template slots -> Bulk Insert', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([{ id: 'sem1' }]);
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([]); // No existing sessions
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([]); // No holidays

            const testDate = new Date('2026-12-25T12:00:00Z'); // Friday (5)
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: testDate.getDay().toString(), courseId: 'c1', startTime: '10:00', endTime: '11:00', location: 'Room 1'
            }]);

            mockDb.insert.mockReturnValueOnce({ values: vi.fn().mockResolvedValueOnce([{}]) } as any);
            // After insert, it refetches:
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([{ id: 'new-session', date: testDate }]);

            const res = await caller.getWeekSchedule({
                startDate: testDate,
                endDate: testDate
            });

            expect(mockDb.insert).toHaveBeenCalled();
            expect(res.length).toBe(1);
            expect(res[0].id).toBe('new-session');
        });

        it('TC-T4: Evaluate exists check for duplicate prevention -> Return Existing', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([{ id: 'sem1' }]);
            const testDate = new Date('2026-12-25T12:00:00Z');

            // Existing session matches the template
            const existingSession = {
                id: 'existing-1',
                date: testDate,
                generatedFromTemplateId: 'tmpl1',
                templateDate: testDate
            };
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([existingSession]);
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([]);

            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: testDate.getDay().toString(), courseId: 'c1'
            }]);

            const res = await caller.getWeekSchedule({
                startDate: testDate,
                endDate: testDate
            });

            // insert should NOT be called because it already exists
            expect(mockDb.insert).not.toHaveBeenCalled();
            expect(res.length).toBe(1);
            expect(res[0].id).toBe('existing-1');
        });

        it('TC-T5: Apply post-query filter for date range -> Exclude from List', async () => {
            mockDb.query.semesters.findMany.mockResolvedValueOnce([{ id: 'sem1' }]);
            const testDate = new Date('2026-12-25T12:00:00Z');
            const outOfRangeDate = new Date('2026-12-28T12:00:00Z');

            // Existing session whose template date was in range, but actual date was moved OUT of range
            const existingSession = {
                id: 'moved-session',
                date: outOfRangeDate,
                generatedFromTemplateId: 'tmpl1',
                templateDate: testDate
            };
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([existingSession]);
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([]);
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: testDate.getDay().toString(), courseId: 'c1'
            }]);

            const res = await caller.getWeekSchedule({
                startDate: testDate,
                endDate: testDate
            });

            expect(mockDb.insert).not.toHaveBeenCalled();
            // The returned list should exclude the moved-session because its actual date is out of range
            expect(res).toEqual([]);
        });

        it('TC-T6: Execute getCourseSchedule union logic -> Template + History', async () => {
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: '1', startTime: '10:00', endTime: '11:00', location: 'Room A'
            }]);

            const historyDate = new Date('2026-12-20T10:00:00Z');
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([{
                id: 'sess1', date: historyDate, startTime: '10:00', endTime: '11:00', location: 'Room A', status: 'conducted'
            }]);

            const res = await caller.getCourseSchedule({ courseId: '123e4567-e89b-12d3-a456-426614174000' });

            // Expected 1 template + 1 session = 2 items
            expect(res.length).toBe(2);
            expect(res[0].status).toBe('Scheduled'); // Template
            expect(res[0].date).toBeUndefined();     // Template has no specific date
            expect(res[1].status).toBe('Conducted'); // History session
            expect(res[1].date).toBe(historyDate.toISOString());
        });

        it('TC-T7: Evaluate activeSemesters[0] fallback branch -> First Active Sem', async () => {
            // Test that when creating a new session, it relies on activeSemesters[0].id
            const activeSemId = 'super-active-sem';
            mockDb.query.semesters.findMany.mockResolvedValueOnce([{ id: activeSemId }]);
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([]);
            mockDb.query.academicEvents.findMany.mockResolvedValueOnce([]);

            const testDate = new Date('2026-12-25T12:00:00Z');
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([{
                id: 'tmpl1', dayOfWeek: testDate.getDay().toString(), courseId: 'c1'
            }]);

            let capturedValues: any;
            mockDb.insert.mockReturnValueOnce({
                values: vi.fn().mockImplementationOnce((vals) => {
                    capturedValues = vals;
                    return Promise.resolve([{}]);
                })
            } as any);
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([]); // Refetch empty

            await caller.getWeekSchedule({
                startDate: testDate,
                endDate: testDate
            });

            expect(mockDb.insert).toHaveBeenCalled();
            expect(capturedValues).toBeDefined();
            expect(capturedValues[0].semesterId).toBe(activeSemId);
        });

        // Add extra coverage for `getCourseSchedule` cancelled/scheduled mapping to ensure 100% path
        it('TC-T8: Evaluate getCourseSchedule map paths', async () => {
            mockDb.query.timetableTemplates.findMany.mockResolvedValueOnce([]);

            const historyDate = new Date('2026-12-20T10:00:00Z');
            mockDb.query.classSessions.findMany.mockResolvedValueOnce([
                { id: 'sess1', date: historyDate, status: 'cancelled' },
                { id: 'sess2', date: historyDate, status: 'scheduled' },
                { id: 'sess3', date: historyDate, status: 'unknown' }
            ]);

            const res = await caller.getCourseSchedule({ courseId: '123e4567-e89b-12d3-a456-426614174000' });

            expect(res.length).toBe(3);
            expect(res[0].status).toBe('Cancelled');
            expect(res[1].status).toBe('Scheduled');
            expect(res[2].status).toBe('Cancelled'); // unknown falls back to Cancelled based on logic
        });
    });
});
