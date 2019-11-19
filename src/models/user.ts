import * as bcrypt from 'bcrypt';
import * as mongodb from 'mongodb';

export interface Todo {
	id?: number;
	title: string;
	notes: string[];
	created: number;
	completed?: boolean;
}

export interface TodoList {
	Master: Todo[];
	[list: string]: Todo[];
}

export interface Info {
	email: string;
	username: string;
	password: string;
	lists?: TodoList;
}

export interface Update {
	username?: string;
	password?: string;
	lists?: TodoList;
}

export interface UpdateTodo {
	title?: string;
	notes?: string[];
	completed?: boolean;
}

export class UserClass {
	public static get = async (db: mongodb.Db, email: string) => {
		const doc = await db.collection('Users').findOne({ _id: email });
		if (!doc) {
			return undefined;
		}
		const { _id, ...info } = doc;
		return new UserClass(db, { email: _id, ...info });
	};
	public static create = async (db: mongodb.Db, info: Info) => {
		if (info.password.length <= 8) {
			throw Error('Password length is too short, must be greater than 8 characters');
		}
		info.password = bcrypt.hashSync(info.password, 10);
		const user = new UserClass(db, info);
		const { email, ...userInfo } = user;
		delete userInfo.db;
		await db.collection('Users').insertOne({ _id: email, ...userInfo });
		return user;
	};
	public email: string;
	public username: string;
	public password: string;
	public lists: TodoList;
	public db: mongodb.Db;

	constructor(db: mongodb.Db, info: Info) {
		this.email = info.email;
		this.username = info.username;
		this.password = info.password;
		this.lists = info.lists || { Master: [] };
		this.db = db;
	}

	public authenticate(password: string) {
		return bcrypt.compareSync(password, this.password);
	}

	public async addTodo(list: string, todo: Todo) {
		todo.completed = false;
		this.validListName(list);
		try {
			await this.createList(list);
		} catch (err) {
			// tslint:disable-next-line:no-empty-line
		}
		todo.id = this.lists[list].length;
		this.lists[list].push(todo);
		await this.update({ lists: this.lists });
	}

	public async deleteTodo(list: string, id: number) {
		this.validOperation(list, id);
		this.lists[list].splice(id, 1);
		await this.update({ lists: this.lists });
	}

	public async updateTodo(list: string, id: number, update: UpdateTodo) {
		this.validOperation(list, id);
		Object.keys(update).forEach(key => {
			if (update[key] !== undefined) {
				this.lists[list][id][key] = update[key];
			}
		});
		await this.update({ lists: this.lists });
	}

	public async moveTodo(list: string, id: number, newList: string, newId: number) {
		this.validOperation(list, id);
		this.validOperation(newList);
		if (!(0 <= newId)) {
			throw Error(`Cannot move item to the '${newList}' list at position ${newId}`);
		}
		// Reassign newId to the end of the list if it is greater than the list length or to remain itself (splice works with any large value
		// but to reassign id of the item newId must be resolved)
		newId = newId > this.lists[newList].length ? this.lists[newList].length : newId;
		const [item] = this.lists[list].splice(id, 1);
		item.id = newId;
		this.lists[newList].splice(newId, 0, item);
		const start = list === newList && newId < id ? newId : id;
		for (let i = start; i < this.lists[list].length; i++) {
			this.lists[list][i].id = i;
		}
		if (list !== newList) {
			for (let i = newId; i < this.lists[newList].length; i++) {
				this.lists[newList][i].id = i;
			}
		}
		await this.update({ lists: this.lists });
	}

	public async createList(list: string) {
		if (list in this.lists) {
			throw Error(`'${list}' list already exists`);
		}
		this.lists[list] = [];
	}

	public async deleteList(list: string) {
		this.validOperation(list);
		if (list === 'Master') {
			throw Error("Cannot delete 'Master' list");
		}
		delete this.lists[list];
		await this.update({ lists: this.lists });
	}

	public async clearList(list: string) {
		this.validOperation(list);
		this.lists[list].splice(0, this.lists[list].length);
		await this.update({ lists: this.lists });
	}

	public async renameList(list: string, newList: string) {
		this.validOperation(list);
		if (list === 'Master') {
			throw Error("Cannot rename 'Master' list");
		}
		if (newList in this.lists) {
			throw Error(
				`Cannot rename '${list}' list to '${newList}', '${newList}' list already exists`
			);
		}
		this.validListName(newList);
		const oldList = this.lists[list];
		delete this.lists[list];
		await this.createList(newList);
		this.lists[newList] = oldList;
		await this.update({ lists: this.lists });
	}

	private validOperation(list: string, id?: number) {
		if (!(list in this.lists)) {
			throw Error(`'${list}' list does not exist`);
		}
		if (id !== undefined) {
			if (!(0 <= id && id < this.lists[list].length)) {
				throw Error(`Item does not exist in '${list}' list`);
			}
		}
	}

	private validListName(list: string) {
		// Tests if string is empty or has only whitespace
		if (!/\S/.test(list)) {
			throw Error(`'${list}' is not a valid list name`);
		}
	}

	private async update(update: Update) {
		await this.db.collection('Users').updateOne({ _id: this.email }, { $set: update });
	}
}
