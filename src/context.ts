import * as mongodb from 'mongodb';
import * as Models from './models';
import * as User from './models/user';

export interface Context {
	User: typeof User.UserClass;
	db: mongodb.Db;
}

export const createContext = async () => {
	return {
		...(await Models.default())
	};
};
