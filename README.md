# Full Stack

Express server & React TypeScript on Docker and on local dev environment. Repo shows how to use: 
- JWT acces & refresh tokens 
- HTTP only cookies

## Prepare

in `server/` folder create `.env` file  and set values for keys

```
cp server/.env.sample server/.env
cat .env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
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
kubectl apply -f server/deployment.yaml
kubectl apply -f server/service.yaml
```

clean up

```sh
kubectl delete deployment server 
kubectl delete services load-balancer
```
