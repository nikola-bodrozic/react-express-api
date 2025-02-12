# Full Stack

Express API server, React TypeScript & MySQL
 
Features:
- HTTPS connection using self-signed certificates
- JWT access token
- Protected route on Express and React
- Cypress E2E tests


## Prepare

in `server/` folder rename `.env.sample` to `.env` file  and set values for env. variables

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
```

### Deployment in Local Environment

In `react/` folders install dependancies with `yarn` and start the React app with `yarn dev`.
Install dependencies in `server/` folder with `yarn` and use `yarn dev` to start the API server. 

### Running Cypress tests

start only react app, response from API is mocked. Determine on which port React app is running and if needed update `reactBaseURL` in `/react/cypress/e2e/login-fixtures.cy.ts` in line 5.

In react folder set your env. variable for password. For headless browser run
```sh
yarn e2e --env password=pass..##A
``` 

for Cypress GUI
```sh
yarn e2e:gui --env password=pass..##A
``` 

select E2E testing, choose browser and click on `login-fixtures.cy.ts`

in spec file `react/cypress/e2e/login-fixtures.cy.ts` there is

```sh
cy.get('input[name="password"]').type(Cypress.env('password'), {log: false})
```
it prevents logging password

### usefull cURL calls against API

```sh
# put user in database
curl -X POST http://localhost:4000/api/v1/register \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }'

# obtain JTW token
curl -X POST http://localhost:4000/api/v1/login \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }'
# row in sw_users
# id  token     user        is_invalidated  timestamp
# 2   eyJh...   testuser    0               2025-02-08 01:30:39

# use token to access protected route
curl -X GET http://localhost:4000/api/v1/dashboard -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."

# logout to invalidate token
curl -X POST http://localhost:4000/api/v1/logout -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."
# row in sw_users
# id  token     user        is_invalidated  timestamp
# 2   eyJh...   testuser    1               2025-02-08 01:30:39

# visit dashboard route with invalidated token and you'll get forbiden
curl -X GET http://localhost:4000/api/v1/dashboard -H "Content-Type: application/json" \
     -H "Authorization: bearer eyJ..."

# clean up tokens older than 1 hour but not invalidated tokens
curl -X DELETE http://localhost:4000/api/v1/deleteTokens -H "Content-Type: application/json"
```

### Deplyment using NGINX reverse proxy:

Put certificates in:
```sh
ssl_certificate /etc/ca-certificates/cert.pem;
ssl_certificate_key /etc/ca-certificates/key.pem;
```
and nginx.conf is

```
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name localhost;

        # Redirect HTTP to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
        # Add access and error logs for the HTTP server
        access_log /var/log/nginx/access_http.log;
        error_log /var/log/nginx/error_http.log;
    }

    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate /etc/ca-certificates/cert.pem;
        ssl_certificate_key /etc/ca-certificates/key.pem;

        # Add access and error logs for the HTTPS server
        access_log /var/log/nginx/access_https.log;
        error_log /var/log/nginx/error_https.log;

        location / {
            proxy_pass http://localhost:4173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        }

        location /api/v1/ {
            allow 127.0.0.1;
            deny all;
            proxy_pass http://localhost:4000/api/v1/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        }
    }
}
```
on Linux make sure that sudo is used for example `sudo systemctl reload nginx`. In react folder run `yarn preview` to start prod. build on `http://localhost:4173/`
Now you can open `https://localhost` nginx will serve react app on HTTPS.
