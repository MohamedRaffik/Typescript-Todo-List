import { Router } from 'express';
import { Context } from '../context';
import { Auth } from '../controllers';

export default (context: Context) => {
	const AuthRouter = Router();

	AuthRouter.get('/login', Auth.Login(context));
	AuthRouter.post('/register', Auth.Register(context));

	return AuthRouter;
};
