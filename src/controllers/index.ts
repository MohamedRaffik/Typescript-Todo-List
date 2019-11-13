import * as User from '../models/user';

export { AuthControllers as Auth } from './auth';
export { ListControllers as List } from './list';

export interface Payload {
	email: string;
	expires_at: number;
}

declare global {
	namespace Express {
		interface Request {
			user?: User.UserClass;
		}
	}
}
