FROM node:alpine

WORKDIR /usr/src/app

RUN apk -U upgrade

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
