import http from 'http';
import supertest from 'supertest';
import { start } from '../../app';
import { Context } from '../../context';
import {
    createUser,
    clearList,
    createList,
    loginUser,
    getList,
    getLists,
    addTodo,
    deleteTodo,
    deleteList,
    moveTodo,
    updateTodo,
    renameList
} from './utils';

describe('Integration Testing Endpoints', () => {
    let server: supertest.SuperTest<supertest.Test>;
    let httpServer: http.Server;
    let context: Context;
    const user = {
        email: 'inttestemail@gmail.com',
        username: 'Johnny',
        password: 'testpassword'
    };

    beforeAll(async () => {
        const a = await start();
        server = supertest.agent(a[0]);
        httpServer = a[0];
        context = a[1];
        try {
            await context.db.dropCollection('Users');
        } catch (err) {
            // tslint:disable-next-line:no-empty-line
        }
    });

    afterAll(async () => {
        try {
            await context.db.dropCollection('Users');
        } catch (err) {
            // tslint:disable-next-line:no-empty-line
        }
        await new Promise(resolve => {
            httpServer.close(resolve);
        });
    });

    describe('/auth', () => {
        it('should POST Register at /register', async () => {
            const response = await createUser(server);
            expect(JSON.parse(response.text)).toEqual({
                token: expect.any(String)
            });
        });

        it('should POST Login at /login', async () => {
            await createUser(server, user);
            const response = await loginUser(server, {
                email: user.email,
                password: user.password
            });
            expect(JSON.parse(response.text)).toEqual({
                token: expect.any(String)
            });
        });
    });

    describe('/list', () => {
        let token: string[];
        const time = Date.now();

        beforeAll(async () => {
            const loginResponse = await loginUser(server, {
                email: user.email,
                password: user.password
            });
            token = [
                loginResponse.header['set-cookie'][0].split(';')[0],
                JSON.parse(loginResponse.text).token
            ];
        });

        it('should GET getLists at /', async () => {
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: []
            });
        });

        it('should GET getList at /:list/:page', async () => {
            const response = await getList(server, 'Main', 1, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: []
            });
        });

        it('should POST createList at /:list', async () => {
            await createList(server, 'Events', token);
            await createList(server, 'Appointments', token);
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: [],
                Events: [],
                Appointments: []
            });
        });

        it('should POST addTodo at /:list/add ', async () => {
            const response = await addTodo(
                server,
                'Events',
                {
                    title: 'Doctors Appointment',
                    notes: ['Bring Appointment Papers', 'Pick up medicine'],
                    created: time
                },
                token
            );
            expect(JSON.parse(response.text)).toEqual({
                Events: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers', 'Pick up medicine'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should POST moveTodo at /:list/move/:id', async () => {
            const response = await moveTodo(
                server,
                { list: 'Events', id: 0 },
                { newList: 'Appointments' },
                token
            );
            expect(JSON.parse(response.text)).toEqual({
                Appointments: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers', 'Pick up medicine'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should POST renameList at /:list/rename', async () => {
            await renameList(server, 'Appointments', { newListName: 'Doctor' }, token);
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: [],
                Events: [],
                Doctor: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers', 'Pick up medicine'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should PUT updateTodo at /:list/update/:id', async () => {
            const response = await updateTodo(
                server,
                'Doctor',
                0,
                { notes: ['Bring Appointment Papers'] },
                token
            );
            expect(JSON.parse(response.text)).toEqual({
                Doctor: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should DELETE deleteList at /:list/delete', async () => {
            await deleteList(server, 'Events', token);
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: [],
                Doctor: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should DELETE deleteTodo at /:list/delete/:id', async () => {
            await addTodo(
                server,
                'Main',
                {
                    title: 'Finish Writing Tests',
                    notes: ['Maybe add head endpoints'],
                    created: time
                },
                token
            );
            await deleteTodo(server, 'Main', 0, token);
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: [],
                Doctor: [
                    {
                        title: 'Doctors Appointment',
                        notes: ['Bring Appointment Papers'],
                        created: time,
                        completed: false
                    }
                ]
            });
        });

        it('should DELETE clearList at /:list/update', async () => {
            await clearList(server, 'Doctor', token);
            const response = await getLists(server, token);
            expect(JSON.parse(response.text)).toEqual({
                Main: [],
                Doctor: []
            });
        });
    });
});
