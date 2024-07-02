import request from 'supertest';
import http from 'http';
import app from './emailService';
import { sendEmail } from './sendEmail';

// mocking sendEmail
jest.mock('./sendEmail', () => {
    const originalModule = jest.requireActual('./sendEmail');
    return {
        ...originalModule,
        sendEmail: jest.fn()
    };
});

let server: http.Server;
const PORT = 4000;

beforeAll((done) => {
    server = http.createServer(app).listen(PORT, done);
});

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    (sendEmail as jest.Mock).mockReset();
    (sendEmail as jest.Mock).mockResolvedValue(true);
});

describe('Email Service API', () => {
    afterEach((done) => {
        server.close(() => {
            server = http.createServer(app).listen(PORT, done);
        });
    });

    test('should queue emails successfully with valid input', async () => {
        const response = await request(server)
            .post('/trigger-emails')
            .send({
                eventNameTrigger: 'socksPurchased',
                userEmail: 'test@example.com',
                emails: [
                    { subject: 'Payment received', emailBody: 'Thank you!', timeDelay: 0 },
                    { subject: 'Socks dispatched!', emailBody: 'Get ready!', timeDelay: 0 }
                ]
            });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Emails queued successfully');
        expect(sendEmail).toHaveBeenCalledTimes(2);
    });

    test('should return 400 with invalid input (missing fields)', async () => {
        const response = await request(server)
            .post('/trigger-emails')
            .send({
                eventNameTrigger: 'websiteSignup',
                userEmail: 'test@example.com'
                // Missing 'emails' field
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid request payload');
    });

    test('should return 400 with empty request body', async () => {
        const response = await request(server)
            .post('/trigger-emails')
            .send({});

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid request payload');
    });

    test('should return 200 with empty emails array', async () => {
        const response = await request(server)
            .post('/trigger-emails')
            .send({
                eventNameTrigger: 'websiteSignup',
                userEmail: 'test@example.com',
                emails: []
            });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Emails queued successfully');
    });

    test('should return 400 with missing eventNameTrigger', async () => {
        const response = await request(server)
            .post('/trigger-emails')
            .send({
                userEmail: 'test@example.com',
                emails: [
                    { subject: 'Welcome!', emailBody: 'Need some socks?', timeDelay: 7200 }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid request payload');
    });

    test('should queue a large number of emails successfully', async () => {
        const largeEmailsArray = Array.from({ length: 10 }, (_, index) => ({
            subject: `Email ${index + 1}`,
            emailBody: `This is email number ${index + 1}`,
            timeDelay: 1
        }));
    
        const response = await request(server)
            .post('/trigger-emails')
            .send({
                eventNameTrigger: 'massEmailTest',
                userEmail: 'test@example.com',
                emails: largeEmailsArray
            });
    
        expect(response.status).toBe(200);
        expect(response.text).toBe('Emails queued successfully');
        expect(sendEmail).toHaveBeenCalledTimes(10);
    }, 30000);
});
