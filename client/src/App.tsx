import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as ListComponent from './components/TodoList';
import * as styles from './stylesheets/App.scss';

const { BrowserRouter, Switch, Link, Route } = ReactRouterDOM;
const { TodoList } = ListComponent;

export const App = () => {
	const [Lists, setLists] = React.useState({
		Main: [],
		Test: []
	});
	const [listPages, changeListPages] = React.useState({ current: 1, total: 1 });
	const [itemPages, changeItemPages] = React.useState({ current: 1, total: 1 });

	const sidebarLists = Object.keys(Lists)
		.slice(listPages.current * 25 - 25, listPages.current * 25)
		.map(listName => (
			<Link key={listName} to={`/${listName === 'Main' ? '' : listName}`}>
				{listName}
			</Link>
		));

	const ListRoutes = Object.keys(Lists).map(listName => (
		<Route key={listName} exact={true} path={`/${listName === 'Main' ? '' : listName}`}>
			<TodoList listName={listName} />
		</Route>
	));

	return (
		<BrowserRouter>
			<div className={styles['nav']}>
				<div className={styles['nav-container']}>
					<p className={styles['nav-container-header']}>TodoLists</p>
					<div className={styles['nav-container-account']}>
						<p>Login</p>
						<p>Register</p>
					</div>
				</div>
			</div>
			<div className={styles['pagegrid']}>
				<div className={styles['pagegrid-sidebar']}>
					<div className={styles['pagegrid-sidebar-list']}>{sidebarLists}</div>
					<div className={styles['pagegrid-sidebar-buttongrid']}>
						<button>{'<<'}</button>
						<button>{'<'}</button>
						<button style={{ fontWeight: 'bold' }}>{listPages.current}</button>
						<button>{'>'}</button>
						<button>{'>>'}</button>
					</div>
				</div>
				{/*PlaceHolder*/}
				<div className={styles['pagegrid-mainview']}>
					<Switch>{ListRoutes}</Switch>
				</div>
			</div>
		</BrowserRouter>
	);
};
