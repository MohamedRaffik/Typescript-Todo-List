import * as User from '../../../models/user';
import * as mock from '../../mock';

describe('Unit Testing User Class', () => {
	let user: User.UserClass;
	const context = mock.createMockContext();
	const todo: User.Todo = {
		title: 'Create TODO',
		notes: ['Note 1', 'Note 2'],
		created: Date.now()
	};

	beforeEach(async () => {
		await context.db.dropCollection('Users');
		user = await context.User.create(context.db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
	});

	describe('testing createList', () => {
		it('should throw an error if the list to be created already exists', async () => {
			await expect(user.createList('Main')).rejects.toThrowError(
				"'Main' list already exists"
			);
		});

		it('should throw and error if the list limit of 50 is reached', async () => {
			for (let i = 0; i < 49; i++) {
				await user.createList(`List${i}`);
			}
			await expect(user.createList('List that cannot be created')).rejects.toThrowError(
				'Maximum number of lists reached'
			);
		});

		it('should create a list if it does not exist', async () => {
			expect(user.lists).toEqual({ Main: [] });
			await user.createList('Cool');
			expect(user.lists).toEqual({ Main: [], Cool: [] });
		});
	});

	describe('testing addTodo', () => {
		it('should add a todo item to the list and create that list if it does not exist', async () => {
			expect(user.lists).toEqual({ Main: [] });
			await user.addTodo('School', todo);
			expect(user.lists).toEqual({
				Main: [],
				School: [{ ...todo, id: 0, completed: false }]
			});
		});
	});

	describe('testing updateTodo', () => {
		it('should not update if the values of the update object are undefined', async () => {
			await user.addTodo('School', todo);
			await user.updateTodo('School', 0, { completed: undefined, notes: undefined });
			expect(user.lists['School'][0]).toEqual({
				...todo,
				id: 0,
				completed: false
			});
		});

		it('should throw an error if the list does not exist', async () => {
			await expect(
				user.updateTodo('Food', 0, { completed: true, title: 'Updated Item' })
			).rejects.toThrowError("'Food' list does not exist");
		});

		it('should mark a todo item as completed in the list', async () => {
			await user.addTodo('School', todo);
			expect(user.lists['School'][0].completed).toEqual(false);
			await user.updateTodo('School', 0, { completed: true });
			expect(user.lists['School'][0]).toEqual({
				...todo,
				id: 0,
				completed: true
			});
		});
	});

	describe('testing deleteTodo', () => {
		it('should throw an error if the todo item does not exist', async () => {
			await expect(user.deleteTodo('Main', 100)).rejects.toThrowError(
				"Item does not exist in 'Main' list"
			);
		});

		it('should remove a todo item from the list', async () => {
			await user.addTodo('School', todo);
			expect(user.lists['School'].length).toEqual(1);
			await user.deleteTodo('School', 0);
			expect(user.lists['School']).toEqual([]);
		});
	});

	describe('testing deleteList', () => {
		it('should throw an error when trying to delete the Main list', async () => {
			expect(user.lists).toHaveProperty('Main');
			await expect(user.deleteList('Main')).rejects.toThrowError("Cannot delete 'Main' list");
		});

		it('should delete a list from the user lists if it is not the Main list', async () => {
			await user.createList('School');
			expect(user.lists).toHaveProperty('School');
			await user.deleteList('School');
			expect(user.lists).not.toHaveProperty('School');
		});
	});

	describe('testing clearList', () => {
		it('should throw an error if the list to be cleared does not exist', async () => {
			await expect(user.clearList('School')).rejects.toThrowError(
				"'School' list does not exist"
			);
		});

		it('should clear the list of all todo items', async () => {
			await user.addTodo('Main', todo);
			expect(user.lists['Main'].length).toEqual(1);
			await user.clearList('Main');
			expect(user.lists['Main'].length).toEqual(0);
		});
	});

	describe('testing renameList', () => {
		it('should throw an error if the list to be renamed does not exist', async () => {
			await expect(user.renameList('TestList', 'RenamedList')).rejects.toThrowError(
				"'TestList' list does not exist"
			);
		});

		it('should throw an error if the newList already exists', async () => {
			await user.addTodo('TestList', todo);
			expect(user.lists['TestList'].length).toEqual(1);
			await expect(user.renameList('TestList', 'Main')).rejects.toThrowError(
				"Cannot rename 'TestList' list to 'Main', 'Main' list already exists"
			);
		});

		it('should throw an error if the list to be renamed is the Main list', async () => {
			await expect(user.renameList('Main', 'NewMain')).rejects.toThrowError(
				"Cannot rename 'Main' list"
			);
		});

		it('should rename the list to the new given list', async () => {
			await user.addTodo('TestList', todo);
			const oldList = user.lists['TestList'];
			await user.renameList('TestList', 'RenamedList');
			expect(user.lists).toHaveProperty('RenamedList');
			expect(user.lists).not.toHaveProperty('TestList');
			expect(user.lists['RenamedList']).toEqual(oldList);
		});
	});

	describe('testing moveTodo', () => {
		it('should throw an error if the list to move an item from does not exist', async () => {
			await expect(user.moveTodo('TestList', 0, 'Main', 0)).rejects.toThrowError(
				"'TestList' list does not exist"
			);
		});

		it('should throw an error if the item to be moved does not exist in the list', async () => {
			await user.createList('TestList');
			await expect(user.moveTodo('TestList', 0, 'Main', 0)).rejects.toThrowError(
				"Item does not exist in 'TestList' list"
			);
		});

		it('should throw an error if the newId is a negative number', async () => {
			await user.createList('TestList');
			await expect(user.moveTodo('TestList', 0, 'Main', -1)).rejects.toThrowError(
				"Item does not exist in 'TestList' list"
			);
		});

		it('should move an item from one list to another', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('Main', { ...todo, title: todo.title + 'Main1' });
			await user.addTodo('Main', { ...todo, title: todo.title + 'Main2' });
			await user.moveTodo('TestList', 1, 'Main', 1);
			expect(user.lists['TestList']).toEqual([
				{
					...todo,
					completed: false,
					id: 0
				},
				{
					...todo,
					title: todo.title + '2',
					completed: false,
					id: 1
				}
			]);
			expect(user.lists['Main']).toEqual([
				{
					...todo,
					title: todo.title + 'Main1',
					completed: false,
					id: 0
				},
				{
					...todo,
					title: todo.title + '1',
					completed: false,
					id: 1
				},
				{
					...todo,
					title: todo.title + 'Main2',
					completed: false,
					id: 2
				}
			]);
		});

		it('should be able to move an item within the same list', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '3' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '4' });
			await expect(user.moveTodo('TestList', 3, 'TestList', 1)).resolves.toEqual({
				...todo,
				title: todo.title + '3',
				completed: false,
				id: 1
			});
		});
	});

	describe('testing getLists', () => {
		it("should return the first page of every list of the users' Todo Lists", () => {
			expect(user.getLists()).toEqual({
				Main: { items: [], pages: 1 }
			});
		});
	});

	describe('testing getList', () => {
		it('should throw an error if the list does not exist', () => {
			expect(() => user.getList('TestList', 0)).toThrowError(
				"'TestList' list does not exist"
			);
		});

		it('should throw an error if the page number is less than 1', async () => {
			await user.addTodo('TestList', todo);
			expect(() => user.getList('TestList', 0)).toThrowError(
				'Invalid Page Number, must be greater than 0'
			);
		});

		it('should throw an error if the page number exceeds the number of sections of the list', async () => {
			await user.addTodo('TestList', todo);
			expect(() => user.getList('TestList', 2)).toThrowError(
				"'TestList' list has no more Todo Items"
			);
		});

		it('should return the page of the list', async () => {
			for (let i = 0; i < 55; i++) {
				await user.addTodo('TestList', todo);
			}
			expect(user.getList('TestList', 1)['items']).toHaveLength(25);
			expect(user.getList('TestList', 1)['pages']).toEqual(3);
			expect(user.getList('TestList', 2)['items']).toHaveLength(25);
			expect(user.getList('TestList', 3)['items']).toHaveLength(5);
		});
	});
});
