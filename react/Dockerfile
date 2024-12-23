FROM node:alpine

WORKDIR /usr/src/app

RUN sudo apk -U upgrade

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
