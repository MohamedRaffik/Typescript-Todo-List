import * as mongodb from 'mongodb';
import * as Database from '../../models/database';
import * as User from '../../models/user';

describe('Unit Testing User Class', () => {
	let db: mongodb.Db;
	let client: mongodb.MongoClient;
	const info: User.Info = {
		email: 'someemail@gmail.com',
		username: 'JohnnyBoy',
		password: 'password123'
	};

	beforeAll(async () => {
		const connection = await Database.connect();
		db = connection.db;
		client = connection.client;
		try {
			await db.dropCollection('Users');
		} catch (err) {
			// tslint:disable-next-line:no-empty-line
		}
	});

	afterAll(async () => {
		try {
			await db.dropCollection('Users');
		} catch (err) {
			// tslint:disable-next-line:no-empty-line
		}
		await client.close();
	});

	it('should create a user, insert it into the database and retrieve the user', async () => {
		await User.UserClass.create(db, info);
		const user = await User.UserClass.get(db, info.email);
		expect(user).toBeInstanceOf(User.UserClass);
		if (user) {
			expect(user.email).toEqual('someemail@gmail.com');
			expect(user.username).toEqual('JohnnyBoy');
			expect(user.authenticate('password123')).toEqual(true);
		}
	});

	it('should throw an error if an email is used with another account', async () => {
		const newInfo: User.Info = {
			email: info.email,
			password: 'newpassword',
			username: 'newname'
		};
		await expect(User.UserClass.create(db, newInfo)).rejects.toThrowError(RegExp('duplicate'));
	});

	it('should update user information in the database and be able to retrieve the update document', async () => {
		const todo: User.Todo = {
			title: 'Create TODO',
			notes: ['Note 1', 'Note 2'],
			created: Date.now()
		};
		const user = await User.UserClass.get(db, info.email);
		expect(user).toBeInstanceOf(User.UserClass);
		if (user) {
			expect(user.lists.Main.length).toEqual(0);
			await user.addTodo('Main', todo);
			const updatedUser = await User.UserClass.get(db, info.email);
			expect(updatedUser).toBeInstanceOf(User.UserClass);
			if (updatedUser) {
				expect(updatedUser.lists.Main.length).toEqual(1);
			}
		}
	});
});
