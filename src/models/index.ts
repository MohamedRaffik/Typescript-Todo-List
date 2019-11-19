import * as Database from './database';
import * as User from './user';

export default async () => ({
	...(await Database.connect()),
	User: User.UserClass
});
