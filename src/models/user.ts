import { compareSync, hashSync } from 'bcrypt';
import { Db } from 'mongodb';

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

export interface UserInfo {
	email: string;
	username: string;
	password: string;
	lists?: TodoList;
}

export interface UserUpdate {
	username?: string;
	password?: string;
	lists?: TodoList;
}

export interface UpdateTodo {
	title?: string;
	notes?: string[];
	completed?: boolean;
}

export default class User {
	public static get = async (db: Db, email: string) => {
		const doc = await db.collection('Users').findOne({ _id: email });
		if (!doc) {
			return undefined;
		}
		const { _id, ...info } = doc;
		return new User(db, { email: _id, ...info });
	};
	public static create = async (db: Db, info: UserInfo) => {
		if (info.password.length <= 8) {
			throw Error('Password length is too short, must be greater than 8 characters');
		}
		info.password = hashSync(info.password, 10);
		const user = new User(db, info);
		const { email, ...userInfo } = user;
		delete userInfo.db;
		await db.collection('Users').insertOne({ _id: email, ...userInfo });
		return user;
	};
	public email: string;
	public username: string;
	public password: string;
	public lists: TodoList;
	public db: Db;

	constructor(db: Db, info: UserInfo) {
		this.email = info.email;
		this.username = info.username;
		this.password = info.password;
		this.lists = info.lists || { Master: [] };
		this.db = db;
	}

	public authenticate(password: string) {
		return compareSync(password, this.password);
	}

	public async addTodo(list: string, todo: Todo) {
		todo.completed = false;
		if (!(list in this.lists)) {
			this.lists[list] = [];
		}
		todo.id = this.lists[list].length;
		this.lists[list].push(todo);
		await this.update({ lists: this.lists });
	}

	public async clearList(list: string) {
		this.validOperation(list);
		this.lists[list].splice(0, this.lists[list].length);
		await this.update({ lists: this.lists });
	}

	public async deleteList(list: string) {
		this.validOperation(list);
		if (list === 'Master') {
			throw Error("Cannot delete 'Master' list");
		}
		delete this.lists[list];
		await this.update({ lists: this.lists });
	}

	public async deleteTodo(list: string, id: number) {
		this.validOperation(list, id);
		this.lists[list].splice(id, 1);
		await this.update({ lists: this.lists });
	}

	public async updateTodo(list: string, id: number, update: UpdateTodo) {
		this.validOperation(list, id);
		const keys = Object.keys(update);
		if (keys.length === 0) {
			return;
		}
		Object.keys(update).forEach(key => {
			if (update[key] !== undefined) {
				this.lists[list][id][key] = update[key];
			}
		});
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

	private async update(update: UserUpdate) {
		await this.db.collection('Users').updateOne({ _id: this.email }, { $set: update });
	}
}
