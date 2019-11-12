/api

-   [x] login - post /auth/login
-   [x] register - post /auth/register

-   [x] addTodo - post /:list/add
-   [ ] createList - post /:list

-   [x] clearList - delete /:list/update
-   [x] deleteList - delete /:list/delete
-   [x] deleteTodo - delete /:list/delete/:id

-   [ ] renameList - put /:list/rename
-   [ ] Move Todo - put /:list/move/:id/
-   [x] Update Todo - put /:list/update/:id

-   [x] Get Lists - get /list
        getLists

-   [x] Move Todo

Add Web Push notifications for app

-   Use web-push with bull on a worker queue to implement cron jobs to send web push notifications
