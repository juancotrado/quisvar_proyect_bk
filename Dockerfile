FROM node:alpine AS builder
# WORKDIR /usr/app
COPY ./package*.json ./
RUN rm -rf ./node_modules
RUN npm cache clean --force
RUN npm install
#RUN npm install -g ts-node
COPY ./ .
#RUN npx prisma generate
# RUN npx prisma db push

ENV NODE_ENV=production
CMD ["npm","run","start"]