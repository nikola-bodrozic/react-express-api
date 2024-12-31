FROM node:alpine

RUN apk add --no-cache yarn

WORKDIR /usr/src/app

COPY package.json .

COPY yarn.lock .

RUN yarn install --production

COPY . .

EXPOSE 4000

CMD ["npm","start"]