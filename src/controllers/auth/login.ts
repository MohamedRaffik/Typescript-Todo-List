import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validateFields } from '../utils';

export default context => {
	const { User, GoogleClient } = context;

	const validateRequest = (req: Request, res: Response, next: NextFunction) => {
		const error = validateFields(req.body, ['id_token', 'access_token', 'expires_at']);
		if (error) {
			return res.status(400).json({ error });
		}
		next();
	};
};
