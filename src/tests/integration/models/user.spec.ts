import { expect } from 'chai';
import { Db } from 'mongodb';
import models from '../../../models';
import { default as UserClass, Todo, UserInfo } from '../../../models/user';

describe('Integration Testing User class', () => {
	let User: typeof UserClass;
	let db: Db;

	before(async () => {
		const DBModels = await models();
		User = DBModels.User;
		db = DBModels.db;
	});

	const info: UserInfo = {
		email: 'someemail@gmail.com',
		username: 'JohnnyBoy',
		password: 'password123'
	};

	before(async () => {
		try {
			await db.dropCollection('Users');
		} catch (err) {
			// tslint:disable-next-line:no-empty
		}
	});

	after(async () => {
		try {
			db.collection('Users').drop();
		} catch (err) {
			// tslint:disable-next-line:no-empty
		}
	});

	describe('testing user creation and retrieval', () => {
		it('should create a user, insert it into the database and retrieve the user', async () => {
			await User.create(db, info);
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.email).to.equal('someemail@gmail.com');
				expect(user.username).to.equal('JohnnyBoy');
				expect(user.authenticate('password123')).to.equal(true);
			}
		});

		it('should throw an error if an email is used with another account', async () => {
			const newInfo: UserInfo = {
				email: info.email,
				password: 'newpassword',
				username: 'newname'
			};
			try {
				await User.create(db, newInfo);
				throw Error('Duplicate user created');
			} catch (err) {
				expect(err.message).to.equal(
					'E11000 duplicate key error collection: local.Users index: _id_ dup key: { : "someemail@gmail.com" }'
				);
			}
		});
	});

	describe('testing user update and retrieval', () => {
		it('should update user information in the database and be able to retrieve the update document', async () => {
			const todo: Todo = {
				title: 'Create TODO',
				notes: ['Note 1', 'Note 2'],
				created: Date.now()
			};
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists.Master.length).to.equal(0);
				await user.addTodo('Master', todo);
				const updatedUser = await User.get(db, info.email);
				expect(updatedUser).to.not.equal(undefined);
				if (updatedUser) {
					expect(updatedUser.lists.Master.length).to.equal(1);
				}
			}
		});
	});
});
