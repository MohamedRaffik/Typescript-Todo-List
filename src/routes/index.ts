import * as express from 'express';
import * as Context from '../context';
import * as Auth from './auth';
import * as List from './list';

export default (context: Context.Context) => {
	const APIRouter = express.Router();
	const AuthRouter = Auth.Router(context);
	const ListRouter = List.Router(context);

	APIRouter.use('/auth', AuthRouter);
	APIRouter.use('/list', ListRouter);

	return APIRouter;
};
