import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '..';
import { Context } from '../../context';
import { validateFields } from '../utils';

interface RegisterBody {
	email: string;
	password: string;
	username: string;
}

interface RegisterResponse {
	token: string;
	expires_at: number;
}

export default (context: Context) => {
	const Register = async (req: Request, res: Response) => {
		const body = req.body;
		const error = validateFields(body, {
			email: { type: 'string' },
			password: { type: 'string' },
			username: { type: 'string' }
		});
		if (error) {
			return res.status(400).json({ error });
		}
		const { User, db } = context;
		const { email, password, username } = req.body as RegisterBody;
		try {
			const user = await User.create(db, { email, password, username });
			const payload: Payload = {
				email: user.email,
				expires_at: Date.now() + Number(process.env.JWT_EXPIRATION)
			};
			const token = jwt.sign(payload, String(process.env.SECRET_KEY));
			const response: RegisterResponse = { token, expires_at: payload.expires_at };
			return res.status(200).json(response);
		} catch (err) {
			// console.error(err);
			return res.status(400).json({ error: err.message });
		}
	};
	return [Register];
};
