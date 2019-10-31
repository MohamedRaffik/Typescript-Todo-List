import { expect } from 'chai';
import MongoClient from 'mongodb';
import UserClass, { DatabaseConnection, UserInfo } from '../../models';

describe('test User class', () => {
	let db: MongoClient.Db;
	let User: any;

	before(async () => {
		db = await DatabaseConnection();
		try {
			await db.dropCollection('Users');
		} catch {
			// tslint:disable-next-line:no-empty
		} finally {
			User = UserClass(db);
		}
	});

	after(async () => {
		await db.dropCollection('Users');
	});

	it('should insert a user into the database with only email and credentials', async () => {
		const info: UserInfo = {
			email: 'someemail@gmail.com',
			credentials: { access_token: 'p', expires_at: Date.now() }
		};
		const user = new User(info);
		await user.insert();
		return Promise.resolve();
	});

	it('should insert a user into the database with all info', async () => {
		const info: UserInfo = {
			email: 'anotheremail@gmail.com',
			credentials: { access_token: 'p', expires_at: Date.now() },
			subscriptions: [{ sub: 'sub' }],
			collections: {
				Music: [],
				Gaming: [],
				Sports: [],
				Entertainment: [],
				Lifestyle: [],
				Knowledge: [],
				Society: []
			},
			ready: false
		};
		const user = new User(info);
		await user.insert();
		return Promise.resolve();
	});

	it('should retrieve the inserted user from the database', async () => {
		await User.get('someemail@gmail.com');
		return Promise.resolve();
	});

	it('should update a user and receive the updated document', async () => {
		const user = await User.get('someemail@gmail.com');
		const updatedUser = await user.update({ ready: true });
		expect(updatedUser.info.ready).to.equal(true);
		return Promise.resolve();
	});
});
