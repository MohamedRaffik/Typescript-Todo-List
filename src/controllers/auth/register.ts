import express from 'express';
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
}

export const controller = (context: Context) => {
    const Register = async (req: express.Request, res: express.Response) => {
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
                email: user.email
            };
            const token = jwt.sign(payload, String(process.env.SECRET_KEY)).split('.');
            const response: RegisterResponse = {
                token: [token[1], token[2]].join('.')
            };
            return res
                .cookie('token', token[0], {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24 * 30
                })
                .status(200)
                .json(response);
        } catch (err) {
            // console.error(err);
            return res.status(400).json({ error: err.message });
        }
    };
    return [Register];
};
