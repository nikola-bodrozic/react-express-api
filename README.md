# Full Stack

Express server & React TypeScript on Docker and on local dev env.
Repo shows how to use JWT and HTTP only cookies

## Prepare

### Set env. variables

Set env. variables in react/package.json in line 

`"start": "REACT_APP_NODE_IP=localhost:4000 react-scripts start",` 

in server/ folder create .env and set values for keys

```
cp server/.env.sample server/.env
cat .env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```



### Local environment

install dependancies in root folder, server/ and react/ folders then in root folder

```
npm start
```

### Docker

in root folder:

```sh
docker compose up
```
