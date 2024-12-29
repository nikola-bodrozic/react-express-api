# Full Stack

Express server & React TypeScript on Docker, on local dev environment and in Kubernetes cluster. 
Features: 
- JWT access & refresh tokens 
- HTTP only cookies

## Prepare

in `server/` folder create `.env` file  and set values for ACCESS_TOKEN_SECRET & REFRESH_TOKEN_SECRET

```sh
cp server/.env.sample server/.env
```

### Deployment in Local Environment

In `react/` folders install dependancies with `npm install` and start the server with `npm run dev` 
Install dependencies in `server/` folder with `npm install` and use `npm run dev` to start the server. 

### Deployment of production using Docker Compose

in root folder:

```sh
docker compose -f docker-compose-prod.yaml up
```

### Deployment of production on Kubernetes

in project root folder

```sh
docker build -t <YOUR-DOCKER-HUB-USERNAME>/server:latest server/
docker push <YOUR-DOCKER-HUB-USERNAME>/server:latest

docker build -t <YOUR-DOCKER-HUB-USERNAME>/react:latest react/
docker push <YOUR-DOCKER-HUB-USERNAME>/react:latest

kubectl apply -f k8s/server
kubectl apply -f k8s/react
```

clean up

```sh
kubectl get svc
kubectl get deployments

# delete depl. and services

kubectl delete deployment server react
kubectl delete services server-load-balancer react-load-balancer
```

second way is to start k8s using 

```sh
# in root folder
kubectl apply -f k8s/bringupk8s.yaml
```

### Running Cypress tests

in `react/` folder

Cypress testing browser
```sh
npx cypress open
```

headless browser
```sh
npx cypress run
```

There are videos in folder `react/cypress/videos` and screenshots in `react/cypress/screenshots` 
