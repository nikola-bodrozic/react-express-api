# Full Stack

Express server & React TypeScript on Docker, on local dev environment and in Kubernetes cluster. Repo shows how to use: 
- JWT access & refresh tokens 
- HTTP only cookies

## Prepare

in `server/` folder create `.env` file  and set values for ACCESS_TOKEN_SECRET & REFRESH_TOKEN_SECRET

```sh
cp server/.env.sample server/.env
```

### Deployment in Local Environment

install dependencies in `server/` and `react/` folders using `npm install` and use `npm start` in those folders to run apps

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
kubectl delete deployment server react
kubectl delete services server-load-balancer react-load-balancer
```
