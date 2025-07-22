# Full Stack

Express API server, React TypeScript & MySQL
 
Features:
- HTTPS connection using self-signed certificates
- stateless app using JWT access token
- Protected routes on Express and React
- Cypress E2E tests
- Form validation combined with captcha in `CAPTCHAFormValidator.tsx`


## Prepare

In `server/` folder rename `.env.sample` to `.env` file and set values for env. variables.
In `react/` folder rename `.env.sample` to `.env` file and set values for env. variables.

Create tables in database

```SQL
CREATE TABLE IF NOT EXISTS sw_users (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sw_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    user VARCHAR(255) NOT NULL,
    is_invalidated BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `sw_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  CONSTRAINT `sw_posts_ibfk_1` FOREIGN KEY (`username`) REFERENCES `sw_users` (`username`)
);

CREATE TABLE sw_slider (
    id INT PRIMARY KEY AUTO_INCREMENT,
    america BOOLEAN NOT NULL DEFAULT FALSE,
    asia BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO sw_slider(id, america, asia) VALUES (1, FALSE, FALSE)

INSERT INTO `sw_users` (`id`, `username`, `password`, `created_at`) VALUES (1, 'testuser', '$2a$10$uLzqXAuSsQfa7MWZm2cjGuht5s4VZYWf3McG4P26geyvkIgds8xJu', '2025-03-26 00:12:00');
INSERT INTO `sw_users` (`id`, `username`, `password`, `created_at`) VALUES (2, 'testmike', '$2a$10$uLzqXAuSsQfa7MWZm2cjGuht5s4VZYWf3McG4P26geyvkIgds8xJu', '2025-03-26 00:16:11');
```

password for both users are `testpass`
populate sw_posts with dummy data

```sql
INSERT INTO sw_posts (id, title, content, created_at, username) 
VALUES (
  1, 
  'Lorem ipsum dolor sit amet', 
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt', 
  '2025-02-17 00:03:00', 
  'testuser'
);

INSERT INTO sw_posts (id, title, content, created_at, username) 
VALUES (
  2, 
  'Vestibulum ante ipsum primis', 
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.', 
  '2025-02-17 00:04:00', 
  'testuser'
);

INSERT INTO sw_posts (id, title, content, created_at, username) 
VALUES (
  3, 
  'Pellentesque in ipsum id orci', 
  'Pellentesque in ipsum id orci porta dapibus. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus', 
  '2025-02-17 00:05:00', 
  'testmike'
);
```

### Deployment in Local Environment

In `react/` folder install dependancies with `yarn` and start the React app with `yarn dev`.
in `server/` folder install dependancies with `yarn` and start the React app with `yarn dev`.

### Running backend tests

to mock db module in **/api/v1/login** route run in `server/` 

```sh
yarn test
```

### Running Cypress tests

start only react app, response from API is mocked. Determine on which port React app is running and if needed update `reactBaseURL` in `/react/cypress/e2e/login-fixtures.cy.ts` in line 5.

For headless browser run
```sh
export CYPRESS_PASSWORD=random-string
yarn e2e
``` 

for Cypress GUI
```sh
export CYPRESS_PASSWORD=random-string
yarn e2e:gui
``` 

select E2E testing, choose browser and click on `login-fixtures.cy.ts`

in spec file `react/cypress/e2e/login-fixtures.cy.ts` there is

```sh
cy.get('input[name="password"]').type(Cypress.env('password'), {log: false})
```
it prevents logging password and shows how to use env. variables in Cypress.

### usefull cURL calls against API

```sh
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

Backend is only accessible to frontend
```
location /api/v1/ {
    allow 127.0.0.1;
    deny all;
...
```
