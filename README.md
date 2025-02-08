# Full Stack

Express API server & React TypeScript
 
Features: 
- JWT access & refresh tokens 
- HTTP only cookies
- Cypress testing

## Prepare

in `server/` folder rename `.env.sample` to `.env` file  and set values for env. variables

if you want to use self signed SSL certificate for HTTPS run

```sh
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```
and move them as sudo to `/etc/ca-certificates/`, in production you must use certificates that you bought.

create table in database

```SQL
CREATE TABLE sw_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sw_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    user VARCHAR(255) NOT NULL,
    is_invalidated BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Deployment in Local Environment

In `react/` folders install dependancies with `yarn` and start the React app with `yarn dev`.
Install dependencies in `server/` folder with `yarn` and use `yarn dev` to start the API server. 

### Running Cypress tests

start only react app, response from API is mocked. In react folder

for headless browser
```sh
yarn e2e
``` 

for Cypress GUI
```sh
yarn e2e:gui
``` 

select E2E testing, choose browser and click on `login-fixtures.cy.ts`

In rare casess you need to test using live API - select `login-live-api.cy.ts`

### usefull cURL calls against API

```sh
# put first user in database
curl -k -X POST https://localhost:4000/api/v1/register \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }'

# obtain JTW token
curl -k -X POST https://localhost:4000/api/v1/login \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }'
# row in sw_users
# id  token     user        is_invalidated  timestamp
# 2   eyJh...   testuser    0               2025-02-08 01:30:39

# use token to access protected route
curl -k -X GET https://localhost:4000/api/v1/dashboard -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."

# logout to invalidate token
curl -k -X POST https://localhost:4000/api/v1/logout -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."
# row in sw_users
# id  token     user        is_invalidated  timestamp
# 2   eyJh...   testuser    1               2025-02-08 01:30:39

# visit dashboard route with invalidated token and you'll get forbiden
curl -k -X GET https://localhost:4000/api/v1/dashboard -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."

# clean up tokens older than 1 hour but not invalidated tokens
curl -k -X DELETE https://localhost:4000/api/v1/deleteTokens -H "Content-Type: application/json"
```