FROM node:14-alpine3.14

WORKDIR /usr/src/app

COPY package*.json .
RUN npm ci
# RUN npm ci --only=production 
COPY . ./


EXPOSE 1337

ENV HOST 0.0.0.0
ENV PORT 1337
ENV NODE_ENV production
# esta URL debe cambiarse segun el host donde se ubique el server
ENV PUBLIC_URL http://localhost:1337

RUN npm run build

#start the service
CMD [ "npm", "run", "start" ]