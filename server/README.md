# Chaos Archives (chaosarchives)

The RP portal to Chaos EU

### Prerequisites

You need to install the Corepack wrapper for the Yarn package manager.

```
sudo corepack enable
```

## Install the dependencies
```bash
yarn install
```

### Install server dependencies (MariaDB and Redis) in Docker
```bash
docker compose up -d mariadb redis
```

### Install minio (S3 compatible object storage server) for development mode
```bash
docker compose up -d minio
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
