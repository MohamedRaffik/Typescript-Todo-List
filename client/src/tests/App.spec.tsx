import * as React from 'react';
import * as renderer from 'react-test-renderer';
import * as AppComponent from '../App';

const { App } = AppComponent;

describe('Testing App Component', () => {
	it('should render', () => {
		const component = renderer.create(<App />);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
