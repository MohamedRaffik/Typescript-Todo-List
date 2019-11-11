import User from '../models/user';

export { default as Auth } from './auth';
export { default as List } from './list';

export interface Payload {
	email: string;
	expires_at: number;
}

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}
