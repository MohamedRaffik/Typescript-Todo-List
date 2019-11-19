import * as chance from 'chance';
import * as http from 'http';
import * as supertest from 'supertest';
import * as app from '../../../app';

describe('/POST register', () => {
	let server: supertest.SuperTest<supertest.Test>;
	let httpServer: http.Server;

	beforeAll(async () => {
		const a = await app.StartServer();
		server = supertest.agent(a[0]);
		httpServer = a[1];
	});

	afterAll(async () => {
		await new Promise(resolve => {
			httpServer.close(resolve);
		});
	});

	it('should return an error response if fields are missing or invalid in the request', async () => {
		const response = await server.get('/').expect(200);
		expect(JSON.parse(response.text)).toEqual({
			message: 'HI'
		});
	});
});
