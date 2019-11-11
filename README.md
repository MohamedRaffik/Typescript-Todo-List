/api

-   [x] login - post /auth/login
-   [x] register - post /auth/register

-   [ ] addTodo - post /list/add

-   [ ] clearList - put /:list/update
-   [ ] deleteList - delete /:list/delete
-   [ ] deleteTodo - delete /:list/delete/:id

-   [ ] Update Todo - put /:list/update/:id
        inCompleteTodo
        completeTodo

-   [ ] Get Lists - get /list
        getLists

6 methods

        Integration works
            for user
        Therefore db Integration
        should work with controllers
        because it uses User

db (mock) => User => controllers
