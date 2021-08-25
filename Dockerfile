FROM node:lts-alpine
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN nest build chaosarchives

CMD ["node", "dist/apps/chaosarchives/main.js"]
