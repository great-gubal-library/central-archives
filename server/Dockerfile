# The jpegtran-bin dependency tries to build from source (and fails) under node:lts-alpine,
# so we use node:lts-slim instead.
FROM node:16-slim
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

# Switch to unprivileged user
RUN groupmod -g 1000 node && usermod -u 1000 -g 1000 node
RUN chown -R node.node /usr/src/app
USER node

# Build application

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN nest build chaosarchives

CMD ["node", "dist/apps/chaosarchives/main.js"]
