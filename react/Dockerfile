FROM node:alpine AS builder

WORKDIR /app

COPY package*.json .

# RUN ls -lA

RUN npm install

COPY . .

# RUN ls -lA

RUN npm run build

# RUN ls -lA

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
 
EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]