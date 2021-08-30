FROM node:12

WORKDIR /usr/src/app

RUN mkdir ./backend

WORKDIR /usr/src/app/backend

COPY package*.json .
RUN npm install
# RUN npm ci --only=production 
COPY . .


EXPOSE 8080

ENV HOST 0.0.0.0
ENV PORT 8080
ENV NODE_ENV production

RUN npm run build

#start the service
CMD [ "npm", "run", "start" ]