import * as React from 'react';

interface ListProps {
	listName: string;
}

export const TodoList = (props: ListProps) => {
	return <div>{props.listName}</div>;
};
