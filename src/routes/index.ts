import { Router } from 'express';
import { Context } from '../context';
import Auth from './auth';
import List from './list';

export default (context: Context) => {
	const APIRouter = Router();

	APIRouter.use('/auth', Auth(context));
	APIRouter.use('/list', List(context));

	return APIRouter;
};
