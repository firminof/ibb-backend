FROM node:19-alpine as build-stage
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=2048
WORKDIR /usr/src/app
COPY ["package.json", "./"]
RUN npm install -g @nestjs/cli --f
RUN npm install --production --f
COPY . .
EXPOSE 3001
ENTRYPOINT ["npm", "start"]
