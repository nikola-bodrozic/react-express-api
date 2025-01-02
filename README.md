# Full Stack

Express server & React TypeScript on Docker, on local dev environment and in Kubernetes cluster. 
Features: 
- JWT access & refresh tokens 
- HTTP only cookies

## Prepare

in `server/` folder rename `.env.sample` to `.env` file  and set values for ACCESS_TOKEN_SECRET & REFRESH_TOKEN_SECRET

### Deployment in Local Environment

In `react/` folders install dependancies with `npm install` and start the React app with `npm run dev`.
Install dependencies in `server/` folder with `yarn` and use `npm run dev` to start the API server. 

### Deployment of production using Docker Compose

in root folder:

```sh
docker compose -f docker-compose-prod.yaml up
```

### Deployment of production on Kubernetes

in project root folder

build images
```sh
docker build -t <YOUR-DOCKER-HUB-USERNAME>/server:latest server/
docker push <YOUR-DOCKER-HUB-USERNAME>/server:latest

docker build -t <YOUR-DOCKER-HUB-USERNAME>/react:latest react/
docker push <YOUR-DOCKER-HUB-USERNAME>/react:latest
```

start deployments and services
```sh
kubectl apply -f k8s/server
kubectl apply -f k8s/react
```

make sure services and deployments are up and running

```sh
kubectl get svc
kubectl get deployments
```

delete depl. and services

```sh
kubectl delete deployment server react
kubectl delete services server-load-balancer react-load-balancer
```

or second way using Pod deployment

```sh
kubectl apply -f k8s/cluster/
```

this lists resouces that need to be deleted during clean up

```sh
kubectl get svc
kubectl get pods
kubectl get deployments
```

### Reading Express log

exec into server container and you can monitor log in real time

```sh
tail -f access-node.log
```

### Running Cypress tests

bring up docker stack using docker compose up and in `react/` folder open Cypress testing browser
```sh
cd react/
npx cypress open
```
and click on spec login.cy.ts in production folder. After running tests bring down docker stack using docker compose down

start your local dev environment run again
```sh
npx cypress open
```
and click on spec login.cy.ts in local-dev folder

There are videos in folder `react/cypress/videos` and screenshots in `react/cypress/screenshots` 

### cURL calls against API

POSTing username and password

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
--data-raw '{"username":"q","password":"q"}'
```

GET protected route
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