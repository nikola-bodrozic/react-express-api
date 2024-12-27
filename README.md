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
Install dependencies in `server/` folder with `npm install` and use `npm start` to start the server. 

### Deployment on Docker

in root folder:

```sh
docker compose up
```

### Deployment on Kubernetes

```sh
# in server folder
docker build -t <YOUR-DOCKER-HUB-USERNAME>/server:latest .
docker push <YOUR-DOCKER-HUB-USERNAME>/server:latest

# in react folder
docker build -t <YOUR-DOCKER-HUB-USERNAME>/react:latest .
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

second way to start k8s using 

```sh
kubectl apply -f k8s/bringupk8s.yaml
```

### Running Cypress tests

standard browser
```sh
npx cypress open
```

headless browser
```sh
npx cypress run
```
