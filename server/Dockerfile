FROM node:alpine

WORKDIR /usr/src/app

RUN sudo apk -U upgrade

RUN whoami

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
