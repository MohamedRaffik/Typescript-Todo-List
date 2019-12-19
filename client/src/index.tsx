import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRouterDOM from 'react-router-dom';
import * as AppComponent from './App';

const { BrowserRouter } = ReactRouterDOM;
const { App } = AppComponent;

ReactDOM.render(
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	document.getElementById('root')
);
