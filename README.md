# Chaos Archives

The prototype of the RP portal for the Chaos EU datacenter in FFXIV.

[![Server Docker Image CI](https://github.com/great-gubal-library/chaos-archives/actions/workflows/docker-image.yml/badge.svg)](https://github.com/great-gubal-library/chaos-archives/actions/workflows/docker-image.yml)

## Building

### Prerequisites

You need to install the Corepack wrapper for the Yarn package manager.

```bash
sudo corepack enable
```

### Client

```bash
cd client
yarn build
```

### Server

```bash
cd server
yarn docker:build
```

## Deploying

Currently the frontend and the API are served from the same HTTP host.

### Client

Just copy `dist/spa` to your web root or set up your web server to serve it directly.

### Server

```bash
cd server
yarn docker:deploy
```

Set up your web server to proxy the `/api` directory to the API server (runs HTTP on port 8111 by default). Also, for RPP character update subscriptions to work, the `/socket.io` directory needs to be proxied to the same server as a WebSocket endpoint (see [Socket.io documentation](https://socket.io/docs/v4/reverse-proxy/) for details).
