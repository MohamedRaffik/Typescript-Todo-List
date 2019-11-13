/api

-   /auth

    -   [x] login - post /auth/login
    -   [x] register - post /auth/register

-   /list

    -   POST

        -   [x] addTodo - /:list/add
        -   [ ] createList - /:list

    -   DELETE

        -   [x] clearList - /:list/update
        -   [x] deleteList - /:list/delete
        -   [x] deleteTodo - /:list/delete/:id

    -   PUT

        -   [ ] renameList - /:list/rename
        -   [ ] moveTodo - /:list/move/:id/
        -   [x] updateTodo - /:list/update/:id

    -   GET

        -   [x] getLists - /

-   Add Web Push notifications for app

-   [ ] Use web-push with bull on a worker queue to implement cron jobs to send web push notifications
