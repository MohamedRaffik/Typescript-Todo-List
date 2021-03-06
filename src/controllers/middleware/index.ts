import express from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '..';
import { Context } from '../../context';

export const middleware = (context: Context) => {
    return {
        isAuthenticated: async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const { User, db } = context;
            if (!req.headers.authorization) {
                return res.status(401).json({ error: 'Authorization Header not provided' });
            }
            const [AuthType, token] = req.headers.authorization.split(' ');
            if (AuthType !== 'Bearer') {
                return res.status(401).json({ error: 'Incorrect Token Type, must be Bearer' });
            }
            if (!('token' in req.cookies)) {
                return res.status(401).json({ error: 'Invalid Token' });
            }
            try {
                const payload = jwt.verify(
                    [req.cookies['token'], token].join('.'),
                    String(process.env.SECRET_KEY)
                ) as Payload;
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
