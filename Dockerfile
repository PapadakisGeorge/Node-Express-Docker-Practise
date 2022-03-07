FROM node:15-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY ../../Desktop/docker-node-js ./
ENV PORT 3000
EXPOSE $PORT
CMD ["npm", "run", "dev"]