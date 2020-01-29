import express from 'express';
import { Context } from '../context';
import { Auth } from '../controllers';

export const Router = (context: Context) => {
    const AuthRouter = express.Router();

    AuthRouter.post('/login', Auth.Login(context));
    AuthRouter.post('/register', Auth.Register(context));

    return AuthRouter;
};
