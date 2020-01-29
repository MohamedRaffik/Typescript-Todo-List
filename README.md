/api

-   /auth

    -   [x] login - post /auth/login
    -   [x] register - post /auth/register

-   /list

    -   GET

        -   [x] getLists - /
        -   [x] getList - /:list/:page

    -   POST

        -   [x] addTodo - /:list/add
        -   [x] createList - /:list
        -   [x] moveTodo - /:list/move/:id/
        -   [x] renameList - /:list/rename

    -   PUT

        -   [x] updateTodo - /:list/update/:id

    -   DELETE

        -   [x] clearList - /:list/update
        -   [x] deleteList - /:list/delete
        -   [x] deleteTodo - /:list/delete/:id
