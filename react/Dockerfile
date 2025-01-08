FROM node:alpine3.20 AS builder

WORKDIR /app

COPY package.json .

COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn run build

FROM nginx:alpine3.20

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
 
EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]