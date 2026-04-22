const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Backend API Tests', () => {

    // Cleanup database connection after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('GET / should return health check message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('msg', '✅ HealthBlock AppointAI API is running');
    });

    test('POST /api/chatbot should return 400 if message is missing', async () => {
        const res = await request(app)
            .post('/api/chatbot')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('msg', 'Message is required');
    });

    test('GET /api/doctors should return a list of doctors', async () => {
        const res = await request(app).get('/api/doctors');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('doctors');
        expect(Array.isArray(res.body.doctors)).toBe(true);
    });

    test('POST /api/auth/login with invalid credentials should fail', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'wrong@example.com', password: 'wrongpassword' });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('msg', 'Invalid email or password');
    });

});
