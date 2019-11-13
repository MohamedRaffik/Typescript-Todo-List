import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as controllerInterfaces from '..';
import * as Context from '../../context';
import * as utils from '../utils';

interface LoginBody {
	email: string;
	password: string;
}

interface LoginResponse {
	token: string;
	expires_at: number;
}

export const controller = (context: Context.Context) => {
	const Login = async (req: express.Request, res: express.Response) => {
		const body = req.body;
		const error = utils.validateFields(body, {
			email: { type: 'string' },
			password: { type: 'string' }
		});
		if (error) {
			return res.status(400).json({ error });
		}
		const { User, db } = context;
		const { email, password } = req.body as LoginBody;
		const user = await User.get(db, email);
		if (!user) {
			return res.status(400).json({ error: 'Account does not exist with this email' });
		}
		if (!user.authenticate(password)) {
			return res.status(401).json({ error: 'Incorrect email or password' });
		}
		const payload: controllerInterfaces.Payload = {
			email: user.email,
			expires_at: Date.now() + Number(process.env.JWT_EXPIRATION)
		};
		const token = jwt.sign(payload, String(process.env.SECRET_KEY));
		const response: LoginResponse = { token, expires_at: payload.expires_at };
		return res.status(200).json(response);
	};
	return [Login];
};
