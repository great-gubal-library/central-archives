# Chaos Archives (chaosarchives)

The RP portal to Chaos EU

## Install the dependencies
```bash
yarn install
```

### Install server dependencies (MariaDB and Redis) in Docker
```bash
docker compose up -d mariadb redis
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
yarn start:dev
```

### Build the app for production as a Docker container
```bash
yarn docker:build
```

### Deploy the app in production as a Docker container
```bash
yarn docker:deploy
```
