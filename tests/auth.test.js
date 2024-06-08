const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth API', () => {
    afterAll(async () => {
        // Clean up the test data
        await User.deleteMany({});
    });

    it('should register a new user', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password',
            role: 'user',
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

        expect(response.body.token).toBeDefined();
    });

    it('should login a user', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password',
            role: 'user',
        };

        await request(app).post('/api/auth/register').send(userData);

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: userData.username,
                password: userData.password,
            })
            .expect(200);

        expect(response.body.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
        await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword',
            })
            .expect(401);
    });

    it('should refresh an access token', async () => {
        const userData = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password',
            role: 'user',
        };

        const registerResponse = await request(app).post('/api/auth/register').send(userData);
        const refreshToken = registerResponse.body.refreshToken;

        const response = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken })
            .expect(200);

        expect(response.body.accessToken).toBeDefined();
    });
});