FROM node:lts-alpine
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN nest build chaosarchives

# Switch to unprivileged user
RUN deluser --remove-home node \
  && addgroup -S node -g 1000 \
  && adduser -S -G node -u 1000 node
USER node
CMD ["node", "dist/apps/chaosarchives/main.js"]
