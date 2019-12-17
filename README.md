/api

-   /auth

    -   [x] login - post /auth/login
    -   [x] register - post /auth/register

-   /list

    -   GET

        -   [x] getLists - /

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

-   Add integration testing for endpoints
-   Add job model
-   Add job info in requests
-   Add job scheduling using mongodb listener
-   Add end to end tests
