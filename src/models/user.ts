import { compareSync, hashSync } from 'bcrypt';
import { Db } from 'mongodb';

export interface Todo {
	id?: number;
	title: string;
	list?: string;
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

	public async addTodo(todo: Todo) {
		todo.list = this.resolvelist(todo.list);
		todo.completed = false;
		if (!(todo.list in this.lists)) {
			this.lists[todo.list] = [];
		}
		todo.id = this.lists[todo.list].length;
		this.lists[todo.list].push(todo);
		await this.update({ lists: this.lists });
	}

	public async clearList(list?: string) {
		list = this.resolvelist(list);
		this.validOperation(list);
		this.lists[list].splice(0, this.lists[list].length);
		await this.update({ lists: this.lists });
	}

	public async deleteList(list?: string) {
		list = this.resolvelist(list);
		this.validOperation(list);
		if (list === 'Master') {
			throw Error("Cannot delete 'Master' list");
		}
		delete this.lists[list];
		await this.update({ lists: this.lists });
	}

	public async deleteTodo(id: number, list?: string) {
		list = this.resolvelist(list);
		this.validOperation(list, id);
		this.lists[list].splice(id, 1);
		await this.update({ lists: this.lists });
	}

	public async inCompleteTodo(id: number, list?: string) {
		list = this.resolvelist(list);
		this.validOperation(list, id);
		this.lists[list][id].completed = false;
		await this.update({ lists: this.lists });
	}

	public async completeTodo(id: number, list?: string) {
		list = this.resolvelist(list);
		this.validOperation(list, id);
		this.lists[list][id].completed = true;
		await this.update({ lists: this.lists });
	}

	private resolvelist(list: string | undefined) {
		return list === undefined ? 'Master' : list;
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
