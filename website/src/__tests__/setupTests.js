import { Server } from 'miragejs';

const mirageServer = new Server({
    routes() {
        this.post('/api/auth/signup', () => ({
            user: {
                email: 'testuser@example.com',
                token: 'test-token',
            },
        }));

        this.post('/api/auth/login', () => ({
            user: {
                email: 'testuser@example.com',
                token: 'test-token',
            },
        }));

        this.get('/api/logout', () => ({
            success: true,
        }));
    },
});

beforeAll(() => {
    mirageServer.start();
});

afterEach(() => {
    mirageServer.reset();
});

afterAll(() => {
    mirageServer.stop();
});