import { compareSync } from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '..';
import { Context } from '../../context';
import { validateFields } from '../utils';

interface LoginBody {
	email: string;
	password: string;
}

interface LoginResponse {
	token: string;
	expires_at: number;
}

export default (context: Context) => {
	const Login = async (req: Request, res: Response) => {
		const body = req.body;
		const error = validateFields(body, {
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
		if (!compareSync(password, user.password)) {
			return res.status(400).json({ error: 'Incorrect Password' });
		}
		const payload: Payload = {
			email: user.email,
			expires_at: Date.now() + Number(process.env.JWT_EXPIRATION)
		};
		const token = jwt.sign(payload, String(process.env.SECRET_KEY));
		const jsonResponse: LoginResponse = { token, expires_at: payload.expires_at };
		return res.status(200).json(jsonResponse);
	};
	return [Login];
};
