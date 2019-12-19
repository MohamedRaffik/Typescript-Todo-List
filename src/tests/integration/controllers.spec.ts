import * as http from 'http';
import * as supertest from 'supertest';
import * as app from '../../app';
import * as Context from '../../context';
import * as utils from './utils';

describe('Integration Testing Endpoints', () => {
	let server: supertest.SuperTest<supertest.Test>;
	let httpServer: http.Server;
	let context: Context.Context;
	const user = {
		email: 'inttestemail@gmail.com',
		username: 'Johnny',
		password: 'testpassword'
	};

	beforeAll(async () => {
		const a = await app.start();
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
			const response = await utils.createUser(server);
			expect(JSON.parse(response.text)).toEqual({
				token: expect.any(String)
			});
		});

		it('should POST Login at /login', async () => {
			await utils.createUser(server, user);
			const response = await utils.loginUser(server, {
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
			const loginResponse = await utils.loginUser(server, {
				email: user.email,
				password: user.password
			});
			token = [
				loginResponse.header['set-cookie'][0].split(';')[0],
				JSON.parse(loginResponse.text).token
			];
		});

		it('should GET getLists at /', async () => {
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: []
			});
		});

		it('should POST createList at /:list', async () => {
			await utils.createList(server, 'Events', token);
			await utils.createList(server, 'Appointments', token);
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: [],
				Events: [],
				Appointments: []
			});
		});

		it('should POST addTodo at /:list/add ', async () => {
			const response = await utils.addTodo(
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
				title: 'Doctors Appointment',
				id: 0,
				notes: ['Bring Appointment Papers', 'Pick up medicine'],
				created: time,
				completed: false
			});
		});

		it('should POST moveTodo at /:list/move/:id', async () => {
			const response = await utils.moveTodo(
				server,
				{ list: 'Events', id: 0 },
				{ newList: 'Appointments', newId: 0 },
				token
			);
			expect(JSON.parse(response.text)).toEqual({
				Events: [],
				Appointments: [
					{
						title: 'Doctors Appointment',
						id: 0,
						notes: ['Bring Appointment Papers', 'Pick up medicine'],
						created: time,
						completed: false
					}
				]
			});
		});

		it('should POST renameList at /:list/rename', async () => {
			await utils.renameList(server, 'Appointments', { newListName: 'Doctor' }, token);
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: [],
				Events: [],
				Doctor: [
					{
						title: 'Doctors Appointment',
						id: 0,
						notes: ['Bring Appointment Papers', 'Pick up medicine'],
						created: time,
						completed: false
					}
				]
			});
		});

		it('should PUT updateTodo at /:list/update/:id', async () => {
			const response = await utils.updateTodo(
				server,
				'Doctor',
				0,
				{ notes: ['Bring Appointment Papers'] },
				token
			);
			expect(JSON.parse(response.text)).toEqual({
				title: 'Doctors Appointment',
				id: 0,
				notes: ['Bring Appointment Papers'],
				created: time,
				completed: false
			});
		});

		it('should DELETE deleteList at /:list/delete', async () => {
			await utils.deleteList(server, 'Events', token);
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: [],
				Doctor: [
					{
						title: 'Doctors Appointment',
						id: 0,
						notes: ['Bring Appointment Papers'],
						created: time,
						completed: false
					}
				]
			});
		});

		it('should DELETE deleteTodo at /:list/delete/:id', async () => {
			await utils.addTodo(
				server,
				'Main',
				{
					title: 'Finish Writing Tests',
					notes: ['Maybe add head endpoints'],
					created: time
				},
				token
			);
			await utils.deleteTodo(server, 'Main', 0, token);
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: [],
				Doctor: [
					{
						title: 'Doctors Appointment',
						id: 0,
						notes: ['Bring Appointment Papers'],
						created: time,
						completed: false
					}
				]
			});
		});

		it('should DELETE clearList at /:list/update', async () => {
			await utils.clearList(server, 'Doctor', token);
			const response = await utils.getLists(server, token);
			expect(JSON.parse(response.text)).toEqual({
				Main: [],
				Doctor: []
			});
		});
	});
});
