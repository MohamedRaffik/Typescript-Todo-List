import { compareSync } from 'bcrypt';
import { expect } from 'chai';
import { Db } from 'mongodb';
import connect from '../../models/database';
import User, { Todo, UserInfo } from '../../models/user';

describe('test User class', () => {
	let db: Db;

	const info: UserInfo = {
		email: 'someemail@gmail.com',
		username: 'JohnnyBoy',
		password: 'password123'
	};

	const todo: Todo = {
		title: 'Create TODO',
		notes: ['Note 1', 'Note 2'],
		created: Date.now()
	};

	before(async () => {
		try {
			db = await connect();
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

	describe('testing user creation', async () => {
		it('should create a user, insert it into the database and retrieve the user', async () => {
			await User.create(db, info);
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.email).to.equal('someemail@gmail.com');
				expect(user.username).to.equal('JohnnyBoy');
				expect(compareSync('password123', user.password)).to.equal(true);
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

	describe('testing addTodo', async () => {
		it('should add a todo item to the master todo list if there is no list defined', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists['Master'].length).to.equal(0);
				user = await user.addTodo(todo);
				expect(user.lists['Master'][0]).to.deep.equal({
					...todo,
					list: 'Master',
					completed: false
				});
			}
		});

		it('should add a todo item to the list and create that list if it does not exist', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists).to.not.have.property('School');
				user = await user.addTodo({ ...todo, list: 'School' });
				expect(user.lists['School'][0]).to.deep.equal({
					...todo,
					list: 'School',
					completed: false
				});
			}
		});
	});

	describe('testing completeTodo', async () => {
		it('should mark a todo item as completed in the list', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				user = await user.completeTodo(0, 'School');
				expect(user.lists['School'][0]).to.deep.equal({
					...todo,
					list: 'School',
					completed: true
				});
			}
		});

		it('should throw an error if the list does not exist', async () => {
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				try {
					await user.completeTodo(0, 'Food');
					throw Error('Item added to non existent list');
				} catch (err) {
					expect(err.message).to.equal("'Food' list does not exist");
				}
			}
		});
	});

	describe('testing inCompleteTodo', async () => {
		it('should mark a todo item as incomplete in the list', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				user = await user.inCompleteTodo(0, 'School');
				expect(user.lists['School'][0]).to.deep.equal({
					...todo,
					list: 'School',
					completed: false
				});
			}
		});

		it('should throw an error if the todo item does not exist', async () => {
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				try {
					await user.inCompleteTodo(100, 'School');
					throw Error('Non existent Todo item marked as incomplete');
				} catch (err) {
					expect(err.message).to.equal("Item does not exist in 'School' list");
				}
			}
		});
	});

	describe('testing deleteTodo', async () => {
		it('should remove a todo item from the list', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists['School'].length).to.equal(1);
				user = await user.deleteTodo(0, 'School');
				expect(user.lists['School']).to.deep.equal([]);
			}
		});

		it('should throw an error if the todo item does not exist', async () => {
			const user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				try {
					await user.deleteTodo(100);
				} catch (err) {
					expect(err.message).to.equal("Item does not exist in 'Master' list");
				}
			}
		});
	});

	describe('testing deleteList', async () => {
		it('should delete a list from the user lists if it is not the master list', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists).to.have.property('School');
				user = await user.deleteList('School');
				expect(user.lists).to.not.have.property('School');
			}
		});

		it('should throw an error when trying to delete the master list', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				try {
					expect(user.lists).to.have.property('Master');
					user = await user.deleteList('Master');
					throw Error('Master list was deleted');
				} catch (err) {
					expect(err.message).to.equal("Cannot delete 'Master' list");
				}
			}
		});
	});

	describe('testing clearList', async () => {
		it('should clear the list of all todo items', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				expect(user.lists['Master'].length).to.equal(1);
				user = await user.clearList();
				expect(user.lists['Master'].length).to.equal(0);
			}
		});

		it('should throw an error if the list to be cleared does not exist', async () => {
			let user = await User.get(db, info.email);
			expect(user).to.not.equal(undefined);
			if (user) {
				try {
					user = await user.clearList('School');
					throw Error('List that does not exist was cleared');
				} catch (err) {
					expect(err.message).to.equal("'School' list does not exist");
				}
			}
		});
	});
});
