FROM node:alpine3.20

RUN apk update && apk add --no-cache python3 py3-pip make g++ yarn

WORKDIR /usr/src/app

COPY package.json .

COPY yarn.lock .

RUN yarn install --production

COPY . .

EXPOSE 4000

CMD ["yarn","run","start:prod"]