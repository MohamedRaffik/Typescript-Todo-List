/api

-   /auth

    -   [x] login - post /auth/login
    -   [x] register - post /auth/register

-   /list

    -   POST

        -   [x] addTodo - /:list/add
        -   [x] createList - /:list \* Change method
        -   [ ] moveTodo - /:list/move/:id/ \* Change method


    -   DELETE

        -   [x] clearList - /:list/update
        -   [x] deleteList - /:list/delete
        -   [x] deleteTodo - /:list/delete/:id

    -   PUT

        -   [x] renameList - /:list/rename
        -   [x] updateTodo - /:list/update/:id

    -   GET

        -   [x] getLists - /

-   Add Web Push notifications for app

-   [ ] Use web-push with bull on a worker queue to implement cron jobs to send web push notifications
