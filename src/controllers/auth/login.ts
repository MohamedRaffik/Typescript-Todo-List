import express from 'express';
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
}

export const controller = (context: Context) => {
    const Login = async (req: express.Request, res: express.Response) => {
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
        if (!user.authenticate(password)) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }
        const payload: Payload = {
            email: user.email
        };
        const token = jwt.sign(payload, String(process.env.SECRET_KEY)).split('.');
        const response: LoginResponse = { token: [token[1], token[2]].join('.') };
        return res
            .cookie('token', token[0], {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 30
            })
            .status(200)
            .json(response);
    };
    return [Login];
};
