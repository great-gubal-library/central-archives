# The jpegtran-bin dependency tries to build from source (and fails) under node:lts-alpine,
# so we use node:lts instead.
FROM node:lts
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN nest build chaosarchives

# Switch to unprivileged user
RUN deluser --remove-home node \
  && addgroup --system --gid 1000 node \
  && adduser --system --ingroup node --uid 1000 node
USER node
CMD ["node", "dist/apps/chaosarchives/main.js"]
