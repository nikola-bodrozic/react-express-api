# Full Stack

Express API server & React TypeScript on local dev environment, Docker stack and in Kubernetes cluster.
 
Features: 
- JWT access & refresh tokens 
- HTTP only cookies
- Cypress testing

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

in project root folder build and push images

```sh
docker build -t <YOUR-DOCKER-HUB-USERNAME>/server:latest server/
docker push <YOUR-DOCKER-HUB-USERNAME>/server:latest

docker build -t <YOUR-DOCKER-HUB-USERNAME>/react:latest react/
docker push <YOUR-DOCKER-HUB-USERNAME>/react:latest
```

run deployment and services:

```sh
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

this lists resouces that need to be deleted during clean up

```sh
kubectl get svc
kubectl get pods
kubectl get deployments
```

### Reading Express log

exec into Express server container and you can monitor HTTP traffic in real time

```sh
tail -f access-node.log
```

### Running Cypress tests

start your local dev environment and run

```sh
yarn cypress open
``` 

for headless browser

```sh
yarn e2e:chrome
``` 

### usefull cURL calls against API

POSTing wrong username and password

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