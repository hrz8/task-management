process.env.NODE_ENV = 'development';

const { ServiceBroker } = require('moleculer');
const moleculerConfig = require('../../moleculer.config');

describe('Test services', () => {

    describe('Test actions', () => {
        const broker = new ServiceBroker(moleculerConfig);
        const service = broker.loadServices('./services', '**/*service.js');

        beforeAll(() => broker.start());
        afterAll(() => broker.stop());

        let USER_ID;
        let token;
        const record = {
            username: 'test999',
            fullName: 'Aku seorang test',
            password: 'test12345'
        };

        it('should create new user', async () => {
            await broker.call('users.remove', { params: { username: record.username } } );
            const res = await broker.call('users.create', { body: record } );
            expect(res.status).toEqual('200');
            USER_ID = res.data.id;
        });

        it('should get the created user', async () => {
            const res = await broker.call('users.get', { params: { id: USER_ID } });
            expect(res.status).toEqual('200');
        });

        it('should successfully login', async () => {
            const res = await broker.call('sessions.create', { 
                body: { 
                    username: record.username,
                    password: record.password
                } 
            });
            expect(res.status).toEqual('200');
            token = res.data.token;
        });

        const task = {
            location: 'Test Tempat',
            day: '23/09/2020',
            startAt: '23/09/2020 10:00',
            lists: [
                {
                    description: 'Lipat baju test'
                },
                {
                    description: 'Tuang Galon test'
                },
                {
                    description: 'Ganti kresek sampah test'
                }
            ]
        };

        it('should get the updated item', async () => {
            const res = await broker.call('tasks.create', { body: task }, { meta: { user: { id: USER_ID} } } );
            expect(res.status).toEqual('200');
            await broker.call('users.remove', { params: { username: record.username } } );
        });
    });

});

