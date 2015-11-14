# RZNU - Labos
Filip Voska, 0036467446

## Setup

1. Install node.js and Mongo
  * Change mongo server connection in config.js if needed
2. Fetch dependencies
```
$ [sudo] npm install
```
3. Start application
```
$ [sudo] node main.js
```
  * Change ports in config.js if there are conflicts

## Usage

When started, app runs on localhost on both HTTP and HTTPS by default (standard ports 80 and 443). Using https version is recommended. Certificate is self-signed, ignore browser warnings.

There is a HTML/jQuery/Bootstrap user interface available at / (https://localhost).

Using UI makes things easier, but requests can always be made directly to the API at /api (https://localhost/api). Postman is a good tool for this. Any data that gets sent using in PUT and POST requests should be formated as ```application/json``` (body -> raw -> JSON in Postman).

## Running tests

Warning: all data in database that is used for testing will be wiped. Suggestion: create another database and before testing set it in config.

In project's root folder run:
```
$ node node_modules/.bin/mocha
```
If you have mocha installed globally, you can simply run:
```
$ mocha
```

##List of endpoints and examples
* /api/auth
 * POST
    ```
    Request:
    {
        "email": "...",
        "password": "..."
    }
    Reponse:
    {
        "success": true,
        "response": "Enjoy your token!",
        "token": "..."
    }
    ```
* /api/users
 * GET gets a list of users
     ```
     Response:
     {
        "success": true,
        "response": [
            {
                "_id": "5645ccf4f60156e34849ce22",
                "email": "filip.voska@gmail.com",
                "roles": [
                    "admin"
                    ]
            },
            {
                "_id": "5646054212037de38a95c82e",
                "email": "filip.voska@outlook.com",
                "roles": []
            }
        ]
     }
     ```
 * PUT creates a new user
     ```
     Request:
     {
        "email" : "filip.voska@gmail.comm",
        "password" : "..."
     }
     Response:
     {
        "success": true,
        "response": "User added.",
        "newUserID": "56463126fa2866a5bbe598b2"
     }
     ```
     ```
     Request:
     {
        "email" : "filip.voska@gmail.comm",
        "password" : "..."
     }
     Response:
     {
        "success": false,
        "response": "User with same e-mail already exists."
     }
     ```
* /api/users/:id
 * POST changes user data (requires token)

     Before auth:
     ```
     Request: https://localhost:443/api/users/56463126fa2866a5bbe598b2
     {
        "password" : "new_pass",
     }
     Response:
     {
        "success": false,
        "response": "No token provided."
     }
     ```
     After auth:
     ```
     Request: https://localhost:443/api/users/56463126fa2866a5bbe598b2?token=...
     {
        "password" : "new_pass",
     }
     Response:
     {
        "success": true,
        "response": "Data is updated for 56463126fa2866a5bbe598b2"
     }
     ```
 * DELETE deletes user (requires token)
* /api/users/:id/posts
 * GET gets a list of user:id's posts
  -examples are similar as for users.
* /api/posts
 * GET gets a list of posts
  -examples are similar as for users.
 * PUT creates a new post (requires token)
  -examples are similar as for users.
* /api/posts/:id
 * POST changes post data (requires token)
  -examples are similar as for users.
 * DELETE deletes post (requires token)
  -examples are similar as for users.

Token can be acquired once the user is registered. Token is signed using symmetrical encryption and contains user ID and validity time period. When making requests to endpoints which require a token, token can be sent in 3 ways:
 * inside x-access-token header - used in included UI
 * regular parameter ?token=...
 * inside request body JSON "token": ...

Actions that require token also check user IDs. For example, user with ID 1 can edit user data for user with ID 1, but can not modify data of user with ID 2. Exception to this rule are users which have 'admin' role - they can manage everything. First user that is created gets 'admin' role.
