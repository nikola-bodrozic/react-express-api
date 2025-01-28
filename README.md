# Full Stack

Express API server & React TypeScript
 
Features: 
- JWT access & refresh tokens 
- HTTP only cookies
- Cypress testing

## Prepare

in `server/` folder rename `.env.sample` to `.env` file  and set values for ACCESS_TOKEN_SECRET & REFRESH_TOKEN_SECRET

### Deployment in Local Environment

In `react/` folders install dependancies with `yarn` and start the React app with `yarn run dev`.
Install dependencies in `server/` folder with `yarn` and use `yarn run dev` to start the API server. 

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

POSTing username and password to get tokens

```sh
curl -i 'http://localhost:4000/api/v1/login' --no-progress-meter -X POST \
-H 'Accept: application/json, text/plain, */*' \
-H 'Accept-Encoding: gzip, deflate, br, zstd' \
-H 'Content-Type: application/json' \
-H 'Origin: http://localhost' \
-H 'Connection: keep-alive' \
-H 'Referer: http://localhost/' \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-site' \
-H 'Priority: u=0' \
-H 'Pragma: no-cache' \
-H 'Cache-Control: no-cache' \
--data-raw '{"username":"username1","password":"pass1"}'
```

GET protected route add accessToken and refereshToken from previous POST call
```sh
curl 'http://localhost:4000/api/v1/dashboard' --no-progress-meter \
-H 'Accept: application/json, text/plain, */*' \
-H 'Accept-Language: en-US,en;q=0.5' \
-H 'Accept-Encoding: gzip, deflate, br, zstd' \
-H 'Origin: http://localhost' \
-H 'Connection: keep-alive' \
-H 'Referer: http://localhost/' \
-H 'Cookie: accessToken=eyJhbGci...6vvoq8; refreshToken=eyJhbGcB...1S0' \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-site' \
-H 'Pragma: no-cache' \
-H 'Cache-Control: no-cache'
```