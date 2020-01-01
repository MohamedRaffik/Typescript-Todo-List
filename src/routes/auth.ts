import * as express from 'express';
import * as Context from '../context';
import * as controllers from '../controllers';

export const Router = (context: Context.Context) => {
    const AuthRouter = express.Router();
    const { Auth } = controllers;

    AuthRouter.post('/login', Auth.Login(context));
    AuthRouter.post('/register', Auth.Register(context));

    return AuthRouter;
};
