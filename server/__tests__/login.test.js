const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../index');
const db = require('../db');

// Mock the database module
jest.mock('../db');

describe('POST /api/v1/login', () => {
    let server;

    beforeAll(() => {
        server = app.listen(4001); // Use a different port than your main app
    });

    afterAll(done => {
        server.close(done);
        jest.clearAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('should return 403 if user does not exist', async () => {
        db.execute.mockResolvedValue([[]]);

        const response = await request(app)
            .post('/api/v1/login')
            .send({ username: 'nonexistent', password: 'testpass' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('bad username or password');
    });

    it('should return 403 if password is incorrect', async () => {
        // Mock user with hashed password
        const hashedPassword = await bcrypt.hash('rightpass', 10);
        db.execute.mockResolvedValueOnce([[{
            id: 1,
            username: 'testuser',
            password: hashedPassword
        }]]);

        const response = await request(app)
            .post('/api/v1/login')
            .send({ username: 'testuser', password: 'wrongpass' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('bad username or password');
    });

    it('should login successfully with correct credentials', async () => {
        // Mock user with hashed password
        const password = 'correctpass';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Mock successful user query
        db.execute.mockResolvedValueOnce([[{
            id: 1,
            username: 'testuser',
            password: hashedPassword
        }]]);
        
        // Mock successful token insertion
        db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app)
            .post('/api/v1/login')
            .send({ username: 'testuser', password: password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('username', 'testuser');
    });

    it('should return 500 if database error occurs', async () => {
        // Mock database error
        db.execute.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/v1/login')
            .send({ username: 'testuser', password: 'testpass' });

        expect(response.status).toBe(500);
    });
});
