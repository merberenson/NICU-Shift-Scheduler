const request = require('supertest');
const mongoose = require('mongoose');
const app = "http://localhost:5000"

describe('NICU Schedule API (Integration)', () => {


    // --- Tests for GET /api/schedule/:yearmonth ---
    describe('GET /api/schedule/:yearmonth', () => {

        it('should return 404 and an empty array for a valid endpoint with no data', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-01`);
            const body = await res.json();
            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
        });

        it('should return 62 documents for the month of 2025-08', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-08`);
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.length).toBe(62);
        });

    });

    // --- Tests for GET /api/nurse/:yearmonth/:empId ---
    describe('GET /api/nurse/:yearmonth/:empId', () => {
        const testEmpId = '687072f4fc13ae2258f82ed4';
        const expectedData = [
            {"date":"2025-08-01","shiftType":"night"},
            {"date":"2025-08-05","shiftType":"night"},
            {"date":"2025-08-10","shiftType":"day"},
            {"date":"2025-08-13","shiftType":"night"},
            {"date":"2025-08-17","shiftType":"night"},
            {"date":"2025-08-22","shiftType":"day"},
            {"date":"2025-08-26","shiftType":"night"},
            {"date":"2025-08-30","shiftType":"night"}];


        it('should return 200 and the correct shifts for a given nurse and month', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-08/${testEmpId}`);
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.length).toBe(expectedData.length);
            expect(body.data).toEqual(expectedData);
        });

        it('should return 200 and an empty array for a valid nurse with no shifts in the given month', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-01/${testEmpId}`);
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.length).toBe(0);
        });

        it('should return a 404 error for an valid empId that does not exist in the system.', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-08/111111111111111111111111`);
            const body = await res.json();
            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
            expect(body.message).toContain('Invalid Nurse id provided');
        });

        it('should return a 400 error for an invalid empId', async () => {
            const res = await fetch(`${ app }/api/schedule/2025-08/this-is-not-an-id`);
            const body = await res.json();
            expect(res.status).toBe(400);
            expect(body.success).toBe(false);
            expect(body.message).toContain('Invalid Employee ID format.');
        });
    });
});
