import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '..';
import { Context } from '../../context';

export default (context: Context) => {
	return {
		isAuthenticated: async (req: Request, res: Response, next: NextFunction) => {
			const { User, db } = context;
			if (!req.headers.authorization) {
				return res.status(401).json({ error: 'Authorization Header not provided' });
			}
			const [AuthType, token] = req.headers.authorization.split(' ');
			if (AuthType !== 'Bearer') {
				return res.status(401).json({ error: 'Incorrect Token Type, must be Bearer' });
			}
			try {
				const payload = jwt.verify(token, String(process.env.SECRET_KEY)) as Payload;
				if (payload.expires_at < Date.now()) {
					return res.status(401).json({ error: 'JWT Token is expired' });
				}
				const user = await User.get(db, payload.email);
				if (!user) {
					return res.status(401).json({ error: 'Account not Found' });
				}
				req.user = user;
				next();
			} catch (err) {
				return res.status(401).json({ error: 'JWT Token is invalid' });
			}
		}
	};
};
